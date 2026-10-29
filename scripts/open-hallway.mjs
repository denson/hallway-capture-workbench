import {mkdirSync,openSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const url='http://localhost:5177/';
async function check(){
  try{const r=await fetch(url,{signal:AbortSignal.timeout(1200)});const body=await r.text();
    if(!r.ok)return false;
    if(!body.includes('Hallway 210'))throw Error('Port 5177 is in use by another app.');
    return true;
  }catch(e){if(e.message.includes('another app'))throw e;return false;}
}
if(!await check()){
  mkdirSync(resolve(root,'outputs'),{recursive:true});
  const log=openSync(resolve(root,'outputs/viewer.log'),'a');
  const child=process.platform==='win32'
    ?spawn(process.env.ComSpec||'cmd.exe',['/d','/c','npm run dev -- --host 127.0.0.1 --port 5177 --strictPort'],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]})
    :spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5177','--strictPort'],{cwd:root,detached:true,stdio:['ignore',log,log]});
  child.unref();let ready=false;
  for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,500));if(await check()){ready=true;break;}}
  if(!ready)throw Error('Viewer did not start. Run npm ci and npm run setup, then try again. See outputs/viewer.log.');
}
console.log('Hallway viewer: '+url);
const open=process.platform==='win32'?spawn(process.env.ComSpec||'cmd.exe',['/d','/c','start','',url],{windowsHide:true,stdio:'ignore'}):spawn('open',[url],{stdio:'ignore'});
open.unref();
