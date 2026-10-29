import {allEvidence} from '../lib/video-evidence.ts';
import {mkdirSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.argv[2];if(!root)throw Error('Provide the private reference directory. Copies only the reviewed image whitelist.');
mkdirSync('public/evidence',{recursive:true});
for(const e of allEvidence){const source='file' in e?e.file:`video-IMG_3462/review/detail/frame-${String(e.seconds).padStart(3,'0')}.jpg`;copyFileSync(resolve(root,source),resolve('public/evidence',e.id+'.jpg'));}
console.log(`Prepared ${allEvidence.length} approved still images; no original video or raw metadata copied.`);
