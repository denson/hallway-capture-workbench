import {parseComponentRecord,type ComponentRecord} from './component-record.ts';
export type Placement = {x:number;z:number;y?:number;sx?:number;sy?:number;sz?:number;angle:number;deleted?:boolean;sourceId?:string;name?:string;material?:string;record?:ComponentRecord};
export type Layout = Record<string,Placement>;
export function parseLayout(raw:string,ids:string[]):Layout {
  const data=JSON.parse(raw);
  if(!data||data.version!==1||!data.objects||typeof data.objects!=='object'||Array.isArray(data.objects))throw Error('This is not a house layout file.');
  const result:Layout={};
  if(Object.keys(data.objects).length>1500)throw Error('This layout contains too many objects.');
  for(const [id,value] of Object.entries(data.objects)){
    const v=value as Placement;
    const isCopy=id.startsWith('copy-')&&v&&typeof v.sourceId==='string'&&ids.includes(v.sourceId);
    if(!ids.includes(id)&&!isCopy)continue;
    if(!v||![v.x,v.z,v.angle].every(n=>typeof n==='number'&&Number.isFinite(n))||Math.abs(v.x)>100||Math.abs(v.z)>100||Math.abs(v.angle)>100000)throw Error('Invalid object position.');
    if(v.deleted!==undefined&&typeof v.deleted!=='boolean')throw Error('Invalid deletion state.');
    if(v.name!==undefined&&(typeof v.name!=='string'||!v.name.trim()||v.name.length>80))throw Error('Invalid object name.');
    if(v.material!==undefined&&!['original','limestone','oak','wallpaper','plaster','fabric'].includes(v.material))throw Error('Invalid material.');
    for(const axis of ['sx','sy','sz'] as const)if(v[axis]!==undefined&&(typeof v[axis]!=='number'||!Number.isFinite(v[axis])||v[axis]!<.001||v[axis]!>100))throw Error('Invalid object scale.');
    if(v.y!==undefined&&(typeof v.y!=='number'||!Number.isFinite(v.y)||Math.abs(v.y)>100))throw Error('Invalid object height.');
    result[id]={x:v.x,z:v.z,angle:v.angle,...(v.y!==undefined?{y:v.y}:{}),...(v.sx!==undefined?{sx:v.sx}:{}),...(v.sy!==undefined?{sy:v.sy}:{}),...(v.sz!==undefined?{sz:v.sz}:{}),...(v.name?{name:v.name}:{}),...(v.material?{material:v.material}:{}),...(v.deleted?{deleted:true}:{}),...(isCopy?{sourceId:v.sourceId}:{}),...(v.record!==undefined?{record:parseComponentRecord(v.record)}:{})};
  }
  return result;
}
export class LayoutHistory {
  past:Layout[]=[];future:Layout[]=[];
  push(before:Layout,after:Layout){if(JSON.stringify(before)===JSON.stringify(after))return;this.past.push(structuredClone(before));if(this.past.length>60)this.past.shift();this.future=[];}
  undo(current:Layout){const next=this.past.pop();if(!next)return null;this.future.push(structuredClone(current));return next;}
  redo(current:Layout){const next=this.future.pop();if(!next)return null;this.past.push(structuredClone(current));return next;}
}
