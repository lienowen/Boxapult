const DEFAULT_PROGRESS = Object.freeze({ version: 1, routes: {} });

export class ProgressStore {
  #memory = structuredClone(DEFAULT_PROGRESS);
  constructor(storageKey = 'parcel_patrol_progress_v1') { this.storageKey = storageKey; }

  load() {
    try {
      const raw = globalThis.localStorage.getItem(this.storageKey);
      if (!raw) return structuredClone(this.#memory);
      const parsed = JSON.parse(raw);
      if (parsed?.version !== 1 || typeof parsed.routes !== 'object') return structuredClone(this.#memory);
      this.#memory = parsed;
      return structuredClone(parsed);
    } catch { return structuredClone(this.#memory); }
  }

  saveResult(result) {
    const progress = this.load();
    const previous = progress.routes[result.routeId] ?? { bestScore: 0, bestStars: 0, completed: false };
    progress.routes[result.routeId] = {
      bestScore: Math.max(previous.bestScore, result.score),
      bestStars: Math.max(previous.bestStars, result.stars),
      completed: previous.completed || result.success,
    };
    this.#memory = progress;
    try { globalThis.localStorage.setItem(this.storageKey, JSON.stringify(progress)); } catch { /* session fallback */ }
    return structuredClone(progress);
  }

  isUnlocked(route, routes) {
    if (route.order === 0) return true;
    const previous = routes[route.order - 1];
    return this.load().routes[previous.id]?.completed === true;
  }

  routeRecord(routeId) {
    return this.load().routes[routeId] ?? { bestScore: 0, bestStars: 0, completed: false };
  }
}
