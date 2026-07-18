import Phaser from 'phaser';
import type { AimSolution } from '../../domain/launch/calculateAimSolution';

export class TrajectoryPreview {
  readonly #graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.#graphics = scene.add.graphics().setDepth(20);
  }

  draw(solution: AimSolution): void {
    this.#graphics.clear();
    this.#graphics.fillStyle(solution.valid ? 0xffffff : 0xe86c6c, 0.82);

    for (let index = 1; index <= 18; index += 1) {
      const time = index * 0.115;
      const x = solution.origin.x + solution.velocity.x * time * 5.7;
      const y = solution.origin.y + solution.velocity.y * time * 5.7 + 0.5 * 44 * time * time;
      const radius = Math.max(2.5, 5.5 - index * 0.16);
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
