import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_OPENING_VIEW,readViewHash,writeViewHash,syncViewUrl} from '../lib/view-url.ts';
const start={mode:'walk',position:[9.339072,1.65,12.030912],target:[17,0,5],yaw:0,pitch:2.8648,roof:true,labels:true,time:48};

test('walk camera links round-trip positions and direction within displayed precision',()=>{
 const url=writeViewHash({...start,yaw:450,object:'wall-cabinet'}),restored=readViewHash(url);
 assert.deepEqual(restored.position,[9.339,1.65,12.031]);assert.equal(restored.yaw,90);assert.equal(restored.pitch,2.9);
 assert.equal(restored.object,'wall-cabinet');assert.equal(restored.roof,true);assert.equal(restored.mode,'walk');
 assert.ok(!url.includes('tx='));
});
test('orbit, cutaway, selected component and vertical floor-plan views retain their camera target',()=>{
 for(const mode of ['orbit','edit','plan']){
   const restored=readViewHash(writeViewHash({...start,mode,position:[17,34,5.01],target:[17,0,5],pitch:-90,roof:false,labels:false,time:80.5,object:'fire-horn-strobe-stair2'}));
   assert.equal(restored.mode,mode);assert.deepEqual(restored.target,[17,0,5]);assert.equal(restored.pitch,-90);
   assert.equal(restored.roof,false);assert.equal(restored.labels,false);assert.equal(restored.time,80.5);
 }
});
test('named location and component links support instant orientation or focus without editing the model',()=>{
 assert.deepEqual(readViewHash('#v=1&mode=walk&location=stair2&look=wall-cabinet'),{mode:'walk',location:'stair2',look:'wall-cabinet'});
 assert.deepEqual(readViewHash('#v=1&mode=edit&object=wall-cabinet&focus=1&roof=0'),{mode:'edit',object:'wall-cabinet',roof:false,focus:true});
});
test('malformed links are rejected as a whole instead of partially changing the view',()=>{
 for(const hash of ['', '#v=2&mode=walk','#mode=bad','#mode=walk&x=1','#mode=walk&x=NaN&y=1&z=2','#mode=walk&x=1000&y=1&z=2','#mode=walk&pitch=91','#mode=walk&yaw=Infinity','#mode=walk&roof=yes','#mode=walk&mode=edit','#location=no-such-room','#object=../../secret','#mode=walk&look=<script>','#mode=edit&x=1&y=2&z=3&tx=1&ty=2&tz=3','#mode=walk&delete=door-210'])assert.equal(readViewHash(hash),null,hash);
});
test('continuous movement replaces URLs, inbound history restores, and teardown removes all listeners',()=>{
 let state=structuredClone(start),current=new URL('http://localhost:5177/?keep=1#v=1&location=stair2&yaw=90');
 const listeners=new Map(),historyState={unrelated:'preserved'};let calls=0,replacements=0,tick,cleared=false;
 const env={location:current,history:{state:historyState,replaceState:(saved,_,url)=>{assert.equal(saved,historyState);current.href=url;replacements++;}},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{assert.equal(listeners.get(name),fn);listeners.delete(name);},setInterval:fn=>{tick=fn;return 42;},clearInterval:id=>{assert.equal(id,42);cleared=true;}};
 const cleanup=syncViewUrl(()=>state,nav=>{calls++;state={...state,...nav};},env);
 assert.equal(calls,1);assert.equal(readViewHash(current.hash).yaw,90);assert.equal(current.search,'?keep=1');
 const old=replacements;tick();assert.equal(replacements,old,'stationary camera does not rewrite history');
 state={...state,position:[9.3,1.65,8],pitch:40};tick();assert.equal(readViewHash(current.hash).position[2],8);
 current.hash='#v=1&mode=walk&location=door210&yaw=-90';listeners.get('popstate')();assert.equal(state.yaw,-90);assert.equal(state.location,'door210');
 current.hash='#v=1&mode=walk&pitch=NaN';const before=calls;listeners.get('hashchange')();assert.equal(calls,before);
 cleanup();assert.equal(listeners.size,0);assert.equal(cleared,true);
});

test('an unlinked visit uses the chosen opening view while explicit links take precedence',()=>{
 for(const hash of ['', '#v=1&mode=walk&location=stair2&yaw=0']){
  const location=new URL('https://example.test/hallway/'+hash);let applied;
  const env={location,history:{state:null,replaceState:(_,__,url)=>{location.href=url;}},addEventListener:()=>{},removeEventListener:()=>{},setInterval:()=>1,clearInterval:()=>{}};
  const cleanup=syncViewUrl(()=>({...DEFAULT_OPENING_VIEW,...applied}),nav=>{applied=nav;},env);
  if(hash) {assert.equal(applied.location,'stair2');assert.equal(applied.yaw,0);}
  else {assert.equal(applied.mode,'walk');assert.deepEqual(applied.position,[9.375,1.65,.941]);assert.equal(applied.yaw,174.8);assert.equal(applied.measurements,false);}
  cleanup();
 }
});
