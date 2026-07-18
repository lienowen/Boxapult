import type Phaser from 'phaser';
import type { GameBalance } from '../../content/config/gameBalance';
import type { GameFlow } from '../../domain/flow/GameFlow';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';
import { getMatterBody } from '../physics/getMatterBody';
import type { LaunchController } from '../systems/LaunchController';
import type { OutcomeSystem } from '../systems/OutcomeSystem';

export class DebugTelemetryPanel {
  readonly #text: Phaser.GameObjects.Text;
  #elapsedMs = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly integrity: IntegrityModel,
    private readonly flow: GameFlow,
    private readonly launch: LaunchController,
    private readonly outcome: OutcomeSystem,
    private readonly balance: GameBalance,
  ) {
    this.#text = scene.add.text(1878, 28, '', {
      fontFamily: 'Consolas, Menlo, monospace',
      fontSize: '18px',
      color: '#dce9ff',
      backgroundColor: '#07101dcc',
      padding: { x: 14, y: 12 },
      lineSpacing: 5,
      align: 'left',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(500);

    this.#render();
  }

  update(deltaMs: number): void {
    this.#elapsedMs += deltaMs;
    if (this.#elapsedMs < 100) {
      return;
    }

    this.#elapsedMs = 0;
    this.#render();
  }

  destroy(): void {
    this.#text.destroy();
  }

  #render(): void {
    const body = getMatterBody(this.packageImage);
    const velocityX = body?.velocity.x ?? 0;
    const velocityY = body?.velocity.y ?? 0;
    const speed = Math.hypot(velocityX, velocityY);
    const solution = this.launch.currentSolution;

    this.#text.setText([
      'BOXAPULT DEBUG',
      `phase      ${this.flow.current}`,
      `fps        ${this.scene.game.loop.actualFps.toFixed(1)}`,
      `position   ${this.packageImage.x.toFixed(1)}, ${this.packageImage.y.toFixed(1)}`,
      `velocity   ${velocityX.toFixed(2)}, ${velocityY.toFixed(2)}`,
      `speed      ${speed.toFixed(2)}`,
      `integrity  ${this.integrity.current}/${this.integrity.maximum}`,
      `aiming     ${this.launch.isAiming ? 'yes' : 'no'}`,
      `power      ${((solution?.strength01 ?? 0) * 100).toFixed(0)}%`,
      `launch v   ${(solution?.velocity.x ?? 0).toFixed(2)}, ${(solution?.velocity.y ?? 0).toFixed(2)}`,
      `failure    ${this.outcome.failureReason ?? '-'}`,
      '',
      `drag max   ${this.balance.launch.maximumDragPixels}`,
      `power mult ${this.balance.launch.velocityPerDragPixel}`,
      `friction   ${this.balance.package.friction}`,
      `air drag   ${this.balance.package.frictionAir}`,
      `bounce     ${this.balance.package.restitution}`,
      `settle     ${this.balance.outcome.stationarySpeedThreshold}`,
    ]);
  }
}
