export class SpawnDirector {
  constructor(route) { this.route=route; this.reset(); }
  reset(){this.enemyMs=this.route.enemySpawnStartMs;this.parcelMs=1400;this.powerupMs=this.route.powerupSpawnMs;}
  update(deltaMs, progress, actions){
    this.enemyMs-=deltaMs; this.parcelMs-=deltaMs; this.powerupMs-=deltaMs;
    if(this.enemyMs<=0){actions.enemy(this.#enemyKind());const dynamic=this.route.enemySpawnStartMs-progress*(this.route.enemySpawnStartMs-this.route.enemySpawnMinMs);this.enemyMs=Math.max(this.route.enemySpawnMinMs,dynamic);}
    if(this.parcelMs<=0){actions.parcel();this.parcelMs=this.route.parcelSpawnMs+random(-450,600);}
    if(this.powerupMs<=0){actions.powerup(Math.random()<.5?'shield':'rapid');this.powerupMs=this.route.powerupSpawnMs+random(-1200,1800);}
  }
  #enemyKind(){const r=Math.random(),w=this.route.enemyWeights;if(r<w.scout)return'scout';if(r<w.scout+w.raider)return'raider';return'interceptor';}
}
function random(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
