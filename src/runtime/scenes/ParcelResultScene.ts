import Phaser from 'phaser';
import { calculateRouteGrade } from '../../domain/parcelPatrol/calculateRouteGrade';
import { createParcelPatrolTextures } from '../parcelPatrol/ArtFactory';
import { addParcelPatrolBackdrop, type ParcelPatrolBackdrop } from '../parcelPatrol/Backdrop';
import type { ParcelResultData } from '../parcelPatrol/ParcelResultData';
import type { ToneSfx } from '../parcelPatrol/ToneSfx';

const emptyResult: ParcelResultData = {
  score: 0,
  deliveries: 0,
  success: false,
  bestScore: 0,
};

export class ParcelResultScene extends Phaser.Scene {
  #result: ParcelResultData = emptyResult;
  #backdrop!: ParcelPatrolBackdrop;
  #transitioning = false;

  constructor() {
    super('parcel-result');
  }

  init(data: ParcelResultData): void {
    this.#result = data ?? emptyResult;
    this.#transitioning = false;
  }

  create(): void {
    createParcelPatrolTextures(this);
    this.#backdrop = addParcelPatrolBackdrop(this);
    this.cameras.main.fadeIn(260, 5, 15, 26);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x071322, 0.44).setDepth(0);

    const successColor = this.#result.success ? '#72f6b8' : '#ff7c8f';
    const heading = this.#result.success ? 'ROUTE COMPLETE' : 'DRONE DOWN';
    const subheading = this.#result.success
      ? 'Downtown deliveries secured.'
      : 'The route ended early. Re-launch the patrol.';

    this.add.text(width / 2, 112, heading, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '66px',
      color: successColor,
      stroke: '#07111d',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 8, color: '#000000', blur: 10, fill: true },
    }).setOrigin(0.5);
    this.add.text(width / 2, 176, subheading, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '23px',
      color: '#e5f5ff',
    }).setOrigin(0.5);

    const reportPanel = this.add.rectangle(width / 2, 358, 760, 290, 0x07182a, 0.9)
      .setStrokeStyle(3, 0x8de8f5, 0.35);
    reportPanel.setOrigin(0.5);

    this.#addStat(width / 2 - 215, 290, 'SCORE', String(this.#result.score).padStart(6, '0'));
    this.#addStat(width / 2, 290, 'PARCELS', this.#result.deliveries.toString());
    this.#addStat(width / 2 + 215, 290, 'BEST', String(this.#result.bestScore).padStart(6, '0'));

    const grade = calculateRouteGrade({
      score: this.#result.score,
      deliveries: this.#result.deliveries,
      completed: this.#result.success,
    });
    this.add.text(width / 2, 420, `ROUTE GRADE  ${grade}`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '42px',
      color: '#ffe08a',
      stroke: '#251b08',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const retryButton = this.#createButton(width / 2 - 190, 580, 330, 'RETRY ROUTE', 0x1fc490);
    const menuButton = this.#createButton(width / 2 + 190, 580, 330, 'MAIN MENU', 0x2a5f89);
    retryButton.on('pointerdown', () => this.#goTo('parcel-game'));
    menuButton.on('pointerdown', () => this.#goTo('parcel-title'));

    this.input.keyboard?.on('keydown-SPACE', this.#retry, this);
    this.input.keyboard?.on('keydown-ENTER', this.#retry, this);
    this.input.keyboard?.on('keydown-ESC', this.#menu, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-SPACE', this.#retry, this);
      this.input.keyboard?.off('keydown-ENTER', this.#retry, this);
      this.input.keyboard?.off('keydown-ESC', this.#menu, this);
    });
  }

  override update(_time: number, delta: number): void {
    this.#backdrop.update(delta, 0.32);
  }

  #addStat(x: number, y: number, label: string, value: string): void {
    this.add.text(x, y - 38, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      color: '#77eafa',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5);
    this.add.text(x, y + 14, value, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  #createButton(
    x: number,
    y: number,
    width: number,
    label: string,
    color: number,
  ): Phaser.GameObjects.Rectangle {
    const button = this.add.rectangle(x, y, width, 76, color, 1)
      .setStrokeStyle(3, 0xc8f7ff, 0.55)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#061521',
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setScale(1.04);
      text.setScale(1.04);
    });
    button.on('pointerout', () => {
      button.setScale(1);
      text.setScale(1);
    });
    return button;
  }

  #goTo(sceneKey: string): void {
    if (this.#transitioning) {
      return;
    }
    this.#transitioning = true;
    const sfx = this.registry.get('parcelSfx') as ToneSfx;
    sfx.play('pickup');
    this.cameras.main.fadeOut(240, 5, 15, 26);
    this.time.delayedCall(250, () => this.scene.start(sceneKey));
  }

  readonly #retry = (): void => this.#goTo('parcel-game');
  readonly #menu = (): void => this.#goTo('parcel-title');
}
