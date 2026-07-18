import Phaser from 'phaser';
import type { ParcelPatrolServices } from '../application/ParcelPatrolServices';
import { LocalPlatformAdapter } from '../infrastructure/platform/LocalPlatformAdapter';
import { LocalHighScoreAdapter } from '../infrastructure/save/LocalHighScoreAdapter';
import { ToneSfx } from '../runtime/parcelPatrol/ToneSfx';
import { ParcelGameScene } from '../runtime/scenes/ParcelGameScene';
import { ParcelResultScene } from '../runtime/scenes/ParcelResultScene';
import { ParcelTitleScene } from '../runtime/scenes/ParcelTitleScene';

export function createParcelPatrol(parent: string): Phaser.Game {
  const services: ParcelPatrolServices = {
    platform: new LocalPlatformAdapter(),
    highScore: new LocalHighScoreAdapter('parcel_patrol_best_v1'),
  };
  const sfx = new ToneSfx();
  void services.platform.initialize();

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#10233d',
    transparent: false,
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    input: {
      activePointers: 2,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('parcelServices', services);
        game.registry.set('parcelSfx', sfx);
      },
    },
    scene: [ParcelTitleScene, ParcelGameScene, ParcelResultScene],
  });
}
