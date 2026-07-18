import Phaser from 'phaser';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';

interface CollisionPair {
  readonly bodyA: MatterJS.BodyType;
  readonly bodyB: MatterJS.BodyType;
}

interface CollisionEvent {
  readonly pairs: readonly CollisionPair[];
}

export class ImpactSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly integrity: IntegrityModel,
  ) {
    scene.matter.world.on(
      Phaser.Physics.Matter.Events.COLLISION_START,
      this.#handleCollision,
      this,
    );
  }

  destroy(): void {
    this.scene.matter.world.off(
      Phaser.Physics.Matter.Events.COLLISION_START,
      this.#handleCollision,
      this,
    );
  }

  readonly #handleCollision = (event: CollisionEvent): void => {
    const packageBody = this.packageImage.body;
    if (!packageBody) {
      return;
    }

    let strongestRelativeSpeed = 0;
    for (const pair of event.pairs) {
      const otherBody = this.#otherBody(pair, packageBody);
      if (!otherBody) {
        continue;
      }

      const relativeSpeed = Math.hypot(
        packageBody.velocity.x - otherBody.velocity.x,
        packageBody.velocity.y - otherBody.velocity.y,
      );
      strongestRelativeSpeed = Math.max(strongestRelativeSpeed, relativeSpeed);
    }

    if (strongestRelativeSpeed > 0) {
      this.integrity.applyImpact(strongestRelativeSpeed);
    }
  };

  #otherBody(pair: CollisionPair, packageBody: MatterJS.BodyType): MatterJS.BodyType | null {
    if (this.#belongsToPackage(pair.bodyA, packageBody)) {
      return pair.bodyB;
    }
    if (this.#belongsToPackage(pair.bodyB, packageBody)) {
      return pair.bodyA;
    }
    return null;
  }

  #belongsToPackage(candidate: MatterJS.BodyType, packageBody: MatterJS.BodyType): boolean {
    return candidate === packageBody || candidate.parent === packageBody;
  }
}
