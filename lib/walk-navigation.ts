import * as T from 'three';

export type FloorPoint = { x: number; z: number };
type CanStand = (x: number, z: number) => boolean;

/** Sweep the whole movement, rather than testing only the landing point. */
export function canWalkSegment(from: FloorPoint, to: FloorPoint, canStand: CanStand) {
  if (![from.x, from.z, to.x, to.z].every(Number.isFinite)) return false;
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  if (distance > 100) return false;
  const steps = Math.max(1, Math.ceil(distance / .06));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!canStand(from.x + (to.x - from.x) * t, from.z + (to.z - from.z) * t)) return false;
  }
  return true;
}

export function findWalkDestination(from: FloorPoint, hit: FloorPoint, canStand: CanStand): FloorPoint | null {
  if (![hit.x, hit.z].every(Number.isFinite)) return null;
  // Clicking near a wall lands just inside the clear floor, leaving body clearance.
  const candidates = [{ x: hit.x, z: hit.z }];
  for (const radius of [.12, .24, .36]) for (let i = 0; i < 16; i++) {
    candidates.push({ x: hit.x + Math.cos(i * Math.PI / 8) * radius, z: hit.z + Math.sin(i * Math.PI / 8) * radius });
  }
  return candidates.find(p => canWalkSegment(from, p, canStand)) ?? null;
}

/** Respect visible occluders: clicking a wall must not select floor behind it. */
export function pickWalkFloor(ray: T.Raycaster, model: T.Object3D): T.Vector3 | null {
  model.updateWorldMatrix(true, true);
  const meshes: T.Mesh[] = [];
  model.traverseVisible(o => { if (o instanceof T.Mesh) meshes.push(o); });
  for (const hit of ray.intersectObjects(meshes, false)) {
    const mesh = hit.object as T.Mesh;
    const material = Array.isArray(mesh.material) ? mesh.material[hit.face?.materialIndex ?? 0] : mesh.material;
    if (!material?.visible || (material.transparent && material.opacity === 0)) continue;
    const clipped = material.clippingPlanes?.map(p => p.distanceToPoint(hit.point) < 0);
    if (clipped?.length && (material.clipIntersection ? clipped.every(Boolean) : clipped.some(Boolean))) continue;
    let object: T.Object3D | null = mesh;
    while (object && !String(object.userData.id ?? '').startsWith('floor-')) object = object.parent;
    if (!object || !hit.face) return null;
    const normal = hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(mesh.matrixWorld));
    return normal.y > .9 ? hit.point.clone() : null;
  }
  return null;
}
