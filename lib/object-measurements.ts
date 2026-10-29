import * as T from 'three';

// Measure geometry in the assembly's own axes, independent of world placement.
export function objectBounds(object:T.Object3D):T.Box3 {
  object.updateWorldMatrix(true,true);
  const inverse=object.matrixWorld.clone().invert(),bounds=new T.Box3();
  const point=new T.Vector3();
  object.traverse(child=>{
    if(!(child instanceof T.Mesh))return;
    const positions=child.geometry.getAttribute('position');if(!positions)return;
    const transform=new T.Matrix4().multiplyMatrices(inverse,child.matrixWorld);
    for(let i=0;i<positions.count;i++)bounds.expandByPoint(point.fromBufferAttribute(positions,i).applyMatrix4(transform));
  });
  if(bounds.isEmpty())bounds.set(new T.Vector3(),new T.Vector3());
  return bounds;
}
export function measurementSize(object:T.Object3D,bounds=objectBounds(object)){
  const size=bounds.getSize(new T.Vector3());
  return {width:size.x*Math.abs(object.scale.x),depth:size.z*Math.abs(object.scale.z),height:size.y*Math.abs(object.scale.y)};
}
export function dimensionOverlay(bounds:T.Box3,size:ReturnType<typeof measurementSize>){
  const group=new T.Group();group.name='Measurement guides';
  const {min:a,max:b}=bounds,offset=.22;
  const guides:[T.Vector3,T.Vector3,string,string][]=[
    [new T.Vector3(a.x,b.y+offset,b.z+offset),new T.Vector3(b.x,b.y+offset,b.z+offset),'Width',size.width.toFixed(2)],
    [new T.Vector3(b.x+offset,b.y+offset,a.z),new T.Vector3(b.x+offset,b.y+offset,b.z),'Depth',size.depth.toFixed(2)],
    [new T.Vector3(a.x-offset,a.y,a.z-offset),new T.Vector3(a.x-offset,b.y,a.z-offset),'Height',size.height.toFixed(2)],
  ];
  for(const [start,end,label,value] of guides){
    const line=new T.Line(new T.BufferGeometry().setFromPoints([start,end]),new T.LineBasicMaterial({color:0xf5cb70,depthTest:false}));line.renderOrder=1000;group.add(line);
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=80;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#193530';ctx.fillRect(0,0,384,80);ctx.fillStyle='#fff1cf';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText(`${label} ${value} m`,192,50);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));sprite.position.copy(start).lerp(end,.5);sprite.scale.set(1.35,.28,1);sprite.renderOrder=1001;group.add(sprite);
  }
  return group;
}
export function disposeDimensions(group:T.Group){group.traverse(o=>{if(o instanceof T.Line){o.geometry.dispose();(o.material as T.Material).dispose();}if(o instanceof T.Sprite){o.material.map?.dispose();o.material.dispose();}});group.removeFromParent();}
