export interface IntegrityBalance {
  readonly maximum: number;
  readonly damageSpeedThreshold: number;
  readonly damagePerSpeedUnit: number;
}

export class IntegrityModel {
  readonly #balance: IntegrityBalance;
  #current: number;

  constructor(balance: IntegrityBalance) {
    if (balance.maximum <= 0) {
      throw new Error('Maximum integrity must be greater than zero.');
    }
    this.#balance = balance;
    this.#current = balance.maximum;
  }

  get current(): number {
    return this.#current;
  }

  get maximum(): number {
    return this.#balance.maximum;
  }

  get depleted(): boolean {
    return this.#current <= 0;
  }

  reset(): void {
    this.#current = this.#balance.maximum;
  }

  applyImpact(speed: number): number {
    const excess = Math.max(0, speed - this.#balance.damageSpeedThreshold);
    const damage = Math.round(excess * this.#balance.damagePerSpeedUnit);
    this.#current = Math.max(0, this.#current - damage);
    return damage;
  }
}
