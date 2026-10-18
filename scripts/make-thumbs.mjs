// Small copies of the comic covers:
// - public/covers/sm/NN.webp: the shelf textures on phones and the list thumbnails;
// - public/covers/og/NN.jpg and NN-bw.jpg: the tiles of the shared-progress card (satori reads JPEG, not WebP).
// Usage: node scripts/make-thumbs.mjs
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const src = 'public/covers', sm = join(src, 'sm'), og = join(src, 'og');
await mkdir(sm, { recursive: true });
await mkdir(og, { recursive: true });
for (const f of (await readdir(src)).filter(f => f.endsWith('.webp'))) {
  await sharp(join(src, f)).resize({ width: 384 }).webp({ quality: 74, effort: 6 }).toFile(join(sm, f));
  const tile = sharp(join(src, f)).resize(104, 156, { fit: 'cover', position: 'top' });
  const base = f.replace('.webp', '');
  await tile.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(og, `${base}.jpg`));
  // unwatched: still in the bag, black and white and dimmed, like on the shelf
  await tile.clone().grayscale().linear(0.5, 14).jpeg({ quality: 72, mozjpeg: true }).toFile(join(og, `${base}-bw.jpg`));
}
console.log('done');
