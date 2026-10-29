import type { ProjectFile } from './project-file';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createHouseEditor, type EditorApi, type EditorState } from './house-editor';
import { rooms, canOccupy, HALL, WALK_START, type ViewMode } from './house-data';
import { migrateHallwayLayout } from './hallway-layout-migration';
import { buildHallway } from './hallway-model';
import { canWalkSegment, findWalkDestination, pickWalkFloor, type FloorPoint } from './walk-navigation';
import {pickInspectable} from './object-inspection';
import {DEFAULT_OPENING_VIEW,type ViewSnapshot,type ViewNavigation} from './view-url';
export type HouseApi = {
  editor: EditorApi; saveProject:(view:ProjectFile['view'])=>Promise<void>;
  setMode: (mode: ViewMode) => void; setRoof: (value: boolean) => void;
  setLabels: (value: boolean) => void; setTime: (value: number) => void;
  goTo: (id: string) => void; renderImage: () => Promise<void>; exportModel: () => Promise<void>;
  move: (key: string, down: boolean) => void; dispose: () => void;
  getView:()=>ViewSnapshot;applyView:(nav:ViewNavigation)=>void;
};
export function createHouse(host:HTMLElement,onPosition:(x:number,z:number,yaw:number)=>void,onEditorChange:(state:EditorState)=>void,restore?:{file:ProjectFile;object:T.Object3D},onWalkNotice:(message:string)=>void=()=>{},onInspect:()=>void=()=>{}):HouseApi{
  const scene=new T.Scene();scene.background=new T.Color('#e1e4e1');
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;renderer.outputColorSpace=T.SRGBColorSpace;renderer.localClippingEnabled=true;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Interactive provisional hallway. Hover over equipment for its name; click for details. Double-click the floor to move; drag to look, including upward. WASD also moves.');host.appendChild(canvas);
  const camera=new T.PerspectiveCamera(58,1,.035,180);camera.position.set(30,25,32);
  const orbit=new OrbitControls(camera,canvas);orbit.target.set(16,0,5);orbit.enableDamping=true;
  orbit.minDistance=.35;orbit.maxDistance=85;orbit.maxPolarAngle=Math.PI*.49;
  const built=buildHallway();const {model,entries:editable,obstacles,resources}=built;let roof:T.Object3D=built.ceiling;scene.add(model);roof.visible=false;
  const roomEnvironment=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(roomEnvironment,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;roomEnvironment.dispose();pmrem.dispose();
  const hemisphere=new T.HemisphereLight('#eff3f5','#8b8171',2.2);scene.add(hemisphere);
  const sun=new T.DirectionalLight('#fff0d4',2.7);sun.position.set(4,12,16);sun.target.position.set(9,0,5);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:18,bottom:-18,near:.5,far:70});sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;
  const interiorLights:T.PointLight[]=[];
  for(const p of built.lights){const light=new T.PointLight('#fff0d0',11,6,1.7);light.position.set(p.x,p.y,p.z);scene.add(light);interiorLights.push(light);}
  if(restore){
    model.clear();model.add(...[...restore.object.children]);
    roof=model.getObjectByProperty('uuid',restore.file.roofUuid)!;
    obstacles.splice(0,obstacles.length,...restore.file.obstacles.map(b=>({...b})));
    editable.splice(0,editable.length,...restore.file.entries.map(e=>({id:e.id,name:e.name,object:model.getObjectByProperty('uuid',e.uuid)!,colliders:e.colliders.map(b=>({...b}))})));
    // Entry collision boxes must be the same instances used by walking updates.
    obstacles.splice(0,obstacles.length,...editable.flatMap(e=>e.colliders),...restore.file.obstacles.filter(b=>!restore.file.entries.some(e=>e.colliders.some(c=>JSON.stringify(c)===JSON.stringify(b)))).map(b=>({...b})));
  }
  const baseline=model.clone(true),originalNodes:T.Object3D[]=[],cloneNodes:T.Object3D[]=[];
  model.traverse(o=>originalNodes.push(o));baseline.traverse(o=>cloneNodes.push(o));
  // Serialize addon/custom geometries as portable vertex buffers for ObjectLoader.
  const portableGeometry=new Map<T.BufferGeometry,T.BufferGeometry>();
  baseline.traverse(o=>{if(o instanceof T.Mesh){let g=portableGeometry.get(o.geometry);if(!g){g=new T.BufferGeometry().copy(o.geometry);portableGeometry.set(o.geometry,g);}o.geometry=g;}});
  const baselineId=(o:T.Object3D)=>cloneNodes[originalNodes.indexOf(o)].uuid;
  const baselineEntries=editable.map(e=>({id:e.id,name:e.name,uuid:baselineId(e.object),colliders:e.colliders.map(b=>({...b}))}));
  const baselineObstacles=obstacles.map(b=>({...b})),baselineRoof=baselineId(roof);
  let selectedId:string|undefined,showMeasurements=true;
  const editor=createHouseEditor(scene,camera,canvas,orbit,editable,obstacles,state=>{selectedId=state.selected?.id;showMeasurements=state.measurements;onEditorChange(state);},restore?.file.editor,restore?undefined:migrateHallwayLayout);
  // DOM labels are projected from real room coordinates and excluded from image exports.
  const labelLayer=document.createElement('div');labelLayer.className='room-label-layer';host.appendChild(labelLayer);
  const labels=rooms.map(room=>{const e=document.createElement('span');e.className='room-label';e.textContent=room.short;labelLayer.appendChild(e);return {e,point:new T.Vector3(room.x,.3,room.z)};});
  let mode:ViewMode='orbit',showLabels=true,daylight=48,yaw=0,pitch=0,disposed=false,frame=0,last=performance.now(),lastPosition=0;
  const keys=new Set<string>();let drag: {x:number;y:number;startX:number;startY:number;id:number}|null=null;
  let journey:{from:FloorPoint;to:FloorPoint;elapsed:number;duration:number}|null=null,lastDrag=-Infinity;
  const destinationRing=new T.Mesh(new T.RingGeometry(.15,.21,40),new T.MeshBasicMaterial({color:'#b9e7bf',side:T.DoubleSide,depthWrite:false}));
  destinationRing.rotation.x=-Math.PI/2;destinationRing.visible=false;scene.add(destinationRing);
  const cancelJourney=()=>{journey=null;destinationRing.visible=false;};
  const clear=()=>{keys.clear();drag=null;cancelJourney();};
  const keyDown=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,dialog,[role="slider"]'))return;if(mode==='walk'&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();cancelJourney();keys.add(e.code);}if(e.code==='Escape')clear();};
  const keyUp=(e:KeyboardEvent)=>keys.delete(e.code);
  const pointerDown=(e:PointerEvent)=>{if(mode!=='walk'||e.button!==0)return;canvas.focus();drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);};
  const pointerMove=(e:PointerEvent)=>{if(!drag||mode!=='walk'||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6)lastDrag=performance.now();yaw-=(e.clientX-drag.x)*.004;pitch=Math.max(-1.54,Math.min(1.54,pitch-(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY;};
  const pointerUp=()=>{drag=null;};
  const floorDoubleClick=(e:MouseEvent)=>{
    if(mode!=='walk'||e.button!==0||performance.now()-lastDrag<650)return;
    e.preventDefault();const rect=canvas.getBoundingClientRect(),ray=new T.Raycaster();
    camera.updateMatrixWorld();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    const hit=pickWalkFloor(ray,model);if(!hit)return;
    const from={x:camera.position.x,z:camera.position.z},to=findWalkDestination(from,hit,(x,z)=>canOccupy(x,z,obstacles));
    if(!to){cancelJourney();onWalkNotice('Move closer to the turn, then double-click the floor again. That route is blocked.');return;}
    const distance=Math.hypot(to.x-from.x,to.z-from.z);if(distance<.05)return;
    keys.clear();journey={from,to,elapsed:0,duration:Math.min(1.4,Math.max(.35,distance/5))};
    destinationRing.position.set(to.x,hit.y+.018,to.z);destinationRing.visible=true;canvas.focus();
  };
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',clear);
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
  canvas.addEventListener('dblclick',floorDoubleClick);
  const hoverLabel=document.createElement('div');hoverLabel.className='object-hover-label';hoverLabel.setAttribute('role','tooltip');hoverLabel.hidden=true;host.appendChild(hoverLabel);
  let inspectPress:{x:number;y:number;moved:boolean;id:number}|null=null;
  const inspectHit=(event:PointerEvent)=>{const rect=canvas.getBoundingClientRect(),ray=new T.Raycaster();camera.updateMatrixWorld();ray.setFromCamera(new T.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);return pickInspectable(ray,model,editable);};
  const hideHover=()=>{hoverLabel.hidden=true;canvas.style.cursor=mode==='walk'?'grab':'default';};
  const inspectDown=(event:PointerEvent)=>{if(mode==='edit'||event.button!==0)return;inspectPress={x:event.clientX,y:event.clientY,moved:false,id:event.pointerId};hideHover();};
  const inspectMove=(event:PointerEvent)=>{
    if(inspectPress){if(Math.hypot(event.clientX-inspectPress.x,event.clientY-inspectPress.y)>6)inspectPress.moved=true;hideHover();return;}
    if(mode==='edit'||event.buttons){hideHover();return;}
    const entry=inspectHit(event);if(!entry){hideHover();return;}
    const rect=canvas.getBoundingClientRect();hoverLabel.textContent=entry.name+' · Click for details';hoverLabel.style.left=Math.max(8,Math.min(event.clientX-rect.left+14,rect.width-280))+'px';hoverLabel.style.top=Math.max(8,event.clientY-rect.top-40)+'px';hoverLabel.hidden=false;canvas.style.cursor='pointer';
  };
  const inspectUp=(event:PointerEvent)=>{const press=inspectPress;inspectPress=null;if(!press||press.id!==event.pointerId||press.moved||Math.hypot(event.clientX-press.x,event.clientY-press.y)>6)return;const entry=inspectHit(event);if(entry){clear();hideHover();editor.select(entry.id);onInspect();}};
  const inspectCancel=()=>{inspectPress=null;hideHover();};
  canvas.addEventListener('pointerdown',inspectDown);canvas.addEventListener('pointermove',inspectMove);canvas.addEventListener('pointerup',inspectUp);canvas.addEventListener('pointerleave',hideHover);canvas.addEventListener('pointercancel',inspectCancel);
  const resize=()=>{if(disposed)return;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function freeWalkPosition(x:number,z:number){
    if(canOccupy(x,z,obstacles))return new T.Vector3(x,HALL.eyeHeight,z);
    for(let radius=.3;radius<4;radius+=.3)for(let i=0;i<24;i++){
      const px=x+Math.cos(i*Math.PI/12)*radius,pz=z+Math.sin(i*Math.PI/12)*radius;
      if(canOccupy(px,pz,obstacles))return new T.Vector3(px,HALL.eyeHeight,pz);
    }
    return new T.Vector3(WALK_START.x,HALL.eyeHeight,WALK_START.z);
  }
  const setMode=(value:ViewMode)=>{
    mode=value;clear();hideHover();editor.enable(value==='edit');orbit.enabled=value!=='walk';canvas.style.cursor=value==='walk'?'grab':'default';
    if(value==='walk'){camera.position.copy(freeWalkPosition(DEFAULT_OPENING_VIEW.position[0],DEFAULT_OPENING_VIEW.position[2]));yaw=T.MathUtils.degToRad(DEFAULT_OPENING_VIEW.yaw);pitch=T.MathUtils.degToRad(DEFAULT_OPENING_VIEW.pitch);camera.rotation.set(pitch,yaw,0,'YXZ');canvas.focus();}
    else{camera.up.set(0,1,0);const fit=Math.max(1,1.05/camera.aspect);camera.position.set(...(value==='plan'?[17,34*fit,5.01]:[17+14*fit,25*fit,5+27*fit]) as [number,number,number]);orbit.maxDistance=Math.max(65,65*fit);orbit.target.set(17,0,5);orbit.enableRotate=value!=='plan';orbit.update();}
  };
  const goTo=(id:string)=>{const room=rooms.find(r=>r.id===id);if(!room)throw new Error('Unknown room');clear();if(mode==='walk'){camera.position.copy(freeWalkPosition(room.x,room.z));yaw=room.yaw;pitch='pitch' in room?room.pitch:0;}else{orbit.target.set(room.x,0,room.z);camera.position.set(room.x+(mode==='plan'?0:9),mode==='plan'?26:13,room.z+(mode==='plan'?.01:12));orbit.update();}};
  const getView=():ViewSnapshot=>{
    const direction=camera.getWorldDirection(new T.Vector3());
    return {mode,position:camera.position.toArray() as [number,number,number],target:orbit.target.toArray() as [number,number,number],yaw:mode==='walk'?T.MathUtils.radToDeg(yaw):T.MathUtils.radToDeg(Math.atan2(-direction.x,-direction.z)),pitch:mode==='walk'?T.MathUtils.radToDeg(pitch):T.MathUtils.radToDeg(Math.asin(T.MathUtils.clamp(direction.y,-1,1))),roof:roof.visible,labels:showLabels,time:daylight,measurements:showMeasurements,...(selectedId?{object:selectedId}:{})};
  };
  const applyView=(nav:ViewNavigation)=>{
    // Clear pending orbit damping before assigning a bookmark's exact camera.
    const damping=orbit.enableDamping;orbit.enableDamping=false;orbit.update();orbit.enableDamping=damping;
    setMode(nav.mode??(nav.object?'edit':'walk'));clear();
    if(nav.location)goTo(nav.location);
    editor.select(nav.object??'');
    if(nav.focus&&nav.object&&mode==='edit'){api.setRoof(nav.roof??false);editor.focusSelected();}
    if(nav.position){if(mode==='walk')camera.position.copy(freeWalkPosition(nav.position[0],nav.position[2]));else camera.position.set(...nav.position);}
    const lookObject=nav.look?editable.find(e=>e.id===nav.look&&!e.deleted)?.object:undefined;
    const lookPoint=lookObject?new T.Box3().setFromObject(lookObject).getCenter(new T.Vector3()):undefined;
    if(mode==='walk'){
      if(nav.yaw!==undefined)yaw=T.MathUtils.degToRad(nav.yaw);
      if(nav.pitch!==undefined)pitch=T.MathUtils.clamp(T.MathUtils.degToRad(nav.pitch),-1.54,1.54);
      if(lookPoint){const d=lookPoint.clone().sub(camera.position).normalize();yaw=Math.atan2(-d.x,-d.z);pitch=T.MathUtils.clamp(Math.asin(d.y),-1.54,1.54);}
      camera.rotation.set(pitch,yaw,0,'YXZ');onPosition(camera.position.x,camera.position.z,yaw);
    }else{
      if(nav.target)orbit.target.set(...nav.target);
      else if(nav.yaw!==undefined||nav.pitch!==undefined){const angles=new T.Euler(T.MathUtils.degToRad(nav.pitch??0),T.MathUtils.degToRad(nav.yaw??0),0,'YXZ');orbit.target.copy(camera.position).add(new T.Vector3(0,0,-1).applyEuler(angles).multiplyScalar(5));}
      if(lookPoint)orbit.target.copy(lookPoint);
      orbit.update();
    }
    if(nav.measurements!==undefined)editor.setMeasurements(nav.measurements);
    api.setRoof(nav.roof??mode==='walk');
    if(nav.labels!==undefined)api.setLabels(nav.labels);
    if(nav.time!==undefined)api.setTime(nav.time);
  };
  function animate(now:number){if(disposed)return;const dt=Math.min((now-last)/1000,.035);last=now;
    if(mode==='walk'){
      if(journey){
        journey.elapsed+=dt;const t=Math.min(1,journey.elapsed/journey.duration),ease=t*t*(3-2*t);
        const next={x:T.MathUtils.lerp(journey.from.x,journey.to.x,ease),z:T.MathUtils.lerp(journey.from.z,journey.to.z,ease)};
        if(canWalkSegment(camera.position,next,(x,z)=>canOccupy(x,z,obstacles)))camera.position.set(next.x,HALL.eyeHeight,next.z);else cancelJourney();
        if(t===1)cancelJourney();
      }
      camera.rotation.set(pitch,yaw,0,'YXZ');let forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
      let side=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));if(keys.has('ArrowLeft'))yaw+=dt*1.6;if(keys.has('ArrowRight'))yaw-=dt*1.6;
      const length=Math.hypot(forward,side);if(length){forward/=length;side/=length;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?4.3:2.3)*dt;
        const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;
        if(canOccupy(camera.position.x+dx,camera.position.z,obstacles))camera.position.x+=dx;
        if(canOccupy(camera.position.x,camera.position.z+dz,obstacles))camera.position.z+=dz;
      }
      if(now-lastPosition>90){onPosition(camera.position.x,camera.position.z,yaw);lastPosition=now;}
    }else orbit.update();
    labelLayer.style.display=showLabels&&mode!=='walk'&&mode!=='edit'&&!roof.visible?'block':'none';
    if(showLabels&&mode!=='walk'&&mode!=='edit'&&!roof.visible)for(const label of labels){const p=label.point.clone().project(camera);label.e.style.display=Math.abs(p.z)>1?'none':'block';label.e.style.transform=`translate(-50%,-50%) translate(${(p.x*.5+.5)*host.clientWidth}px,${(-p.y*.5+.5)*host.clientHeight}px)`;}
    editor.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate);
  }
  frame=requestAnimationFrame(animate);
  function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const api:HouseApi={
    getView,applyView,
    saveProject:async view=>{
      const images:Promise<unknown>[]=[];baseline.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){const img=(m as T.MeshStandardMaterial).map?.image;if(img instanceof HTMLImageElement&&!img.complete)images.push(img.decode());}});await Promise.all(images);
      const file:ProjectFile={format:'house-editor-project',version:1,model:baseline.toJSON(),entries:baselineEntries,obstacles:baselineObstacles,roofUuid:baselineRoof,editor:editor.projectState(),view};
      download(new Blob([JSON.stringify(file)],{type:'application/json'}),'hallway-210.house-project.json');
    },
    editor,setMode,setRoof:value=>{roof.visible=value;const seen=new Set<T.Material>();model.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(seen.has(m))continue;seen.add(m);if(m.userData.architectural){m.clippingPlanes=value?null:[new T.Plane(new T.Vector3(0,-1,0),1.15)];m.needsUpdate=true;}}});},setLabels:value=>{showLabels=value;},goTo,
    setTime:value=>{daylight=value;const t=value/100;sun.position.set(3+15*t,8+Math.sin(t*Math.PI)*12,17);sun.color.set(t>.75?'#ffc88e':'#fff1dc');sun.intensity=2.4+Math.sin(t*Math.PI);hemisphere.intensity=1.4+Math.sin(t*Math.PI);scene.background=new T.Color(t>.75?'#c5c1bb':'#dde7eb');for(const light of interiorLights)light.intensity=roof.visible?11:6;},
    move:(key,down)=>{if(down){cancelJourney();keys.add(key);}else keys.delete(key);},
    renderImage:async()=>{const size=renderer.getSize(new T.Vector2()),ratio=renderer.getPixelRatio(),restoreHelpers=editor.hideHelpers();try{renderer.setPixelRatio(1);renderer.setSize(2560,Math.round(2560/ camera.aspect),false);renderer.render(scene,camera);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Image could not be saved');download(blob,'hallway-210-render.png');}finally{restoreHelpers();renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);}},
    exportModel:async()=>{const visible=roof.visible;roof.visible=true;try{const exporter=new GLTFExporter();const data=await exporter.parseAsync(model,{binary:true});download(new Blob([data as ArrayBuffer],{type:'model/gltf-binary'}),'hallway-210.glb');}finally{roof.visible=visible;}},
    dispose:()=>{disposed=true;canvas.removeEventListener('pointerdown',inspectDown);canvas.removeEventListener('pointermove',inspectMove);canvas.removeEventListener('pointerup',inspectUp);canvas.removeEventListener('pointerleave',hideHover);canvas.removeEventListener('pointercancel',inspectCancel);hoverLabel.remove();cancelAnimationFrame(frame);editor.dispose();portableGeometry.forEach(g=>g.dispose());observer.disconnect();orbit.dispose();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clear);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('dblclick',floorDoubleClick);const materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});materials.forEach(m=>m.dispose());resources.forEach(t=>t.dispose());environment.dispose();renderer.dispose();canvas.remove();labelLayer.remove();}
  };
  return api;
}
