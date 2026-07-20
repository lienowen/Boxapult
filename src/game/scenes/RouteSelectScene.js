import { ROUTES } from '../../config/routes.js';
import { Backdrop } from '../systems/Backdrop.js';

export class RouteSelectScene extends Phaser.Scene {
  constructor(){super('routes');}

  create(){
    const { width, height } = this.scale;
    this.backdrop = new Backdrop(this, ROUTES[2]);
    this.add.rectangle(width / 2, height / 2, width, height, 0x030611, .58);
    this.add.text(width / 2, 62, 'CHOOSE BLOCKADE SECTOR', {
      fontFamily: 'Arial Black',
      fontSize: '46px',
      color: '#fff',
      stroke: '#050813',
      strokeThickness: 8,
    }).setOrigin(.5);
    this.add.text(width / 2, 108, 'STEAL THE ENERGY CORES. SURVIVE THE CORPORATE RESPONSE.', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ff8ca5',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(.5);

    const store = this.registry.get('progress');
    const cardWidth = 350;
    const gap = 35;
    const startX = width / 2 - (cardWidth * 1.5 + gap);

    ROUTES.forEach((route, index) => {
      const unlocked = store.isUnlocked(route, ROUTES);
      const record = store.routeRecord(route.id);
      const x = startX + cardWidth / 2 + index * (cardWidth + gap);
      const y = 376;
      const accent = route.scenery?.accentColor ?? 0xff6f9f;
      const cardColor = unlocked ? 0x0b1727 : 0x10131b;

      const card = this.add.rectangle(x, y, cardWidth, 440, cardColor, .96)
        .setStrokeStyle(3, unlocked ? accent : 0x4a4d57, .66);
      if (unlocked) card.setInteractive({ useHandCursor: true });

      this.add.rectangle(x, y - 208, cardWidth - 12, 10, unlocked ? accent : 0x343742, .88);
      this.add.text(x, y - 168, `SECTOR 0${index + 1}`, {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: unlocked ? '#ff7897' : '#59606c',
      }).setOrigin(.5);
      this.add.text(x, y - 108, route.name, {
        fontFamily: 'Arial Black',
        fontSize: '25px',
        color: unlocked ? '#fff' : '#6c727d',
        align: 'center',
        wordWrap: { width: 300 },
      }).setOrigin(.5);
      this.add.text(x, y - 66, route.subtitle, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: unlocked ? '#cde9f2' : '#59606d',
      }).setOrigin(.5);
      this.add.text(x, y - 22, route.briefing, {
        fontFamily: 'Arial Black',
        fontSize: '15px',
        color: unlocked ? '#ffd98a' : '#59606d',
        align: 'center',
      }).setOrigin(.5);
      this.add.text(x, y + 25, `${route.durationSeconds}s  ·  ${route.targetParcels} CORES`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: unlocked ? '#dff8ff' : '#59606d',
        fontStyle: 'bold',
      }).setOrigin(.5);
      this.add.text(x, y + 79, unlocked ? `BEST ${String(record.bestScore).padStart(6, '0')}` : 'LOCKED', {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        color: unlocked ? '#fff' : '#ff7d8f',
      }).setOrigin(.5);
      this.add.text(x, y + 121, unlocked ? rank(record.bestStars) : 'BREAK THE PREVIOUS BLOCKADE', {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#ffe181',
        fontStyle: 'bold',
      }).setOrigin(.5);

      if (unlocked) {
        const play = this.add.rectangle(x, y + 178, 240, 56, 0xff5b78)
          .setStrokeStyle(2, 0xffcad4, .8)
          .setInteractive({ useHandCursor: true });
        this.add.text(x, y + 178, 'INFILTRATE', {
          fontFamily: 'Arial Black',
          fontSize: '22px',
          color: '#12040a',
        }).setOrigin(.5);
        card.on('pointerdown', () => this.launch(route.id));
        play.on('pointerdown', () => this.launch(route.id));
      }
    });

    this.add.text(42, height - 38, 'ESC · BACK', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#c7dde8',
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('title'));
  }

  update(_time, delta){
    this.backdrop.update(delta, .2);
  }

  launch(routeId){
    this.registry.get('audio').play('pickup');
    this.cameras.main.fadeOut(220, 5, 15, 26);
    this.time.delayedCall(230, () => this.scene.start('game', { routeId }));
  }
}

function rank(count){
  return `RENEGADE RANK  ${'◆'.repeat(count)}${'◇'.repeat(3 - count)}`;
}
