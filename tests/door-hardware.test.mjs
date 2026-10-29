import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { buildHallway } from '../lib/hallway-model.ts';
import { findEvidence } from '../lib/video-evidence.ts';
import { pickInspectable } from '../lib/object-inspection.ts';
import { migrateHallwayLayout } from '../lib/hallway-layout-migration.ts';
import { emptyComponentRecord } from '../lib/component-record.ts';
import { HALL } from '../lib/hallway-data.ts';
import { objectBounds } from '../lib/object-measurements.ts';

test('210 hardware follows its door and can be inspected independently', () => {
  const b = buildHallway(false),
    door = b.entries.find((e) => e.id === 'door-210').object;
  const hardware = b.entries.find((e) => e.id === 'door-hardware-210');
  assert.equal(hardware.object.parent, door);
  // Hallway-facing -Z surface: local +X is the left latch edge in the photos.
  assert.ok(
    Math.abs(HALL.doorWidth / 2 - hardware.object.position.x - 0.065) < 1e-8,
  );
  assert.ok(
    objectBounds(hardware.object).min.x < -0.12,
    'lever extends inward across the leaf',
  );
  assert.ok(
    objectBounds(hardware.object).max.x < 0.04,
    'rose stays inside the latch edge',
  );
  assert.equal(
    b.entries.some((e) => e.id === 'door-hardware-209'),
    false,
  );
  door.position.z += 0.4;
  door.rotation.y += 0.2;
  b.model.updateMatrixWorld(true);
  const point = hardware.object.localToWorld(new T.Vector3(0, 0, -0.065));
  const outward = new T.Vector3(0, 0, -1).transformDirection(
    hardware.object.matrixWorld,
  );
  const ray = new T.Raycaster(
    point.clone().addScaledVector(outward, 0.3),
    outward.negate(),
  );
  // Isolate the moved assembly: the fixed hallway wall was not moved with it.
  assert.equal(pickInspectable(ray, door, b.entries)?.id, hardware.id);
  const record = hardware.object.userData.componentRecord;
  assert.equal(record.manufacturer, '');
  assert.equal(record.model, '');
  assert.equal(record.partNumber, '');
  assert.equal(record.heightStatus, 'estimated');
  for (const id of [
    'door210-lock-closeup',
    'door210-lever-front',
    'door210-lever-side',
  ]) {
    assert.ok(record.evidenceIds.includes(id));
    assert.ok(findEvidence(id));
  }
});

test('new door evidence refreshes the old default while preserving custom annotations', () => {
  const old = {
    x: 10,
    z: 11,
    angle: 90,
    record: {
      ...emptyComponentRecord(),
      notes:
        'Door height supplied by tape: 79 inches. Video places doorway on east wall near Stair 2. Distance along hallway estimated.',
      evidenceIds: ['v009', 'v168', 'v156'],
    },
  };
  const updated = migrateHallwayLayout({ 'door-210': old })['door-210'];
  assert.equal(updated.x, old.x);
  assert.equal(updated.z, old.z);
  assert.ok(updated.record.evidenceIds.includes('door210-lever-side'));
  assert.ok(updated.record.evidenceIds.includes('v168'));
  const custom = {
    ...old,
    record: { ...old.record, notes: 'User installation note' },
  };
  assert.deepEqual(
    migrateHallwayLayout({ 'door-210': custom })['door-210'],
    custom,
  );
  assert.deepEqual(
    migrateHallwayLayout({ 'door-210': updated })['door-210'],
    updated,
  );
});
