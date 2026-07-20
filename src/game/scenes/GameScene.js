import { ASSET_KEYS } from '../../config/assetManifest.js';
import { getRoute } from '../../config/routes.js';
import { MissionSession } from '../../domain/MissionSession.js';
import {
  ANIMATION_KEYS,
  applyAsset,
  getAssetSpec,
  isAtlasMode,
  playAnimation,
} from '../systems/AssetCatalog.js';
import { Backdrop } from '../systems/Backdrop.js';
import { SpawnDirector } from '../systems/SpawnDirector.js';
import { GameplayControlsOverlay } from '../ui/GameplayControlsOverlay.js';
import { Hud } from '../ui/Hud.js';

const ENEMY_POINTS={scout:100,raider:220,interceptor:170};

export class GameScene extends Phaser.Scene {
  constructor(){super('game');}

  init(data){
    this.route=getRoute(data.routeId);
    this.session=new MissionSession(this.route);
    this.finished=false;
    this.pointerY=null;
    this.lastFire=-9999;
    this.invulnerableUntil=0;
    this.shieldUntil=0;
    this.rapidUntil=0;
    this.nextEnemyShot=0;
    this.pauseStartedAt=null;
    this.controls=null;
  }

  create(){
    this.audio=this.registry.get('audio');
    this.backdrop=new Backdrop(this,this.route);
    this.director=new SpawnDirector(this.route);
    this.hud=new Hud(this,this.route);

    const playerSpec=getAssetSpec(this,'player');
    this.player=this.physics.add.sprite(155,360,playerSpec.key,playerSpec.frame).setCollideWorldBounds(true).setDepth(20);
    applyAsset(this,this.player,'player');
    setWorldBodySize(this.player,78,40);

    this.enemies=this.physics.add.group({maxSize:50});
    this.bolts=this.physics.add.group({maxSize:70});
    this.enemyBolts=this.physics.add.group({maxSize:45});
    this.parcels=this.physics.add.group({maxSize:16});
    this.powerups=this.physics.add.group({maxSize:8});
    this.sparks=this.add.group({maxSize:80});

    this.cursors=this.input.keyboard?.createCursorKeys()??null;
    this.up=this.input.keyboard?.addKey('W')??null;
    this.down=this.input.keyboard?.addKey('S')??null;
    this.fireKey=this.input.keyboard?.addKey('SPACE')??null;
    this.fireKey?.on('down',this.fire,this);
    this.input.on('pointermove',this.pointerMove,this);
    this.input.on('pointerdown',this.pointerDown,this);

    this.physics.add.overlap(this.bolts,this.enemies,(b,e)=>this.hitEnemy(b,e));
    this.physics.add.overlap(this.player,this.enemyBolts,(_p,b)=>this.damage(b));
    this.physics.add.overlap(this.player,this.enemies,(_p,e)=>this.damage(e));
    this.physics.add.overlap(this.player,this.parcels,(_p,p)=>this.collectParcel(p));
    this.physics.add.overlap(this.player,this.powerups,(_p,p)=>this.collectPowerup(p));

    this.events.once('shutdown',this.shutdown,this);
    this.registry.get('platform').gameplayStart();
    this.controls=new GameplayControlsOverlay(this,{
      audio:this.audio,
      settings:this.registry.get('settings'),
      onPauseChange:(paused)=>this.setRoutePaused(paused),
      onQuit:()=>this.quitRoute(),
    });
    this.cameras.main.fadeIn(200,5,15,26);
  }

  update(time,delta){
    if(this.finished||this.controls?.blocksGameplay)return;
    this.backdrop.update(delta,1+this.session.score/13000);
    this.movePlayer(delta);
    this.session.tick(delta);
    const progress=1-this.session.remainingMs/(this.route.durationSeconds*1000);
    this.director.update(delta,progress,{
      enemy:k=>this.spawnEnemy(k,time),
      parcel:()=>this.spawnParcel(),
      powerup:k=>this.spawnPowerup(k),
    });
    this.updateEnemies(time);
    this.cleanup();
    this.hud.update(this.session,this.powerLabel(time));
    if(this.session.ended)this.finish();
  }

  movePlayer(delta){
    const up=this.cursors?.up.isDown||this.up?.isDown;
    const down=this.cursors?.down.isDown||this.down?.isDown;
    const speed=this.route.playerSpeed;
    if(up){
      this.player.setVelocityY(-speed);this.pointerY=null;
    }else if(down){
      this.player.setVelocityY(speed);this.pointerY=null;
    }else if(this.pointerY!==null){
      const diff=this.pointerY-this.player.y;
      this.player.setVelocityY(Math.abs(diff)<6?0:Phaser.Math.Clamp(diff*6.4,-speed,speed));
    }else{
      this.player.setVelocityY(0);
    }
    this.player.setAngle(Phaser.Math.Clamp(this.player.body.velocity.y/speed,-1,1)*8);
    this.player.x=Phaser.Math.Linear(this.player.x,155,Math.min(1,delta*.004));
  }

  spawnEnemy(kind,time){
    const spec=getAssetSpec(this,kind);
    const y=Phaser.Math.Between(135,this.scale.height-100);
    const enemy=this.enemies.get(this.scale.width+100,y,spec.key,spec.frame);
    if(!enemy)return;

    enemy.enableBody(true,this.scale.width+100,y,true,true);
    applyAsset(this,enemy,kind);
    enemy.setAlpha(1).clearTint().setDepth(15);
    enemy.setData({
      kind,
      hp:kind==='raider'?2:1,
      bornAt:time,
      baseY:y,
      nextShot:time+Phaser.Math.Between(850,1600),
    });

    const base=kind==='interceptor'?330:kind==='scout'?250:185;
    enemy.setVelocityX(-base*this.route.speedMultiplier);
    setWorldBodySize(
      enemy,
      kind==='raider'?82:kind==='interceptor'?68:62,
      kind==='raider'?44:36,
    );
  }

  updateEnemies(time){
    this.enemies.children.iterate(enemy=>{
      if(!enemy?.active)return;
      const kind=enemy.getData('kind');
      const age=(time-enemy.getData('bornAt'))/1000;
      if(kind==='interceptor')enemy.y=enemy.getData('baseY')+Math.sin(age*4.2)*82;
      if(kind==='raider'&&enemy.x<this.scale.width-120&&time>=enemy.getData('nextShot')){
        this.enemyFire(enemy);
        enemy.setData('nextShot',time+Phaser.Math.Between(1100,1900));
      }
    });
  }

  spawnParcel(){
    const spec=getAssetSpec(this,'parcel');
    const y=Phaser.Math.Between(145,this.scale.height-105);
    const parcel=this.parcels.get(this.scale.width+70,y,spec.key,spec.frame);
    if(!parcel)return;
    parcel.enableBody(true,this.scale.width+70,y,true,true);
    applyAsset(this,parcel,'parcel',false);
    parcel.setAlpha(1).setVelocityX(-190*this.route.speedMultiplier).setAngularVelocity(28).setDepth(14);
  }

  spawnPowerup(kind){
    const spec=getAssetSpec(this,kind);
    const y=Phaser.Math.Between(150,this.scale.height-110);
    const powerup=this.powerups.get(this.scale.width+70,y,spec.key,spec.frame);
    if(!powerup)return;
    powerup.enableBody(true,this.scale.width+70,y,true,true);
    applyAsset(this,powerup,kind);
    powerup.setAlpha(1).setVelocityX(-170*this.route.speedMultiplier).setAngularVelocity(42).setData('kind',kind).setDepth(14);
  }

  fire(){
    if(this.controls?.blocksGameplay)return;
    const time=this.time.now;
    const cooldown=time<this.rapidUntil?105:220;
    if(this.finished||time-this.lastFire<cooldown)return;

    const spec=getAssetSpec(this,'bolt');
    const bolt=this.bolts.get(this.player.x+58,this.player.y,spec.key,spec.frame);
    if(!bolt)return;
    this.lastFire=time;
    bolt.enableBody(true,this.player.x+58,this.player.y,true,true);
    applyAsset(this,bolt,'bolt');
    bolt.setAlpha(1).setVelocityX(900).setDepth(18);
    playAnimation(this,this.player,ANIMATION_KEYS.playerFire,ANIMATION_KEYS.playerIdle);
    this.audio.play('fire');
  }

  enemyFire(enemy){
    const spec=getAssetSpec(this,'enemy-bolt');
    const bolt=this.enemyBolts.get(enemy.x-38,enemy.y,spec.key,spec.frame);
    if(!bolt)return;
    bolt.enableBody(true,enemy.x-38,enemy.y,true,true);
    applyAsset(this,bolt,'enemy-bolt');
    bolt.setAlpha(1).setDepth(17);
    this.physics.moveToObject(bolt,this.player,300*this.route.speedMultiplier);
    if(enemy.getData('kind')==='raider'){
      playAnimation(this,enemy,ANIMATION_KEYS.raiderFire,ANIMATION_KEYS.raiderFly);
    }
  }

  hitEnemy(bolt,enemy){
    if(!bolt.active||!enemy.active)return;
    bolt.disableBody(true,true);
    const hp=enemy.getData('hp')-1;
    enemy.setData('hp',hp);
    this.burst(enemy.x,enemy.y,hp<=0?0xffd36f:0xffffff,hp<=0?12:5);
    this.audio.play('hit');
    if(hp>0){
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(65,()=>enemy.active&&enemy.clearTint());
      return;
    }
    const points=this.session.destroyEnemy(ENEMY_POINTS[enemy.getData('kind')]);
    this.floatText(enemy.x,enemy.y,`+${points}`);
    this.playEffect(ANIMATION_KEYS.explosion,enemy.x,enemy.y,.5);
    enemy.disableBody(true,true);
  }

  collectParcel(parcel){
    if(!parcel.active)return;
    parcel.disableBody(true,true);
    const points=this.session.collectParcel();
    this.audio.play('pickup');
    this.playEffect(ANIMATION_KEYS.pickupBurst,this.player.x+35,this.player.y,.5);
    this.burst(this.player.x+35,this.player.y,0x72f6b8,12);
    this.floatText(this.player.x+95,this.player.y-28,`CORE SECURED +${points}`);
  }

  collectPowerup(powerup){
    if(!powerup.active)return;
    const kind=powerup.getData('kind');
    powerup.disableBody(true,true);
    if(kind==='shield'){
      this.shieldUntil=this.time.now+7000;
      this.audio.play('shield');
      this.player.setTint(0x8eeeff);
    }else{
      this.rapidUntil=this.time.now+8000;
      this.audio.play('rapid');
    }
    this.playEffect(ANIMATION_KEYS.pickupBurst,this.player.x+30,this.player.y,.5);
    this.floatText(this.player.x+90,this.player.y-35,kind==='shield'?'SHIELD 7s':'RAPID FIRE 8s');
  }

  damage(source){
    if(!source.active||this.finished)return;
    source.disableBody(true,true);
    if(this.time.now<this.shieldUntil){
      this.shieldUntil=0;
      this.player.clearTint();
      this.audio.play('shield');
      this.playEffect(ANIMATION_KEYS.pickupBurst,this.player.x,this.player.y,.5);
      this.burst(this.player.x,this.player.y,0x72e8ff,18);
      return;
    }
    if(this.time.now<this.invulnerableUntil)return;
    this.invulnerableUntil=this.time.now+900;
    this.session.takeDamage();
    this.audio.play('damage');
    this.cameras.main.shake(160,.012);
    this.cameras.main.flash(150,255,70,85);
    this.burst(this.player.x,this.player.y,0xff7184,18);
    playAnimation(this,this.player,ANIMATION_KEYS.playerDamage,ANIMATION_KEYS.playerIdle);
    this.tweens.add({targets:this.player,alpha:.2,duration:90,yoyo:true,repeat:5,onComplete:()=>this.player.setAlpha(1)});
  }

  cleanup(){
    for(const enemy of this.enemies.getChildren())if(enemy.active&&enemy.x<-125){enemy.disableBody(true,true);this.session.combo=Math.max(1,this.session.combo-.25);}
    for(const bolt of this.bolts.getChildren())if(bolt.active&&bolt.x>this.scale.width+90)bolt.disableBody(true,true);
    for(const bolt of this.enemyBolts.getChildren())if(bolt.active&&(bolt.x<-70||bolt.y<-70||bolt.y>this.scale.height+70))bolt.disableBody(true,true);
    for(const parcel of this.parcels.getChildren())if(parcel.active&&parcel.x<-75){parcel.disableBody(true,true);this.session.missParcel();}
    for(const powerup of this.powerups.getChildren())if(powerup.active&&powerup.x<-75)powerup.disableBody(true,true);
  }

  powerLabel(time){
    if(time<this.shieldUntil)return`SHIELD ${Math.ceil((this.shieldUntil-time)/1000)}s`;
    if(this.shieldUntil>0){this.shieldUntil=0;this.player.clearTint();}
    if(time<this.rapidUntil)return`RAPID ${Math.ceil((this.rapidUntil-time)/1000)}s`;
    return'';
  }

  setRoutePaused(paused){
    if(paused){
      if(this.pauseStartedAt===null)this.pauseStartedAt=this.time.now;
      this.player.setVelocity(0,0);
      this.physics.world.pause();
      this.registry.get('platform').gameplayStop();
      return;
    }

    const pausedFor=this.pauseStartedAt===null?0:this.time.now-this.pauseStartedAt;
    if(pausedFor>0)this.shiftGameplayTimestamps(pausedFor);
    this.pauseStartedAt=null;
    this.physics.world.resume();
    if(!this.finished)this.registry.get('platform').gameplayStart();
  }

  shiftGameplayTimestamps(durationMs){
    if(this.lastFire>-9000)this.lastFire+=durationMs;
    if(this.invulnerableUntil>0)this.invulnerableUntil+=durationMs;
    if(this.shieldUntil>0)this.shieldUntil+=durationMs;
    if(this.rapidUntil>0)this.rapidUntil+=durationMs;

    for(const enemy of this.enemies.getChildren()){
      if(!enemy.active)continue;
      const bornAt=enemy.getData('bornAt');
      const nextShot=enemy.getData('nextShot');
      if(Number.isFinite(bornAt))enemy.setData('bornAt',bornAt+durationMs);
      if(Number.isFinite(nextShot))enemy.setData('nextShot',nextShot+durationMs);
    }
  }

  quitRoute(){
    if(this.finished)return;
    this.finished=true;
    this.pauseStartedAt=null;
    this.physics.world.resume();
    this.registry.get('platform').gameplayStop();
    this.scene.start('routes');
  }

  finish(){
    if(this.finished)return;
    this.finished=true;
    this.registry.get('platform').gameplayStop();
    const result=this.session.snapshot();
    this.registry.get('progress').saveResult(result);
    this.audio.play(result.success?'success':'failure');
    this.cameras.main.fadeOut(320,5,15,26);
    this.time.delayedCall(340,()=>this.scene.start('result',result));
  }

  playEffect(animationKey,x,y,scale){
    if(!isAtlasMode(this)||!this.anims.exists(animationKey))return;
    const frames=animationKey===ANIMATION_KEYS.explosion?ASSET_KEYS.animations.explosion:ASSET_KEYS.animations.pickupBurst;
    const effect=this.add.sprite(x,y,ASSET_KEYS.gameplayAtlas,frames[0]).setScale(scale).setDepth(60);
    effect.play(animationKey);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>effect.destroy());
  }

  floatText(x,y,msg){
    const text=this.add.text(x,y,msg,{fontFamily:'Arial Black',fontSize:'21px',color:'#fff',stroke:'#091525',strokeThickness:5}).setOrigin(.5).setDepth(80);
    this.tweens.add({targets:text,y:y-55,alpha:0,duration:650,ease:'Cubic.out',onComplete:()=>text.destroy()});
  }

  burst(x,y,color,count){
    for(let i=0;i<count;i++){
      const spark=this.add.image(x,y,'spark').setTint(color).setDepth(40);
      const angle=Phaser.Math.FloatBetween(0,Math.PI*2);
      const distance=Phaser.Math.Between(30,95);
      this.tweens.add({targets:spark,x:x+Math.cos(angle)*distance,y:y+Math.sin(angle)*distance,scale:0,alpha:0,duration:Phaser.Math.Between(250,520),ease:'Cubic.out',onComplete:()=>spark.destroy()});
    }
  }

  pointerMove(pointer){
    if(this.controls?.blocksGameplay)return;
    this.pointerY=Phaser.Math.Clamp(pointer.y,125,this.scale.height-80);
  }

  pointerDown(pointer){
    if(this.controls?.blocksGameplay)return;
    this.pointerY=Phaser.Math.Clamp(pointer.y,125,this.scale.height-80);
    this.fire();
  }

  shutdown(){
    this.registry.get('platform').gameplayStop();
    this.pauseStartedAt=null;
    this.physics.world.resume();
    this.controls?.destroy();
    this.controls=null;
    this.fireKey?.off('down',this.fire,this);
    this.input.off('pointermove',this.pointerMove,this);
    this.input.off('pointerdown',this.pointerDown,this);
  }
}

function setWorldBodySize(sprite,width,height){
  const scaleX=Math.abs(sprite.scaleX)||1;
  const scaleY=Math.abs(sprite.scaleY)||1;
  sprite.body.setSize(width/scaleX,height/scaleY,true);
}
