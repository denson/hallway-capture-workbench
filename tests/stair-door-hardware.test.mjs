import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { buildHallway } from '../lib/hallway-model.ts';
import { hallwayComponentRecord } from '../lib/hallway-component-defaults.ts';
import { migrateHallwayLayout } from '../lib/hallway-layout-migration.ts';
import { findEvidence } from '../lib/video-evidence.ts';

test('stair exit has a horizontal push bar rather than the apartment lever', () => {
  const b = buildHallway(false),
    door = b.entries.find((e) => e.id === 'door-2').object;
  const bar = door.getObjectByName('Stair 2 horizontal push bar');
  assert.ok(bar);
  const bounds = new T.Box3().setFromObject(door.getObjectByName('Stair 2 exit-device backing rail')),
    size = bounds.getSize(new T.Vector3());
  assert.ok(
    size.x > 0.7 && size.y < 0.1,
    'exit device spans most of the leaf',
  );
  assert.ok(
    door.getObjectByName('Stair 2 push-bar latch housing').position.x > 0,
    'latch case is on hallway-view left',
  );
  assert.equal(
    door.children.some(
      (o) =>
        o instanceof T.Mesh &&
        o.geometry.type === 'CylinderGeometry' &&
        Math.abs(o.position.y - 0.96) < 0.01,
    ),
    false,
    'old lever rose/shaft removed',
  );
  assert.ok(door.userData.componentRecord.evidenceIds.includes('v054'));
  const own = b.entries.find((e) => e.id === 'door-hardware-210');
  assert.ok(
    own &&
      own.object.parent === b.entries.find((e) => e.id === 'door-210').object,
    '210 hardware retained',
  );
});

test('209 hallway view retains its observed opposite handing and upper lock', () => {
  const b = buildHallway(false),
    door = b.entries.find((e) => e.id === 'door-209').object;
  b.model.updateMatrixWorld(true);
  const center = door.getWorldPosition(new T.Vector3()),
    camera = new T.PerspectiveCamera(58, 1, 0.01, 20);
  camera.position.copy(center).add(new T.Vector3(1, 1, 0));
  camera.lookAt(center.clone().add(new T.Vector3(0, 1, 0)));
  camera.updateMatrixWorld();
  const rose = door
    .getObjectByName('Generic apartment lever rose')
    .getWorldPosition(new T.Vector3())
    .project(camera);
  const lever = door
    .getObjectByName('Generic apartment lever')
    .getWorldPosition(new T.Vector3())
    .project(camera);
  assert.ok(rose.x > 0, '209 rose is on view-right, not copied from 210');
  assert.ok(lever.x < rose.x, 'lever extends inward to view-left');
  assert.ok(door.getObjectByName('209 upper round lock · observed at 01:00'));
});

test('stair detail evidence updates old defaults without replacing custom observations', () => {
  const previous='Hallway-facing Stairway 2 door: horizontal metal push bar across the leaf, with a larger latch-side housing at the left when viewed from the hall. Replaces the incorrect generic apartment lever. Hardware form follows video 00:54 and the 00:18 context frame; size, mounting height and projection remain estimated. Manufacturer/model/part number unconfirmed. Stairwell beyond is not modeled from this footage.';
  const placement={x:9,z:12,angle:0,record:{...hallwayComponentRecord('door-2'),notes:previous,evidenceIds:['v054','v018']}};
  const updated=migrateHallwayLayout({'door-2':placement})['door-2'];
  for(const id of ['stair2-exit-front','stair2-exit-latch-side','stair2-exit-end-side','stair2-exit-bar-profile']) {
    assert.ok(updated.record.evidenceIds.includes(id));assert.ok(findEvidence(id));
  }
  assert.equal(updated.x,placement.x);
  assert.ok(updated.record.evidenceIds.includes('v054'));
  const custom={...placement,record:{...placement.record,notes:'Dated technician observation'}};
  assert.deepEqual(migrateHallwayLayout({'door-2':custom})['door-2'],custom);
  assert.deepEqual(migrateHallwayLayout({'door-2':updated})['door-2'],updated);
});

test('stair notice arrangement stays on the solid leaf with the transom above the header',()=>{
  const b=buildHallway(false),door=b.entries.find(e=>e.id==='door-2').object;
  const left=door.getObjectByName('Taped smoking and vaping notice'),right=door.getObjectByName('Taped please do not slam door notice');
  assert.ok(left.position.x>right.position.x,'local +X is hallway-view left');
  assert.ok(left.position.y>right.position.y,'right sheet is slightly lower');
  const transom=b.model.getObjectByName('Stair 2 transom above solid door leaf');
  assert.ok(new T.Box3().setFromObject(transom).min.y>2.18,'glass sits above, not in, the leaf');
  assert.ok(door.getObjectByName('Stair 2 upper door closer'));
  assert.ok(door.userData.componentRecord.evidenceIds.includes('stair2-paper-context'));
});
