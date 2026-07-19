import { ASSET_KEYS } from '../../config/assetManifest.js';

export const ANIMATION_KEYS = Object.freeze({
  playerIdle: 'pp-player-idle',
  playerFire: 'pp-player-fire',
  playerDamage: 'pp-player-damage',
  scoutFly: 'pp-scout-fly',
  raiderFly: 'pp-raider-fly',
  raiderFire: 'pp-raider-fire',
  interceptorFly: 'pp-interceptor-fly',
  interceptorBoost: 'pp-interceptor-boost',
  shieldPulse: 'pp-shield-pulse',
  rapidPulse: 'pp-rapid-pulse',
  playerBolt: 'pp-player-bolt',
  enemyBolt: 'pp-enemy-bolt',
  explosion: 'pp-explosion',
  pickupBurst: 'pp-pickup-burst',
});

const ATLAS_ASSETS = Object.freeze({
  player: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.playerIdle, scale: 0.5, animation: ANIMATION_KEYS.playerIdle },
  scout: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.scout, scale: 0.5, animation: ANIMATION_KEYS.scoutFly },
  raider: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.raider, scale: 0.5, animation: ANIMATION_KEYS.raiderFly },
  interceptor: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.interceptor, scale: 0.5, animation: ANIMATION_KEYS.interceptorFly },
  parcel: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.parcel, scale: 0.5 },
  shield: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.shield, scale: 0.5, animation: ANIMATION_KEYS.shieldPulse },
  rapid: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.rapid, scale: 0.5, animation: ANIMATION_KEYS.rapidPulse },
  bolt: { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.playerBolt, scale: 0.5, animation: ANIMATION_KEYS.playerBolt },
  'enemy-bolt': { key: ASSET_KEYS.gameplayAtlas, frame: ASSET_KEYS.frames.enemyBolt, scale: 0.5, animation: ANIMATION_KEYS.enemyBolt },
  titleLogo: { key: ASSET_KEYS.uiAtlas, frame: ASSET_KEYS.frames.titleLogo, scale: 0.5 },
});

const FALLBACK_ASSETS = Object.freeze({
  player: { key: 'player', scale: 1 },
  scout: { key: 'scout', scale: 1 },
  raider: { key: 'raider', scale: 1 },
  interceptor: { key: 'interceptor', scale: 1 },
  parcel: { key: 'parcel', scale: 1 },
  shield: { key: 'shield', scale: 1 },
  rapid: { key: 'rapid', scale: 1 },
  bolt: { key: 'bolt', scale: 1 },
  'enemy-bolt': { key: 'enemy-bolt', scale: 1 },
});

export function isAtlasMode(scene) {
  return scene.registry.get('assetMode') === 'atlas';
}

export function getAssetSpec(scene, assetName) {
  const catalog = isAtlasMode(scene) ? ATLAS_ASSETS : FALLBACK_ASSETS;
  const spec = catalog[assetName];
  if (!spec) throw new Error(`Unknown asset: ${assetName}`);
  return spec;
}

export function applyAsset(scene, object, assetName, playAnimation = true) {
  const spec = getAssetSpec(scene, assetName);
  object.setTexture(spec.key, spec.frame);
  object.setScale(spec.scale);
  if (playAnimation && spec.animation && object.anims) object.play(spec.animation, true);
  return object;
}

export function playAnimation(scene, object, animationName, returnAnimationName = null) {
  if (!isAtlasMode(scene) || !object.anims || !scene.anims.exists(animationName)) return;
  object.play(animationName, true);
  if (returnAnimationName) {
    object.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (object.active && scene.anims.exists(returnAnimationName)) object.play(returnAnimationName, true);
    });
  }
}
