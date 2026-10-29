import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const files = execFileSync('git', ['ls-files', '--cached', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(Boolean);
const rules = [
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{20,}/],
  ['fine-grained GitHub token', /github_pat_[A-Za-z0-9_]{30,}/],
  ['API key', /sk-(?:proj-)?[A-Za-z0-9_-]{30,}/],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['Sites source credential', /art_v2_[A-Za-z0-9_]{20,}/],
  ['personal Site identity', /appgprj_[a-zA-Z0-9]{15,}/],
  ['local user path', /\/(?:Users|home)\/[^\s/]+\//],
  ['email address', /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i],
];
const findings = [];
for (const file of files) {
  if (
    /(^|\/)(\.env(?:\..*)?|references|private|node_modules|\.git)(\/|$)/.test(
      file,
    ) ||
    file === '.openai/hosting.json' ||
    /\.(pem|key|p12|pfx)$/.test(file)
  ) {
    findings.push(`${file}: private file must not be tracked`);
    continue;
  }
  const stagedSize = Number(
    execFileSync('git', ['cat-file', '-s', ':' + file], { encoding: 'utf8' }),
  );
  const contents = [execFileSync('git', ['show', ':' + file], {
    maxBuffer: Math.max(1024 * 1024, stagedSize + 1024),
  })];
  try {
    contents.push(readFileSync(file));
  } catch {}
  for (const [label, pattern] of rules)
    if (
      contents.some(
        (content) =>
          !content.includes(0) && pattern.test(content.toString('utf8')),
      )
    )
      findings.push(`${file}: possible ${label}`);
}
if (findings.length) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Checked ${files.length} tracked files: no configured secret or personal-data patterns found.`,
  );
// Heuristic only: review the diff and scan repository history before publishing.
