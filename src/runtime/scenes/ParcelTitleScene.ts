import Phaser from 'phaser';
import { createParcelPatrolTextures } from '../parcelPatrol/ArtFactory';
import { addParcelPatrolBackdrop, type ParcelPatrolBackdrop } from '../parcelPatrol/Backdrop';
import type { ToneSfx } from '../parcelPatrol/ToneSfx';

export class ParcelTitleScene extends Phaser.Scene {
  #backdrop!: ParcelPatrolBackdrop;
  #drone!: Phaser.GameObjects.Image;
  #starting = false;

  constructor() {
    super('parcel-title');
  }

  create(): void {
    createParcelPatrolTextures(this);
    this.#backdrop = addParcelPatrolBackdrop(this);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x071322, 0.18).setDepth(0);

    this.#drone = this.add.image(width * 0.28, height * 0.35, 'pp-player').setScale(1.65).setDepth(10);
    this.tweens.add({
      targets: this.#drone,
      y: this.#drone.y - 18,
      angle: 2,
      duration: 1350,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    const parcelOne = this.add.image(width * 0.18, height * 0.58, 'pp-parcel').setScale(1.1).setAngle(-8);
    const parcelTwo = this.add.image(width * 0.34, height * 0.61, 'pp-parcel').setScale(0.88).setAngle(9);
    this.tweens.add({
      targets: [parcelOne, parcelTwo],
      y: '-=12',
      duration: 1000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 180,
    });

    this.add.text(width * 0.58, height * 0.22, 'PARCEL', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '86px',
      color: '#ffffff',
      stroke: '#0b1a2d',
      strokeThickness: 10,
    }).setOrigin(0.5);
    this.add.text(width * 0.58, height * 0.35, 'PATROL', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '102px',
      color: '#69efff',
      stroke: '#0b1a2d',
      strokeThickness: 11,
      shadow: { offsetX: 0, offsetY: 8, color: '#000000', blur: 10, fill: true },
    }).setOrigin(0.5);
    this.add.text(width * 0.58, height * 0.45, 'SKY COURIER DEFENSE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffe18e',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    const panel = this.add.rectangle(width * 0.66, height * 0.62, 640, 176, 0x09182a, 0.78)
      .setStrokeStyle(3, 0x91ddea, 0.35);
    panel.setOrigin(0.5);
    this.add.text(width * 0.47, height * 0.56, 'MOVE', {
      fontFamily: 'Arial, sans-serif', fontSize: '21px', color: '#76f0ff', fontStyle: 'bold',
    });
    this.add.text(width * 0.47, height * 0.61, 'Mouse / Touch / ↑ ↓', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff',
    });
    this.add.text(width * 0.68, height * 0.56, 'FIRE', {
      fontFamily: 'Arial, sans-serif', fontSize: '21px', color: '#76f0ff', fontStyle: 'bold',
    });
    this.add.text(width * 0.68, height * 0.61, 'Click / Tap / Space', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff',
    });

    const startButton = this.add.rectangle(width * 0.66, height * 0.79, 420, 82, 0x1bc08e, 1)
      .setStrokeStyle(4, 0xaaffdf, 0.9)
      .setInteractive({ useHandCursor: true });
    const startText = this.add.text(width * 0.66, height * 0.79, 'START DELIVERY', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '30px',
      color: '#061b1c',
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
      startButton.setScale(1.04);
      startText.setScale(1.04);
    });
    startButton.on('pointerout', () => {
      startButton.setScale(1);
      startText.setScale(1);
    });
    startButton.on('pointerdown', this.#startGame, this);
    this.input.keyboard?.on('keydown-ENTER', this.#startGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.#startGame, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ENTER', this.#startGame, this);
      this.input.keyboard?.off('keydown-SPACE', this.#startGame, this);
    });
  }

  override update(_time: number, delta: number): void {
    this.#backdrop.update(delta, 0.45);
  }

  readonly #startGame = (): void => {
    if (this.#starting) {
      return;
    }
    this.#starting = true;
    const sfx = this.registry.get('parcelSfx') as ToneSfx;
    sfx.unlock();
    sfx.play('pickup');
    this.cameras.main.fadeOut(260, 5, 15, 26);
    this.time.delayedCall(260, () => this.scene.start('parcel-game'));
  };
}
