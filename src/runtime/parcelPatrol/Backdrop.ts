import Phaser from 'phaser';

export interface ParcelPatrolBackdrop {
  readonly farCity: Phaser.GameObjects.TileSprite;
  readonly nearCity: Phaser.GameObjects.TileSprite;
  update(deltaMs: number, speedMultiplier?: number): void;
}

export function addParcelPatrolBackdrop(scene: Phaser.Scene): ParcelPatrolBackdrop {
  const { width, height } = scene.scale;

  scene.add.rectangle(width / 2, height * 0.16, width, height * 0.32, 0x10233d).setDepth(-30);
  scene.add.rectangle(width / 2, height * 0.49, width, height * 0.34, 0x1b4264).setDepth(-30);
  scene.add.rectangle(width / 2, height * 0.83, width, height * 0.34, 0x34749a).setDepth(-30);

  scene.add.circle(width * 0.78, height * 0.2, 62, 0xffd87a, 0.88).setDepth(-28);
  scene.add.circle(width * 0.78, height * 0.2, 88, 0xffd87a, 0.1).setDepth(-29);

  const farCity = scene.add
    .tileSprite(width / 2, height - 250, width, 220, 'pp-city-far')
    .setDepth(-20);
  const nearCity = scene.add
    .tileSprite(width / 2, height - 130, width, 260, 'pp-city-near')
    .setDepth(-10);

  const cloudGroup = scene.add.container(0, 0).setDepth(-24);
  for (let index = 0; index < 7; index += 1) {
    const cloud = scene.add.container(index * 230 + 60, 95 + (index % 3) * 58);
    cloud.add([
      scene.add.ellipse(0, 10, 96, 24, 0xd9f3ff, 0.12),
      scene.add.circle(-26, 1, 18, 0xd9f3ff, 0.12),
      scene.add.circle(8, -4, 25, 0xd9f3ff, 0.12),
      scene.add.circle(34, 6, 15, 0xd9f3ff, 0.12),
    ]);
    cloudGroup.add(cloud);
  }

  return {
    farCity,
    nearCity,
    update(deltaMs: number, speedMultiplier = 1): void {
      const deltaSeconds = deltaMs / 1000;
      farCity.tilePositionX += 18 * speedMultiplier * deltaSeconds;
      nearCity.tilePositionX += 54 * speedMultiplier * deltaSeconds;
      cloudGroup.x -= 7 * speedMultiplier * deltaSeconds;
      if (cloudGroup.x < -230) {
        cloudGroup.x += 230;
      }
    },
  };
}
