import { ASSET_KEYS } from '../../config/assetManifest.js';
import { ANIMATION_KEYS } from '../systems/AssetCatalog.js';
import { ensureEnvironmentTextures, ensureTextures } from '../systems/ArtFactory.js';

export class BootScene extends Phaser.Scene {
  constructor(){super('boot');}

  preload(){
    const width=this.scale.width;
    const height=this.scale.height;
    this.cameras.main.setBackgroundColor('#090b18');
    this.add.text(width/2,height/2-105,'CARGO RENEGADE',{fontFamily:'Arial Black',fontSize:'46px',color:'#ffffff',stroke:'#050813',strokeThickness:8,letterSpacing:3}).setOrigin(.5);
    this.add.text(width/2,height/2-48,'INFILTRATING CORPORATE AIRSPACE',{fontFamily:'Arial',fontSize:'18px',color:'#ff7897',fontStyle:'bold',letterSpacing:3}).setOrigin(.5);
    this.add.rectangle(width/2,height/2+20,520,24,0x060912,.94).setStrokeStyle(2,0xff6f9f,.38);
    const progressBar=this.add.rectangle(width/2-252,height/2+20,504,12,0xff5b78).setOrigin(0,.5);
    const progressText=this.add.text(width/2,height/2+62,'0%',{fontFamily:'Arial Black',fontSize:'20px',color:'#ffffff'}).setOrigin(.5);
    const statusText=this.add.text(width/2,height/2+98,'Arming renegade systems…',{fontFamily:'Arial',fontSize:'16px',color:'#cde7f2'}).setOrigin(.5);

    this.load.on('progress',value=>{
      progressBar.setScale(Phaser.Math.Clamp(value,0,1),1);
      progressText.setText(`${Math.round(value*100)}%`);
    });
    this.load.on('fileprogress',file=>statusText.setText(`Loading ${formatAssetName(file.key)}…`));
    this.load.on('loaderror',()=>this.registry.set('assetLoadFailed',true));

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
    const atlasReady =
      this.registry.get('assetLoadFailed')!==true &&
      this.textures.exists(ASSET_KEYS.gameplayAtlas) &&
      this.textures.exists(ASSET_KEYS.uiAtlas);
    this.registry.set('assetMode', atlasReady ? 'atlas' : 'fallback');

    if (atlasReady) {
      ensureEnvironmentTextures(this);
      createAtlasAnimations(this);
    } else {
      ensureTextures(this);
    }

    this.cameras.main.fadeOut(180,5,15,26);
    this.time.delayedCall(190,()=>this.scene.start('title'));
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

function formatAssetName(key){
  return String(key).replaceAll('-',' ').toUpperCase();
}
