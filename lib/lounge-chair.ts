import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Approximate 74 cm wide lounge chair reconstructed from the supplied photograph. */
export function createLoungeChair(upholstery: T.Material, timber: T.Material) {
  const chair = new T.Group();
  chair.name = 'Living room — cream boucle and oak lounge chair';
  function mesh(
    geometry: T.BufferGeometry,
    material: T.Material,
    name: string,
  ) {
    const object = new T.Mesh(geometry, material);
    object.name = name;
    object.castShadow = true;
    object.receiveShadow = true;
    chair.add(object);
    return object;
  }
  const seat = mesh(
    new RoundedBoxGeometry(0.66, 0.16, 0.61, 5, 0.065),
    upholstery,
    'Rounded upholstered seat',
  );
  seat.position.set(0, 0.65, -0.045);
  // A continuous U-shaped shell, curved in plan with a gently rising back.
  const outline = new T.Shape();
  const limit = 1.43,
    segments = 40;
  for (let i = 0; i <= segments; i++) {
    const a = -limit + (i * 2 * limit) / segments;
    const x = 0.365 * Math.sin(a),
      y = -0.325 * Math.cos(a);
    if (i === 0) outline.moveTo(x, y);
    else outline.lineTo(x, y);
  }
  for (let i = segments; i >= 0; i--) {
    const a = -limit + (i * 2 * limit) / segments;
    outline.lineTo(0.3 * Math.sin(a), -0.26 * Math.cos(a));
  }
  outline.closePath();
  const shell = new T.ExtrudeGeometry(outline, {
    depth: 0.49,
    bevelEnabled: true,
    bevelThickness: 0.019,
    bevelSize: 0.014,
    bevelSegments: 4,
    curveSegments: 32,
    steps: 8,
  });
  shell.rotateX(-Math.PI / 2);
  const p = shell.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const height = Math.max(0, p.getY(i) / 0.49);
    const edge = Math.min(1, Math.abs(p.getX(i)) / 0.365);
    p.setY(i, p.getY(i) - 0.14 * edge * edge * height);
    p.setX(i, p.getX(i) * (1 + 0.04 * height));
  }
  shell.computeVertexNormals();
  const back = mesh(shell, upholstery, 'Curved wraparound upholstered back');
  back.position.set(0, 0.55, 0);
  function beam(
    a: [number, number, number],
    b: [number, number, number],
    name: string,
  ) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b),
      direction = end.clone().sub(start);
    const object = mesh(
      new RoundedBoxGeometry(0.046, direction.length(), 0.066, 3, 0.01),
      timber,
      name,
    );
    object.position.copy(start).add(end).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      direction.normalize(),
    );
  }
  for (const side of [-1, 1]) {
    const x = side * 0.326;
    beam([x, 0.22, -0.385], [x, 0.7, 0.13], 'Splayed oak front leg');
    beam(
      [x, 0.22, 0.34],
      [x, 0.91, -0.07],
      'Oak rear leg and exposed back support',
    );
    beam([x, 0.55, -0.21], [x, 0.55, 0.22], 'Seat support rail');
  }
  return chair;
}
