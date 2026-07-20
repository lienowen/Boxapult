export class SpawnDirector {
  constructor(route) {
    this.route = route;
    this.reset();
  }

  reset() {
    this.elapsedMs = 0;
    this.openingIndex = 0;
    this.enemyMs = 650;
    this.parcelMs = this.route.parcelSpawnMs;
    this.powerupMs = this.route.powerupSpawnMs;
  }

  update(deltaMs, progress, actions) {
    this.elapsedMs += deltaMs;
    this.#runOpeningEvents(actions);

    if (this.elapsedMs < (this.route.openingDurationMs ?? 0)) return;

    this.enemyMs -= deltaMs;
    this.parcelMs -= deltaMs;
    this.powerupMs -= deltaMs;

    if (this.enemyMs <= 0) {
      actions.enemy(this.#enemyKind());
      const dynamic = this.route.enemySpawnStartMs
        - progress * (this.route.enemySpawnStartMs - this.route.enemySpawnMinMs);
      this.enemyMs = Math.max(this.route.enemySpawnMinMs, dynamic);
    }

    if (this.parcelMs <= 0) {
      actions.parcel();
      this.parcelMs = this.route.parcelSpawnMs + random(-450, 600);
    }

    if (this.powerupMs <= 0) {
      actions.powerup(Math.random() < .5 ? 'shield' : 'rapid');
      this.powerupMs = this.route.powerupSpawnMs + random(-1200, 1800);
    }
  }

  #runOpeningEvents(actions) {
    const events = this.route.openingEvents ?? [];
    while (this.openingIndex < events.length) {
      const event = events[this.openingIndex];
      if (event.atMs > this.elapsedMs) break;
      this.openingIndex += 1;
      if (event.type === 'enemy') actions.enemy(event.kind);
      else if (event.type === 'parcel') actions.parcel();
      else if (event.type === 'powerup') actions.powerup(event.kind);
    }
  }

  #enemyKind() {
    const roll = Math.random();
    const weights = this.route.enemyWeights;
    if (roll < weights.scout) return 'scout';
    if (roll < weights.scout + weights.raider) return 'raider';
    return 'interceptor';
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
