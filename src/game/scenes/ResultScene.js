import { getRoute, getNextRoute } from '../../config/routes.js';
import { Backdrop } from '../systems/Backdrop.js';

export class ResultScene extends Phaser.Scene {
  constructor(){super('result');}
  init(data){this.result=data;this.transitioning=false;}

  create(){
    const route=getRoute(this.result.routeId);
    const{width:w,height:h}=this.scale;
    this.backdrop=new Backdrop(this,route);
    this.add.rectangle(w/2,h/2,w,h,0x030611,.64);
    const success=this.result.success;

    this.add.text(w/2,88,success?'BLOCKADE BROKEN':'RUN TERMINATED',{
      fontFamily:'Arial Black',
      fontSize:'60px',
      color:success?'#72f6b8':'#ff5b78',
      stroke:'#050813',
      strokeThickness:10,
    }).setOrigin(.5);

    const reason=!success&&this.result.failureReason==='parcel-target'
      ?`Only ${this.result.parcels}/${this.result.targetParcels} energy cores were extracted.`
      :!success
        ?'Renegade craft destroyed by corporate hunters.'
        :`${route.name} is no longer under corporate control.`;

    this.add.text(w/2,150,reason,{
      fontFamily:'Arial',
      fontSize:'22px',
      color:'#e6f6ff',
    }).setOrigin(.5);

    this.add.rectangle(w/2,348,800,310,0x050914,.94).setStrokeStyle(3,success?0x72f6b8:0xff5b78,.36);
    this.stat(w/2-235,278,'BOUNTY',String(this.result.score).padStart(6,'0'));
    this.stat(w/2,278,'CORES',`${this.result.parcels}/${this.result.targetParcels}`);
    this.stat(w/2+235,278,'HULL DAMAGE',String(this.result.damageTaken));

    this.add.text(w/2,390,'RENEGADE RANK',{
      fontFamily:'Arial Black',
      fontSize:'19px',
      color:'#ff8ca5',
      letterSpacing:3,
    }).setOrigin(.5);
    this.add.text(w/2,446,`${'◆'.repeat(this.result.stars)}${'◇'.repeat(3-this.result.stars)}`,{
      fontFamily:'Arial',
      fontSize:'58px',
      color:'#ffe080',
      stroke:'#33240b',
      strokeThickness:5,
    }).setOrigin(.5);

    const retry=this.button(w/2-300,585,260,'RUN AGAIN',0xff5b78);
    const sectors=this.button(w/2,585,260,'SECTORS',0x2c658d);
    const nextRoute=getNextRoute(route.id);
    const next=this.button(
      w/2+300,
      585,
      260,
      nextRoute&&success?'NEXT SECTOR':'MAIN MENU',
      nextRoute&&success?0xe0a448:0x536276,
    );

    retry.on('pointerdown',()=>this.go('game',{routeId:route.id}));
    sectors.on('pointerdown',()=>this.go('routes'));
    next.on('pointerdown',()=>this.go(nextRoute&&success?'game':'title',nextRoute&&success?{routeId:nextRoute.id}:undefined));
    this.input.keyboard?.once('keydown-SPACE',()=>this.go('game',{routeId:route.id}));
    this.input.keyboard?.once('keydown-ESC',()=>this.go('routes'));
  }

  update(_time,delta){this.backdrop.update(delta,.25);}

  stat(x,y,label,value){
    this.add.text(x,y-35,label,{fontFamily:'Arial',fontSize:'18px',color:'#ff8ca5',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(x,y+18,value,{fontFamily:'Arial Black',fontSize:'33px',color:'#fff'}).setOrigin(.5);
  }

  button(x,y,width,label,color){
    const button=this.add.rectangle(x,y,width,72,color).setStrokeStyle(3,0xffd7df,.45).setInteractive({useHandCursor:true});
    this.add.text(x,y,label,{fontFamily:'Arial Black',fontSize:'22px',color:'#09040a'}).setOrigin(.5);
    return button;
  }

  go(scene,data){
    if(this.transitioning)return;
    this.transitioning=true;
    this.registry.get('audio').play('pickup');
    this.cameras.main.fadeOut(220,5,15,26);
    this.time.delayedCall(230,()=>this.scene.start(scene,data));
  }
}
