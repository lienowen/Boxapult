import { ensureTextures } from '../systems/ArtFactory.js';
export class BootScene extends Phaser.Scene {
  constructor(){super('boot');}
  create(){ensureTextures(this);this.scene.start('title');}
}
