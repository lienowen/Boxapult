import Phaser from 'phaser';
import type { GameServices } from '../../application/GameServices';
import { firstLevelId } from '../../content/levels/levelCatalog';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 8, 8);
    graphics.generateTexture('pixel', 8, 8);
    graphics.destroy();

    const services = this.registry.get('services') as GameServices;
    void services.platform.initialize().then(() => {
      this.scene.start('gameplay', { levelId: firstLevelId });
    });
  }
}
