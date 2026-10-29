import assert from 'node:assert/strict';
import test from 'node:test';
import {emptyComponentRecord,parseComponentRecord} from '../lib/component-record.ts';
import {parseLayout,LayoutHistory} from '../lib/layout-state.ts';
import {buildHallway} from '../lib/hallway-model.ts';
import {findVideoEvidence} from '../lib/video-evidence.ts';

test('component records survive layout backup, history and independent edits',()=>{
 const record={...emptyComponentRecord(),manufacturer:'Example manufacturer',model:'Reference head',partNumber:'P-123',status:'needs-confirmation-for-hallway',evidenceIds:['v282','v252'],workHeight:3.4,heightStatus:'estimated',heightSource:'Provisional geometry'};
 const before={head:{x:1,z:2,angle:90,record}},after=structuredClone(before);
 after.head.record.status='confirmed';after.head.record.notes='Markings compared with reference';
 const restored=parseLayout(JSON.stringify({version:1,objects:after}),['head']);assert.deepEqual(restored,after);
 const history=new LayoutHistory();history.push(before,after);assert.deepEqual(history.undo(after),before);assert.deepEqual(history.redo(before),after);
 assert.equal(before.head.record.status,'needs-confirmation-for-hallway');
});

test('invalid records and unsafe evidence identifiers are rejected rather than silently discarded',()=>{
 for(const patch of [{workHeight:Infinity},{workHeight:-1},{workHeight:31},{status:'probably'},{evidenceIds:['../../private']},{notes:'x'.repeat(4001)}])assert.throws(()=>parseComponentRecord({...emptyComponentRecord(),...patch}));
 assert.deepEqual(parseComponentRecord({}),emptyComponentRecord());
 assert.deepEqual(parseComponentRecord({evidenceIds:['v282','v282']}).evidenceIds,['v282']);
 assert.equal(findVideoEvidence('../v120'),undefined);
});

test('video-informed geometry retains unknown part numbers and source evidence',()=>{
 const built=buildHallway(false),head=built.entries.find(e=>e.id==='sprinkler-head-B0').object.userData.componentRecord;
 assert.equal(head.status,'needs-confirmation-for-hallway');assert.equal(head.partNumber,'');assert.equal(head.heightStatus,'estimated');
 assert.ok(head.evidenceIds.every(id=>findVideoEvidence(id)));
 assert.equal(built.entries.find(e=>e.id==='fire-pull-station').object.userData.componentRecord.manufacturer,'Honeywell');
 assert.equal(built.entries.find(e=>e.id==='wall-main-north').object.userData.coverage,'overview-only');
 assert.equal(built.entries.some(e=>e.id==='pipe-main-corridor'),false);
});
