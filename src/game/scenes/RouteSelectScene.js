import { ROUTES } from '../../config/routes.js';
import { Backdrop } from '../systems/Backdrop.js';

export class RouteSelectScene extends Phaser.Scene {
  constructor(){super('routes');}

  create(){
    const { width, height } = this.scale;
    this.backdrop = new Backdrop(this, ROUTES[0]);
    this.add.rectangle(width / 2, height / 2, width, height, 0x06111f, .46);
    this.add.text(width / 2, 62, 'CHOOSE DELIVERY ROUTE', {
      fontFamily: 'Arial Black',
      fontSize: '46px',
      color: '#fff',
      stroke: '#07111d',
      strokeThickness: 8,
    }).setOrigin(.5);
    this.add.text(width / 2, 108, 'EACH ROUTE HAS A DIFFERENT OPENING, SKYLINE AND THREAT MIX', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#bceeff',
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
      const accent = route.scenery?.accentColor ?? 0x6fe7f4;
      const cardColor = unlocked ? 0x0d2940 : 0x101722;

      const card = this.add.rectangle(x, y, cardWidth, 440, cardColor, .94)
        .setStrokeStyle(3, unlocked ? accent : 0x4a5664, .60);
      if (unlocked) card.setInteractive({ useHandCursor: true });

      this.add.rectangle(x, y - 208, cardWidth - 12, 10, unlocked ? accent : 0x36414d, .82);
      this.add.text(x, y - 168, `0${index + 1}`, {
        fontFamily: 'Arial Black',
        fontSize: '46px',
        color: unlocked ? '#70eeff' : '#596674',
      }).setOrigin(.5);
      this.add.text(x, y - 108, route.name, {
        fontFamily: 'Arial Black',
        fontSize: '25px',
        color: unlocked ? '#fff' : '#6c7782',
        align: 'center',
        wordWrap: { width: 300 },
      }).setOrigin(.5);
      this.add.text(x, y - 66, route.subtitle, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: unlocked ? '#cde9f2' : '#59636d',
      }).setOrigin(.5);
      this.add.text(x, y - 22, route.briefing, {
        fontFamily: 'Arial Black',
        fontSize: '15px',
        color: unlocked ? '#ffd98a' : '#59636d',
        align: 'center',
      }).setOrigin(.5);
      this.add.text(x, y + 25, `${route.durationSeconds}s  ·  ${route.targetParcels} PARCELS`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: unlocked ? '#dff8ff' : '#59636d',
        fontStyle: 'bold',
      }).setOrigin(.5);
      this.add.text(x, y + 79, unlocked ? `BEST ${String(record.bestScore).padStart(6, '0')}` : 'LOCKED', {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        color: unlocked ? '#fff' : '#ff7d8f',
      }).setOrigin(.5);
      this.add.text(x, y + 121, unlocked ? stars(record.bestStars) : 'COMPLETE PREVIOUS ROUTE', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffe181',
        fontStyle: 'bold',
      }).setOrigin(.5);

      if (unlocked) {
        const play = this.add.rectangle(x, y + 178, 240, 56, 0x1fbf8e)
          .setStrokeStyle(2, 0xb6ffe5, .8)
          .setInteractive({ useHandCursor: true });
        this.add.text(x, y + 178, 'LAUNCH', {
          fontFamily: 'Arial Black',
          fontSize: '22px',
          color: '#061923',
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

function stars(count){
  return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}
