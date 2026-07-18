import Phaser from 'phaser';
import type { TrajectoryPreviewBalance } from '../../content/config/gameBalance';
import type { AimSolution } from '../../domain/launch/calculateAimSolution';

export class TrajectoryPreview {
  readonly #graphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly balance: TrajectoryPreviewBalance,
  ) {
    this.#graphics = scene.add.graphics().setDepth(20);
  }

  draw(solution: AimSolution): void {
    this.#graphics.clear();

    const color = solution.valid ? 0xffffff : 0xe86c6c;
    this.#graphics.lineStyle(3, color, 0.55);
    this.#graphics.lineBetween(
      solution.packagePosition.x,
      solution.packagePosition.y,
      solution.origin.x,
      solution.origin.y,
    );

    this.#graphics.fillStyle(color, 0.82);
    for (let index = 1; index <= this.balance.pointCount; index += 1) {
      const time = index * this.balance.timeStep;
      const x = solution.origin.x + solution.velocity.x * time * this.balance.velocityScale;
      const y =
        solution.origin.y +
        solution.velocity.y * time * this.balance.velocityScale +
        0.5 * this.balance.gravityPixelsPerSecondSquared * time * time;
      const radius = Math.max(2.5, 5.5 - index * 0.18);
      this.#graphics.fillCircle(x, y, radius);
    }

    const meterWidth = 150;
    const meterHeight = 12;
    const meterX = solution.origin.x - meterWidth / 2;
    const meterY = solution.origin.y - 92;
    this.#graphics.fillStyle(0x0e192a, 0.9);
    this.#graphics.fillRoundedRect(meterX - 4, meterY - 4, meterWidth + 8, meterHeight + 8, 6);
    this.#graphics.fillStyle(solution.valid ? 0x7bf0a2 : 0xe86c6c, 0.95);
    this.#graphics.fillRoundedRect(
      meterX,
      meterY,
      meterWidth * solution.strength01,
      meterHeight,
      4,
    );
  }

  clear(): void {
    this.#graphics.clear();
  }

  destroy(): void {
    this.#graphics.destroy();
  }
}
