import Phaser from 'phaser';
import type { LevelDefinition } from '../../domain/level/LevelDefinition';
import { IntegrityModel } from '../../domain/package/IntegrityModel';
import type { GameBalance } from '../../content/config/gameBalance';

export interface LevelRuntime {
  readonly package: Phaser.Physics.Matter.Image;
  readonly integrity: IntegrityModel;
}

export class LevelBuilder {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly balance: GameBalance,
  ) {}

  build(level: LevelDefinition): LevelRuntime {
    this.scene.cameras.main.setBackgroundColor('#182842');

    for (const object of level.objects) {
      const display = this.scene.add
        .rectangle(object.x, object.y, object.width, object.height, object.tint ?? 0x58708f)
        .setStrokeStyle(3, 0x91a9c6, 0.45);

      this.scene.matter.add.gameObject(display, {
        isStatic: true,
        angle: Phaser.Math.DegToRad(object.angleDegrees ?? 0),
        label: object.id,
        friction: 0.8,
      });
    }

    this.scene.add
      .rectangle(level.goal.x, level.goal.y, level.goal.width, level.goal.height, 0x4fc47b, 0.18)
      .setStrokeStyle(5, 0x6ef09d, 0.9);
    this.scene.add
      .text(level.goal.x, level.goal.y - level.goal.height / 2 - 28, 'DELIVERY ZONE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#baffcf',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const packageImage = this.scene.matter.add.image(
      level.launchPoint.x,
      level.launchPoint.y,
      'pixel',
      undefined,
      {
        label: 'package',
        friction: 0.45,
        frictionAir: 0.008,
        restitution: 0.12,
        density: 0.002,
      },
    );
    packageImage.setDisplaySize(84, 62);
    packageImage.setRectangle(84, 62, { chamfer: { radius: 5 } });
    packageImage.setTint(0xd99a4e);
    packageImage.setStatic(true);
    packageImage.setDepth(10);

    const integrity = new IntegrityModel(this.balance.integrity);
    return { package: packageImage, integrity };
  }
}
