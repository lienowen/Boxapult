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
    this.#graphics.fillStyle(solution.valid ? 0xffffff : 0xe86c6c, 0.82);

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
  }

  clear(): void {
    this.#graphics.clear();
  }

  destroy(): void {
    this.#graphics.destroy();
  }
}
