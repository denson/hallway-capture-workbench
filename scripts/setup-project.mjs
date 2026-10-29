import { copyFileSync, constants, mkdirSync } from 'node:fs';
mkdirSync('.openai', { recursive: true });
try {
  copyFileSync(
    '.openai/hosting.example.json',
    '.openai/hosting.json',
    constants.COPYFILE_EXCL,
  );
  console.log(
    'Created local hosting configuration. No Site is registered or published.',
  );
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Kept the existing local hosting configuration.');
}
mkdirSync('references', { recursive: true });
console.log(
  'Ready. Put private reference images in references/ and run npm run dev.',
);
