import Phaser from 'phaser';
import type {
  PackageBalance,
  TrajectoryPreviewBalance,
} from '../../content/config/gameBalance';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { AimSolution, LaunchBalance } from '../../domain/launch/calculateAimSolution';
import { calculateAimSolution } from '../../domain/launch/calculateAimSolution';
import type { Vector2 } from '../../domain/launch/Vector2';
import { TrajectoryPreview } from './TrajectoryPreview';

export class LaunchController {
  readonly #preview: TrajectoryPreview;
  readonly #origin: Vector2;
  #aiming = false;
  #solution: AimSolution | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly flow: GameFlow,
    private readonly launchBalance: LaunchBalance,
    private readonly packageBalance: PackageBalance,
    trajectoryBalance: TrajectoryPreviewBalance,
    origin: Vector2,
  ) {
    this.#origin = origin;
    this.#preview = new TrajectoryPreview(scene, trajectoryBalance);

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
  }

  reset(): void {
    this.#aiming = false;
    this.#solution = null;
    this.#preview.clear();
    this.packageImage.setStatic(true);
    this.packageImage.setPosition(this.#origin.x, this.#origin.y);
    this.packageImage.setRotation(0);
    this.packageImage.setVelocity(0, 0);
    this.packageImage.setAngularVelocity(0);
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#preview.destroy();
  }

  readonly #handlePointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (this.flow.current !== GamePhase.Aiming) {
      return;
    }

    const point = this.#worldPoint(pointer);
    const distance = Phaser.Math.Distance.Between(
      point.x,
      point.y,
      this.packageImage.x,
      this.packageImage.y,
    );
    if (distance > this.packageBalance.aimGrabRadiusPixels) {
      return;
    }

    this.#aiming = true;
    this.packageImage.setStatic(true);
    this.#updateAim(point);
  };

  readonly #handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.#aiming) {
      return;
    }
    this.#updateAim(this.#worldPoint(pointer));
  };

  readonly #handlePointerUp = (): void => {
    if (!this.#aiming) {
      return;
    }

    this.#aiming = false;
    const solution = this.#solution;
    this.#preview.clear();

    if (!solution?.valid) {
      this.reset();
      return;
    }

    this.packageImage.setPosition(solution.origin.x, solution.origin.y);
    this.packageImage.setStatic(false);
    this.packageImage.setVelocity(solution.velocity.x, solution.velocity.y);
    this.packageImage.setAngularVelocity(
      this.packageBalance.angularVelocityAtFullStrength * solution.strength01,
    );
    this.flow.moveTo(GamePhase.Flying);
  };

  #updateAim(pointer: Vector2): void {
    const solution = calculateAimSolution(this.#origin, pointer, this.launchBalance);
    this.#solution = solution;
    this.packageImage.setPosition(solution.packagePosition.x, solution.packagePosition.y);
    this.#preview.draw(solution);
  }

  #worldPoint(pointer: Phaser.Input.Pointer): Vector2 {
    const point = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
    return { x: point.x, y: point.y };
  }
}
