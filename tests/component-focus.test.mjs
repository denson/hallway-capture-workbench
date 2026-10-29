import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { componentFocusPose } from '../lib/component-focus.ts';
import { buildHallway } from '../lib/hallway-model.ts';
import { pickInspectable } from '../lib/object-inspection.ts';

test('nested inspection focus remains outside the host after parent rotation changes', () => {
  const root = new T.Group(),
    door = new T.Group(),
    hardware = new T.Group();
  root.add(door);
  door.add(hardware);
  door.add(
    new T.Mesh(new T.BoxGeometry(0.85, 2, 0.052), new T.MeshBasicMaterial()),
  );
  hardware.position.set(0.3, 0, -0.06);
  hardware.add(
    new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.04), new T.MeshBasicMaterial()),
  );
  const entries = [
    { id: 'door-test', object: door },
    { id: 'door-hardware-test', object: hardware },
  ];
  for (const angle of [0, Math.PI / 2, Math.PI, -Math.PI / 2, 0.37]) {
    // Leave matrices dirty deliberately: the helper must update ancestors first.
    root.position.set(8, 0, 5);
    root.rotation.y = angle / 3;
    door.position.set(2, 1, -1);
    door.rotation.y = angle;
    const pose = componentFocusPose(hardware);
    const front = new T.Vector3(0, 0, -1).transformDirection(
      hardware.matrixWorld,
    );
    assert.ok(
      pose.position.clone().sub(pose.target).dot(front) > 0,
      'camera is on exposed side',
    );
    assert.ok(
      pose.target.distanceTo(hardware.getWorldPosition(new T.Vector3())) < 1e-6,
      'target follows dirty parent',
    );
    const ray = new T.Raycaster(
      pose.position,
      pose.target.clone().sub(pose.position).normalize(),
    );
    assert.equal(
      pickInspectable(ray, root, entries)?.id,
      'door-hardware-test',
      'door must not occlude hardware',
    );
  }
});

test('apartment 210 focus sees the actual handle from the hallway side', () => {
  const b = buildHallway(false),
    hardware = b.entries.find((e) => e.id === 'door-hardware-210');
  const pose = componentFocusPose(hardware.object);
  const door = b.entries.find((e) => e.id === 'door-210').object;
  assert.ok(
    pose.position.x < door.getWorldPosition(new T.Vector3()).x,
    'camera faces east-wall door from hall',
  );
  const ray = new T.Raycaster(
    pose.position,
    pose.target.clone().sub(pose.position).normalize(),
  );
  assert.equal(pickInspectable(ray, b.model, b.entries)?.id, hardware.id);
});
