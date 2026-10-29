import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLayout, LayoutHistory } from '../lib/layout-state.ts';
const original = { chair: { x: 6.75, z: 10.25, angle: 0 } };
const moved = { chair: { x: 7, z: 11, angle: 90 } };
test('layout save and load round trip preserves a moved and rotated object', () => {
  assert.deepEqual(
    parseLayout(JSON.stringify({ version: 1, objects: moved }), ['chair']),
    moved,
  );
});
test('corrupt coordinates and unsupported versions fail without partial mutation', () => {
  assert.throws(() =>
    parseLayout(
      JSON.stringify({
        version: 1,
        objects: { chair: { x: null, z: 11, angle: 90 } },
      }),
      ['chair'],
    ),
  );
  assert.throws(() =>
    parseLayout(
      JSON.stringify({
        version: 1,
        objects: { chair: { x: 1e9, z: 11, angle: 90 } },
      }),
      ['chair'],
    ),
  );
  assert.throws(() =>
    parseLayout(JSON.stringify({ version: 2, objects: moved }), ['chair']),
  );
  assert.deepEqual(original, { chair: { x: 6.75, z: 10.25, angle: 0 } });
});
test('unknown objects are ignored when importing another version of the house', () => {
  assert.deepEqual(
    parseLayout(
      JSON.stringify({
        version: 1,
        objects: { ...moved, unknown: { x: 1, z: 2, angle: 3 } },
      }),
      ['chair'],
    ),
    moved,
  );
});
test('undo and redo restore position and rotation together', () => {
  const h = new LayoutHistory();
  h.push(original, moved);
  assert.deepEqual(h.undo(moved), original);
  assert.deepEqual(h.redo(original), moved);
});
test('new edits after undo clear the redo branch and no-op edits are ignored', () => {
  const h = new LayoutHistory();
  h.push(original, original);
  assert.equal(h.past.length, 0);
  h.push(original, moved);
  h.undo(moved);
  h.push(original, { chair: { x: 5, z: 10, angle: 45 } });
  assert.equal(h.future.length, 0);
});
test('copies and deleted originals survive a layout round trip', () => {
  const layout = {
    chair: { x: 6, z: 10, angle: 0, deleted: true },
    'copy-123': { x: 8, z: 10, angle: 90, sourceId: 'chair' },
  };
  assert.deepEqual(
    parseLayout(JSON.stringify({ version: 1, objects: layout }), ['chair']),
    layout,
  );
});
test('undo removes a duplicate and redo restores its transform', () => {
  const layout = {
    ...original,
    'copy-123': { x: 8, z: 11, angle: 90, sourceId: 'chair' },
  };
  const h = new LayoutHistory();
  h.push(original, layout);
  assert.deepEqual(h.undo(layout), original);
  assert.deepEqual(h.redo(original), layout);
});
test('delete undo restores an original object and rejects invalid delete markers', () => {
  const deleted = { chair: { ...original.chair, deleted: true } };
  const h = new LayoutHistory();
  h.push(original, deleted);
  assert.deepEqual(h.undo(deleted), original);
  assert.throws(() =>
    parseLayout(
      JSON.stringify({
        version: 1,
        objects: { chair: { ...original.chair, deleted: 'yes' } },
      }),
      ['chair'],
    ),
  );
});
