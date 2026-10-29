import * as T from 'three';

/** Inspection pose on the component's exposed local -Z side, including its parents. */
export function componentFocusPose(object: T.Object3D) {
  object.updateWorldMatrix(true, true);
  const bounds = new T.Box3().setFromObject(object);
  const target = bounds.getCenter(new T.Vector3());
  const distance = Math.max(
    0.6,
    bounds.getSize(new T.Vector3()).length() * 1.6,
  );
  const offset = new T.Vector3(distance * 0.45, 0, -distance).applyQuaternion(
    object.getWorldQuaternion(new T.Quaternion()),
  );
  offset.y = distance * 0.35;
  return { target, position: target.clone().add(offset) };
}
