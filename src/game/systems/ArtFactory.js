export function ensureTextures(scene) {
  if (scene.textures.exists('player')) return;
  const g = scene.add.graphics();
  makePlayer(g); makeEnemy(g, 'scout', 0xff5d73, 88, 52); makeEnemy(g, 'raider', 0x9b63ff, 108, 64);
  makeInterceptor(g); makeBolt(g); makeEnemyBolt(g); makeParcel(g); makePowerup(g, 'shield', 0x65e7ff, 'S');
  makePowerup(g, 'rapid', 0xffd260, 'R'); makeSpark(g); makeCity(g, 'city-far', 720, 230, 0x9db2c8);
  makeCity(g, 'city-near', 720, 280, 0xd6e2ee); g.destroy();
}
function clear(g,w,h){g.clear();g.fillStyle(0,0);g.fillRect(0,0,w,h);}
function makePlayer(g){clear(g,118,68);g.fillStyle(0x07111e,.32);g.fillEllipse(58,57,88,12);g.fillStyle(0x25c3d9);g.fillRoundedRect(25,16,66,34,14);g.fillStyle(0x79f0ff);g.fillRoundedRect(40,22,30,12,5);g.fillStyle(0x0d192a);g.fillCircle(82,33,8);g.fillStyle(0xffb84d);g.fillTriangle(23,24,23,45,3,34);g.fillStyle(0xf3f7fb);g.fillRect(44,40,31,13);g.lineStyle(3,0x091528,.8);g.strokeRoundedRect(25,16,66,34,14);g.generateTexture('player',118,68);}
function makeEnemy(g,key,color,w,h){clear(g,w,h);g.fillStyle(color);g.fillRoundedRect(12,10,w-25,h-20,12);g.fillStyle(0xffffff,.65);g.fillRoundedRect(25,18,w*.28,9,4);g.fillStyle(0x101525);g.fillCircle(w-28,h/2,7);g.lineStyle(3,0x210d22,.75);g.strokeRoundedRect(12,10,w-25,h-20,12);g.generateTexture(key,w,h);}
function makeInterceptor(g){clear(g,96,60);g.fillStyle(0xff9e4b);g.fillTriangle(8,30,70,7,70,53);g.fillStyle(0x7a3615);g.fillRoundedRect(38,20,47,20,7);g.fillStyle(0xffe1bd);g.fillRect(52,25,17,7);g.generateTexture('interceptor',96,60);}
function makeBolt(g){clear(g,38,16);g.fillStyle(0x6ff3ff);g.fillRoundedRect(0,3,33,10,5);g.fillStyle(0xffffff,.9);g.fillRoundedRect(20,6,17,4,2);g.generateTexture('bolt',38,16);}
function makeEnemyBolt(g){clear(g,22,22);g.fillStyle(0xff667b);g.fillCircle(11,11,10);g.fillStyle(0xffd5dc,.8);g.fillCircle(8,8,3);g.generateTexture('enemy-bolt',22,22);}
function makeParcel(g){clear(g,58,50);g.fillStyle(0xf0a64c);g.fillRoundedRect(6,6,46,38,5);g.fillStyle(0x8e5625);g.fillRect(25,6,8,38);g.fillRect(6,18,46,5);g.fillStyle(0xffefd0);g.fillRect(36,27,11,8);g.lineStyle(2,0x6c411f,.9);g.strokeRoundedRect(6,6,46,38,5);g.generateTexture('parcel',58,50);}
function makePowerup(g,key,color,label){clear(g,54,54);g.fillStyle(color,.16);g.fillCircle(27,27,26);g.lineStyle(4,color,.95);g.strokeCircle(27,27,20);g.fillStyle(color);g.fillCircle(27,27,15);g.fillStyle(0x091524);g.fillRoundedRect(21,16,12,22,5);g.generateTexture(key,54,54);}
function makeSpark(g){clear(g,14,14);g.fillStyle(0xffe287);g.fillCircle(7,7,7);g.generateTexture('spark',14,14);}
function makeCity(g,key,w,h,color){clear(g,w,h);let x=0,i=0;while(x<w){const bw=54+(i%4)*17,bh=55+((i*43)%(h-65));g.fillStyle(color);g.fillRect(x,h-bh,bw,bh);g.fillStyle(0xffffff,.18);for(let r=0;r<5;r++)for(let c=0;c<2;c++){const wy=h-bh+15+r*25;if(wy<h-10)g.fillRect(x+11+c*24,wy,8,10);}x+=bw+10;i++;}g.generateTexture(key,w,h);}
