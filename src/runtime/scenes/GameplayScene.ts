import Phaser from 'phaser';
import type { GameServices } from '../../application/GameServices';
import { gameBalance } from '../../content/config/gameBalance';
import { getLevel } from '../../content/levels/levelCatalog';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { LevelDefinition } from '../../domain/level/LevelDefinition';
import { LaunchController } from '../systems/LaunchController';
import { LevelBuilder, type LevelRuntime } from '../systems/LevelBuilder';
import { OutcomeSystem } from '../systems/OutcomeSystem';
import { GameHud } from '../ui/GameHud';

interface GameplaySceneData {
  readonly levelId: string;
}

export class GameplayScene extends Phaser.Scene {
  #services!: GameServices;
  #flow!: GameFlow;
  #level!: LevelDefinition;
  #runtime!: LevelRuntime;
  #launch!: LaunchController;
  #outcome!: OutcomeSystem;
  #hud!: GameHud;
  #restartKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('gameplay');
  }

  init(data: GameplaySceneData): void {
    this.#level = getLevel(data.levelId);
  }

  create(): void {
    this.#services = this.registry.get('services') as GameServices;
    this.#flow = new GameFlow();
    this.#flow.moveTo(GamePhase.Loading);

    this.matter.set60Hz();

    const builder = new LevelBuilder(this, gameBalance);
    this.#runtime = builder.build(this.#level);
    this.#launch = new LaunchController(
      this,
      this.#runtime.package,
      this.#flow,
      gameBalance.launch,
      gameBalance.package,
      gameBalance.trajectoryPreview,
      this.#level.launchPoint,
    );
    this.#outcome = new OutcomeSystem(
      this.#runtime.package,
      this.#runtime.integrity,
      this.#level.worldBounds,
      this.#level.goal,
      gameBalance,
      this.#flow,
    );
    this.#hud = new GameHud(this, this.#level.id, this.#runtime.integrity, this.#flow);

    this.#restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null;
    this.#restartKey?.on('down', this.#restartLevel, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handleResultPointer, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#shutdown, this);
    this.#flow.subscribe((_previous, current) => {
      if (current === GamePhase.Aiming) {
        this.#services.platform.gameplayStart();
      } else if (current === GamePhase.Success || current === GamePhase.Failure) {
        this.#services.platform.gameplayStop();
      }
    });

    this.#flow.moveTo(GamePhase.Aiming);
  }

  override update(_time: number, delta: number): void {
    this.#outcome.update(delta);
    this.#hud.updateIntegrity(this.#runtime.integrity);
  }

  readonly #handleResultPointer = (): void => {
    if (this.#flow.current === GamePhase.Success || this.#flow.current === GamePhase.Failure) {
      this.#restartLevel();
    }
  };

  readonly #restartLevel = (): void => {
    this.scene.restart({ levelId: this.#level.id });
  };

  readonly #shutdown = (): void => {
    this.#services.platform.gameplayStop();
    this.#restartKey?.off('down', this.#restartLevel, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handleResultPointer, this);
    this.#launch.destroy();
    this.#hud.destroy();
  };
}
