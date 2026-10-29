import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {objectBounds,measurementSize} from '../lib/object-measurements.ts';
test('assembly measurements stay unchanged through arbitrary rotation and translation',()=>{
 const parent=new T.Group(),g=new T.Group();parent.add(g);
 const seat=new T.Mesh(new T.BoxGeometry(.8,.2,.7));seat.position.y=.5;g.add(seat);
 const back=new T.Mesh(new T.BoxGeometry(.8,.6,.1));back.position.set(0,.8,-.3);g.add(back);
 const before=measurementSize(g);g.position.set(8,0,4);g.rotation.y=.723;parent.rotation.y=.43;
 const after=measurementSize(g);for(const k of ['width','depth','height'])assert.ok(Math.abs(before[k]-after[k])<1e-6);
 assert.ok(Math.abs(after.height-.7)<1e-6);
});
test('empty objects are finite and nested scaled geometry is measured',()=>{
 assert.deepEqual(measurementSize(new T.Group()),{width:0,depth:0,height:0});
 const g=new T.Group(),child=new T.Mesh(new T.BoxGeometry(2,3,4));child.scale.set(2,1,.5);g.add(child);g.scale.set(2,1,1);
 assert.deepEqual(measurementSize(g),{width:8,depth:2,height:3});assert.equal(objectBounds(g).getSize(new T.Vector3()).x,4);
});

test('names and material choices survive layout export, validation and history',async()=>{
 const {parseLayout,LayoutHistory}=await import('../lib/layout-state.ts');
 const before={chair:{x:1,z:2,angle:0}};
 const after={chair:{x:1,z:2,angle:0,name:'Reading chair',material:'oak'}};
 assert.deepEqual(parseLayout(JSON.stringify({version:1,objects:after}),['chair']),after);
 const h=new LayoutHistory();h.push(before,after);assert.deepEqual(h.undo(after),before);assert.deepEqual(h.redo(before),after);
 assert.throws(()=>parseLayout(JSON.stringify({version:1,objects:{chair:{...after.chair,material:'invalid'}}}),['chair']));
 assert.throws(()=>parseLayout(JSON.stringify({version:1,objects:{chair:{...after.chair,name:'x'.repeat(81)}}}),['chair']));
});

test('resizing and catalog recipes validate and survive layout history',async()=>{
 const {parseCatalog,scaleForDimension}=await import('../lib/asset-catalog.ts');
 const {parseLayout,LayoutHistory}=await import('../lib/layout-state.ts');
 const p={x:1,z:2,angle:30,y:-.1,sx:2,sy:.5,sz:1.3,name:'Small chair',material:'fabric'};
 const parsed=parseLayout(JSON.stringify({version:1,objects:{chair:p}}),['chair']);assert.deepEqual(parsed.chair,p);
 const asset={id:'asset-1',name:'Small chair',kind:'object',sourceId:'chair',placement:p};assert.deepEqual(parseCatalog(JSON.stringify([asset]),['chair']),[asset]);
 assert.throws(()=>parseCatalog(JSON.stringify([asset]),['bed']));
 for(const v of [0,-1,Infinity,NaN,101])assert.throws(()=>scaleForDimension(1,v));
 assert.equal(scaleForDimension(.8,1.2),1.4999999999999998);
 assert.throws(()=>parseLayout(JSON.stringify({version:1,objects:{chair:{...p,sx:0}}}),['chair']));
 const h=new LayoutHistory();h.push({chair:{x:1,z:2,angle:30}},{chair:p});assert.equal(h.undo({chair:p}).chair.sx,undefined);assert.equal(h.redo({chair:{x:1,z:2,angle:30}}).chair.sx,2);
});
