import { ROUTES } from '../../config/routes.js';
import { applyAsset, getAssetSpec } from '../systems/AssetCatalog.js';
import { Backdrop } from '../systems/Backdrop.js';

export class TitleScene extends Phaser.Scene {
  constructor(){super('title');this.starting=false;}
  init(){this.starting=false;}

  create(){
    const route=ROUTES[2];
    this.backdrop=new Backdrop(this,route);
    const{width:w,height:h}=this.scale;
    this.add.rectangle(w/2,h/2,w,h,0x020714,.42);
    this.add.rectangle(w*.67,h*.34,650,330,0x060b18,.38).setStrokeStyle(2,0xff6f9f,.18);

    const playerSpec=getAssetSpec(this,'player');
    const drone=this.add.sprite(w*.21,h*.40,playerSpec.key,playerSpec.frame).setDepth(10);
    applyAsset(this,drone,'player');
    drone.setScale(drone.scaleX*1.85).setTint(0xe8f4ff);
    this.add.ellipse(drone.x-16,drone.y+48,260,64,0xff4f7a,.10).setDepth(7);
    this.tweens.add({targets:drone,y:'-=20',angle:3,duration:1080,yoyo:true,repeat:-1,ease:'Sine.inOut'});

    const coreSpec=getAssetSpec(this,'parcel');
    const cores=[
      this.add.sprite(w*.12,h*.66,coreSpec.key,coreSpec.frame),
      this.add.sprite(w*.24,h*.70,coreSpec.key,coreSpec.frame),
      this.add.sprite(w*.33,h*.62,coreSpec.key,coreSpec.frame),
    ];
    cores.forEach((core,index)=>{
      applyAsset(this,core,'parcel',false);
      core.setScale(core.scaleX*(index===1?1.05:.88)).setTint(index===1?0x7ff6ff:0xffd27a).setDepth(9);
      const glow=this.add.circle(core.x,core.y,42,index===1?0x6ff3ff:0xffa94d,.12).setDepth(8);
      this.tweens.add({targets:[core,glow],y:'-=10',alpha:{from:.72,to:1},duration:850+index*120,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    });

    this.add.text(w*.66,h*.18,'CARGO',{fontFamily:'Arial Black',fontSize:'78px',color:'#f4f7ff',stroke:'#050913',strokeThickness:10,letterSpacing:5}).setOrigin(.5);
    this.add.text(w*.66,h*.31,'RENEGADE',{fontFamily:'Arial Black',fontSize:'92px',color:'#ff577d',stroke:'#050913',strokeThickness:11,shadow:{offsetY:8,color:'#000',blur:12,fill:true},letterSpacing:3}).setOrigin(.5);
    this.add.text(w*.66,h*.425,'STEAL CORES  ·  SHOOT HUNTERS  ·  ESCAPE',{fontFamily:'Arial Black',fontSize:'19px',color:'#8ff6ff',letterSpacing:2}).setOrigin(.5);

    this.add.rectangle(w*.65,h*.61,700,132,0x050b17,.9).setStrokeStyle(3,0xff6f9f,.30);
    this.add.text(w*.65,h*.565,'MOVE UP AND DOWN TO DODGE',{fontFamily:'Arial',fontSize:'20px',color:'#ffffff',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(w*.65,h*.635,'TAP OR PRESS SPACE TO FIRE',{fontFamily:'Arial',fontSize:'20px',color:'#ffffff',fontStyle:'bold'}).setOrigin(.5);

    const button=this.add.rectangle(w*.65,h*.80,480,90,0xff5b78).setStrokeStyle(4,0xffcad4,.9).setInteractive({useHandCursor:true});
    const label=this.add.text(w*.65,h*.79,'PLAY NOW',{fontFamily:'Arial Black',fontSize:'36px',color:'#12040a'}).setOrigin(.5);
    const hint=this.add.text(w*.65,h*.855,'Tap anywhere to start',{fontFamily:'Arial',fontSize:'17px',color:'#ffd9e1'}).setOrigin(.5);
    this.tweens.add({targets:[button,label],scale:1.035,duration:650,yoyo:true,repeat:-1,ease:'Sine.inOut'});

    button.on('pointerdown',this.start,this);
    this.input.on('pointerdown',this.start,this);
    this.input.keyboard?.on('keydown-ENTER',this.start,this);
    this.input.keyboard?.on('keydown-SPACE',this.start,this);
    this.events.once('shutdown',()=>{
      this.input.off('pointerdown',this.start,this);
      this.input.keyboard?.off('keydown-ENTER',this.start,this);
      this.input.keyboard?.off('keydown-SPACE',this.start,this);
      hint.destroy();
    });
  }

  update(_time,delta){this.backdrop.update(delta,.48);}

  start(){
    if(this.starting)return;
    this.starting=true;
    this.registry.get('audio').unlock();
    this.registry.get('audio').play('pickup');
    this.cameras.main.fadeOut(180,5,15,26);
    this.time.delayedCall(190,()=>this.scene.start('routes'));
  }
}
