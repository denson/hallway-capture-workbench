import * as T from 'three';
import type { EditableEntry } from './house-editor';
export function isInspectable(id: string) {
  return (
    !/^(floor-|wall-|ceiling-|structure-|frame-|junction-wall-)/.test(id) ||
    id === 'frame-210' ||
    id === 'wall-cabinet' ||
    id === 'wall-heater-stair2'
  );
}
/** The closest visible surface wins; walls occlude equipment behind them. */
export function pickInspectable(
  ray: T.Raycaster,
  model: T.Object3D,
  entries: EditableEntry[],
): EditableEntry | null {
  model.updateWorldMatrix(true, true);
  const meshes: T.Mesh[] = [];
  model.traverseVisible((o) => {
    if (o instanceof T.Mesh) meshes.push(o);
  });
  for (const hit of ray.intersectObjects(meshes, false)) {
    const mesh = hit.object as T.Mesh,
      material = Array.isArray(mesh.material)
        ? mesh.material[hit.face?.materialIndex ?? 0]
        : mesh.material;
    if (!material?.visible || (material.transparent && material.opacity === 0))
      continue;
    const clipped = material.clippingPlanes?.map(
      (p) => p.distanceToPoint(hit.point) < 0,
    );
    if (
      clipped?.length &&
      (material.clipIntersection
        ? clipped.every(Boolean)
        : clipped.some(Boolean))
    )
      continue;
    let node: T.Object3D | null = mesh;
    while (node) {
      const entry = entries.find((e) => e.object === node);
      if (entry)
        return !entry.deleted && isInspectable(entry.id) ? entry : null;
      node = node.parent;
    }
    return null;
  }
  return null;
}
