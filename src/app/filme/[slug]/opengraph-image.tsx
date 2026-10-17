import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { getCatalog } from '@/lib/catalog';

export const alt = 'Capa do gibi e título do filme no Avengers Countdown';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const { films, finale } = await getCatalog();
  return [...films.map(f => ({ slug: f.slug })), { slug: finale.slug }];
}

/** One social card per film: its comic cover, the title and where it sits in the marathon. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { films, finale } = await getCatalog();
  const film = films.find(f => f.slug === slug);
  const title = film?.title ?? finale.title;
  const cover = film?.cover ?? finale.cover;
  const kicker = film ? `Nº ${film.n} de ${films.length} · ${film.year}` : 'Estreia · 17.12.2026';
  // satori reads PNG/JPEG; the covers are WebP
  const png = await sharp(await readFile(join(process.cwd(), 'public', cover))).resize({ width: 420 }).png().toBuffer();
  const src = `data:image/png;base64,${png.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#121318', color: '#f2eadb', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', width: 470, alignItems: 'center', justifyContent: 'center', background: '#1b1c23' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={380} height={540} style={{ objectFit: 'cover', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,.6)', transform: 'rotate(-3deg)' }} alt="" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 56px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#f2c200' }}>{kicker}</div>
          <div style={{ fontSize: title.length > 28 ? 66 : 82, fontWeight: 900, lineHeight: 1.02, margin: '18px 0 28px', color: '#f7f1e3' }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
            <span style={{ color: '#e2231a' }}>AVENGERS</span>
            <span style={{ color: '#f2c200', marginLeft: 12 }}>COUNTDOWN</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
