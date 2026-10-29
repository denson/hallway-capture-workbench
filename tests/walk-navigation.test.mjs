import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import {canWalkSegment,findWalkDestination,pickWalkFloor} from '../lib/walk-navigation.ts';
import {canOccupy,HALL} from '../lib/hallway-data.ts';

test('floor movement accepts a corridor destination and leaves clearance at a wall',()=>{
  const from={x:5,z:.8},stand=(x,z)=>canOccupy(x,z,[]);
  assert.deepEqual(findWalkDestination(from,{x:2,z:.8},stand),{x:2,z:.8});
  const nearWall=findWalkDestination(from,{x:2,z:.02},stand);
  assert.ok(nearWall && stand(nearWall.x,nearWall.z));
  assert.ok(Math.hypot(nearWall.x-2,nearWall.z-.02)<=.361);
});

test('floor movement cannot tunnel through a thin obstacle or cut across the T corner',()=>{
  const obstacle=[{minX:3,maxX:3.02,minZ:0,maxZ:HALL.width}];
  assert.equal(findWalkDestination({x:5,z:.8},{x:2,z:.8},(x,z)=>canOccupy(x,z,obstacle)),null);
  assert.equal(canWalkSegment({x:5,z:.8},{x:9.3,z:5},(x,z)=>canOccupy(x,z,[])),false);
  assert.equal(findWalkDestination({x:5,z:.8},{x:NaN,z:.8},()=>true),null);
  assert.equal(canWalkSegment({x:5,z:.8},{x:Infinity,z:.8},()=>true),false);
});

test('floor ray picking rejects walls, hidden floors and floor side faces',()=>{
  const scene=new T.Group(),floorGroup=new T.Group();floorGroup.userData.id='floor-0';scene.add(floorGroup);
  const floor=new T.Mesh(new T.BoxGeometry(10,.1,10),new T.MeshBasicMaterial());floor.position.y=-.05;floorGroup.add(floor);
  const ray=new T.Raycaster(new T.Vector3(0,2,3),new T.Vector3(0,-1,-1).normalize());
  const point=pickWalkFloor(ray,scene);assert.ok(point);assert.ok(Math.abs(point.y)<1e-8);
  const wall=new T.Mesh(new T.BoxGeometry(10,3,.1),new T.MeshBasicMaterial());wall.position.set(0,1.5,2);scene.add(wall);
  assert.equal(pickWalkFloor(ray,scene),null);
  wall.visible=false;assert.ok(pickWalkFloor(ray,scene));
  floorGroup.visible=false;assert.equal(pickWalkFloor(ray,scene),null);floorGroup.visible=true;
  const sideRay=new T.Raycaster(new T.Vector3(6,-.05,0),new T.Vector3(-1,0,0));
  assert.equal(pickWalkFloor(sideRay,scene),null);
});

test('floor ray picking respects architectural cutaway clipping',()=>{
  const scene=new T.Group(),floorGroup=new T.Group();floorGroup.userData.id='floor-0';scene.add(floorGroup);
  floorGroup.add(new T.Mesh(new T.BoxGeometry(10,.1,10),new T.MeshBasicMaterial()));
  const material=new T.MeshBasicMaterial();material.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),1)];
  const wall=new T.Mesh(new T.BoxGeometry(10,3,.1),material);wall.position.set(0,1.5,2);scene.add(wall);
  const ray=new T.Raycaster(new T.Vector3(0,2,3),new T.Vector3(0,-1,-1).normalize());
  assert.ok(pickWalkFloor(ray,scene));
});
