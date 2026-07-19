export class Backdrop {
  constructor(scene, route) {
    this.scene = scene; this.route = route;
    const { width, height } = scene.scale, p = route.palette;
    scene.add.rectangle(width/2,height*.16,width,height*.32,p.top).setDepth(-40);
    scene.add.rectangle(width/2,height*.49,width,height*.34,p.middle).setDepth(-40);
    scene.add.rectangle(width/2,height*.83,width,height*.34,p.bottom).setDepth(-40);
    scene.add.circle(width*.78,height*.18,p.celestialRadius,p.sun,.9).setDepth(-38);
    scene.add.circle(width*.78,height*.18,p.celestialRadius*1.45,p.sun,.10).setDepth(-39);
    this.far=scene.add.tileSprite(width/2,height-245,width,230,'city-far').setTint(p.far).setDepth(-20);
    this.near=scene.add.tileSprite(width/2,height-135,width,280,'city-near').setTint(p.near).setDepth(-10);
    this.clouds=scene.add.container(0,0).setDepth(-25);
    for(let i=0;i<7;i++){const c=scene.add.container(i*240+60,85+(i%3)*62);c.add([scene.add.ellipse(0,10,100,25,0xe7f7ff,.12),scene.add.circle(-28,1,18,0xe7f7ff,.12),scene.add.circle(8,-5,26,0xe7f7ff,.12),scene.add.circle(36,6,16,0xe7f7ff,.12)]);this.clouds.add(c);}
  }
  update(deltaMs, multiplier=1){const s=deltaMs/1000*this.route.speedMultiplier*multiplier;this.far.tilePositionX+=18*s;this.near.tilePositionX+=58*s;this.clouds.x-=7*s;if(this.clouds.x<-240)this.clouds.x+=240;}
}
