import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const scanner = resolve('scripts/check-public.mjs');
function fixture(run) {
  const dir = mkdtempSync(join(tmpdir(), 'public-check-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test('public check accepts clean staged source', () =>
  fixture((dir) => {
    writeFileSync(join(dir, 'app.txt'), 'Example 3D house');
    execFileSync('git', ['add', '.'], { cwd: dir });
    assert.equal(
      spawnSync(process.execPath, [scanner], { cwd: dir }).status,
      0,
    );
  }));
test('public check catches a staged token even after the working file is cleaned', () =>
  fixture((dir) => {
    const fake = ['g', 'hp_'].join('') + 'A'.repeat(36);
    writeFileSync(join(dir, 'app.txt'), fake);
    execFileSync('git', ['add', '.'], { cwd: dir });
    writeFileSync(join(dir, 'app.txt'), 'clean now');
    const result = spawnSync(process.execPath, [scanner], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /possible GitHub token/);
    assert.ok(!result.stderr.includes(fake));
  }));

test('public check handles illustration assets larger than the default buffer', () =>
  fixture((dir) => {
    writeFileSync(join(dir, 'illustration.png'), Buffer.alloc(2 * 1024 * 1024));
    execFileSync('git', ['add', '.'], { cwd: dir });
    const result = spawnSync(process.execPath, [scanner], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }));
