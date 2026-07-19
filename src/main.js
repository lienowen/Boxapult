import { ROUTES } from './config/routes.js';
import { ProgressStore } from './infrastructure/ProgressStore.js';
import { AudioManager } from './game/systems/AudioManager.js';
import { BootScene } from './game/scenes/BootScene.js';
import { TitleScene } from './game/scenes/TitleScene.js';
import { RouteSelectScene } from './game/scenes/RouteSelectScene.js';
import { GameScene } from './game/scenes/GameScene.js';
import { ResultScene } from './game/scenes/ResultScene.js';

if (!globalThis.Phaser) {
  document.getElementById('load-error').hidden = false;
  throw new Error('Phaser failed to load');
}
const platform = Object.freeze({ gameplayStart(){}, gameplayStop(){} });
const progress = new ProgressStore();
const audio = new AudioManager();
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#10233d',
  antialias: true,
  input: { activePointers: 2 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  callbacks: { preBoot(game){ game.registry.set('routes',ROUTES);game.registry.set('progress',progress);game.registry.set('audio',audio);game.registry.set('platform',platform); } },
  scene: [BootScene, TitleScene, RouteSelectScene, GameScene, ResultScene],
});
