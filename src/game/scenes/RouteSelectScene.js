import { ROUTES } from '../../config/routes.js';
import { Backdrop } from '../systems/Backdrop.js';
export class RouteSelectScene extends Phaser.Scene {
  constructor(){super('routes');}
  create(){const{width:w,height:h}=this.scale;this.backdrop=new Backdrop(this,ROUTES[0]);this.add.rectangle(w/2,h/2,w,h,0x06111f,.46);this.add.text(w/2,72,'CHOOSE DELIVERY ROUTE',{fontFamily:'Arial Black',fontSize:'48px',color:'#fff',stroke:'#07111d',strokeThickness:8}).setOrigin(.5);
    const store=this.registry.get('progress');const cardW=350,gap=35,start=w/2-(cardW*1.5+gap);
    ROUTES.forEach((route,index)=>{const unlocked=store.isUnlocked(route,ROUTES),record=store.routeRecord(route.id),x=start+cardW/2+index*(cardW+gap),y=360;const color=unlocked?0x0d2940:0x101722;const card=this.add.rectangle(x,y,cardW,430,color,.94).setStrokeStyle(3,unlocked?0x6fe7f4:0x4a5664,.55);if(unlocked)card.setInteractive({useHandCursor:true});
      this.add.text(x,y-155,`0${index+1}`,{fontFamily:'Arial Black',fontSize:'50px',color:unlocked?'#70eeff':'#596674'}).setOrigin(.5);this.add.text(x,y-90,route.name,{fontFamily:'Arial Black',fontSize:'25px',color:unlocked?'#fff':'#6c7782',align:'center',wordWrap:{width:300}}).setOrigin(.5);
      this.add.text(x,y-38,route.subtitle,{fontFamily:'Arial',fontSize:'18px',color:unlocked?'#cde9f2':'#59636d'}).setOrigin(.5);this.add.text(x,y+35,`${route.durationSeconds}s  ·  ${route.targetParcels} PARCELS`,{fontFamily:'Arial',fontSize:'20px',color:unlocked?'#ffd98a':'#59636d',fontStyle:'bold'}).setOrigin(.5);
      this.add.text(x,y+90,unlocked?`BEST ${String(record.bestScore).padStart(6,'0')}`:'LOCKED',{fontFamily:'Arial Black',fontSize:'22px',color:unlocked?'#fff':'#ff7d8f'}).setOrigin(.5);this.add.text(x,y+132,unlocked?stars(record.bestStars):'COMPLETE PREVIOUS ROUTE',{fontFamily:'Arial',fontSize:'24px',color:'#ffe181',fontStyle:'bold'}).setOrigin(.5);
      if(unlocked){const play=this.add.rectangle(x,y+180,240,56,0x1fbf8e).setStrokeStyle(2,0xb6ffe5,.8);this.add.text(x,y+180,'LAUNCH',{fontFamily:'Arial Black',fontSize:'22px',color:'#061923'}).setOrigin(.5);card.on('pointerdown',()=>this.launch(route.id));play.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.launch(route.id));}
    });
    this.add.text(42,h-42,'ESC · BACK',{fontFamily:'Arial',fontSize:'18px',color:'#c7dde8'}).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('title'));this.input.keyboard?.once('keydown-ESC',()=>this.scene.start('title'));
  }
  update(_t,d){this.backdrop.update(d,.2);}
  launch(routeId){this.registry.get('audio').play('pickup');this.cameras.main.fadeOut(220,5,15,26);this.time.delayedCall(230,()=>this.scene.start('game',{routeId}));}
}
function stars(count){return `${'★'.repeat(count)}${'☆'.repeat(3-count)}`;}
