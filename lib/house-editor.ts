import {emptyComponentRecord,parseComponentRecord,type ComponentRecord} from './component-record';
import {componentFocusPose} from './component-focus';
import { PROJECT_CONFIG } from './project-config';
import {parseCatalog,scaleForDimension,type CatalogAsset} from './asset-catalog';
import { makeMaterial, materialNames, type MaterialPreset } from './material-presets';
import { objectBounds, measurementSize, dimensionOverlay, disposeDimensions } from './object-measurements';
import * as T from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { transformedObstacle } from './editor-geometry';
import { LayoutHistory, parseLayout, type Layout, type Placement } from './layout-state';
import type { Obstacle } from './house-data';
export type EditableEntry={id:string;name:string;object:T.Object3D;colliders:Obstacle[];sourceId?:string;deleted?:boolean;material?:MaterialPreset};
export type EditorState={catalog:CatalogAsset[];objects:{id:string;name:string}[];selected:({id:string;name:string;dimensions:ReturnType<typeof measurementSize>;evidence?:{basis:string;status:string;notes:string}}&Placement)|null;designs:string[];measurements:boolean;tool:'translate'|'rotate';snap:boolean;canUndo:boolean;canRedo:boolean;dirty:boolean;storageError:boolean};
export type EditorApi={focusSelected:()=>void;setRecord:(patch:Partial<ComponentRecord>)=>void;exportRecords:()=>string;projectState:()=>{layout:string;catalog:string;designs:Record<string,string>};resize:(axis:'width'|'depth'|'height',value:number)=>void;saveAsset:(name:string,kind:'object'|'material')=>void;useAsset:(id:string)=>void;removeAsset:(id:string)=>void;rename:(name:string)=>void;setMaterial:(preset:MaterialPreset)=>void;saveDesign:(name:string)=>void;loadDesign:(name:string)=>void;deleteDesign:(name:string)=>void;exportPlan:()=>void;setMeasurements:(show:boolean)=>void;duplicateSelected:()=>void;deleteSelected:()=>void;enable:(enabled:boolean)=>void;select:(id:string)=>void;setTool:(tool:'translate'|'rotate')=>void;setSnap:(value:boolean)=>void;setPlacement:(value:Partial<Placement>)=>void;nudge:(x:number,z:number,angle?:number)=>void;undo:()=>void;redo:()=>void;resetSelected:()=>void;resetAll:()=>void;save:()=>void;exportLayout:()=>string;importLayout:(raw:string)=>void;update:()=>void;hideHelpers:()=>()=>void;dispose:()=>void};
const STORAGE_KEY=PROJECT_CONFIG.id+'-layout-v1';
export function createHouseEditor(scene:T.Scene,camera:T.Camera,canvas:HTMLCanvasElement,orbit:OrbitControls,entries:EditableEntry[],obstacles:Obstacle[],onChange:(state:EditorState)=>void,restore?:{layout:string;catalog:string;designs:Record<string,string>},migrateLayout?:(layout:Layout)=>Layout):EditorApi{
  const control=new TransformControls(camera,canvas);const helper=control.getHelper();scene.add(helper);control.enabled=false;helper.visible=false;control.setSize(.85);control.setSpace('world');
  const selection=new T.BoxHelper(new T.Object3D(),0x49734b);selection.visible=false;scene.add(selection);
  const history=new LayoutHistory();let enabled=false,selected:EditableEntry|undefined,tool:'translate'|'rotate'='translate',snap=true,storageError=false;
  let measurements=true, guide:T.Group|undefined, guideObject:T.Object3D|undefined,guideScale='';
  const boundsCache=new WeakMap<T.Object3D,T.Box3>();
  const boundsFor=(o:T.Object3D)=>{let b=boundsCache.get(o);if(!b){b=objectBounds(o);boundsCache.set(o,b);}return b;};
  const originalNames=new Map(entries.map(e=>[e.id,e.name]));
  const originalMaterials=new WeakMap<T.Mesh,T.Material|T.Material[]>();
  for(const e of entries)e.object.traverse(o=>{if(o instanceof T.Mesh)originalMaterials.set(o,o.material);});
  const finishes=new Map<MaterialPreset,T.MeshStandardMaterial>();
  const designKey=STORAGE_KEY+'-designs';
  let importedDesigns=restore?.designs;
  const designs=():Record<string,string>=>{const raw=importedDesigns??JSON.parse(localStorage.getItem(designKey)||'{}');return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};};
  const designNames=()=>{try{return Object.keys(designs());}catch{return [];}};
  function applyMaterial(e:EditableEntry,preset:MaterialPreset){
    e.material=preset;
    let finish=finishes.get(preset);if(preset!=='original'&&!finish){finish=makeMaterial(preset);finishes.set(preset,finish);}
    e.object.traverse(o=>{if(!(o instanceof T.Mesh))return;const base=originalMaterials.get(o);if(!base)return;
      const replace=(m:T.Material)=>m.transparent?m:finish!;
      o.material=preset==='original'?base:Array.isArray(base)?base.map(replace):replace(base);
    });
  }
  const catalogKey=STORAGE_KEY+'-catalog';
  let customAssets:CatalogAsset[]=[];
  const read=():Layout=>Object.fromEntries(entries.filter(e=>!e.sourceId||!e.deleted).map(e=>[e.id,{x:e.object.position.x,z:e.object.position.z,y:e.object.position.y,sx:e.object.scale.x,sy:e.object.scale.y,sz:e.object.scale.z,angle:e.object.rotation.y*180/Math.PI,name:e.name,material:e.material??'original',...(e.deleted?{deleted:true}:{}),...(e.sourceId?{sourceId:e.sourceId}:{}),record:structuredClone(e.object.userData.componentRecord??emptyComponentRecord())}]));
  const originalIds=entries.map(e=>e.id);const defaults=read();let saved=JSON.stringify(defaults);
  try{customAssets=parseCatalog(restore?.catalog??localStorage.getItem(catalogKey)??'[]',originalIds);}catch{storageError=true;}
  const catalog=():CatalogAsset[]=>[...entries.filter(e=>!e.sourceId).map(e=>({id:'builtin:'+e.id,name:originalNames.get(e.id)??e.name,kind:'object' as const,sourceId:e.id,placement:defaults[e.id]})),...customAssets];
  const bases=entries.map(e=>{e.object.updateWorldMatrix(true,false);return{entry:e,inverse:e.object.matrixWorld.clone().invert(),colliders:e.colliders.map(b=>({...b}))};});
  function updateCollisions(){for(const base of bases){base.entry.object.updateWorldMatrix(true,false);const matrix=base.entry.object.matrixWorld.clone().multiply(base.inverse);base.colliders.forEach((b,i)=>{Object.assign(base.entry.colliders[i],base.entry.deleted?{minX:1e6,maxX:1e6,minZ:1e6,maxZ:1e6}:transformedObstacle(b,matrix));});}}
  const emit=()=>{const p=selected?read()[selected.id]:null;onChange({catalog:catalog(),designs:designNames(),objects:entries.filter(e=>!e.deleted).map(e=>({id:e.id,name:e.name})),selected:selected&&p?{id:selected.id,name:selected.name,dimensions:measurementSize(selected.object,boundsFor(selected.object)),evidence:selected.object.userData.evidence,...p}:null,measurements,tool,snap,canUndo:history.past.length>0,canRedo:history.future.length>0,dirty:JSON.stringify(read())!==saved,storageError});};
  const update=()=>{if(selected&&enabled){selection.setFromObject(selected.object);selection.visible=true;}else selection.visible=false;
    if(guideObject!==selected?.object||guideScale!==selected?.object.scale.toArray().join(',')){if(guide)disposeDimensions(guide);guide=undefined;guideObject=selected?.object;guideScale=selected?.object.scale.toArray().join(',')??'';
      if(selected){guide=dimensionOverlay(boundsFor(selected.object),measurementSize(selected.object,boundsFor(selected.object)));guide.matrixAutoUpdate=false;scene.add(guide);}}
    if(guide){guide.visible=!!selected&&enabled&&measurements;if(selected){selected.object.updateWorldMatrix(true,false);guide.matrix.copy(selected.object.matrixWorld);}}
  };
  function createCopy(id:string,sourceId:string){
    const existing=entries.find(e=>e.id===id);if(existing)return existing;
    const source=entries.find(e=>e.id===sourceId&&!e.sourceId);if(!source)throw Error('The source object is not available.');
    const sourceBase=bases.find(b=>b.entry===source)!;
    source.object.updateWorldMatrix(true,false);
    const delta=source.object.matrixWorld.clone().multiply(sourceBase.inverse);
    const object=source.object.clone(true);object.visible=true;
    const sourceMeshes:T.Mesh[]=[];source.object.traverse(o=>{if(o instanceof T.Mesh)sourceMeshes.push(o);});let meshIndex=0;
    object.traverse(o=>{if(o instanceof T.Mesh)originalMaterials.set(o,originalMaterials.get(sourceMeshes[meshIndex++])!);});source.object.parent!.add(object);object.updateWorldMatrix(true,false);
    const colliders=sourceBase.colliders.map(b=>transformedObstacle(b,delta));obstacles.push(...colliders);
    const entry:EditableEntry={id,sourceId,name:source.name+' (copy)',object,colliders};entries.push(entry);
    bases.push({entry,inverse:object.matrixWorld.clone().invert(),colliders:colliders.map(b=>({...b}))});return entry;
  }
  function apply(layout:Layout){
    for(const [id,p] of Object.entries(layout))if(p.sourceId)createCopy(id,p.sourceId);
    for(const e of entries){const p=layout[e.id]??(e.sourceId?undefined:defaults[e.id]);e.deleted=!p||!!p.deleted;e.object.visible=!e.deleted;if(p){e.object.scale.set(p.sx??defaults[e.sourceId??e.id]?.sx??1,p.sy??defaults[e.sourceId??e.id]?.sy??1,p.sz??defaults[e.sourceId??e.id]?.sz??1);e.object.position.y=p.y??defaults[e.sourceId??e.id]?.y??0;e.name=p.name??originalNames.get(e.sourceId??e.id)??e.name;applyMaterial(e,(p.material??'original') as MaterialPreset);e.object.userData.componentRecord=structuredClone(p.record??defaults[e.sourceId??e.id]?.record??emptyComponentRecord());e.object.position.x=p.x;e.object.position.z=p.z;e.object.rotation.y=p.angle*Math.PI/180;}}
    if(selected?.deleted){selected=undefined;control.detach();helper.visible=false;}
    updateCollisions();update();emit();
  }
  function transaction(change:()=>void){const before=read();change();updateCollisions();history.push(before,read());update();emit();}
  try{const raw=restore?.layout??localStorage.getItem(STORAGE_KEY);if(raw){const layout=parseLayout(raw,originalIds);apply(migrateLayout?migrateLayout(layout):layout);}saved=JSON.stringify(read());}catch{storageError=true;}
  const axes=()=>{control.setMode(tool);control.showX=tool==='translate';control.showY=tool==='rotate';control.showZ=tool==='translate';control.setTranslationSnap(snap ? .1 : null);control.setRotationSnap(snap?Math.PI/12:null);};axes();
  function select(id:string){selected=entries.find(e=>e.id===id&&!e.deleted);if(selected&&enabled){control.attach(selected.object);helper.visible=true;}else{control.detach();helper.visible=false;}update();emit();}
  let beforeDrag:Layout|null=null,pointerStart:{x:number;y:number}|null=null,wasDragging=false;
  control.addEventListener('dragging-changed',e=>{orbit.enabled=!e.value;});
  control.addEventListener('mouseDown',()=>{beforeDrag=read();wasDragging=true;});
  control.addEventListener('objectChange',()=>{if(selected){selected.object.position.x=T.MathUtils.clamp(selected.object.position.x,-30,40);selected.object.position.z=T.MathUtils.clamp(selected.object.position.z,-30,40);}update();emit();});
  control.addEventListener('mouseUp',()=>{if(beforeDrag){history.push(beforeDrag,read());beforeDrag=null;updateCollisions();emit();}});
  const raycaster=new T.Raycaster();
  const down=(event:PointerEvent)=>{pointerStart={x:event.clientX,y:event.clientY};wasDragging=control.dragging;};
  const up=(event:PointerEvent)=>{
    if(!enabled||!pointerStart||wasDragging||Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>5){pointerStart=null;return;}
    pointerStart=null;const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);
    const hits=raycaster.intersectObjects(entries.map(e=>e.object),true);
    const hit=hits.find(h=>{let o:T.Object3D|null=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});
    if(hit){let node:T.Object3D|null=hit.object;while(node){const entry=entries.find(e=>e.object===node);if(entry){select(entry.id);break;}node=node.parent;}}
  };
  canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointerup',up);
  const undo=()=>{const next=history.undo(read());if(next)apply(next);};const redo=()=>{const next=history.redo(read());if(next)apply(next);};
  function setPlacement(value:Partial<Placement>){if(!selected)return;const p={...read()[selected.id],...value};if(![p.x,p.z,p.angle].every(Number.isFinite))return;p.x=T.MathUtils.clamp(p.x,-30,40);p.z=T.MathUtils.clamp(p.z,-30,40);transaction(()=>{selected!.object.scale.set(p.sx??1,p.sy??1,p.sz??1);selected!.object.position.y=p.y??0;selected!.object.position.x=p.x;selected!.object.position.z=p.z;selected!.object.rotation.y=p.angle*Math.PI/180;});}
  function duplicateSelected(){if(!selected)return;if(entries.filter(e=>e.sourceId&&!e.deleted).length>=500)throw Error('The layout supports up to 500 copies.');
    const sourceId=selected.sourceId??selected.id,p=read()[selected.id];let copy:EditableEntry|undefined;
    transaction(()=>{copy=createCopy('copy-'+crypto.randomUUID(),sourceId);copy.object.position.x=Math.min(40,p.x+.8);copy.object.position.z=Math.min(40,p.z+.8);copy.object.rotation.y=p.angle*Math.PI/180;copy.object.scale.set(p.sx??1,p.sy??1,p.sz??1);copy.object.position.y=p.y??0;copy.name=selected!.name+' (copy)';copy.object.userData.componentRecord=structuredClone(p.record??emptyComponentRecord());applyMaterial(copy,(p.material??'original') as MaterialPreset);});select(copy!.id);
  }
  function deleteSelected(){if(!selected)return;transaction(()=>{selected!.deleted=true;selected!.object.visible=false;selected=undefined;control.detach();helper.visible=false;});}
  const key=(e:KeyboardEvent)=>{if(!enabled||(e.target as HTMLElement)?.closest('input,select,textarea,[role="slider"]'))return;if((e.metaKey||e.ctrlKey)&&e.code==='KeyZ'){e.preventDefault();if(e.shiftKey)redo();else undo();}else if((e.metaKey||e.ctrlKey)&&e.code==='KeyD'){e.preventDefault();duplicateSelected();}else if(e.code==='Delete'||e.code==='Backspace'){e.preventDefault();deleteSelected();}else if(e.code==='Escape')select('');};window.addEventListener('keydown',key);
  function exportPlan(){
    const items=entries.filter(e=>!e.deleted&&!/roof|garden|plant|pool|detail/i.test(originalNames.get(e.sourceId??e.id)??e.name));
    const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
    const world=new T.Box3();items.forEach(e=>world.expandByObject(e.object));const size=world.getSize(new T.Vector3()),scale=800/Math.max(size.x,size.z,1);
    const points=(e:EditableEntry)=>{const b=boundsFor(e.object);e.object.updateWorldMatrix(true,false);return [[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>{const p=new T.Vector3(x,0,z).applyMatrix4(e.object.matrixWorld);return `${60+(p.x-world.min.x)*scale},${100+(p.z-world.min.z)*scale}`;}).join(' ');};
    const height=980+items.length*24;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}"><rect width="100%" height="100%" fill="white"/><g font-family="Arial" fill="#193b32"><text x="60" y="40" font-size="24">Measured object footprint plan</text><text x="60" y="68">Model estimates · metres · numbered bounds, not a construction plan</text>${items.map((e,i)=>{const b=new T.Box3().setFromObject(e.object).getCenter(new T.Vector3());return `<polygon points="${points(e)}" fill="${/wall/i.test(e.name)?'#aaa':'#e7eee7'}" fill-opacity=".35" stroke="#42685a"/><text x="${60+(b.x-world.min.x)*scale}" y="${100+(b.z-world.min.z)*scale}" font-size="12">${i+1}</text>`;}).join('')}<text x="60" y="930">Object dimensions: width × depth × height (includes all grouped parts)</text>${items.map((e,i)=>{const d=measurementSize(e.object,boundsFor(e.object));return `<text x="60" y="${960+i*24}">${i+1}. ${esc(e.name)} — ${d.width.toFixed(2)} × ${d.depth.toFixed(2)} × ${d.height.toFixed(2)} m</text>`;}).join('')}</g></svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='measured-floor-plan.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  emit();
  return{
    focusSelected:()=>{if(!selected)return;const pose=componentFocusPose(selected.object);orbit.target.copy(pose.target);camera.position.copy(pose.position);measurements=false;orbit.update();update();emit();},
    setRecord:patch=>{if(!selected)return;const record=parseComponentRecord({...read()[selected.id].record,...patch});transaction(()=>{selected!.object.userData.componentRecord=record;});},
    exportRecords:()=>JSON.stringify({format:'hallway-component-inventory',version:1,units:'metres',source:'IMG_3462.MOV',objects:entries.filter(e=>!e.deleted).map(e=>({id:e.id,name:e.name,dimensions:measurementSize(e.object),evidence:e.object.userData.evidence,coverage:e.object.userData.coverage,record:read()[e.id].record}))},null,2),
    projectState:()=>({layout:JSON.stringify({version:1,objects:read()}),catalog:JSON.stringify(customAssets),designs:structuredClone(designs())}),
    resize:(axis,value)=>{if(!selected)return;const b=boundsFor(selected.object),size=b.getSize(new T.Vector3()),key=axis==='width'?'x':axis==='depth'?'z':'y';const scale=scaleForDimension(size[key],value);const o=selected.object;transaction(()=>{if(key==='y')o.position.y+=b.min.y*(o.scale.y-scale);o.scale[key]=scale;});},
    saveAsset:(name,kind)=>{if(!selected)throw Error('Select an object first.');const title=name.trim();if(!title||title.length>80)throw Error('Use an asset name of 1–80 characters.');if(customAssets.length>=200)throw Error('Catalog limit is 200 saved assets.');const next=[...customAssets,{id:'asset-'+crypto.randomUUID(),name:title,kind,sourceId:selected.sourceId??selected.id,placement:read()[selected.id]}];localStorage.setItem(catalogKey,JSON.stringify(next));customAssets=next;emit();},
    useAsset:id=>{const asset=catalog().find(a=>a.id===id);if(!asset)return;
      if(asset.kind==='material'){if(!selected)throw Error('Select an object to apply this finish.');transaction(()=>applyMaterial(selected!,(asset.placement.material??'original') as MaterialPreset));return;}
      if(entries.filter(e=>e.sourceId&&!e.deleted).length>=500)throw Error('The layout supports up to 500 copies.');
      let copy:EditableEntry|undefined;transaction(()=>{copy=createCopy('copy-'+crypto.randomUUID(),asset.sourceId);const p=asset.placement;copy.deleted=false;copy.object.visible=true;copy.name=asset.name;copy.object.userData.componentRecord=structuredClone(p.record??emptyComponentRecord());copy.object.position.set(Math.min(40,p.x+.8),p.y??0,Math.min(40,p.z+.8));copy.object.rotation.y=p.angle*Math.PI/180;copy.object.scale.set(p.sx??1,p.sy??1,p.sz??1);applyMaterial(copy,(p.material??'original') as MaterialPreset);});select(copy!.id);},
    removeAsset:id=>{const next=customAssets.filter(a=>a.id!==id);localStorage.setItem(catalogKey,JSON.stringify(next));customAssets=next;emit();},
    exportPlan,
    rename:name=>{const value=name.trim();if(!selected||!value||value.length>80)return;transaction(()=>{selected!.name=value;});},
    setMaterial:preset=>{if(selected&&materialNames.includes(preset))transaction(()=>applyMaterial(selected!,preset));},
    saveDesign:name=>{const key=name.trim();if(!key||key.length>80)throw Error('Use a design name of 1–80 characters.');const all=designs();if(Object.keys(all).length>=20&&!Object.hasOwn(all,key))throw Error('You can save up to 20 designs.');Object.defineProperty(all,key,{value:JSON.stringify({version:1,objects:read()}),enumerable:true,writable:true,configurable:true});localStorage.setItem(designKey,JSON.stringify(all));if(importedDesigns)importedDesigns=all;emit();},
    loadDesign:name=>{const raw=designs()[name];if(typeof raw!=='string')throw Error('Design not found.');const layout=parseLayout(raw,originalIds);transaction(()=>apply({...defaults,...layout}));},
    deleteDesign:name=>{const all=designs();delete all[name];localStorage.setItem(designKey,JSON.stringify(all));if(importedDesigns)importedDesigns=all;emit();},
    setMeasurements:show=>{measurements=show;update();emit();},duplicateSelected,deleteSelected,
    enable:value=>{enabled=value;control.enabled=value;helper.visible=value&&!!selected;if(!value){control.detach();orbit.enabled=true;}else if(selected)control.attach(selected.object);update();emit();},select,
    setTool:value=>{tool=value;axes();emit();},setSnap:value=>{snap=value;axes();emit();},setPlacement,
    nudge:(x,z,angle=0)=>{if(!selected)return;const p=read()[selected.id];setPlacement({x:p.x+x,z:p.z+z,angle:p.angle+angle});},undo,redo,
    resetSelected:()=>{if(selected)setPlacement(defaults[selected.sourceId??selected.id]);},resetAll:()=>transaction(()=>apply(defaults)),
    save:()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,objects:read()}));saved=JSON.stringify(read());storageError=false;emit();}catch{storageError=true;emit();throw Error('Browser storage is unavailable. Download the layout instead.');}},
    exportLayout:()=>JSON.stringify({version:1,objects:read()},null,2),
    importLayout:raw=>{const layout=parseLayout(raw,originalIds);if(!Object.keys(layout).length)throw Error('No matching objects were found.');transaction(()=>apply({...defaults,...layout}));},
    update,hideHelpers:()=>{const h=helper.visible,s=selection.visible,g=guide?.visible;helper.visible=false;selection.visible=false;if(guide)guide.visible=false;return()=>{helper.visible=h;selection.visible=s;if(guide)guide.visible=!!g;};},
    dispose:()=>{finishes.forEach(m=>{m.map?.dispose();m.dispose();});if(guide)disposeDimensions(guide);control.dispose();scene.remove(helper,selection);selection.geometry.dispose();(selection.material as T.Material).dispose();canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);}
  };
}
