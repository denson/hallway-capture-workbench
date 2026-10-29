import {parseLayout} from './layout-state.ts';
import {parseCatalog} from './asset-catalog.ts';
import {parseComponentRecord} from './component-record.ts';
import type * as T from 'three';
export type ProjectFile={format:'house-editor-project';version:1;model:ReturnType<T.Object3D['toJSON']>;entries:{id:string;name:string;uuid:string;colliders:{minX:number;maxX:number;minZ:number;maxZ:number}[]}[];obstacles:{minX:number;maxX:number;minZ:number;maxZ:number}[];roofUuid:string;editor:{layout:string;catalog:string;designs:Record<string,string>};view:{mode:'orbit'|'walk'|'plan'|'edit';roof:boolean;labels:boolean;time:number}};
export function parseProject(raw:string):ProjectFile{
 if(raw.length>100_000_000)throw Error('Project file exceeds 100 MB.');
 const p=JSON.parse(raw) as ProjectFile;
 if(p?.format!=='house-editor-project'||p.version!==1||!p.model?.object||!Array.isArray(p.entries)||p.entries.length>1500||!p.entries.length||!Array.isArray(p.obstacles)||p.obstacles.length>10000)throw Error('Invalid or unsupported project file.');
 const uuids=new Set<string>();let count=0;
 const visit=(o:any,depth:number)=>{if(depth>100||++count>20000||!o||typeof o.uuid!=='string'||!['Group','Object3D','Mesh','Scene'].includes(o.type))throw Error('Unsupported model objects.');uuids.add(o.uuid);if(o.userData?.componentRecord!==undefined)parseComponentRecord(o.userData.componentRecord);if(o.children){if(!Array.isArray(o.children))throw Error('Invalid model.');o.children.forEach((c:any)=>visit(c,depth+1));}};visit(p.model.object,0);
 const checkBox=(b:any)=>{if(!b||!['minX','maxX','minZ','maxZ'].every(k=>typeof b[k]==='number'&&Number.isFinite(b[k])&&Math.abs(b[k])<1e7)||b.minX>b.maxX||b.minZ>b.maxZ)throw Error('Invalid collision bounds.');};
 p.obstacles.forEach(checkBox);
 const ids=p.entries.map(e=>{if(!e||typeof e.id!=='string'||['__proto__','constructor','prototype'].includes(e.id)||typeof e.name!=='string'||e.name.length>100||!uuids.has(e.uuid)||!Array.isArray(e.colliders))throw Error('Invalid model entry.');e.colliders.forEach(checkBox);return e.id;});if(new Set(ids).size!==ids.length||!uuids.has(p.roofUuid))throw Error('Invalid model IDs.');
 for(const image of (p.model as typeof p.model & {images?:{url:unknown}[]}).images??[]){const url=(image as any).url;if(typeof url!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(url))throw Error('Project textures must be embedded images.');}
 if(!p.editor||typeof p.editor.layout!=='string'||typeof p.editor.catalog!=='string'||!p.editor.designs||Array.isArray(p.editor.designs)||typeof p.editor.designs!=='object'||Object.keys(p.editor.designs).length>20)throw Error('Invalid editor backup.');
 parseLayout(p.editor.layout,ids);parseCatalog(p.editor.catalog,ids);for(const [name,layout] of Object.entries(p.editor.designs)){if(!name.trim()||name.length>80||typeof layout!=='string')throw Error('Invalid saved design.');parseLayout(layout,ids);}
 if(!p.view||!['orbit','walk','plan','edit'].includes(p.view.mode)||typeof p.view.roof!=='boolean'||typeof p.view.labels!=='boolean'||!Number.isFinite(p.view.time)||p.view.time<0||p.view.time>100)throw Error('Invalid view settings.');return p;
}
