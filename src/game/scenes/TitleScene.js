import { ROUTES } from '../../config/routes.js';
import { applyAsset, getAssetSpec, isAtlasMode } from '../systems/AssetCatalog.js';
import { Backdrop } from '../systems/Backdrop.js';

export class TitleScene extends Phaser.Scene {
  constructor(){super('title');this.starting=false;}
  init(){this.starting=false;}
  create(){
    const route=ROUTES[0];this.backdrop=new Backdrop(this,route);const{width:w,height:h}=this.scale;
    this.add.rectangle(w/2,h/2,w,h,0x06111f,.22);

    const playerSpec=getAssetSpec(this,'player');
    const drone=this.add.sprite(w*.22,h*.36,playerSpec.key,playerSpec.frame).setDepth(10);
    applyAsset(this,drone,'player');drone.setScale(drone.scaleX*1.7);
    this.tweens.add({targets:drone,y:'-=18',angle:2,duration:1300,yoyo:true,repeat:-1,ease:'Sine.inOut'});

    const parcelSpec=getAssetSpec(this,'parcel');
    const p1=this.add.sprite(w*.14,h*.64,parcelSpec.key,parcelSpec.frame),p2=this.add.sprite(w*.29,h*.66,parcelSpec.key,parcelSpec.frame);
    applyAsset(this,p1,'parcel',false);applyAsset(this,p2,'parcel',false);p1.setScale(p1.scaleX*1.15).setAngle(-8);p2.setScale(p2.scaleX*.92).setAngle(9);
    this.tweens.add({targets:[p1,p2],y:'-=12',duration:950,yoyo:true,repeat:-1,stagger:170,ease:'Sine.inOut'});

    if(isAtlasMode(this)){
      const logoSpec=getAssetSpec(this,'titleLogo');
      this.add.image(w*.65,h*.31,logoSpec.key,logoSpec.frame).setScale(logoSpec.scale).setDepth(8);
    }else{
      this.add.text(w*.62,h*.22,'PARCEL',{fontFamily:'Arial Black',fontSize:'86px',color:'#fff',stroke:'#091629',strokeThickness:10}).setOrigin(.5);
      this.add.text(w*.62,h*.36,'PATROL',{fontFamily:'Arial Black',fontSize:'104px',color:'#69efff',stroke:'#091629',strokeThickness:11,shadow:{offsetY:8,color:'#000',blur:10,fill:true}}).setOrigin(.5);
      this.add.text(w*.62,h*.47,'SKY COURIER DEFENSE',{fontFamily:'Arial',fontSize:'24px',color:'#ffe18e',fontStyle:'bold',letterSpacing:4}).setOrigin(.5);
    }

    this.add.rectangle(w*.65,h*.62,650,142,0x07182a,.83).setStrokeStyle(3,0x91ddea,.32);
    this.add.text(w*.43,h*.58,'MOVE',{fontFamily:'Arial',fontSize:'20px',color:'#76f0ff',fontStyle:'bold'});this.add.text(w*.43,h*.63,'Pointer / Touch / ↑ ↓',{fontFamily:'Arial',fontSize:'19px',color:'#fff'});
    this.add.text(w*.68,h*.58,'FIRE',{fontFamily:'Arial',fontSize:'20px',color:'#76f0ff',fontStyle:'bold'});this.add.text(w*.68,h*.63,'Click / Tap / Space',{fontFamily:'Arial',fontSize:'19px',color:'#fff'});
    const button=this.add.rectangle(w*.65,h*.81,430,82,0x1bc08e).setStrokeStyle(4,0xaaffdf,.9).setInteractive({useHandCursor:true});const label=this.add.text(w*.65,h*.81,'SELECT ROUTE',{fontFamily:'Arial Black',fontSize:'30px',color:'#061b1c'}).setOrigin(.5);
    button.on('pointerover',()=>{button.setScale(1.04);label.setScale(1.04);});button.on('pointerout',()=>{button.setScale(1);label.setScale(1);});button.on('pointerdown',this.start,this);
    this.input.keyboard?.on('keydown-ENTER',this.start,this);this.input.keyboard?.on('keydown-SPACE',this.start,this);this.events.once('shutdown',()=>{this.input.keyboard?.off('keydown-ENTER',this.start,this);this.input.keyboard?.off('keydown-SPACE',this.start,this);});
  }
  update(_t,d){this.backdrop.update(d,.42);}
  start(){if(this.starting)return;this.starting=true;this.registry.get('audio').unlock();this.registry.get('audio').play('pickup');this.cameras.main.fadeOut(240,5,15,26);this.time.delayedCall(250,()=>this.scene.start('routes'));}
}