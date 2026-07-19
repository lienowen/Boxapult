const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  muted: false,
  tutorialSeen: false,
});

export class SettingsStore {
  #memory = structuredClone(DEFAULT_SETTINGS);

  constructor(storageKey = 'parcel_patrol_settings_v1') {
    this.storageKey = storageKey;
    this.#memory = this.#read();
  }

  snapshot() {
    return structuredClone(this.#memory);
  }

  isMuted() {
    return this.#memory.muted === true;
  }

  setMuted(muted) {
    this.#memory = { ...this.#memory, muted: muted === true };
    this.#write();
    return this.#memory.muted;
  }

  hasSeenTutorial() {
    return this.#memory.tutorialSeen === true;
  }

  markTutorialSeen() {
    if (this.#memory.tutorialSeen) return;
    this.#memory = { ...this.#memory, tutorialSeen: true };
    this.#write();
  }

  #read() {
    try {
      const raw = globalThis.localStorage.getItem(this.storageKey);
      if (!raw) return structuredClone(DEFAULT_SETTINGS);
      const parsed = JSON.parse(raw);
      if (parsed?.version !== 1) return structuredClone(DEFAULT_SETTINGS);
      return {
        version: 1,
        muted: parsed.muted === true,
        tutorialSeen: parsed.tutorialSeen === true,
      };
    } catch {
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  #write() {
    try {
      globalThis.localStorage.setItem(this.storageKey, JSON.stringify(this.#memory));
    } catch {
      // In-memory settings keep the current session functional.
    }
  }
}
