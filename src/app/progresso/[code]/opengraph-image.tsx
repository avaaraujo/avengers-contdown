import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCatalog } from '@/lib/catalog';
import { dotDate, hm, parseProgressCode } from '@/lib/format';
import { siteUrl } from '@/lib/site';

export const alt = 'A estante de quem compartilhou: filmes assistidos em cores e filmes que faltam em preto e branco';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return [{ code: '0' }];
}

const tiles = new Map<string, Promise<string>>();
/** a cover tile from public/covers/og as a data URI; from the deployed site when the file is not bundled with the function */
function tile(cover: string, seen: boolean) {
  const path = cover.replace('/covers/', '/covers/og/').replace('.webp', seen ? '.jpg' : '-bw.jpg');
  let p = tiles.get(path);
  if (!p) {
    p = readFile(join(process.cwd(), 'public', path))
      .catch(async () => Buffer.from(await (await fetch(new URL(path, siteUrl))).arrayBuffer()))
      .then(buf => `data:image/jpeg;base64,${buf.toString('base64')}`);
    p.catch(() => tiles.delete(path));
    tiles.set(path, p);
  }
  return p;
}

/** The shared-progress card: how many films, and the whole shelf with the watched comics in color. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { films, finale } = await getCatalog();
  const seen = parseProgressCode(code, films.length) ?? new Set<number>();
  const seenMin = films.filter(f => seen.has(f.n)).reduce((a, f) => a + f.runtime, 0);
  const srcs = await Promise.all(films.map(f => tile(f.cover, seen.has(f.n))));
  const perRow = Math.ceil(films.length / 2);
  const done = seen.size === films.length;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#121318', color: '#f2eadb', fontFamily: 'sans-serif', padding: '44px 52px 40px' }}>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#f2c200' }}>Maratona do MCU · ordem cronológica</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 10 }}>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4 }}>{seen.size}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 22, paddingBottom: 10 }}>
            <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{`de ${films.length} filmes`}</div>
            <div style={{ display: 'flex', fontSize: 26, color: '#b3ab9d', marginTop: 8 }}>
              {done ? `Pronto para ${finale.title}` : `vistos antes de ${finale.title}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
          {[0, 1].map(row => (
            <div key={row} style={{ display: 'flex', marginTop: row ? 8 : 0 }}>
              {films.slice(row * perRow, (row + 1) * perRow).map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={f.n} src={srcs[row * perRow + i]} width={52} height={78} alt=""
                  style={{ marginLeft: i ? 6 : 0, borderRadius: 2, objectFit: 'cover', border: seen.has(f.n) ? '2px solid #f2c200' : '2px solid #121318' }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', fontSize: 26 }}>
          <div style={{ display: 'flex', color: '#b3ab9d' }}>{`${hm(seenMin)} assistidas · estreia ${dotDate(finale.premiereAt)}`}</div>
          <div style={{ display: 'flex', fontWeight: 800, fontSize: 30 }}>
            <span style={{ color: '#e2231a' }}>AVENGERS</span>
            <span style={{ color: '#f2c200', marginLeft: 12 }}>COUNTDOWN</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
