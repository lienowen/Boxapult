#!/usr/bin/env python3
"""Fast repository-level architecture checks that do not require Unity."""

from __future__ import annotations

import json
import pathlib
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[1]
PROJECT_ROOT = ROOT / "Assets" / "_Project"

EXPECTED_REFERENCES = {
    "Boxapult.Core": set(),
    "Boxapult.Gameplay": {"Boxapult.Core"},
    "Boxapult.Presentation": {"Boxapult.Core", "Boxapult.Gameplay"},
    "Boxapult.Infrastructure": {"Boxapult.Core", "Boxapult.Gameplay"},
    "Boxapult.Bootstrap": {
        "Boxapult.Core",
        "Boxapult.Gameplay",
        "Boxapult.Presentation",
        "Boxapult.Infrastructure",
    },
    "Boxapult.Editor": {"Boxapult.Core", "Boxapult.Gameplay"},
}

FORBIDDEN_SOURCE_PATTERNS = {
    "PlayerPrefs": {"Boxapult.Infrastructure"},
    "CrazyGames": {"Boxapult.Infrastructure"},
    "Resources.Load": set(),
    "FindObjectOfType": set(),
    "FindFirstObjectByType": set(),
    "FindAnyObjectByType": set(),
}


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def load_assemblies(errors: list[str]) -> tuple[dict[str, set[str]], dict[pathlib.Path, str]]:
    graph: dict[str, set[str]] = {}
    assembly_roots: dict[pathlib.Path, str] = {}

    for path in PROJECT_ROOT.rglob("*.asmdef"):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            fail(f"Invalid asmdef {path.relative_to(ROOT)}: {exc}", errors)
            continue

        name = payload.get("name")
        references = set(payload.get("references", []))
        if not isinstance(name, str) or not name:
            fail(f"Assembly without a valid name: {path.relative_to(ROOT)}", errors)
            continue

        graph[name] = references
        assembly_roots[path.parent] = name

    return graph, assembly_roots


def validate_references(graph: dict[str, set[str]], errors: list[str]) -> None:
    missing = set(EXPECTED_REFERENCES) - set(graph)
    extra = set(graph) - set(EXPECTED_REFERENCES)

    for name in sorted(missing):
        fail(f"Missing required assembly: {name}", errors)
    for name in sorted(extra):
        fail(f"Unexpected assembly requires an architecture decision: {name}", errors)

    for name, expected in EXPECTED_REFERENCES.items():
        actual = graph.get(name)
        if actual is not None and actual != expected:
            fail(
                f"{name} references {sorted(actual)}; expected exactly {sorted(expected)}",
                errors,
            )


def validate_cycles(graph: dict[str, set[str]], errors: list[str]) -> None:
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str, path: list[str]) -> None:
        if node in visiting:
            cycle_start = path.index(node)
            fail("Assembly cycle: " + " -> ".join(path[cycle_start:] + [node]), errors)
            return
        if node in visited:
            return

        visiting.add(node)
        for dependency in graph.get(node, set()):
            if dependency in graph:
                visit(dependency, path + [dependency])
        visiting.remove(node)
        visited.add(node)

    for assembly in graph:
        visit(assembly, [assembly])


def owning_assembly(path: pathlib.Path, roots: dict[pathlib.Path, str]) -> str | None:
    candidates = [root for root in roots if root == path.parent or root in path.parents]
    if not candidates:
        return None
    root = max(candidates, key=lambda item: len(item.parts))
    return roots[root]


def validate_sources(assembly_roots: dict[pathlib.Path, str], errors: list[str]) -> None:
    for source in PROJECT_ROOT.rglob("*.cs"):
        owner = owning_assembly(source, assembly_roots)
        relative = source.relative_to(ROOT)
        if owner is None:
            fail(f"C# file is outside an assembly boundary: {relative}", errors)
            continue

        text = source.read_text(encoding="utf-8")
        for pattern, allowed_owners in FORBIDDEN_SOURCE_PATTERNS.items():
            if pattern in text and owner not in allowed_owners:
                fail(f"Forbidden '{pattern}' in {relative} ({owner})", errors)

    for directory in PROJECT_ROOT.rglob("*"):
        if directory.is_dir() and directory.name == "Resources":
            fail(f"Resources folder is forbidden: {directory.relative_to(ROOT)}", errors)


def main() -> int:
    errors: list[str] = []
    graph, assembly_roots = load_assemblies(errors)
    validate_references(graph, errors)
    validate_cycles(graph, errors)
    validate_sources(assembly_roots, errors)

    if errors:
        print("Boxapult architecture validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Boxapult architecture validation passed ({len(graph)} assemblies).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
