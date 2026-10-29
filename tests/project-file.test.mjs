import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {parseProject} from '../lib/project-file.ts';
function fixture(){const model=new T.Group(),roof=new T.Group();model.add(roof);const layout=JSON.stringify({version:1,objects:{roof:{x:0,z:0,angle:0,sx:2}}});return {format:'house-editor-project',version:1,model:model.toJSON(),entries:[{id:'roof',name:'Roof',uuid:roof.uuid,colliders:[]}],obstacles:[],roofUuid:roof.uuid,editor:{layout,catalog:'[]',designs:{OptionA:layout}},view:{mode:'edit',roof:false,labels:true,time:48}};}
test('project backup restores embedded model, layout and saved designs',()=>{const p=fixture();assert.deepEqual(parseProject(JSON.stringify(p)),p);});
test('invalid backup or remote texture is rejected before replacing model',()=>{const p=fixture();assert.throws(()=>parseProject(JSON.stringify({...p,version:2})));p.model.images=[{uuid:'texture',url:'https://example.invalid/texture.png'}];assert.throws(()=>parseProject(JSON.stringify(p)));delete p.model.images;p.entries[0].uuid='missing';assert.throws(()=>parseProject(JSON.stringify(p)));});

test('project backup validates component records in both model and saved layout',()=>{
 const p=fixture();p.model.object.userData={componentRecord:{status:'untrusted-value'}};
 assert.throws(()=>parseProject(JSON.stringify(p)),/identification status/);
 delete p.model.object.userData;const l=JSON.parse(p.editor.layout);l.objects.roof.record={partNumber:'P-1',status:'tentative',evidenceIds:['v282']};p.editor.layout=JSON.stringify(l);
 assert.equal(JSON.parse(parseProject(JSON.stringify(p)).editor.layout).objects.roof.record.partNumber,'P-1');
});
