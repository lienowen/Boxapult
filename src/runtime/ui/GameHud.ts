import Phaser from 'phaser';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { FlightFailureReason } from '../../domain/outcome/evaluateFlightOutcome';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';

const failureMessages: Readonly<Record<FlightFailureReason, string>> = {
  destroyed: 'PACKAGE DESTROYED',
  'out-of-bounds': 'PACKAGE LEFT THE DELIVERY AREA',
  stationary: 'PACKAGE GOT STUCK',
};

export class GameHud {
  readonly #levelText: Phaser.GameObjects.Text;
  readonly #integrityText: Phaser.GameObjects.Text;
  readonly #instructionText: Phaser.GameObjects.Text;
  readonly #resultPanel: Phaser.GameObjects.Container;
  readonly #resultTitle: Phaser.GameObjects.Text;
  readonly #resultReason: Phaser.GameObjects.Text;
  readonly #resultHint: Phaser.GameObjects.Text;
  readonly #unsubscribe: () => void;

  constructor(
    scene: Phaser.Scene,
    levelId: string,
    integrity: IntegrityModel,
    flow: GameFlow,
    private readonly getFailureReason: () => FlightFailureReason | null,
  ) {
    this.#levelText = scene.add.text(42, 34, levelId.toUpperCase(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(100);

    this.#integrityText = scene.add.text(42, 76, `PACKAGE ${integrity.current}%`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f1c27d',
    }).setScrollFactor(0).setDepth(100);

    this.#instructionText = scene.add.text(960, 850, 'DRAG BACK · RELEASE TO LAUNCH', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#eef5ff',
      fontStyle: 'bold',
      backgroundColor: '#0e192a',
      padding: { x: 18, y: 11 },
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#000000',
        blur: 6,
        fill: true,
      },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    const panel = scene.add.rectangle(0, 0, 680, 280, 0x0e192a, 0.94)
      .setStrokeStyle(4, 0xffffff, 0.16);
    this.#resultTitle = scene.add.text(0, -70, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '54px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.#resultReason = scene.add.text(0, 5, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '23px',
      color: '#e8eef8',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    this.#resultHint = scene.add.text(0, 82, 'CLICK OR PRESS R TO RETRY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#c9d8ee',
    }).setOrigin(0.5);

    this.#resultPanel = scene.add.container(
      960,
      540,
      [panel, this.#resultTitle, this.#resultReason, this.#resultHint],
    ).setDepth(200).setVisible(false);

    this.#unsubscribe = flow.subscribe((_previous, current) => this.#renderPhase(current));
  }

  updateIntegrity(integrity: IntegrityModel): void {
    this.#integrityText.setText(`PACKAGE ${integrity.current}%`);
  }

  destroy(): void {
    this.#unsubscribe();
    this.#levelText.destroy();
    this.#integrityText.destroy();
    this.#instructionText.destroy();
    this.#resultPanel.destroy(true);
  }

  #renderPhase(phase: GamePhase): void {
    this.#instructionText.setVisible(phase === GamePhase.Aiming);
    const isResult = phase === GamePhase.Success || phase === GamePhase.Failure;
    this.#resultPanel.setVisible(isResult);

    if (phase === GamePhase.Success) {
      this.#resultTitle.setText('DELIVERED!').setColor('#7bf0a2');
      this.#resultReason.setText('PACKAGE SECURED');
    } else if (phase === GamePhase.Failure) {
      const failureReason = this.getFailureReason();
      this.#resultTitle.setText('MISDELIVERED').setColor('#ff8585');
      this.#resultReason.setText(
        failureReason === null ? 'TRY A DIFFERENT ANGLE' : failureMessages[failureReason],
      );
    }
  }
}
