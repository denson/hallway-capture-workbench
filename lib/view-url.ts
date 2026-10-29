import {rooms,type ViewMode} from './hallway-data.ts';

type Point=[number,number,number];
export type ViewSnapshot={mode:ViewMode;position:Point;target:Point;yaw:number;pitch:number;roof:boolean;labels:boolean;time:number;measurements?:boolean;object?:string};
/** Angles in links are degrees; positions and targets are local model metres. */
export type ViewNavigation=Partial<Omit<ViewSnapshot,'target'>> & {target?:Point;location?:string;focus?:boolean;look?:string};
/** User-selected opening view at the T, looking back along the captured branch. */
export const DEFAULT_OPENING_VIEW:ViewSnapshot={mode:'walk',position:[9.375,1.65,.941],target:[9.28,1.56,1.93],yaw:174.8,pitch:-5.4,roof:true,labels:true,time:48,measurements:false};
const modes=['walk','orbit','plan','edit'];
const keys=['v','mode','x','y','z','yaw','pitch','tx','ty','tz','roof','labels','time','object','location','focus','look','measurements'];
export function readViewHash(hash:string):ViewNavigation|null{
  const p=new URLSearchParams(hash.replace(/^#/,''));
  if(!p.size||[...p.keys()].some(k=>!keys.includes(k)||p.getAll(k).length!==1)||p.has('v')&&p.get('v')!=='1')return null;
  if(!['mode','location','object','x'].some(k=>p.has(k)))return null;
  const r:ViewNavigation={};
  if(p.has('mode')){if(!modes.includes(p.get('mode')!))return null;r.mode=p.get('mode') as ViewMode;}
  if(p.has('location')){if(!rooms.some(room=>room.id===p.get('location')))return null;r.location=p.get('location')!;}
  if(p.has('object')){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(p.get('object')!))return null;r.object=p.get('object')!;}
  if(p.has('look')){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(p.get('look')!))return null;r.look=p.get('look')!;}
  const number=(key:string,min:number,max:number)=>{const s=p.get(key);if(s===null||!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(s))return null;const n=Number(s);return Number.isFinite(n)&&n>=min&&n<=max?n:null;};
  for(const [names,field] of [[['x','y','z'],'position'],[['tx','ty','tz'],'target']] as const){
    if(names.some(k=>p.has(k))){const values=names.map(k=>number(k,-200,200));if(values.some(v=>v===null))return null;r[field]=values as Point;}
  }
  for(const [key,min,max] of [['yaw',-36000,36000],['pitch',-90,90],['time',0,100]] as const){if(p.has(key)){const n=number(key,min,max);if(n===null)return null;r[key]=key==='yaw'?normalizeYaw(n):n;}}
  for(const key of ['roof','labels','focus','measurements'] as const){if(p.has(key)){if(!['0','1'].includes(p.get(key)!))return null;r[key]=p.get(key)==='1';}}
  if(r.position&&r.target&&Math.hypot(...r.position.map((v,i)=>v-r.target![i]))<.01)return null;
  return r;
}
export const normalizeYaw=(degrees:number)=>((degrees+180)%360+360)%360-180;
const rounded=(n:number,digits:number)=>String(Number(n.toFixed(digits)));
export function writeViewHash(s:ViewSnapshot):string{
  const p=new URLSearchParams({v:'1',mode:s.mode});
  for(const [i,key] of ['x','y','z'].entries())p.set(key,rounded(s.position[i],3));
  p.set('yaw',rounded(normalizeYaw(s.yaw),1));p.set('pitch',rounded(s.pitch,1));
  if(s.mode!=='walk')for(const [i,key] of ['tx','ty','tz'].entries())p.set(key,rounded(s.target[i],3));
  p.set('roof',s.roof?'1':'0');p.set('labels',s.labels?'1':'0');p.set('time',rounded(s.time,1));
  p.set('measurements',s.measurements?'1':'0');
  if(s.object)p.set('object',s.object);
  return '#'+p;
}

/** Replace continuous motion, so dragging never creates hundreds of Back entries. */
export function syncViewUrl(getView:()=>ViewSnapshot,apply:(nav:ViewNavigation)=>void,env:{location:{hash:string;href:string};history:{state:unknown;replaceState:(state:unknown,unused:string,url:string)=>void};addEventListener:(name:string,fn:()=>void)=>void;removeEventListener:(name:string,fn:()=>void)=>void;setInterval:(fn:()=>void,ms:number)=>number;clearInterval:(id:number)=>void},onUrl:(url:string)=>void=()=>{}){
  const restore=()=>{const nav=readViewHash(env.location.hash);if(nav)apply(nav);};
  const publish=()=>{const hash=writeViewHash(getView());if(hash!==env.location.hash)env.history.replaceState(env.history.state,'',env.location.href.split('#')[0]+hash);onUrl(env.location.href);};
  const initial=readViewHash(env.location.hash);apply(initial??DEFAULT_OPENING_VIEW);publish();
  env.addEventListener('hashchange',restore);env.addEventListener('popstate',restore);
  const timer=env.setInterval(publish,200);
  return ()=>{env.clearInterval(timer);env.removeEventListener('hashchange',restore);env.removeEventListener('popstate',restore);};
}
