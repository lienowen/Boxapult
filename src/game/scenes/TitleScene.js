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

    this.add.text(w*.66,h*.20,'CARGO',{fontFamily:'Arial Black',fontSize:'82px',color:'#f4f7ff',stroke:'#050913',strokeThickness:10,letterSpacing:5}).setOrigin(.5);
    this.add.text(w*.66,h*.34,'RENEGADE',{fontFamily:'Arial Black',fontSize:'96px',color:'#ff577d',stroke:'#050913',strokeThickness:11,shadow:{offsetY:8,color:'#000',blur:12,fill:true},letterSpacing:3}).setOrigin(.5);
    this.add.text(w*.66,h*.47,'STEAL THE CORE. BREAK THE BLOCKADE.',{fontFamily:'Arial',fontSize:'21px',color:'#8ff6ff',fontStyle:'bold',letterSpacing:3}).setOrigin(.5);

    this.add.rectangle(w*.65,h*.63,680,136,0x050b17,.88).setStrokeStyle(3,0xff6f9f,.30);
    this.add.text(w*.41,h*.59,'EVADE',{fontFamily:'Arial Black',fontSize:'18px',color:'#ff7897'});
    this.add.text(w*.41,h*.64,'Pointer / Touch / ↑ ↓',{fontFamily:'Arial',fontSize:'19px',color:'#fff'});
    this.add.text(w*.68,h*.59,'RETURN FIRE',{fontFamily:'Arial Black',fontSize:'18px',color:'#ff7897'});
    this.add.text(w*.68,h*.64,'Click / Tap / Space',{fontFamily:'Arial',fontSize:'19px',color:'#fff'});

    const button=this.add.rectangle(w*.65,h*.82,460,84,0xff5b78).setStrokeStyle(4,0xffcad4,.82).setInteractive({useHandCursor:true});
    const label=this.add.text(w*.65,h*.82,'BREAK THE BLOCKADE',{fontFamily:'Arial Black',fontSize:'27px',color:'#12040a'}).setOrigin(.5);
    button.on('pointerover',()=>{button.setScale(1.04);label.setScale(1.04);});
    button.on('pointerout',()=>{button.setScale(1);label.setScale(1);});
    button.on('pointerdown',this.start,this);
    this.input.keyboard?.on('keydown-ENTER',this.start,this);
    this.input.keyboard?.on('keydown-SPACE',this.start,this);
    this.events.once('shutdown',()=>{
      this.input.keyboard?.off('keydown-ENTER',this.start,this);
      this.input.keyboard?.off('keydown-SPACE',this.start,this);
    });
  }

  update(_time,delta){this.backdrop.update(delta,.48);}

  start(){
    if(this.starting)return;
    this.starting=true;
    this.registry.get('audio').unlock();
    this.registry.get('audio').play('pickup');
    this.cameras.main.fadeOut(240,5,15,26);
    this.time.delayedCall(250,()=>this.scene.start('routes'));
  }
}
