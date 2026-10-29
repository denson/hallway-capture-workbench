import {hallwayComponentRecord} from './hallway-component-defaults.ts';
import {buildDoor210Hardware} from './door-hardware.ts';
import {buildStairExitDevice} from './stair-exit-device.ts';
import {buildDuplexOutlet} from './duplex-outlet.ts';
import {buildStairDoorNotices} from './stair-door-notices.ts';
import * as T from 'three';
import {HALL, DOOR_210, FLOOR_RECTS, planX, planZ, type Obstacle} from './hallway-data.ts';
import type {EditableEntry} from './house-editor';

export type Evidence={basis:string;status:'measured'|'plan'|'estimated';notes:string};
type V=[number,number,number];
const evidence=(basis:string,notes:string,status:Evidence['status']='estimated'):Evidence=>({basis,notes,status});

/** Authored provisional geometry. No photo is used as a billboard or facade. */
export function buildHallway(textures=typeof document!=='undefined'){
  const model=new T.Group();model.name='Second-floor hallway · blueprint + photo reconstruction';
  model.userData={units:'metres',revision:'draft-2-video-informed',planCalibration:'150 px = 24 ft',note:'Estimated equipment dimensions; see HALLWAY_DRAFT.md'};
  const entries:EditableEntry[]=[],obstacles:Obstacle[]=[],resources:T.Texture[]=[];
  const lights:{x:number;y:number;z:number}[]=[];
  const architectural:T.MeshStandardMaterial[]=[];
  const materials=new Map<string,T.MeshStandardMaterial>();
  function material(name:string,color:string,roughness=.75,metalness=0,arch=false){
    const m=new T.MeshStandardMaterial({name,color,roughness,metalness});materials.set(name,m);
    if(arch){architectural.push(m);m.clipShadows=true;m.userData.architectural=true;}return m;
  }
  const paint=material('Warm terracotta wall','#b95d32',.48,0,true);
  const concrete=material('Board-formed overhead concrete','#777a74',.92,0,true);
  const floor=material('Worn concrete floor','#92938b',.79);
  const grayFloor=material('Overview only · floor','#9a9fa2',.96);
  const grayWall=material('Details not captured · walls','#858c90',.96,0,true);
  const grayDoor=material('Details not captured · door proxies','#626c72',.96);
  const trim=material('Charcoal painted trim','#263138',.4);
  const steel=material('Galvanized conduit','#b2b7b6',.3,.73);
  const black=material('Black painted pipe','#1d292c',.4,.15);
  const orange=material('Orange grooved pipe fittings','#b94c20',.46,.12);
  const white=material('Off-white equipment enclosure','#e8e8df',.38);
  const red=material('Red indicator / cylinder','#a5291e',.38,.12);
  const wire=material('Black cable sheathing','#242624',.68);
  const cableWhite=material('Cream cable sheathing','#d9cfa9',.66);
  const brick=material('Exposed brick at stair door','#a66c50',.94);
  const mortar=material('Brick mortar','#a6a292',1);
  const lamp=material('Warm LED diffuser','#fff6d6',.35);lamp.emissive.set('#fff4cc');lamp.emissiveIntensity=2;
  const green=material('Exit sign green','#188844',.55);green.emissive.set('#26a64c');green.emissiveIntensity=.6;
  const lens=material('Camera smoked dome','#15222a',.17,.5);
  const glass=new T.MeshPhysicalMaterial({name:'Cabinet glazing',color:'#c6d9db',transparent:true,opacity:.22,roughness:.14,metalness:.08,side:T.DoubleSide,depthWrite:false});

  if(textures){
    let seed=210;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    for(const [target,isFloor] of [[concrete,false],[floor,true]] as const){
      const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;
      const image=ctx.createImageData(512,512);
      for(let y=0;y<512;y++)for(let x=0;x<512;x++){
        const i=(y*512+x)*4;
        const v=180+(rnd()-.5)*23+Math.sin(x*.07)*3+Math.sin(y*.03)*5;
        image.data[i]=v;image.data[i+1]=v;image.data[i+2]=v-5;image.data[i+3]=255;
      }
      ctx.putImageData(image,0,0);
      if(!isFloor){
        ctx.strokeStyle='rgba(42,40,30,.22)';ctx.lineWidth=1;
        for(let x=0;x<512;x+=128){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+3,512);ctx.stroke();}
      }
      for(let i=0;i<(isFloor?350:110);i++){
        ctx.fillStyle=`rgba(40,37,30,${rnd()*.12})`;ctx.beginPath();ctx.ellipse(rnd()*512,rnd()*512,.4+rnd()*4,.4+rnd()*2,rnd()*3,0,Math.PI*2);ctx.fill();
      }
      const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
      resources.push(t);target.map=t;target.bumpMap=t;target.bumpScale=isFloor?.004:.008;
    }
  }
  function assembly(id:string,name:string,e:Evidence,pos:V=[0,0,0],rotation=0){
    const g=new T.Group();g.name=name;g.position.set(...pos);g.rotation.y=rotation;
    g.userData={id,evidence:e,recenter:pos.every(n=>n===0)&&rotation===0};model.add(g);
    entries.push({id,name,object:g,colliders:[]});return g;
  }
  function box(g:T.Object3D,p:V,s:V,m:T.Material){
    const geo=new T.BoxGeometry(...s);
    if(m instanceof T.MeshStandardMaterial&&m.map){
      const v=geo.getAttribute('position'),n=geo.getAttribute('normal'),uv=geo.getAttribute('uv');
      for(let i=0;i<v.count;i++){
        const x=v.getX(i)+p[0],y=v.getY(i)+p[1],z=v.getZ(i)+p[2];
        uv.setXY(i,Math.abs(n.getX(i))>.5?z:x,Math.abs(n.getY(i))>.5?z:y);
      }
    }
    const mesh=new T.Mesh(geo,m);mesh.position.set(...p);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;
  }
  function cylinder(g:T.Object3D,a:V,b:V,r:number,m:T.Material,segments=14){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),d=end.clone().sub(start);
    const mesh=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),segments),m);
    mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
    mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;
  }
  function ball(g:T.Object3D,p:V,r:number,m:T.Material){const mesh=new T.Mesh(new T.SphereGeometry(r,14,10),m);mesh.position.set(...p);mesh.castShadow=true;g.add(mesh);return mesh;}
  function collider(g:T.Object3D,x:number,z:number,w:number,d:number){
    const b={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2};obstacles.push(b);
    entries.find(e=>e.object===g)!.colliders.push(b);
  }
  function label(g:T.Object3D,text:string,p:V,w:number,h:number,rotation=0,bg='#28343a',fg='#ecebdd'){
    if(!textures)return;
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;
    ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;resources.push(t);
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));mesh.position.set(...p);mesh.rotation.y=rotation;g.add(mesh);
  }
  for(const [i,[x,z,w,d]] of FLOOR_RECTS.entries()){
    const g=assembly('floor-'+i,['Main corridor concrete floor','Stair 2 branch concrete floor','East lobby concrete floor'][i],evidence('Blueprint scale bar','Corridor footprint traced from corresponding plan geometry.','plan'));
    if(i===0){for(const [a,b,m] of [[0,HALL.branchLeft,grayFloor],[HALL.branchLeft,HALL.branchRight,floor],[HALL.branchRight,HALL.length,grayFloor]] as const)box(g,[(a+b)/2,-.065,z+d/2],[b-a,.13,d],m);}
    else box(g,[x+w/2,-.065,z+d/2],[w,.13,d],i===1?floor:grayFloor);
  }
  const ceiling=assembly('ceiling-slabs','Ceiling slabs · cutaway toggle',evidence('Photos + existing height reading','3.5052 m height uses the existing approximate iPhone reading; slab thickness inferred.'));
  for(const [i,[x,z,w,d]] of FLOOR_RECTS.entries())box(ceiling,[x+w/2,HALL.ceiling+.12,z+d/2],[w+.18,.24,d+.18],i===1?concrete:grayWall);

  type Opening={center:number;id:string};
  function wall(id:string,name:string,x:number,z:number,length:number,axis:'x'|'z',openings:Opening[]=[]){
    const g=assembly(id,name,evidence('Blueprint','Wall position follows the blueprint; finish from hallway photos.','plan'));
    const thick=.16;
    function segment(a:number,b:number,low=0,high=HALL.ceiling){
      if(b-a<.001)return;
      const px=x+(axis==='x'?(a+b)/2:0),pz=z+(axis==='z'?(a+b)/2:0);
      box(g,[px,(low+high)/2,pz],[axis==='x'?b-a:thick,high-low,axis==='z'?b-a:thick],paint);
      if(low===0){
        collider(g,px,pz,axis==='x'?b-a:thick,axis==='z'?b-a:thick);
        box(g,[px,.055,pz],[axis==='x'?b-a:thick+.016,.11,axis==='z'?b-a:thick+.016],trim);
      }
    }
    let cursor=0;
    for(const o of [...openings].sort((a,b)=>a.center-b.center)){
      const openingW=o.id==='210'?40*.0254-.15:HALL.doorWidth;
      const openingH=o.id==='210'?80*.0254-.08:HALL.doorHeight;
      const a=o.center-openingW/2-.045,b=o.center+openingW/2+.045;
      segment(cursor,a);segment(a,b,openingH+.05);cursor=b;
      door(o.id,x+(axis==='x'?o.center:0),z+(axis==='z'?o.center:0),axis==='x'?(z<0?Math.PI:0):(x>HALL.branchRight?Math.PI/2:-Math.PI/2));
    }
    segment(cursor,length);return g;
  }
  function door(id:string,x:number,z:number,rotation:number,exit=false){
    const name=id==='210'?'Apartment 210 door panel · estimated':exit?'Stair '+id+' exit door':'Apartment '+id+' door panel';
    const e=id==='210'?evidence('Tape measurement + photos + user correction','The prior 79-inch leaf height reading is unreliable. Leaf dimensions inferred to fit a frame 40 inches wide and approximately 80 inches high; leaf dimensions remain estimates. Video 00:06–00:24 establishes the east wall of the Stair 2 branch; distance from stair door estimated.','estimated'):exit?evidence('Four exit-device detail photos + video 00:18 / 00:54','Hallway-left curved latch case, raised press pad, shorter right fixed cover and end cap observed. Door and hardware dimensions estimated.'):evidence('Blueprint + photo style','Door size inferred from 210; closed doors define model boundary.');
    const g=assembly('door-'+id,name,e,[x,0,z],rotation);
    const w=id==='210'?40*.0254-.15:exit?.95:HALL.doorWidth,h=id==='210'?80*.0254-.08:exit?2.18:HALL.doorHeight;
    box(g,[0,h/2,0],[w,h,.052],trim);
    box(g,[0,.145,-.029],[w-.08,.28,.008],steel);
    if(id==='210'){
      const hardware=assembly('door-hardware-210','Apartment 210 · keyed lever and lock',evidence('Three hardware close-ups + video 00:06 / 00:09','Left latch edge and right-extending lever viewed from the hallway. Round stepped rose, flattened satin-metal blade, curved side profile and keyed insert observed. Setback about 65 mm and center height about 0.91 m inferred from the full-door image; not measured. Maker/model/part number unconfirmed.'),[w/2-.065,.91,-.026]);
      const form=buildDoor210Hardware();form.scale.x=-1;hardware.add(form);g.add(hardware);
    }else if(!exit){
      const rose=cylinder(g,[-w*.34,.96,-.035],[-w*.34,.96,-.075],.034,steel);rose.name='Generic apartment lever rose';
      const lever=cylinder(g,[-w*.34,.96,-.075],[-w*.13,.96,-.075],.012,steel);lever.name='Generic apartment lever';
      if(id==='209'){
        const upper=cylinder(g,[-w*.34,1.15,-.029],[-w*.34,1.15,-.050],.025,steel);upper.name='209 upper round lock · observed at 01:00';
        cylinder(g,[-w*.34,1.15,-.050],[-w*.34,1.15,-.052],.012,black);
      }
    }
    if(exit){
      const device=buildStairExitDevice(w);device.position.y=1.02;g.add(device);
      g.add(buildStairDoorNotices(textures,resources));
      const closer=box(g,[-.08,2.04,-.063],[.30,.065,.067],steel);closer.name='Stair 2 upper door closer';
      cylinder(g,[.11,2.125,-.05],[-.16,2.13,-.075],.007,steel);
      cylinder(g,[-.16,2.13,-.075],[-.27,2.16,-.04],.007,steel);
    }
    if(!exit)cylinder(g,[0,1.48,-.029],[0,1.48,-.043],.008,steel,12);
    const hingeX=id==='210'||exit?-w/2-.008:w/2+.008;
    for(const y of [.22,h/2,h-.22])cylinder(g,[hingeX,y-.04,0],[hingeX,y+.04,0],.009,steel);
    const frame=assembly('frame-'+id,'Door frame '+id,evidence(id==='210'?'Measured outside width + photo height estimate':'Photos',id==='210'?'Outside frame width 40 inches measured; outside height approximately 80 inches photo-derived. Depth and frame profiles estimated.':'Steel jamb, stop and header profiles estimated.'),[x,0,z],rotation);
    for(const side of [-1,1])box(frame,[side*(w/2+.037),id==='210'?(h+.08)/2:h/2,0],[.074,id==='210'?h+.08:h+.09,.12],trim);
    box(frame,[0,h+.04,0],[w+.15,.08,.12],trim);
    if(!exit){const plaque=id==='210'?[w/2+.16,1.45,-.075]:id==='209'?[-w/2-.16,1.45,-.075]:[0,h+.16,-.075];label(id==='210'?g:frame,id,plaque as V,.19,.065,Math.PI);}
    const alongX=Math.abs(Math.sin(rotation))<.5;
    collider(g,x,z,alongX?w+.09:.11,alongX?.11:w+.09);
    return g;
  }
  const north=[{center:planX(368),id:'206'},{center:planX(564),id:'205'},{center:planX(600),id:'204'},{center:planX(810),id:'203'},{center:planX(851),id:'202'}];
  wall('wall-main-north','Main corridor · upper plan wall',0,-.08,HALL.length,'x',north);
  wall('wall-main-south-west','Main corridor · west return',0,HALL.width+.08,HALL.branchLeft,'x');
  const southX=HALL.branchRight;
  wall('wall-main-south-east','Main corridor · apartment wall',southX,HALL.width+.08,HALL.lobbyLeft-southX,'x',[
    {center:planX(621)-southX,id:'211'},
    {center:planX(724)-southX,id:'212'},{center:planX(831)-southX,id:'213'}]);
  wall('wall-main-west','West corridor end',-.08,0,HALL.width,'z');
  wall('wall-branch-west','Stair 2 branch · west wall',HALL.branchLeft-.08,HALL.width,HALL.branchEnd-HALL.width,'z',[
    {center:planZ(583)-HALL.width,id:'209'}]);
  wall('wall-branch-east','Stair 2 branch · east wall',HALL.branchRight+.08,HALL.width,HALL.branchEnd-HALL.width,'z',[{center:DOOR_210.z-HALL.width,id:'210'}]);
  const end=assembly('wall-stair2','Stair 2 end · brick surround',evidence('Exit photo + plan','Brick surround and transom approximate; plan locates the stair.'));
  for(const side of [-1,1])box(end,[(HALL.branchLeft+HALL.branchRight)/2+side*.64,1.7,HALL.branchEnd+.08],[.31,3.4,.16],mortar);
  for(let row=0;row<25;row++)for(const side of [-1,1]){
    const bx=(HALL.branchLeft+HALL.branchRight)/2+side*.64;
    box(end,[bx,.067+row*.137,HALL.branchEnd-.009],[.30,.125,.025],brick);
  }
  box(end,[(HALL.branchLeft+HALL.branchRight)/2,3.105,HALL.branchEnd+.08],[1.05,.80,.16],paint);
  const transomX=(HALL.branchLeft+HALL.branchRight)/2;
  const transom=box(end,[transomX,2.48,HALL.branchEnd+.025],[.95,.44,.025],lamp);transom.name='Stair 2 transom above solid door leaf';
  for(const side of [-1,1])box(end,[transomX+side*.51,2.48,HALL.branchEnd],[.07,.51,.10],trim);
  box(end,[transomX,2.735,HALL.branchEnd],[1.09,.07,.10],trim);
  const stairSignX=(HALL.branchLeft+HALL.branchRight)/2+.64;
  box(end,[stairSignX,1.38,HALL.branchEnd-.027],[.24,.20,.008],white);
  label(end,'STAIR',[stairSignX,1.42,HALL.branchEnd-.033],.20,.06,Math.PI,'#e8e8df','#263138');
  label(end,'#2',[stairSignX,1.34,HALL.branchEnd-.033],.12,.06,Math.PI,'#e8e8df','#263138');
  door('2',(HALL.branchLeft+HALL.branchRight)/2,HALL.branchEnd,0,true);
  wall('wall-lobby-north','Elevator lobby · north side',HALL.length,HALL.width-.08,HALL.lobbyRight-HALL.length,'x');
  wall('wall-lobby-south','Elevator lobby · south side',HALL.lobbyLeft,HALL.lobbyEnd+.08,HALL.lobbyRight-HALL.lobbyLeft,'x',[{center:planX(924)-HALL.lobbyLeft,id:'214'}]);
  wall('wall-lobby-east','Stair 1 lobby end',HALL.lobbyRight+.08,HALL.width,HALL.lobbyEnd-HALL.width,'z');
  const elevator=assembly('elevator-doors','Elevator doors · plan location',evidence('Blueprint','Appearance inferred; no close view of this second-floor end.','plan'));
  for(const side of [-1,1])box(elevator,[HALL.length-.012,1.08,HALL.width/2+side*.29],[.08,2.16,.575],steel);
  box(elevator,[HALL.length-.056,1.08,HALL.width/2],[.01,2.16,.012],trim);
  label(elevator,'ELEVATOR',[HALL.length-.07,2.36,HALL.width/2],.65,.10,-Math.PI/2);
  collider(elevator,HALL.length+.02,HALL.width/2,.12,HALL.width);

  // Repeated transverse beams and wall braces are photo-shaped, not surveyed.
  function beamBay(id:string,center:number,branch:boolean){
    const x=branch?(HALL.branchLeft+HALL.branchRight)/2:center,z=branch?center:HALL.width/2;
    const width=branch?HALL.branchRight-HALL.branchLeft:HALL.width;
    const g=assembly('structure-'+id,'Concrete beam and brace '+id,evidence('Photos 1 / 2 and ceiling close-ups','Beam profile, bay spacing and brace dimensions inferred.'));
    box(g,[x,HALL.ceiling-.25,z],[branch?width+.12:.30,.50,branch?.30:width+.12],concrete);
    const postX=branch?HALL.branchLeft+.035:x,postZ=branch?z:HALL.width-.035;
    box(g,[postX,(HALL.ceiling-.5)/2,postZ],[.14,HALL.ceiling-.5,.14],concrete);
    const a:V=[postX,HALL.ceiling-1.02,postZ],b:V=branch?[postX+.42,HALL.ceiling-.48,postZ]:[postX,HALL.ceiling-.48,postZ-.42];
    const dir=new T.Vector3(...b).sub(new T.Vector3(...a));
    const brace=box(g,new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray() as V,[.14,dir.length(),.15],concrete);
    brace.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());
  }
  for(const [i,z] of [2.4,5.5,8.6,11.6].entries())beamBay('B'+(i+1),z,true);


  // Pipe cylinders, elbow arcs, grooved fittings and suspension hardware.
  function coupling(g:T.Group,p:V,axis:V,r=.036){
    const d=new T.Vector3(...axis).normalize(),a=new T.Vector3(...p).addScaledVector(d,-.035),b=new T.Vector3(...p).addScaledVector(d,.035);
    cylinder(g,a.toArray() as V,b.toArray() as V,r*1.34,orange);
    const lateral=new T.Vector3(0,1,0).cross(d);if(lateral.length()<.1)lateral.set(1,0,0);lateral.normalize();
    for(const s of [-1,1]){
      const c=new T.Vector3(...p).addScaledVector(lateral,s*r*1.35);
      ball(g,c.toArray() as V,.014,orange);
      cylinder(g,c.clone().addScaledVector(d,-.047).toArray() as V,c.clone().addScaledVector(d,.047).toArray() as V,.006,steel,6);
    }
  }
  function pipeRun(id:string,points:V[],r=.032){
    const g=assembly('pipe-'+id,'Sprinkler pipe '+id,evidence('Ceiling photos','Visible pipe style/fittings modeled; unphotographed route and spacing inferred.'));
    for(let i=1;i<points.length;i++){
      cylinder(g,points[i-1],points[i],r,black,16);
      if(i<points.length-1)ball(g,points[i],r*1.03,orange);
      const mid=new T.Vector3(...points[i-1]).lerp(new T.Vector3(...points[i]),.85);
      coupling(g,mid.toArray() as V,new T.Vector3(...points[i]).sub(new T.Vector3(...points[i-1])).toArray() as V,r);
    }
    return g;
  }
  function hanger(g:T.Group,x:number,z:number,y:number,r=.032){
    cylinder(g,[x,HALL.ceiling-.015,z],[x,y+r+.01,z],.0035,steel,8);
    const ring=new T.Mesh(new T.TorusGeometry(r+.007,.003,6,18),steel);ring.position.set(x,y,z);g.add(ring);
    box(g,[x,HALL.ceiling-.012,z],[.045,.018,.045],steel);
  }
  const pipeY=HALL.ceiling-.27;
  const branchPipe=pipeRun('branch-main',[[HALL.branchRight-.17,pipeY,1.8],[HALL.branchRight-.17,pipeY,HALL.branchEnd-.4]]);
  for(const z of [2.05,4.2,6.4,8.7,10.9])hanger(branchPipe,HALL.branchRight-.17,z,pipeY);
  for(const [i,z] of [3.9,7.1,10.3].entries()){
    const g=pipeRun('branch-cross-'+i,[[HALL.branchLeft+.02,pipeY-.035,z],[HALL.branchRight-.17,pipeY-.035,z],[HALL.branchRight-.17,pipeY-.035,z+.14],[HALL.branchRight-.17,HALL.ceiling-.11,z+.14]],.025);
    for(const x of [HALL.branchLeft+.3,HALL.branchRight-.35])hanger(g,x,z,pipeY-.035,.025);
    const head=assembly('sprinkler-head-B'+i,'Upright sprinkler head B'+(i+1),evidence('Video 00:36 / 04:42','Upright end form visible near east wall; simplified head and dimensions estimated. Exact model needs confirmation for hallway.'));
    const x=HALL.branchRight-.17,headZ=z+.14;
    cylinder(head,[x,pipeY-.035,headZ],[x,HALL.ceiling-.07,headZ],.012,steel);
    cylinder(head,[x,HALL.ceiling-.07,headZ],[x,HALL.ceiling-.045,headZ],.025,steel);
    for(const s of [-1,1])cylinder(head,[x+s*.012,HALL.ceiling-.07,headZ],[x+s*.012,HALL.ceiling-.115,headZ],.002,steel,6);
  }

  function conduit(id:string,points:V[],r=.009){
    const g=assembly('conduit-'+id,'Conduit '+id,evidence('Ceiling photos','Routes near photographed bay are reference-informed; continuations inferred.'));
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
    const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(8,points.length*6),r,8,false),steel);mesh.castShadow=true;g.add(mesh);
    const p0=points[0],pn=points[points.length-1],len=new T.Vector3(...pn).distanceTo(new T.Vector3(...p0));
    for(let d=.4;d<len;d+=1.25){
      const p=curve.getPointAt(d/len);box(g,[p.x,p.y+.013,p.z],[.038,.012,.03],steel);
      cylinder(g,[p.x,p.y+.01,p.z],[p.x,HALL.ceiling-.015,p.z],.002,steel,6);
    }return g;
  }
  for(const [i,x] of [HALL.branchLeft+.48,HALL.branchLeft+.94].entries())conduit('branch-'+i,[[x,HALL.ceiling-.045,1.7],[x,HALL.ceiling-.045,HALL.branchEnd-.15]]);

  conduit('branch-junction-offset',[[HALL.branchLeft+.15,HALL.ceiling-.10,2.3],[HALL.branchLeft+.3,HALL.ceiling-.10,2.3],[HALL.branchLeft+.48,HALL.ceiling-.045,2.6],[HALL.branchLeft+.48,HALL.ceiling-.045,3]]);
  for(let c=0;c<4;c++){
    const g=assembly('cable-bundle-'+c,'Wall-top cable '+(c+1),evidence('Photos','Individual cables and loose bends reference-informed; precise routes inferred.'));
    const points:V[]=[];
    for(let i=0;i<=24;i++)points.push([HALL.branchLeft+.02+c*.012,HALL.ceiling-.09-.025*Math.sin(i*.75+c),1.65+i*(HALL.branchEnd-1.8)/24]);
    const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),70,.0045,6,false),c<2?cableWhite:wire);g.add(mesh);
    for(let z=2;z<HALL.branchEnd;z+=1.1)box(g,[HALL.branchLeft+.035,HALL.ceiling-.08,z],[.065,.025,.008],wire);
  }
  function roundLight(id:string,x:number,z:number){
    const g=assembly('light-'+id,'Round ceiling light '+id,evidence('Photos','Suspension, housing and diffuser dimensions estimated.'));
    cylinder(g,[x,HALL.ceiling-.04,z],[x,HALL.ceiling-.24,z],.009,steel);
    cylinder(g,[x,HALL.ceiling-.24,z],[x,HALL.ceiling-.31,z],.15,trim,28);
    cylinder(g,[x,HALL.ceiling-.31,z],[x,HALL.ceiling-.319,z],.135,lamp,28);
    lights.push({x,y:HALL.ceiling-.43,z});
  }
  for(const [i,z] of [2.8,5.9,9,11.9].entries())roundLight('B'+(i+1),(HALL.branchLeft+HALL.branchRight)/2,z);

  function emergency(id:string,x:number,z:number,rot=0,exitSign=false){
    const g=assembly('emergency-'+id,exitSign?'Exit sign / twin-head unit '+id:'Twin-head emergency light '+id,evidence('Overhead close-ups','Housing shape, two lamp heads, mounting box, indicator and test button observed; dimensions estimated.'),[x,HALL.ceiling-.21,z],rot);
    box(g,[0,0,0],[.34,.065,.18],white);box(g,[0,.06,0],[.14,.08,.10],white);
    for(const side of [-1,1]){
      box(g,[side*.18,.006,0],[.05,.024,.035],white);
      cylinder(g,[side*.207,.005,0],[side*.207,-.021,0],.033,white,20);
      cylinder(g,[side*.207,-.021,0],[side*.207,-.025,0],.027,lamp,20);
    }
    ball(g,[.075,-.007,-.092],.004,red);box(g,[.04,-.008,-.093],[.022,.008,.003],trim);
    cylinder(g,[-.04,.04,0],[-.04,.21,-.16],.002,steel,6);
    if(exitSign){box(g,[0,-.10,0],[.34,.15,.04],white);label(g,'EXIT',[0,-.10,-.023],.29,.12,Math.PI,'#e4e8cf','#1f9a36');label(g,'EXIT',[0,-.10,.023],.29,.12,0,'#e4e8cf','#1f9a36');}
    return g;
  }

  emergency('branch',(HALL.branchLeft+HALL.branchRight)/2,2,0);
  emergency('stair2',(HALL.branchLeft+HALL.branchRight)/2,HALL.branchEnd-1.15,0,true);
  emergency('junction',(HALL.branchLeft+HALL.branchRight)/2,.9,Math.PI/2,true);
  for(const [i,z] of [4.6,10.2].entries()){
    const g=assembly('detector-'+i,'Ceiling detector '+(i+1),evidence('Wide corridor photos','Round housing modeled; exact device identity and position estimated.'));
    cylinder(g,[HALL.branchLeft+.60,HALL.ceiling-.08,z],[HALL.branchLeft+.60,HALL.ceiling-.135,z],.065,white,24);
    cylinder(g,[HALL.branchLeft+.60,HALL.ceiling-.135,z],[HALL.branchLeft+.60,HALL.ceiling-.16,z],.045,white,24);
  }
  const camera=assembly('camera-dome','Dome camera and exposed leads',evidence('Video 03:36 / 04:54','Camera is on the junction wall, with visible loose leads; dimensions estimated.'),[(HALL.branchLeft+HALL.branchRight)/2,HALL.ceiling-.20,.025]);
  cylinder(camera,[0,0,0],[0,0,.06],.07,white,24);
  ball(camera,[0,0,.075],.045,lens);
  const loop=new T.Mesh(new T.TorusGeometry(.05,.0035,6,24),cableWhite);loop.position.set(.02,.14,.02);camera.add(loop);
  const outlet=assembly('outlet-opposite-210','Outlet opposite 210',evidence('Three outlet detail photos + earlier opposite-wall registration','White duplex plate, view-left T slots, lower ground openings and central screw observed. Existing branch west-wall placement retained; location, height and size estimated.'),[HALL.branchLeft+.006,0,DOOR_210.z],-Math.PI/2);
  const outletFace=buildDuplexOutlet();outletFace.position.y=.34;outlet.add(outletFace);
  const cabinet=assembly('wall-cabinet','Fire extinguisher cabinet',evidence('User confirmation + two cabinet close-up photos','Fire extinguisher in white cabinet with narrow left viewing window, metal pull and right hinge. Dimensions estimated; location confirmed by user, existing placement retained.'),[HALL.branchRight+.025,0,DOOR_210.z+1.05],Math.PI/2);
  box(cabinet,[0,1.05,.085],[.34,.69,.015],white);
  for(const side of [-1,1])box(cabinet,[side*.162,1.05,.03],[.015,.69,.11],white);
  for(const y of [.712,1.388])box(cabinet,[0,y,.03],[.34,.015,.11],white);
  // Front faces local -Z: viewer-left is positive local X; narrow slot and pull are on that side.
  box(cabinet,[.081,1.05,-.036],[.066,.58,.006],glass);
  box(cabinet,[-.045,1.05,-.039],[.186,.65,.018],white);
  box(cabinet,[.133,1.05,-.039],[.038,.65,.018],white);
  for(const y of [.741,1.359])box(cabinet,[.081,y,-.039],[.066,.032,.018],white);
  for(const y of [.966,1.134])box(cabinet,[.137,y,-.058],[.012,.012,.028],steel);
  box(cabinet,[.137,1.05,-.075],[.009,.177,.009],steel);
  cylinder(cabinet,[-.145,.736,-.043],[-.145,1.364,-.043],.005,steel,10);
  for(let y=.75;y<1.35;y+=.025)box(cabinet,[-.145,y,-.045],[.012,.002,.008],trim);
  // Identified extinguisher; proportions are estimates, no brand/part number implied.
  const body=cylinder(cabinet,[.055,.81,.025],[.055,1.20,.025],.059,red,24);body.name='Red fire extinguisher body';
  for(const y of [.81,1.20])ball(cabinet,[.055,y,.025],.059,red).scale.y=.36;
  cylinder(cabinet,[.055,1.21,.025],[.055,1.26,.025],.017,steel,14);
  box(cabinet,[.055,1.275,.025],[.10,.014,.026],trim);
  box(cabinet,[.055,1.255,.025],[.083,.009,.023],steel);
  const hoseCurve=new T.CatmullRomCurve3([[.03,1.25,.018],[.085,1.23,.017],[.109,1.14,.017],[.105,.92,.017]].map(p=>new T.Vector3(...p as V)));
  const hose=new T.Mesh(new T.TubeGeometry(hoseCurve,24,.006,8,false),wire);hose.name='Extinguisher hose';cabinet.add(hose);
  cylinder(cabinet,[.105,.90,.017],[.105,.98,.017],.010,black,12);
  cylinder(cabinet,[.055,1.225,.008],[.055,1.225,-.008],.012,steel,16);
  cylinder(cabinet,[.055,1.225,-.009],[.055,1.225,-.011],.009,white,16);
  box(cabinet,[.055,1.025,-.035],[.097,.115,.002],white);
  label(cabinet,'ABC',[.055,1.025,-.037],.09,.042,Math.PI,'#eee7b9','#222722');
  // Keep the existing wall anchor, with the enclosure projecting into the hall.
  for(const part of cabinet.children)part.position.z-=.12;

  const alarm=assembly('fire-pull-station','Fire alarm pull station · Stair 2',evidence('Video 01:54–02:06','Red manual pull station above wall heater. Honeywell marking visible; exact model and part number unconfirmed.'),[HALL.branchRight-.003,1.28,HALL.branchEnd-.34],Math.PI/2);
  box(alarm,[0,0,0],[.095,.14,.045],red);
  box(alarm,[0,0,-.025],[.077,.114,.008],white);
  box(alarm,[0,-.007,-.031],[.060,.043,.012],trim);
  label(alarm,'FIRE',[0,.038,-.034],.074,.025,Math.PI,'#b02624','#ffffff');
  label(alarm,'PUSH IN',[0,.003,-.039],.053,.012,Math.PI,'#182025','#ffffff');
  label(alarm,'PULL DOWN',[0,-.013,-.039],.053,.012,Math.PI,'#182025','#ffffff');
  label(alarm,'Honeywell',[.005,-.048,-.034],.050,.012,Math.PI,'#a5291e','#ffffff');
  cylinder(alarm,[.028,-.05,-.028],[.028,-.05,-.040],.009,trim,12);
  const heater=assembly('wall-heater-stair2','Wall heater · Stair 2',evidence('Video 02:12–02:24','Video 02:12/02:18 and new stills show the projecting dark enclosure, silver surround and divided grille. Approximate 20 cm visible projection; not measured.'),[HALL.branchRight+.02,.52,HALL.branchEnd-.44],Math.PI/2);
  box(heater,[0,0,.015],[.47,.52,.16],trim);
  box(heater,[0,0,-.07],[.50,.55,.025],steel);
  box(heater,[0,0,-.09],[.43,.48,.014],trim);
  for(let y=-.20;y<.22;y+=.014)box(heater,[0,y,-.101],[.39,.004,.010],black);
  box(heater,[0,-.08,-.107],[.42,.055,.014],trim);
  box(heater,[0,.08,-.107],[.018,.28,.014],trim);
  ball(heater,[-.15,-.18,-.112],.009,steel);
  // Side views at 02:12/02:18 show the box outside the wall, not embedded in it.
  for(const part of heater.children)part.position.z-=.10;
  const notification=assembly('fire-horn-strobe-stair2','Wall fire alarm horn/strobe · Stair 2',evidence('New wall-equipment context and upper-alarm photo','White upper grille, clear lower strobe and FIRE marking visible. Exact product identity and dimensions estimated.'),[HALL.branchRight-.003,2.45,DOOR_210.z+1.27],Math.PI/2);
  box(notification,[0,0,-.018],[.105,.165,.035],white);
  for(let y=.025;y<.068;y+=.008)for(let x=-.032;x<.033;x+=.008)box(notification,[x,y,-.037],[.003,.003,.002],trim);
  box(notification,[0,-.035,-.039],[.073,.052,.009],steel);
  box(notification,[0,-.035,-.053],[.073,.052,.024],glass);
  for(const x of [-.021,0,.021])box(notification,[x,-.035,-.067],[.002,.048,.002],white);
  const fireMark=notification.children.length;
  label(notification,'FIRE',[-.045,-.002,-.038],.069,.014,Math.PI,'#e8e8df','#a5291e');
  if(notification.children.length>fireMark)notification.children[fireMark].rotation.z=-Math.PI/2;
  const junctionWall=assembly('junction-wall-finish','Junction wall · observed orange finish',evidence('Video 03:36','Short wall opposite captured branch is visible; adjoining corridors remain overview only.'));
  box(junctionWall,[(HALL.branchLeft+HALL.branchRight)/2,HALL.ceiling/2,.003],[HALL.branchRight-HALL.branchLeft,HALL.ceiling,.006],paint);
  for(const entry of entries){
    const id=entry.id;entry.object.userData.componentRecord=hallwayComponentRecord(id);
    const overview=/^(wall-main-|wall-lobby-|elevator-)/.test(id)||/^door-(20[2-7]|21[1-4])$/.test(id)||/^frame-(20[2-7]|21[1-4])$/.test(id);
    entry.object.userData.coverage=overview?'overview-only':'captured-route';
    if(overview){
      entry.object.userData.evidence={basis:'Blueprint + distant corridor overview',status:'plan',notes:'Details not captured. Gray simplified context; equipment and exact second-floor features unverified.'};
      entry.object.traverse(o=>{if(o instanceof T.Mesh)o.material=/^wall/.test(id)?grayWall:grayDoor;});
    }
  }

  // Center authoring groups for usable transform handles without changing world geometry.
  model.updateMatrixWorld(true);
  for(const e of entries){
    if(!e.object.userData.recenter)continue;
    const b=new T.Box3().setFromObject(e.object);if(b.isEmpty())continue;const c=b.getCenter(new T.Vector3());
    for(const child of e.object.children){child.position.x-=c.x;child.position.z-=c.z;}
    e.object.position.set(c.x,0,c.z);delete e.object.userData.recenter;
  }
  model.updateMatrixWorld(true);
  return {model,ceiling,entries,obstacles,resources,lights,architectural,materials};
}
