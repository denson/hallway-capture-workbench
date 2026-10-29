import * as T from 'three';

/** Hallway-facing exit device from four detail photos. Sizes remain estimates.
 * Local +X is view-left, -Z projects into the hallway; origin is on the leaf.
 */
export function buildStairExitDevice(leafWidth: number) {
  const group = new T.Group();
  group.name = 'Stair 2 photo-informed exit device';
  const metal = new T.MeshStandardMaterial({name:'Exit device satin metal',color:'#bdc0bd',metalness:.78,roughness:.33});
  const dark = new T.MeshStandardMaterial({name:'Exit device seams',color:'#27302d',roughness:.7});
  function block(name:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=metal) {
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);
    mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  const left=leafWidth/2-.075, right=-leafWidth/2+.035;
  const start=left-.047, split=-leafWidth*.15, end=right+.02;
  block('Stair 2 exit-device backing rail',(start+end)/2,0,-.039,start-end,.071,.026);
  // The broad press pad ends at a visible seam about two-thirds across the rail.
  block('Stair 2 horizontal push bar',(start+split)/2,0,-.083,start-split,.064,.047);
  block('Stair 2 fixed hinge-side cover',(split+end)/2,0,-.061,split-end,.064,.037);
  block('Stair 2 press-pad seam',split-.001,0,-.081,.002,.062,.003,dark);
  block('Stair 2 push-bar end support',right,0,-.051,.028,.077,.055);
  // Rounded tall latch case: a curved side section extruded vertically, rather
  // than a full-height square block or an apartment lockset.
  const section=new T.Shape();
  section.moveTo(-.045,0);section.lineTo(.045,0);section.lineTo(.045,.025);
  section.bezierCurveTo(.043,.070,.025,.104,-.004,.104);
  section.bezierCurveTo(-.031,.104,-.045,.070,-.045,.025);section.closePath();
  const geometry=new T.ExtrudeGeometry(section,{depth:.225,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:3,curveSegments:20});
  const latch=new T.Mesh(geometry,metal);latch.name='Stair 2 push-bar latch housing';
  latch.rotation.x=-Math.PI/2;latch.position.set(left,-.1125,-.028);
  latch.castShadow=latch.receiveShadow=true;group.add(latch);
  block('Stair 2 latch-side strike plate',leafWidth/2+.012,0,-.035,.033,.262,.018);
  const hole=new T.Mesh(new T.CircleGeometry(.004,16),dark);
  hole.name='Stair 2 visible fixed-cover opening';hole.position.set(split-.038,0,-.080);hole.rotation.y=Math.PI;group.add(hole);
  return group;
}
