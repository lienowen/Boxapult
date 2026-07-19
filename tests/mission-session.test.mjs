import assert from 'node:assert/strict';
import { MissionSession } from '../src/domain/MissionSession.js';
const route={id:'test',durationSeconds:10,targetParcels:2,lives:3,stars:{two:1000,three:2000}};
{
  const s=new MissionSession(route);assert.equal(s.lives,3);assert.equal(s.collectParcel(),300);assert.equal(s.parcels,1);s.collectParcel();s.tick(10000);assert.equal(s.success,true);assert.equal(s.stars,1);
}
{
  const s=new MissionSession(route);s.tick(10000);assert.equal(s.success,false);assert.equal(s.failureReason,'parcel-target');
}
{
  const s=new MissionSession(route);s.takeDamage();s.takeDamage();s.takeDamage();assert.equal(s.ended,true);assert.equal(s.failureReason,'drone-destroyed');
}
{
  const s=new MissionSession(route);s.score=2500;s.parcels=2;s.remainingMs=0;s.ended=true;s.success=true;assert.equal(s.stars,3);s.damageTaken=1;assert.equal(s.stars,2);
}
console.log('MissionSession tests passed');
