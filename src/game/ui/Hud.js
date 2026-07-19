export class Hud {
  constructor(scene, route){
    const w=scene.scale.width;
    scene.add.rectangle(w/2,44,w-42,74,0x061424,.82).setStrokeStyle(2,0x86e3ef,.25).setDepth(100);
    this.route=scene.add.text(34,18,route.name,{fontFamily:'Arial',fontSize:'19px',color:'#bceeff',fontStyle:'bold'}).setDepth(110);
    this.score=scene.add.text(34,48,'SCORE 000000',{fontFamily:'Arial Black',fontSize:'22px',color:'#fff'}).setDepth(110);
    this.parcels=scene.add.text(325,48,'PARCELS 0/0',{fontFamily:'Arial',fontSize:'21px',color:'#ffd98a',fontStyle:'bold'}).setDepth(110);
    this.combo=scene.add.text(555,48,'COMBO x1.0',{fontFamily:'Arial',fontSize:'21px',color:'#72efff',fontStyle:'bold'}).setDepth(110);
    this.power=scene.add.text(765,48,'',{fontFamily:'Arial',fontSize:'18px',color:'#8fffc7',fontStyle:'bold'}).setDepth(110);
    this.lives=scene.add.text(w-242,19,'♥ ♥ ♥',{fontFamily:'Arial',fontSize:'25px',color:'#ff7184',fontStyle:'bold'}).setDepth(110);
    this.time=scene.add.text(w-242,49,'TIME 00',{fontFamily:'Arial Black',fontSize:'22px',color:'#fff'}).setDepth(110);
    scene.add.rectangle(w/2,88,w-84,8,0x07111d,.8).setDepth(100);
    this.bar=scene.add.rectangle(42,88,w-84,8,0x59e7b0).setOrigin(0,.5).setDepth(101);
    this.objective=scene.add.text(w/2,116,`COLLECT ${route.targetParcels} PARCELS AND SURVIVE`,{fontFamily:'Arial',fontSize:'18px',color:'#e7f8ff',backgroundColor:'#07111dcc',padding:{x:14,y:7}}).setOrigin(.5).setDepth(100);
  }
  update(session,powerLabel=''){
    this.score.setText(`SCORE ${String(session.score).padStart(6,'0')}`);
    this.parcels.setText(`PARCELS ${session.parcels}/${session.route.targetParcels}`);
    this.combo.setText(`COMBO x${session.combo.toFixed(1)}`); this.power.setText(powerLabel);
    this.lives.setText(Array.from({length:session.lives},()=> '♥').join(' '));this.time.setText(`TIME ${String(session.timeSeconds).padStart(2,'0')}`);
    const ratio=session.remainingMs/(session.route.durationSeconds*1000);this.bar.setScale(Math.max(0,Math.min(1,ratio)),1);this.bar.setFillStyle(ratio<.2?0xff7184:ratio<.45?0xffd36f:0x59e7b0);
    this.objective.setText(session.parcels>=session.route.targetParcels?'PARCEL TARGET SECURED — SURVIVE!':`COLLECT ${session.route.targetParcels-session.parcels} MORE PARCEL${session.route.targetParcels-session.parcels===1?'':'S'}`);
  }
}
