import { ASSET_KEYS } from '../../config/assetManifest.js';
import { ANIMATION_KEYS } from '../systems/AssetCatalog.js';
import { ensureEnvironmentTextures, ensureTextures } from '../systems/ArtFactory.js';

export class BootScene extends Phaser.Scene {
  constructor(){super('boot');}

  preload(){
    this.load.atlas(
      ASSET_KEYS.gameplayAtlas,
      ASSET_KEYS.atlasSources.gameplay.textureURL,
      ASSET_KEYS.atlasSources.gameplay.atlasURL,
    );
    this.load.atlas(
      ASSET_KEYS.uiAtlas,
      ASSET_KEYS.atlasSources.ui.textureURL,
      ASSET_KEYS.atlasSources.ui.atlasURL,
    );
  }

  create(){
    const atlasReady = this.textures.exists(ASSET_KEYS.gameplayAtlas) && this.textures.exists(ASSET_KEYS.uiAtlas);
    this.registry.set('assetMode', atlasReady ? 'atlas' : 'fallback');

    if (atlasReady) {
      ensureEnvironmentTextures(this);
      createAtlasAnimations(this);
    } else {
      ensureTextures(this);
    }

    this.scene.start('title');
  }
}

function createAtlasAnimations(scene){
  create(scene, ANIMATION_KEYS.playerIdle, ASSET_KEYS.animations.playerIdle, 7, -1);
  create(scene, ANIMATION_KEYS.playerFire, ASSET_KEYS.animations.playerFire, 12, 0);
  create(scene, ANIMATION_KEYS.playerDamage, ASSET_KEYS.animations.playerDamage, 9, 0);
  create(scene, ANIMATION_KEYS.scoutFly, ASSET_KEYS.animations.scoutFly, 7, -1);
  create(scene, ANIMATION_KEYS.raiderFly, ASSET_KEYS.animations.raiderFly, 7, -1);
  create(scene, ANIMATION_KEYS.raiderFire, ASSET_KEYS.animations.raiderFire, 11, 0);
  create(scene, ANIMATION_KEYS.interceptorFly, ASSET_KEYS.animations.interceptorFly, 8, -1);
  create(scene, ANIMATION_KEYS.interceptorBoost, ASSET_KEYS.animations.interceptorBoost, 12, -1);
  create(scene, ANIMATION_KEYS.shieldPulse, ASSET_KEYS.animations.shield, 8, -1);
  create(scene, ANIMATION_KEYS.rapidPulse, ASSET_KEYS.animations.rapid, 8, -1);
  create(scene, ANIMATION_KEYS.playerBolt, ASSET_KEYS.animations.playerBolt, 12, -1);
  create(scene, ANIMATION_KEYS.enemyBolt, ASSET_KEYS.animations.enemyBolt, 12, -1);
  create(scene, ANIMATION_KEYS.explosion, ASSET_KEYS.animations.explosion, 18, 0);
  create(scene, ANIMATION_KEYS.pickupBurst, ASSET_KEYS.animations.pickupBurst, 16, 0);
}

function create(scene,key,frameNames,frameRate,repeat){
  if(scene.anims.exists(key))return;
  scene.anims.create({
    key,
    frames: frameNames.map(frame=>({key:ASSET_KEYS.gameplayAtlas,frame})),
    frameRate,
    repeat,
  });
}