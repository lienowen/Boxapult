export class MissionSession {
  constructor(route) {
    this.route = route;
    this.reset();
  }

  reset() {
    this.remainingMs = this.route.durationSeconds * 1000;
    this.score = 0;
    this.parcels = 0;
    this.lives = this.route.lives;
    this.combo = 1;
    this.damageTaken = 0;
    this.missedParcels = 0;
    this.ended = false;
    this.success = false;
    this.failureReason = null;
  }

  tick(deltaMs) {
    if (this.ended) return;
    this.remainingMs = Math.max(0, this.remainingMs - Math.max(0, deltaMs));
    if (this.remainingMs === 0) {
      this.ended = true;
      this.success = this.parcels >= this.route.targetParcels && this.lives > 0;
      this.failureReason = this.success ? null : 'parcel-target';
    }
  }

  destroyEnemy(basePoints) {
    if (this.ended) return 0;
    const awarded = Math.round(Math.max(0, basePoints) * this.combo);
    this.score += awarded;
    this.combo = Math.min(4, this.combo + 0.15);
    return awarded;
  }

  collectParcel(basePoints = 300) {
    if (this.ended) return 0;
    this.parcels += 1;
    const awarded = Math.round(Math.max(0, basePoints) * this.combo);
    this.score += awarded;
    this.combo = Math.min(4, this.combo + 0.30);
    return awarded;
  }

  missParcel() {
    if (this.ended) return;
    this.missedParcels += 1;
    this.combo = 1;
  }

  takeDamage() {
    if (this.ended) return false;
    this.damageTaken += 1;
    this.lives = Math.max(0, this.lives - 1);
    this.combo = 1;
    if (this.lives === 0) {
      this.ended = true;
      this.success = false;
      this.failureReason = 'drone-destroyed';
    }
    return true;
  }

  get stars() {
    if (!this.success) return 0;
    if (this.score >= this.route.stars.three && this.damageTaken === 0) return 3;
    if (this.score >= this.route.stars.two) return 2;
    return 1;
  }

  get timeSeconds() {
    return Math.ceil(this.remainingMs / 1000);
  }

  snapshot() {
    return Object.freeze({
      routeId: this.route.id,
      score: this.score,
      parcels: this.parcels,
      targetParcels: this.route.targetParcels,
      lives: this.lives,
      combo: this.combo,
      damageTaken: this.damageTaken,
      missedParcels: this.missedParcels,
      success: this.success,
      failureReason: this.failureReason,
      stars: this.stars,
    });
  }
}
