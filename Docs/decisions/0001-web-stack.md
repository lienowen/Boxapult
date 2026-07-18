# ADR 0001: Phaser web stack

## Status

Accepted.

## Decision

Use Phaser 3.90, TypeScript, Vite, and Phaser's bundled Matter Physics for Boxapult.

## Why

Boxapult is a 2D browser-first physics title. Unity WebGL would add editor, build, payload, and deployment complexity without a necessary 3D capability. Phaser is compatible with CrazyGames' HTML5 SDK path, while Matter supplies rigid bodies, sleeping, sensors, constraints, and fixed-step configuration.

Phaser 3.90 is pinned instead of immediately adopting Phaser 4 because the project values proven APIs and ecosystem stability over renderer novelty. An upgrade requires a separate architecture decision after the vertical slice.

## Consequences

- Browser iteration and static deployment are fast.
- Initial payload is substantially smaller than a Unity WebGL runtime.
- Runtime and UI remain in one TypeScript project.
- Module boundaries and content validation are enforced by repository tooling.
- Complex 3D and native-console targets are outside the current plan.
