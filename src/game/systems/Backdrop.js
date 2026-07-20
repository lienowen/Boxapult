export class Backdrop {
  constructor(scene, route) {
    this.scene = scene;
    this.route = route;
    this.width = scene.scale.width;
    this.height = scene.scale.height;
    this.elapsed = 0;
    this.clouds = [];
    this.stars = [];
    this.traffic = [];
    this.waterGlints = [];

    const palette = route.palette;
    const scenery = route.scenery ?? {};

    scene.add.rectangle(this.width / 2, this.height * .16, this.width, this.height * .32, palette.top).setDepth(-40);
    scene.add.rectangle(this.width / 2, this.height * .49, this.width, this.height * .34, palette.middle).setDepth(-40);
    scene.add.rectangle(this.width / 2, this.height * .83, this.width, this.height * .34, palette.bottom).setDepth(-40);

    scene.add.ellipse(
      this.width * .5,
      this.height * .63,
      this.width * 1.3,
      this.height * .30,
      scenery.accentColor ?? palette.sun,
      scenery.hazeAlpha ?? .08,
    ).setDepth(-37);

    scene.add.circle(this.width * .78, this.height * .18, palette.celestialRadius, palette.sun, .9).setDepth(-38);
    scene.add.circle(this.width * .78, this.height * .18, palette.celestialRadius * 1.45, palette.sun, .10).setDepth(-39);

    this.#createStars(scenery);
    this.#createClouds(scenery);

    this.far = scene.add.tileSprite(this.width / 2, this.height - 245, this.width, 230, 'city-far')
      .setTint(palette.far)
      .setDepth(-20);

    this.#createWater(scenery.water);
    this.#createLandmarks(scenery.landmarks ?? [], scenery.accentColor ?? palette.sun);

    this.near = scene.add.tileSprite(this.width / 2, this.height - 135, this.width, 280, 'city-near')
      .setTint(palette.near)
      .setDepth(-10);

    this.#createTraffic(scenery);
  }

  update(deltaMs, multiplier = 1) {
    const seconds = deltaMs / 1000;
    const speed = seconds * this.route.speedMultiplier * multiplier;
    this.elapsed += seconds;

    this.far.tilePositionX += 18 * speed;
    this.near.tilePositionX += 58 * speed;

    for (const cloud of this.clouds) {
      cloud.x -= cloud.getData('speed') * speed;
      if (cloud.x < -150) cloud.x = this.width + Phaser.Math.Between(80, 300);
    }

    for (const star of this.stars) {
      const phase = star.getData('phase');
      const twinkle = star.getData('twinkle');
      star.setAlpha(.28 + (Math.sin(this.elapsed * twinkle + phase) + 1) * .24);
    }

    for (const streak of this.traffic) {
      streak.x -= streak.getData('speed') * speed;
      if (streak.x < -80) {
        streak.x = this.width + Phaser.Math.Between(40, 360);
        streak.y = Phaser.Math.Between(Math.floor(this.height * .72), this.height - 32);
      }
    }

    for (const glint of this.waterGlints) {
      glint.x -= glint.getData('speed') * speed;
      if (glint.x < -120) glint.x = this.width + Phaser.Math.Between(60, 260);
      glint.setAlpha(.16 + (Math.sin(this.elapsed * 2.2 + glint.getData('phase')) + 1) * .08);
    }
  }

  #createStars(scenery) {
    const count = scenery.starCount ?? 0;
    for (let index = 0; index < count; index += 1) {
      const star = this.scene.add.circle(
        Phaser.Math.Between(20, this.width - 20),
        Phaser.Math.Between(20, Math.floor(this.height * .56)),
        Phaser.Math.Between(1, 3),
        0xe8efff,
        Phaser.Math.FloatBetween(.35, .85),
      ).setDepth(-36);
      star.setData('phase', Phaser.Math.FloatBetween(0, Math.PI * 2));
      star.setData('twinkle', Phaser.Math.FloatBetween(1.2, 3.2));
      this.stars.push(star);
    }
  }

  #createClouds(scenery) {
    const count = scenery.cloudCount ?? 6;
    const alpha = scenery.cloudAlpha ?? .12;
    const baseSpeed = scenery.cloudSpeed ?? 7;

    for (let index = 0; index < count; index += 1) {
      const cloud = this.scene.add.container(
        60 + index * (this.width / Math.max(1, count - 1)),
        82 + (index % 3) * 64,
      ).setDepth(-25);
      cloud.add([
        this.scene.add.ellipse(0, 10, 108, 25, 0xe7f7ff, alpha),
        this.scene.add.circle(-30, 1, 18, 0xe7f7ff, alpha),
        this.scene.add.circle(8, -6, 27, 0xe7f7ff, alpha),
        this.scene.add.circle(38, 6, 17, 0xe7f7ff, alpha),
      ]);
      cloud.setScale(Phaser.Math.FloatBetween(.72, 1.25));
      cloud.setData('speed', baseSpeed * Phaser.Math.FloatBetween(.72, 1.3));
      this.clouds.push(cloud);
    }
  }

  #createWater(water) {
    if (!water) return;
    const y = this.height * water.y;
    this.scene.add.rectangle(this.width / 2, y + 90, this.width, 180, water.color, .88).setDepth(-18);
    this.scene.add.rectangle(this.width / 2, y, this.width, 4, water.highlight, .45).setDepth(-17);

    for (let index = 0; index < 14; index += 1) {
      const glint = this.scene.add.rectangle(
        Phaser.Math.Between(0, this.width),
        Phaser.Math.Between(Math.floor(y + 12), Math.floor(y + 118)),
        Phaser.Math.Between(32, 105),
        Phaser.Math.Between(2, 4),
        water.highlight,
        Phaser.Math.FloatBetween(.10, .28),
      ).setDepth(-17);
      glint.setData('speed', Phaser.Math.Between(18, 42));
      glint.setData('phase', Phaser.Math.FloatBetween(0, Math.PI * 2));
      this.waterGlints.push(glint);
    }
  }

  #createLandmarks(landmarks, accentColor) {
    for (const landmark of landmarks) {
      const container = this.scene.add.container(
        this.width * landmark.x,
        this.height * landmark.y,
      ).setScale(landmark.scale ?? 1).setDepth(-12);

      if (landmark.kind === 'billboard') {
        container.add([
          this.scene.add.rectangle(0, 52, 7, 105, 0x07111d, .92),
          this.scene.add.rectangle(0, 0, 146, 72, 0x07131f, .96).setStrokeStyle(4, accentColor, .65),
          this.scene.add.rectangle(0, 0, 116, 42, accentColor, .16),
          this.scene.add.rectangle(-22, -4, 46, 9, accentColor, .86),
          this.scene.add.rectangle(30, 11, 32, 5, 0xffffff, .46),
        ]);
      } else if (landmark.kind === 'crane') {
        container.add([
          this.scene.add.rectangle(0, -42, 11, 150, 0x0b2835, .96),
          this.scene.add.rectangle(48, -112, 116, 9, 0x174b5a, .98),
          this.scene.add.rectangle(97, -70, 3, 78, accentColor, .55),
          this.scene.add.circle(97, -30, 7, accentColor, .75),
          this.scene.add.rectangle(-18, 34, 70, 18, 0x0a202a, .96),
        ]);
      } else if (landmark.kind === 'antenna') {
        container.add([
          this.scene.add.rectangle(0, -30, 8, 144, 0x111a2f, .94),
          this.scene.add.rectangle(0, -105, 3, 58, accentColor, .55),
          this.scene.add.circle(0, -137, 7, accentColor, .9),
          this.scene.add.circle(0, -137, 17, accentColor, .10),
          this.scene.add.rectangle(-27, 10, 58, 52, 0x101a2d, .96),
        ]);
      }
    }
  }

  #createTraffic(scenery) {
    const count = scenery.trafficCount ?? 8;
    const color = scenery.trafficColor ?? 0xffd36f;
    for (let index = 0; index < count; index += 1) {
      const streak = this.scene.add.rectangle(
        Phaser.Math.Between(0, this.width),
        Phaser.Math.Between(Math.floor(this.height * .72), this.height - 32),
        Phaser.Math.Between(18, 54),
        Phaser.Math.Between(2, 5),
        color,
        Phaser.Math.FloatBetween(.25, .72),
      ).setDepth(-5);
      streak.setData('speed', Phaser.Math.Between(85, 190));
      this.traffic.push(streak);
    }
  }
}
