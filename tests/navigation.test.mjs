import assert from 'node:assert/strict';
import test from 'node:test';
import {canOccupy,HALL} from '../lib/house-data.ts';
test('walker can pass through the main and branch junction',()=>{
  const x=(HALL.branchLeft+HALL.branchRight)/2;
  for(let z=.4;z<3;z+=.05)assert.equal(canOccupy(x,z,[]),true);
});
test('body radius prevents clipping modeled floor edges and obstacle faces',()=>{
  assert.equal(canOccupy(4,.1,[]),false);
  assert.equal(canOccupy(4,.4,[]),true);
  const box=[{minX:4,maxX:5,minZ:.5,maxZ:1.1}];
  assert.equal(canOccupy(3.9,.8,box),false);
  assert.equal(canOccupy(3.7,.8,box),true);
});
test('movement stays within the actual T-shaped corridor, not its enclosing rectangle',()=>{
  assert.equal(canOccupy(20,5,[]),false);
  assert.equal(canOccupy(HALL.branchLeft+.6,5,[]),true);
  assert.equal(canOccupy(-1,.8,[]),false);
  assert.equal(canOccupy(HALL.lobbyRight+1,2.2,[]),false);
  assert.equal(canOccupy(NaN,1,[]),false);
});
