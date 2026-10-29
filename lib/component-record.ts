export const identificationStatuses = ['unknown','tentative','confirmed','needs-confirmation-for-hallway'] as const;
export const identificationLabels = {unknown:'Unknown',tentative:'Tentative',confirmed:'Confirmed','needs-confirmation-for-hallway':'Needs confirmation for hallway'} as const;
export type ComponentRecord = {
  manufacturer:string; model:string; partNumber:string;
  status:typeof identificationStatuses[number]; notes:string;
  evidenceIds:string[]; evidenceNote:string;
  workHeight:number|null; heightStatus:'unknown'|'estimated'|'measured'; heightSource:string; accessNote:string;
};
export function emptyComponentRecord():ComponentRecord{return {manufacturer:'',model:'',partNumber:'',status:'unknown',notes:'',evidenceIds:[],evidenceNote:'',workHeight:null,heightStatus:'unknown',heightSource:'',accessNote:''};}
export function parseComponentRecord(value:unknown):ComponentRecord{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid component record.');
  const v=value as Record<string,unknown>,r=emptyComponentRecord();
  const fields={manufacturer:120,model:120,partNumber:160,notes:4000,evidenceNote:1000,heightSource:1000,accessNote:2000} as const;
  for(const [key,max] of Object.entries(fields)){const s=v[key];if(s!==undefined&&(typeof s!=='string'||s.length>max))throw Error('Invalid component '+key);if(typeof s==='string')(r as unknown as Record<string,unknown>)[key]=s;}
  if(v.status!==undefined){if(!identificationStatuses.includes(v.status as ComponentRecord['status']))throw Error('Invalid identification status.');r.status=v.status as ComponentRecord['status'];}
  if(v.heightStatus!==undefined){if(!['unknown','estimated','measured'].includes(v.heightStatus as string))throw Error('Invalid height status.');r.heightStatus=v.heightStatus as ComponentRecord['heightStatus'];}
  if(v.workHeight!==undefined&&v.workHeight!==null){if(typeof v.workHeight!=='number'||!Number.isFinite(v.workHeight)||v.workHeight<0||v.workHeight>30)throw Error('Invalid work-point height.');r.workHeight=v.workHeight;}
  if(v.evidenceIds!==undefined){if(!Array.isArray(v.evidenceIds)||v.evidenceIds.length>12||v.evidenceIds.some(id=>typeof id!=='string'||!/^[a-z0-9-]{1,80}$/.test(id)))throw Error('Invalid evidence references.');r.evidenceIds=[...new Set(v.evidenceIds)] as string[];}
  return r;
}
