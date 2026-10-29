import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { transformedObstacle } from '../lib/editor-geometry.ts';
const original = { minX: 1, maxX: 3, minZ: 4, maxZ: 5 };
test('walking collision follows a 90 degree rotation and translation', () => {
  const matrix = new T.Matrix4()
    .makeTranslation(10, 0, 10)
    .multiply(new T.Matrix4().makeRotationY(Math.PI / 2));
  const moved = transformedObstacle(original, matrix);
  for (const [key, value] of Object.entries({
    minX: 14,
    maxX: 15,
    minZ: 7,
    maxZ: 9,
  }))
    assert.ok(Math.abs(moved[key] - value) < 1e-9);
});
test('resetting transform restores the original collision bounds', () => {
  assert.deepEqual(transformedObstacle(original, new T.Matrix4()), original);
});
