import * as T from 'three';

/** Photo-informed face only; size and hidden electrical details are unverified.
 * Local +X appears on the viewer's left when looking at the -Z face.
 */
export function buildDuplexOutlet() {
  const group=new T.Group();group.name='Photo-informed white duplex outlet';
  const plate=new T.MeshStandardMaterial({name:'White outlet wall plate',color:'#edece6',roughness:.36});
  const face=new T.MeshStandardMaterial({name:'White receptacle faces',color:'#dcdcd5',roughness:.44});
  const shadow=new T.MeshStandardMaterial({name:'Outlet opening shadows',color:'#141916',roughness:.9});
  const metal=new T.MeshStandardMaterial({name:'Outlet center screw',color:'#a6aca8',roughness:.35,metalness:.65});
  function add(name:string,geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0) {
    const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);
    mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  const rectangle=new T.Shape();rectangle.moveTo(-.033,-.055);rectangle.lineTo(.033,-.055);rectangle.lineTo(.033,.055);rectangle.lineTo(-.033,.055);rectangle.closePath();
  add('Beveled white wall plate',new T.ExtrudeGeometry(rectangle,{depth:.004,bevelEnabled:true,bevelSize:.0025,bevelThickness:.002,bevelSegments:3}),plate,0,0,-.006);
  const outline=new T.Shape();outline.moveTo(-.009,.014);outline.lineTo(.009,.014);
  outline.quadraticCurveTo(.018,.007,.016,-.004);outline.quadraticCurveTo(.015,-.010,.009,-.014);
  outline.lineTo(-.009,-.014);outline.quadraticCurveTo(-.018,-.007,-.016,.004);outline.quadraticCurveTo(-.015,.010,-.009,.014);
  function slot(name:string,x:number,y:number,w:number,h:number,z=-.0105) {
    return add(name,new T.BoxGeometry(w,h,.0005),shadow,x,y,z);
  }
  for(const [index,y] of [[1,.021],[2,-.021]] as const) {
    const rim=add(`Receptacle ${index} perimeter seam`,new T.ShapeGeometry(outline),shadow,0,y,-.0081);rim.rotation.y=Math.PI;rim.scale.setScalar(1.04);
    const socket=add(`Receptacle ${index} clipped-round face`,new T.ExtrudeGeometry(outline,{depth:.0015,bevelEnabled:true,bevelSize:.0004,bevelThickness:.0004,bevelSegments:2}),face,0,y,-.010);
    // Vertical and horizontal limbs form the observed view-left T, on both sockets.
    slot(`Receptacle ${index} view-left T stem`,.008,y+.003,.0023,.009);
    slot(`Receptacle ${index} view-left T branch`,.011,y+.003,.006,.0023);
    slot(`Receptacle ${index} view-right vertical slot`,-.008,y+.003,.0023,.008);
    const ground=new T.Shape();ground.moveTo(-.0026,-.0025);ground.lineTo(.0026,-.0025);ground.lineTo(.0026,.0003);
    ground.absarc(0,.0003,.0026,0,Math.PI,false);ground.closePath();
    const opening=add(`Receptacle ${index} lower ground opening`,new T.ShapeGeometry(ground),shadow,0,y-.009,-.0106);opening.rotation.y=Math.PI;
  }
  const screw=add('Central metal screw',new T.CylinderGeometry(.003,.003,.001,24),metal,0,0,-.008);screw.rotation.x=Math.PI/2;
  slot('Central screw slot',0,0,.00055,.0048,-.0087);
  return group;
}
