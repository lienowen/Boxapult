import Phaser from 'phaser';
import type { GameBalance } from '../../content/config/gameBalance';
import { whiteboxTheme } from '../../content/config/whiteboxTheme';
import type { LevelDefinition, LevelObjectDefinition } from '../../domain/level/LevelDefinition';
import { IntegrityModel } from '../../domain/package/IntegrityModel';
import { PackagePresenter } from '../presentation/PackagePresenter';

export interface LevelRuntime {
  readonly package: Phaser.Physics.Matter.Image;
  readonly packagePresenter: PackagePresenter;
  readonly integrity: IntegrityModel;
}

export class LevelBuilder {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly balance: GameBalance,
  ) {}

  build(level: LevelDefinition): LevelRuntime {
    this.#drawBackdrop(level);

    for (const object of level.objects) {
      this.#buildStaticObject(object);
    }

    this.#drawGoal(level);

    const packageBalance = this.balance.package;
    const packageImage = this.scene.matter.add.image(
      level.launchPoint.x,
      level.launchPoint.y,
      'pixel',
      undefined,
      {
        label: 'package',
        friction: packageBalance.friction,
        frictionAir: packageBalance.frictionAir,
        restitution: packageBalance.restitution,
        density: packageBalance.density,
      },
    );
    packageImage.setDisplaySize(packageBalance.widthPixels, packageBalance.heightPixels);
    packageImage.setRectangle(packageBalance.widthPixels, packageBalance.heightPixels, {
      chamfer: { radius: packageBalance.chamferRadiusPixels },
    });
    packageImage.setTint(whiteboxTheme.package.fill);
    packageImage.setStatic(true);
    packageImage.setDepth(10);

    const packagePresenter = new PackagePresenter(this.scene, packageImage, packageBalance);
    const integrity = new IntegrityModel(this.balance.integrity);
    return { package: packageImage, packagePresenter, integrity };
  }

  #drawBackdrop(level: LevelDefinition): void {
    const bounds = level.worldBounds;
    const centerX = bounds.x + bounds.width / 2;

    this.scene.add
      .rectangle(centerX, bounds.y + bounds.height * 0.16, bounds.width, bounds.height * 0.32, whiteboxTheme.backdrop.top)
      .setDepth(-30);
    this.scene.add
      .rectangle(centerX, bounds.y + bounds.height * 0.49, bounds.width, bounds.height * 0.34, whiteboxTheme.backdrop.middle)
      .setDepth(-30);
    this.scene.add
      .rectangle(centerX, bounds.y + bounds.height * 0.82, bounds.width, bounds.height * 0.32, whiteboxTheme.backdrop.lower)
      .setDepth(-30);

    const buildings = [
      { x: 90, width: 250, height: 330 },
      { x: 350, width: 210, height: 250 },
      { x: 1540, width: 250, height: 300 },
      { x: 1800, width: 180, height: 390 },
    ];

    for (const building of buildings) {
      const y = 430 - building.height / 2;
      this.scene.add
        .rectangle(building.x, y, building.width, building.height, whiteboxTheme.backdrop.silhouette, 0.42)
        .setDepth(-20);

      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 2; column += 1) {
          this.scene.add
            .rectangle(
              building.x - building.width * 0.22 + column * building.width * 0.44,
              y - building.height * 0.28 + row * building.height * 0.27,
              24,
              16,
              whiteboxTheme.backdrop.window,
              0.32,
            )
            .setDepth(-19);
        }
      }
    }
  }

  #buildStaticObject(object: LevelObjectDefinition): void {
    const angle = Phaser.Math.DegToRad(object.angleDegrees ?? 0);
    const fill = object.tint ?? whiteboxTheme.platform.fill;

    this.scene.add
      .rectangle(
        object.x + 9,
        object.y + 11,
        object.width,
        object.height,
        whiteboxTheme.platform.shadow,
        0.46,
      )
      .setRotation(angle)
      .setDepth(0);

    const display = this.scene.add
      .rectangle(object.x, object.y, object.width, object.height, fill)
      .setStrokeStyle(3, whiteboxTheme.platform.edge, 0.72)
      .setDepth(2);

    this.scene.matter.add.gameObject(display, {
      isStatic: true,
      angle,
      label: object.id,
      friction: 0.8,
    });

    if (angle === 0) {
      this.scene.add
        .rectangle(
          object.x,
          object.y - object.height / 2 + 5,
          Math.max(8, object.width - 8),
          8,
          whiteboxTheme.platform.top,
          0.66,
        )
        .setDepth(3);
    }
  }

  #drawGoal(level: LevelDefinition): void {
    const goal = level.goal;

    this.scene.add
      .rectangle(goal.x, goal.y, goal.width + 30, goal.height + 30, whiteboxTheme.goal.glow, 0.08)
      .setDepth(4);
    this.scene.add
      .rectangle(goal.x, goal.y, goal.width, goal.height, whiteboxTheme.goal.fill, 0.16)
      .setStrokeStyle(5, whiteboxTheme.goal.border, 0.95)
      .setDepth(5);

    const arrowY = goal.y + goal.height / 2 - 28;
    for (const offsetX of [-56, 0, 56]) {
      this.scene.add
        .triangle(
          goal.x + offsetX,
          arrowY,
          0,
          0,
          18,
          0,
          9,
          12,
          whiteboxTheme.goal.border,
          0.82,
        )
        .setOrigin(0.5)
        .setDepth(6);
    }

    this.scene.add
      .text(goal.x, goal.y - goal.height / 2 - 34, 'DROP ZONE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: whiteboxTheme.goal.label,
        fontStyle: 'bold',
        backgroundColor: '#102438',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(6);
  }
}
