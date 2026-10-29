import test from 'node:test';
import assert from 'node:assert/strict';
import {buildHallway} from '../lib/hallway-model.ts';
import {HALL,DOOR_210,WALK_START,METRES_PER_PLAN_PIXEL,rooms,canOccupy,planX} from '../lib/hallway-data.ts';
import {migrateHallwayLayout} from '../lib/hallway-layout-migration.ts';
import {measurementSize} from '../lib/object-measurements.ts';
import {emptyComponentRecord} from '../lib/component-record.ts';

test('scale bar and provisional door geometry survive authored geometry',()=>{
  assert.ok(Math.abs(METRES_PER_PLAN_PIXEL*150-24*.3048)<1e-10);
  const built=buildHallway(false),door=built.entries.find(e=>e.id==='door-210');
  assert.ok(door);const d=measurementSize(door.object);
  assert.ok(Math.abs(d.height-79*.0254)<1e-6,`Door panel height ${d.height}`);
  // Overall bounds include the hinge knuckles outside the 34-inch leaf.
  assert.ok(d.width>=34*.0254&&d.width<.90,`Door/hardware width ${d.width}`);
  assert.equal(door.object.userData.evidence.status,'estimated');
  assert.ok(Math.abs(door.object.position.x-DOOR_210.x)<1e-9);
  assert.ok(Math.abs(door.object.position.z-DOOR_210.z)<1e-9);
  assert.ok(Math.abs(door.object.rotation.y-Math.PI/2)<1e-9);
  assert.ok(built.entries.find(e=>e.id==='wall-cabinet').object.position.x>HALL.branchRight);
  assert.ok(built.entries.find(e=>e.id==='outlet-opposite-210').object.position.x<HALL.branchLeft+.02);
});

test('start faces away from Stair 2 and old default placements migrate without discarding edits',()=>{
  assert.equal(WALK_START.yaw,0); // Three.js forward is -Z, away from the +Z stair end.
  assert.ok(WALK_START.z<HALL.branchEnd && WALK_START.z>HALL.branchEnd-2);
  assert.ok(canOccupy(WALK_START.x,WALK_START.z,buildHallway(false).obstacles));
  const layout={
    'door-210':{x:HALL.door210,z:HALL.width+.08,angle:0,material:'oak'},
    'frame-210':{x:HALL.door210+.4,z:HALL.width+.08,angle:0},
    'wall-cabinet':{x:HALL.door210+1.05,z:HALL.width-.025,angle:0},
  };
  const migrated=migrateHallwayLayout(layout);
  assert.equal(migrated['door-210'].z,DOOR_210.z);assert.equal(migrated['door-210'].x,DOOR_210.x);assert.equal(migrated['door-210'].angle,90);
  assert.equal(migrated['door-210'].material,'oak');
  assert.deepEqual(migrated['frame-210'],layout['frame-210']);
  assert.equal(migrated['wall-cabinet'].z,DOOR_210.z+1.05);
  assert.equal(layout['door-210'].z,HALL.width+.08);
  assert.deepEqual(migrateHallwayLayout(migrated),migrated);
});

test('all modeled locations are reachable on the connected floor union',()=>{
  const b=buildHallway(false);
  for(const room of rooms)assert.equal(canOccupy(room.x,room.z,b.obstacles),true,room.name);
  const x=(HALL.branchLeft+HALL.branchRight)/2;
  for(let z=.4;z<HALL.branchEnd-.4;z+=.08)assert.equal(canOccupy(x,z,b.obstacles),true,`Branch blocked at ${z}`);
  for(let x=.4;x<HALL.length-.4;x+=.08)assert.equal(canOccupy(x,HALL.width/2,b.obstacles),true,`Main blocked at ${x}`);
});

test('cabinet identification updates old defaults without moving it or replacing custom records',()=>{
  const old={x:10.12,z:11.68,angle:90,name:'White wall cabinet beside 210',record:{...emptyComponentRecord(),notes:'White glazed cabinet beside 210, toward Stair 2. Contents and exact model not confirmed.',workHeight:1.2,heightStatus:'measured',heightSource:'User tape'}};
  const updated=migrateHallwayLayout({'wall-cabinet':old})['wall-cabinet'];
  assert.equal(updated.x,old.x);assert.equal(updated.z,old.z);assert.equal(updated.angle,old.angle);
  assert.match(updated.name,/Fire extinguisher/);assert.match(updated.record.notes,/Location confirmed by user/);
  assert.ok(updated.record.evidenceIds.includes('extinguisher-photo-2'));
  assert.equal(updated.record.workHeight,1.2);assert.equal(updated.record.heightStatus,'measured');
  const custom={...old,name:'My extinguisher',record:{...old.record,notes:'Inspected by user',manufacturer:'Known brand'}};
  assert.deepEqual(migrateHallwayLayout({'wall-cabinet':custom})['wall-cabinet'],custom);
  assert.deepEqual(migrateHallwayLayout({'wall-cabinet':updated})['wall-cabinet'],updated);
});

test('component IDs are unique, dimensions finite, and all pieces carry evidence',()=>{
  const b=buildHallway(false),ids=b.entries.map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.includes('wall-cabinet')&&ids.includes('camera-dome')&&ids.includes('emergency-branch'));
  assert.ok(b.entries.length>70);
  assert.ok(!ids.includes('door-208')&&!ids.includes('frame-208'),'No blueprint-only door on the observed blank branch wall');
  for(const e of b.entries){
    assert.ok(e.object.userData.evidence?.basis,e.id);
    for(const n of Object.values(measurementSize(e.object)))assert.ok(Number.isFinite(n)&&n>=0,e.id);
  }
});
