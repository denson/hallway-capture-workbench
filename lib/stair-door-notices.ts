import * as T from 'three';

/** Authored paper and text, not a photograph pasted over the door geometry. */
export function buildStairDoorNotices(textures:boolean,resources:T.Texture[]) {
  const group=new T.Group();group.name='Stair 2 taped paper notices';
  const paper=new T.MeshStandardMaterial({name:'Notice paper',color:'#eee8ce',roughness:.9});
  const tape=new T.MeshPhysicalMaterial({name:'Clear tape edges',color:'#e3dfd3',transparent:true,opacity:.22,roughness:.3,depthWrite:false,side:T.DoubleSide});
  function box(parent:T.Object3D,name:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material) {
    const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
  }
  for(const [kind,x,y] of [['notice',.06,1.54],['slam',-.25,1.48]] as const) {
    const sheet=new T.Group();sheet.name=kind==='notice'?'Taped smoking and vaping notice':'Taped please do not slam door notice';sheet.position.set(x,y,0);sheet.rotation.z=kind==='slam'?-.012:.009;group.add(sheet);
    const w=.29,h=.23;box(sheet,'Paper sheet',0,0,-.0275,w,h,.001,paper);
    if(textures) {
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=500;const ctx=canvas.getContext('2d')!;
      ctx.fillStyle='#eee8ce';ctx.fillRect(0,0,640,500);ctx.textAlign='center';ctx.textBaseline='middle';
      if(kind==='notice') {
        ctx.fillStyle='#536c9b';ctx.fillRect(155,65,330,92);ctx.fillStyle='#c94839';ctx.font='bold 65px sans-serif';ctx.fillText('NOTICE',320,112);
        ctx.fillStyle='#78554a';ctx.font='27px sans-serif';['SMOKING AND VAPING IS','NOT PERMITTED WITHIN 25','FEET OF ALL ENTRANCES.'].forEach((s,i)=>ctx.fillText(s,320,207+i*44));
        // Four prohibition circles are visible; their tiny pictograms are not resolved.
        ctx.strokeStyle='#ae5c43';ctx.lineWidth=7;for(let i=0;i<4;i++){const cx=200+i*80;ctx.beginPath();ctx.arc(cx,365,30,0,Math.PI*2);ctx.moveTo(cx-22,343);ctx.lineTo(cx+22,387);ctx.stroke();}
      } else {
        ctx.fillStyle='#252a27';ctx.font='bold 64px sans-serif';ctx.fillText('PLEASE',320,108);ctx.font='bold 94px sans-serif';ctx.fillText('DO NOT',320,240);ctx.font='bold 66px sans-serif';ctx.fillText('SLAM DOOR',320,362);
      }
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;resources.push(texture);
      const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:texture,roughness:.9}));face.name='Readable notice text';face.position.z=-.0282;face.rotation.y=Math.PI;sheet.add(face);
    }
    for(const side of [-1,1]) {
      box(sheet,'Clear tape horizontal edge',0,side*(h/2+.002),-.0293,w+.034,.022,.0005,tape);
      box(sheet,'Clear tape vertical edge',side*(w/2+.002),0,-.0297,.019,h+.035,.0005,tape);
    }
  }
  return group;
}
