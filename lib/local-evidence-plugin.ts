import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {Plugin} from 'vite';
import {findEvidence} from './video-evidence.ts';

/** Local preview only: serve whitelisted review stills without publishing references/. */
export function localEvidence():Plugin{return {
  name:'hallway-local-evidence',
  configureServer(server){
    server.middlewares.use(async(req,res,next)=>{
      const pathname=new URL(req.url??'/','http://localhost').pathname;
      if(!pathname.startsWith('/api/evidence/'))return next();
      const entry=findEvidence(pathname.slice('/api/evidence/'.length));
      if(req.method!=='GET'||!entry){res.statusCode=404;res.end('Evidence not found');return;}
      try{
        const file='file' in entry?entry.file:join('video-IMG_3462','review','detail',`frame-${entry.seconds.toString().padStart(3,'0')}.jpg`);
        const bytes=await readFile(join(process.cwd(),'references',file));
        res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(bytes);
      }catch{res.statusCode=404;res.end('Local evidence image unavailable');}
    });
  },
};}
