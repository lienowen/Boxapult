import Phaser from 'phaser';
import type { PackageBalance } from '../../content/config/gameBalance';
import { whiteboxTheme } from '../../content/config/whiteboxTheme';

export class PackagePresenter {
  readonly #shadow: Phaser.GameObjects.Ellipse;
  readonly #details: Phaser.GameObjects.Container;
  readonly #shadowOffset: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly packageImage: Phaser.Physics.Matter.Image,
    packageBalance: PackageBalance,
  ) {
    const width = packageBalance.widthPixels;
    const height = packageBalance.heightPixels;
    this.#shadowOffset = height * 0.72;

    this.#shadow = scene.add
      .ellipse(
        packageImage.x,
        packageImage.y + this.#shadowOffset,
        width * 0.9,
        height * 0.34,
        whiteboxTheme.package.shadow,
        0.24,
      )
      .setDepth(8);

    const outline = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setStrokeStyle(3, whiteboxTheme.package.edge, 0.8);
    const tape = scene.add.rectangle(0, 0, width * 0.18, height + 2, whiteboxTheme.package.tape, 0.92);
    const seam = scene.add.rectangle(0, -height * 0.22, width * 0.86, 4, whiteboxTheme.package.tape, 0.72);
    const label = scene.add.rectangle(
      width * 0.2,
      -height * 0.12,
      width * 0.28,
      height * 0.24,
      whiteboxTheme.package.label,
      1,
    );
    const labelMark = scene.add.rectangle(
      width * 0.2,
      -height * 0.12,
      width * 0.12,
      3,
      whiteboxTheme.package.labelInk,
      0.8,
    );

    this.#details = scene.add
      .container(packageImage.x, packageImage.y, [outline, tape, seam, label, labelMark])
      .setDepth(11);
  }

  update(): void {
    this.#details.setPosition(this.packageImage.x, this.packageImage.y);
    this.#details.setRotation(this.packageImage.rotation);
    this.#shadow.setPosition(this.packageImage.x, this.packageImage.y + this.#shadowOffset);
  }

  destroy(): void {
    this.#shadow.destroy();
    this.#details.destroy(true);
  }
}
