import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { pickInspectable, isInspectable } from '../lib/object-inspection.ts';
function setup() {
  const model = new T.Group(),
    object = new T.Group();
  object.add(new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial()));
  model.add(object);
  return {
    model,
    entry: { id: 'wall-heater-stair2', name: 'Heater', object, colliders: [] },
    ray: new T.Raycaster(new T.Vector3(0, 0, 4), new T.Vector3(0, 0, -1)),
  };
}
test('equipment picking resolves a nested mesh to its stable component', () => {
  const { model, entry, ray } = setup();
  assert.equal(pickInspectable(ray, model, [entry]), entry);
  assert.equal(isInspectable('floor-1'), false);
  assert.equal(isInspectable('wall-cabinet'), true);
  assert.equal(isInspectable('door-210'), true);
});
test('walls occlude equipment; clipped-away walls do not block inspection', () => {
  const { model, entry, ray } = setup();
  const material = new T.MeshBasicMaterial(),
    wall = new T.Mesh(new T.BoxGeometry(2, 2, 0.1), material);
  wall.position.z = 2;
  model.add(wall);
  assert.equal(pickInspectable(ray, model, [entry]), null);
  material.clippingPlanes = [new T.Plane(new T.Vector3(0, 0, -1), 1)];
  assert.equal(pickInspectable(ray, model, [entry]), entry);
});
test('hidden or deleted equipment cannot be inspected', () => {
  const { model, entry, ray } = setup();
  entry.object.visible = false;
  assert.equal(pickInspectable(ray, model, [entry]), null);
  entry.object.visible = true;
  entry.deleted = true;
  assert.equal(pickInspectable(ray, model, [entry]), null);
});
