// Small copies of the comic covers (public/covers/sm/NN.webp): the shelf textures on phones and the list thumbnails.
// Usage: node scripts/make-thumbs.mjs
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const src = 'public/covers', out = join(src, 'sm');
await mkdir(out, { recursive: true });
for (const f of (await readdir(src)).filter(f => f.endsWith('.webp'))) {
  await sharp(join(src, f)).resize({ width: 384 }).webp({ quality: 74, effort: 6 }).toFile(join(out, f));
}
console.log('done');
