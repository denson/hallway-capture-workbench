import * as T from 'three';

/** Photo-informed exterior lever. All sizes are provisional, in metres. */
export function buildDoor210Hardware() {
  const group = new T.Group();
  const nickel = new T.MeshStandardMaterial({
    name: '210 satin metal hardware',
    color: '#b6b9b7',
    metalness: 0.82,
    roughness: 0.32,
  });
  const inset = new T.MeshStandardMaterial({
    name: '210 cylinder outline',
    color: '#555b59',
    metalness: 0.7,
    roughness: 0.4,
  });
  const slot = new T.MeshStandardMaterial({
    name: '210 generic keyway shadow',
    color: '#111714',
    roughness: 0.85,
  });
  const add = (
    name: string,
    geometry: T.BufferGeometry,
    material: T.Material,
    z = 0,
  ) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.z = z;
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const disc = (
    name: string,
    r: number,
    depth: number,
    z: number,
    material: T.Material = nickel,
  ) => {
    const mesh = add(
      name,
      new T.CylinderGeometry(r, r, depth, 48),
      material,
      z,
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  disc('Round rose · estimated 76 mm diameter', 0.038, 0.01, -0.005);
  disc('Rose stepped inner shoulder', 0.029, 0.004, -0.012);
  disc('Lever spindle hub', 0.016, 0.038, -0.033);

  const blade = new T.Shape();
  blade.moveTo(-0.023, 0.001);
  blade.quadraticCurveTo(-0.023, 0.025, 0, 0.024);
  blade.lineTo(0.053, 0.017);
  blade.quadraticCurveTo(0.105, 0.01, 0.129, 0.004);
  blade.lineTo(0.127, -0.011);
  blade.quadraticCurveTo(0.126, -0.016, 0.112, -0.016);
  blade.lineTo(0.002, -0.02);
  blade.quadraticCurveTo(-0.023, -0.023, -0.023, 0.001);
  const geometry = new T.ExtrudeGeometry(blade, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.0015,
    bevelSegments: 3,
    curveSegments: 16,
  });
  // The side photograph shows a thin blade sweeping back toward the door.
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const t = T.MathUtils.clamp(positions.getX(i) / 0.129, 0, 1);
    positions.setZ(i, positions.getZ(i) + 0.015 * t * t);
  }
  geometry.computeVertexNormals();
  add('Flattened curved lever blade', geometry, nickel, -0.062);

  // Two-lobed insert outline, without inventing the faint maker's marking.
  const core = new T.Shape();
  core.moveTo(0, 0.007);
  core.quadraticCurveTo(0.003, 0.01, 0.007, 0.01);
  core.absarc(0.007, 0, 0.01, Math.PI / 2, -Math.PI / 2, true);
  core.quadraticCurveTo(0.003, -0.01, 0, -0.007);
  core.quadraticCurveTo(-0.003, -0.01, -0.007, -0.01);
  core.absarc(-0.007, 0, 0.01, -Math.PI / 2, Math.PI / 2, true);
  core.quadraticCurveTo(-0.003, 0.01, 0, 0.007);
  const outline = add(
    'Two-lobed keyed insert surround',
    new T.ShapeGeometry(core, 24),
    inset,
    -0.064,
  );
  outline.rotation.y = Math.PI;
  const face = add(
    'Keyed insert face',
    new T.ShapeGeometry(core, 24),
    nickel,
    -0.0644,
  );
  face.rotation.y = Math.PI;
  face.scale.setScalar(0.94);
  const plug = disc('Round key plug', 0.0075, 0.0008, -0.065);
  plug.position.x = -0.007;
  const keyway = add(
    'Generic keyway · no key profile inferred',
    new T.PlaneGeometry(0.009, 0.0025),
    slot,
    -0.0656,
  );
  keyway.position.x = -0.007;
  keyway.rotation.y = Math.PI;
  return group;
}
