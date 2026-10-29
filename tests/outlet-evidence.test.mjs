import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildHallway} from '../lib/hallway-model.ts';
import {pickInspectable} from '../lib/object-inspection.ts';
import {findEvidence} from '../lib/video-evidence.ts';

test('outlet front remains selectable and its observed openings are not mirrored',()=>{
  const built=buildHallway(false),outlet=built.entries.find(e=>e.id==='outlet-opposite-210').object;
  built.model.updateMatrixWorld(true);
  const center=new T.Box3().setFromObject(outlet).getCenter(new T.Vector3());
  const camera=new T.PerspectiveCamera(58,1,.01,10);camera.position.copy(center).add(new T.Vector3(.7,0,0));camera.lookAt(center);camera.updateMatrixWorld();
  const point=name=>outlet.getObjectByName(name).getWorldPosition(new T.Vector3()).project(camera);
  for(const index of [1,2]){
    const left=point(`Receptacle ${index} view-left T stem`),right=point(`Receptacle ${index} view-right vertical slot`),ground=point(`Receptacle ${index} lower ground opening`);
    assert.ok(left.x<right.x,'T remains on viewer left');assert.ok(ground.y<left.y,'ground stays below slots');
  }
  const ray=new T.Raycaster(camera.position,center.clone().sub(camera.position).normalize());
  assert.equal(pickInspectable(ray,built.model,built.entries)?.id,'outlet-opposite-210');
  for(const id of ['outlet-face-closeup','outlet-wall-context','outlet-wall-wide']){
    assert.ok(outlet.userData.componentRecord.evidenceIds.includes(id));assert.ok(findEvidence(id));
  }
});
