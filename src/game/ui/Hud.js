export class Hud {
  constructor(scene, route){
    this.scene = scene;
    this.lastParcels = 0;
    this.lastLives = route.lives;
    this.targetSecured = false;

    const width = scene.scale.width;
    scene.add.rectangle(width / 2, 44, width - 42, 74, 0x061424, .82)
      .setStrokeStyle(2, 0x86e3ef, .25)
      .setDepth(100);

    this.route = scene.add.text(34, 18, route.name, {
      fontFamily: 'Arial',
      fontSize: '19px',
      color: '#bceeff',
      fontStyle: 'bold',
    }).setDepth(110);

    this.score = scene.add.text(34, 48, 'SCORE 000000', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#fff',
    }).setDepth(110);

    this.parcels = scene.add.text(325, 48, 'PARCELS 0/0', {
      fontFamily: 'Arial',
      fontSize: '21px',
      color: '#ffd98a',
      fontStyle: 'bold',
    }).setDepth(110);

    this.combo = scene.add.text(555, 48, 'COMBO x1.0', {
      fontFamily: 'Arial',
      fontSize: '21px',
      color: '#72efff',
      fontStyle: 'bold',
    }).setDepth(110);

    this.power = scene.add.text(765, 48, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#8fffc7',
      fontStyle: 'bold',
    }).setDepth(110);

    this.lives = scene.add.text(width - 242, 19, '♥ ♥ ♥', {
      fontFamily: 'Arial',
      fontSize: '25px',
      color: '#ff7184',
      fontStyle: 'bold',
    }).setDepth(110);

    this.time = scene.add.text(width - 242, 49, 'TIME 00', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#fff',
    }).setDepth(110);

    scene.add.rectangle(width / 2, 88, width - 84, 8, 0x07111d, .8).setDepth(100);
    this.bar = scene.add.rectangle(42, 88, width - 84, 8, 0x59e7b0)
      .setOrigin(0, .5)
      .setDepth(101);

    this.objective = scene.add.text(width / 2, 116, `COLLECT ${route.targetParcels} PARCELS AND SURVIVE`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#e7f8ff',
      backgroundColor: '#07111dcc',
      padding: { x: 14, y: 7 },
    }).setOrigin(.5).setDepth(100);

    this.#showRouteIntro(route);
  }

  update(session, powerLabel = ''){
    this.score.setText(`SCORE ${String(session.score).padStart(6, '0')}`);
    this.parcels.setText(`PARCELS ${session.parcels}/${session.route.targetParcels}`);
    this.combo.setText(`COMBO x${session.combo.toFixed(1)}`);
    this.power.setText(powerLabel);
    this.lives.setText(Array.from({ length: session.lives }, () => '♥').join(' '));
    this.time.setText(`TIME ${String(session.timeSeconds).padStart(2, '0')}`);

    const ratio = session.remainingMs / (session.route.durationSeconds * 1000);
    this.bar.setScale(Math.max(0, Math.min(1, ratio)), 1);
    this.bar.setFillStyle(ratio < .2 ? 0xff7184 : ratio < .45 ? 0xffd36f : 0x59e7b0);

    const secured = session.parcels >= session.route.targetParcels;
    this.objective.setText(
      secured
        ? 'PARCEL TARGET SECURED — SURVIVE!'
        : `COLLECT ${session.route.targetParcels - session.parcels} MORE PARCEL${session.route.targetParcels - session.parcels === 1 ? '' : 'S'}`,
    );

    if (session.parcels !== this.lastParcels) {
      this.lastParcels = session.parcels;
      this.scene.tweens.killTweensOf(this.parcels);
      this.parcels.setScale(1).setColor('#fff4ad');
      this.scene.tweens.add({
        targets: this.parcels,
        scale: 1.26,
        duration: 110,
        yoyo: true,
        ease: 'Back.out',
        onComplete: () => this.parcels.setColor('#ffd98a'),
      });
    }

    if (session.lives !== this.lastLives) {
      this.lastLives = session.lives;
      this.scene.tweens.killTweensOf(this.lives);
      this.scene.tweens.add({
        targets: this.lives,
        alpha: .15,
        scale: 1.28,
        duration: 90,
        yoyo: true,
        repeat: 2,
        onComplete: () => this.lives.setAlpha(1).setScale(1),
      });
    }

    if (secured && !this.targetSecured) {
      this.targetSecured = true;
      this.objective.setColor('#8fffc7');
      this.scene.tweens.add({
        targets: this.objective,
        scale: 1.16,
        duration: 150,
        yoyo: true,
        repeat: 1,
        ease: 'Back.out',
      });
    }
  }

  #showRouteIntro(route){
    const width = this.scene.scale.width;
    const accent = route.scenery?.accentColor ?? 0x72efff;
    const container = this.scene.add.container(width / 2, 218)
      .setDepth(130)
      .setAlpha(0)
      .setScale(.9);

    const panel = this.scene.add.rectangle(0, 0, 650, 104, 0x061424, .91)
      .setStrokeStyle(3, accent, .58);
    const title = this.scene.add.text(0, -20, route.name, {
      fontFamily: 'Arial Black',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#06101e',
      strokeThickness: 5,
    }).setOrigin(.5);
    const briefing = this.scene.add.text(0, 24, route.briefing, {
      fontFamily: 'Arial',
      fontSize: '17px',
      color: '#ffd98a',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(.5);

    container.add([panel, title, briefing]);
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      y: 196,
      duration: 280,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: 170,
          duration: 360,
          delay: 1500,
          ease: 'Cubic.in',
          onComplete: () => container.destroy(true),
        });
      },
    });
  }
}
