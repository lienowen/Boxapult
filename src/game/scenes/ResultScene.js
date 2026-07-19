import { getRoute, getNextRoute, ROUTES } from '../../config/routes.js';
import { Backdrop } from '../systems/Backdrop.js';
export class ResultScene extends Phaser.Scene {
  constructor(){super('result');}
  init(data){this.result=data;this.transitioning=false;}
  create(){const route=getRoute(this.result.routeId),{width:w,height:h}=this.scale;this.backdrop=new Backdrop(this,route);this.add.rectangle(w/2,h/2,w,h,0x06111f,.55);const success=this.result.success;
    this.add.text(w/2,95,success?'ROUTE COMPLETE':'DELIVERY FAILED',{fontFamily:'Arial Black',fontSize:'62px',color:success?'#72f6b8':'#ff7c8f',stroke:'#07111d',strokeThickness:10}).setOrigin(.5);
    const reason=!success&&this.result.failureReason==='parcel-target'?`Only ${this.result.parcels}/${this.result.targetParcels} parcels secured.`:!success?'Courier drone was destroyed.':route.name;
    this.add.text(w/2,157,reason,{fontFamily:'Arial',fontSize:'22px',color:'#e6f6ff'}).setOrigin(.5);
    this.add.rectangle(w/2,350,780,300,0x07182a,.92).setStrokeStyle(3,0x8de8f5,.35);
    this.stat(w/2-235,285,'SCORE',String(this.result.score).padStart(6,'0'));this.stat(w/2,285,'PARCELS',`${this.result.parcels}/${this.result.targetParcels}`);this.stat(w/2+235,285,'DAMAGE',String(this.result.damageTaken));
    this.add.text(w/2,420,`${'★'.repeat(this.result.stars)}${'☆'.repeat(3-this.result.stars)}`,{fontFamily:'Arial',fontSize:'60px',color:'#ffe080',stroke:'#33240b',strokeThickness:5}).setOrigin(.5);
    const retry=this.button(w/2-300,575,260,'RETRY',0x1fc490),routes=this.button(w/2,575,260,'ROUTES',0x2c658d),nextRoute=getNextRoute(route.id),next=this.button(w/2+300,575,260,nextRoute&&success?'NEXT ROUTE':'MAIN MENU',nextRoute&&success?0xe0a448:0x536276);
    retry.on('pointerdown',()=>this.go('game',{routeId:route.id}));routes.on('pointerdown',()=>this.go('routes'));next.on('pointerdown',()=>this.go(nextRoute&&success?'game':'title',nextRoute&&success?{routeId:nextRoute.id}:undefined));
    this.input.keyboard?.once('keydown-SPACE',()=>this.go('game',{routeId:route.id}));this.input.keyboard?.once('keydown-ESC',()=>this.go('routes'));
  }
  update(_t,d){this.backdrop.update(d,.25);}
  stat(x,y,label,value){this.add.text(x,y-35,label,{fontFamily:'Arial',fontSize:'18px',color:'#76eafa',fontStyle:'bold'}).setOrigin(.5);this.add.text(x,y+18,value,{fontFamily:'Arial Black',fontSize:'33px',color:'#fff'}).setOrigin(.5);}
  button(x,y,width,label,color){const b=this.add.rectangle(x,y,width,72,color).setStrokeStyle(3,0xc8f7ff,.5).setInteractive({useHandCursor:true});this.add.text(x,y,label,{fontFamily:'Arial Black',fontSize:'22px',color:'#061521'}).setOrigin(.5);return b;}
  go(scene,data){if(this.transitioning)return;this.transitioning=true;this.registry.get('audio').play('pickup');this.cameras.main.fadeOut(220,5,15,26);this.time.delayedCall(230,()=>this.scene.start(scene,data));}
}
