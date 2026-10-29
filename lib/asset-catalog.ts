import {parseLayout,type Placement} from './layout-state.ts';
export type CatalogAsset={id:string;name:string;kind:'object'|'material';sourceId:string;placement:Placement};
export function parseCatalog(raw:string,ids:string[]):CatalogAsset[]{
 const data=JSON.parse(raw);if(!Array.isArray(data)||data.length>200)throw Error('Invalid asset catalog.');
 return data.map(a=>{if(!a||typeof a.id!=='string'||typeof a.name!=='string'||!a.name.trim()||a.name.length>80||!['object','material'].includes(a.kind)||!ids.includes(a.sourceId))throw Error('Invalid catalog asset.');
 const placement=parseLayout(JSON.stringify({version:1,objects:{[a.sourceId]:a.placement}}),ids)[a.sourceId];if(!placement)throw Error('Invalid asset placement.');return {id:a.id,name:a.name,kind:a.kind,sourceId:a.sourceId,placement};});
}
export function scaleForDimension(base:number,target:number){if(!Number.isFinite(target)||target<.01||target>50||base<1e-6)throw Error('Choose a dimension between 0.01 and 50 metres.');const scale=target/base;if(scale<.001||scale>100)throw Error('This size is outside the supported scaling range.');return scale;}
