import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { buildHallway } from '../lib/hallway-model.ts';

test('stair exit has a horizontal push bar rather than the apartment lever', () => {
  const b = buildHallway(false),
    door = b.entries.find((e) => e.id === 'door-2').object;
  const bar = door.getObjectByName('Stair 2 horizontal push bar');
  assert.ok(bar);
  const bounds = new T.Box3().setFromObject(bar),
    size = bounds.getSize(new T.Vector3());
  assert.ok(
    size.x > 0.7 && size.y < 0.1,
    'push surface spans most of the leaf',
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
