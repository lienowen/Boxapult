import Phaser from 'phaser';

export function createParcelPatrolTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('pp-player')) {
    return;
  }

  const graphics = scene.add.graphics();

  graphics.fillStyle(0x000000, 0);
  graphics.fillRect(0, 0, 112, 64);
  graphics.fillStyle(0x19283f, 0.38);
  graphics.fillEllipse(54, 52, 88, 13);
  graphics.fillStyle(0x25c3d9, 1);
  graphics.fillRoundedRect(25, 17, 61, 31, 13);
  graphics.fillStyle(0x79f0ff, 1);
  graphics.fillRoundedRect(38, 23, 28, 12, 5);
  graphics.fillStyle(0x0e1b30, 1);
  graphics.fillCircle(78, 32, 8);
  graphics.fillStyle(0xffb84d, 1);
  graphics.fillTriangle(20, 24, 20, 44, 3, 34);
  graphics.fillStyle(0xf4f7fb, 1);
  graphics.fillRect(43, 39, 28, 13);
  graphics.lineStyle(3, 0x0d1728, 0.75);
  graphics.strokeRoundedRect(25, 17, 61, 31, 13);
  graphics.generateTexture('pp-player', 112, 64);
  graphics.clear();

  graphics.fillStyle(0x000000, 0);
  graphics.fillRect(0, 0, 90, 54);
  graphics.fillStyle(0xff5d73, 1);
  graphics.fillRoundedRect(14, 12, 62, 30, 12);
  graphics.fillStyle(0x781d35, 1);
  graphics.fillTriangle(76, 18, 88, 5, 84, 30);
  graphics.fillStyle(0xffd3da, 1);
  graphics.fillRect(26, 20, 21, 8);
  graphics.fillStyle(0x111a2a, 1);
  graphics.fillCircle(61, 27, 7);
  graphics.lineStyle(3, 0x381122, 0.8);
  graphics.strokeRoundedRect(14, 12, 62, 30, 12);
  graphics.generateTexture('pp-scout', 90, 54);
  graphics.clear();

  graphics.fillStyle(0x000000, 0);
  graphics.fillRect(0, 0, 112, 66);
  graphics.fillStyle(0x9b63ff, 1);
  graphics.fillRoundedRect(13, 13, 82, 40, 14);
  graphics.fillStyle(0x4c287d, 1);
  graphics.fillRect(29, 5, 49, 12);
  graphics.fillStyle(0xe0d0ff, 1);
  graphics.fillRoundedRect(30, 23, 34, 11, 4);
  graphics.fillStyle(0x181129, 1);
  graphics.fillCircle(80, 33, 9);
  graphics.lineStyle(3, 0x321b54, 0.9);
  graphics.strokeRoundedRect(13, 13, 82, 40, 14);
  graphics.generateTexture('pp-raider', 112, 66);
  graphics.clear();

  graphics.fillStyle(0x6ff3ff, 1);
  graphics.fillRoundedRect(0, 3, 30, 8, 4);
  graphics.fillStyle(0xffffff, 0.9);
  graphics.fillRoundedRect(18, 5, 15, 4, 2);
  graphics.generateTexture('pp-bolt', 34, 14);
  graphics.clear();

  graphics.fillStyle(0xff6a79, 1);
  graphics.fillCircle(10, 10, 9);
  graphics.fillStyle(0xffd2d7, 0.85);
  graphics.fillCircle(7, 7, 3);
  graphics.generateTexture('pp-enemy-bolt', 20, 20);
  graphics.clear();

  graphics.fillStyle(0x000000, 0);
  graphics.fillRect(0, 0, 54, 46);
  graphics.fillStyle(0xf3a94d, 1);
  graphics.fillRoundedRect(6, 6, 42, 34, 5);
  graphics.fillStyle(0x8f5725, 1);
  graphics.fillRect(23, 6, 8, 34);
  graphics.fillRect(6, 17, 42, 5);
  graphics.fillStyle(0xfff0ce, 1);
  graphics.fillRect(33, 25, 10, 7);
  graphics.lineStyle(2, 0x6c411f, 0.9);
  graphics.strokeRoundedRect(6, 6, 42, 34, 5);
  graphics.generateTexture('pp-parcel', 54, 46);
  graphics.clear();

  graphics.fillStyle(0xffe287, 1);
  graphics.fillCircle(6, 6, 6);
  graphics.generateTexture('pp-spark', 12, 12);
  graphics.clear();

  drawCityTexture(graphics, 'pp-city-far', 640, 220, 0x173354, 0x244d73, 36, 84);
  drawCityTexture(graphics, 'pp-city-near', 640, 260, 0x10233c, 0x2d5d83, 58, 130);

  graphics.destroy();
}

function drawCityTexture(
  graphics: Phaser.GameObjects.Graphics,
  key: string,
  width: number,
  height: number,
  buildingColor: number,
  windowColor: number,
  minimumHeight: number,
  maximumHeight: number,
): void {
  graphics.clear();
  graphics.fillStyle(0x000000, 0);
  graphics.fillRect(0, 0, width, height);

  let x = 0;
  let index = 0;
  while (x < width) {
    const buildingWidth = 55 + (index % 4) * 16;
    const buildingHeight = minimumHeight + ((index * 37) % (maximumHeight - minimumHeight));
    const y = height - buildingHeight;
    graphics.fillStyle(buildingColor, 1);
    graphics.fillRect(x, y, buildingWidth, buildingHeight);

    graphics.fillStyle(windowColor, 0.55);
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 2; column += 1) {
        const windowX = x + 12 + column * 24;
        const windowY = y + 18 + row * 26;
        if (windowY < height - 12) {
          graphics.fillRect(windowX, windowY, 8, 10);
        }
      }
    }

    x += buildingWidth + 11;
    index += 1;
  }

  graphics.generateTexture(key, width, height);
}
