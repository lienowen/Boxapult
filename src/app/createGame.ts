import Phaser from 'phaser';
import type { GameServices } from '../application/GameServices';
import { LocalPlatformAdapter } from '../infrastructure/platform/LocalPlatformAdapter';
import { LocalStorageSaveAdapter } from '../infrastructure/save/LocalStorageSaveAdapter';
import { BootScene } from '../runtime/scenes/BootScene';
import { GameplayScene } from '../runtime/scenes/GameplayScene';

export function createGame(parent: string): Phaser.Game {
  const services: GameServices = {
    platform: new LocalPlatformAdapter(),
    save: new LocalStorageSaveAdapter('boxapult_save_v1'),
  };

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1920,
    height: 1080,
    backgroundColor: '#182842',
    transparent: false,
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    input: {
      activePointers: 1,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 1 },
        enableSleeping: true,
        positionIterations: 8,
        velocityIterations: 6,
        constraintIterations: 2,
        debug: false,
      },
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('services', services);
      },
    },
    scene: [BootScene, GameplayScene],
  });
}
