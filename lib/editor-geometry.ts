import * as T from 'three';
import type { Obstacle } from './house-data';
export function transformedObstacle(
  base: Obstacle,
  matrix: T.Matrix4,
): Obstacle {
  const bounds = new T.Box3();
  for (const x of [base.minX, base.maxX])
    for (const z of [base.minZ, base.maxZ])
      bounds.expandByPoint(new T.Vector3(x, 0, z).applyMatrix4(matrix));
  return {
    minX: bounds.min.x,
    maxX: bounds.max.x,
    minZ: bounds.min.z,
    maxZ: bounds.max.z,
  };
}
