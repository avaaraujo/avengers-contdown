import type { Metadata, Viewport } from 'next';
import { Archivo, Bangers, Shantell_Sans } from 'next/font/google';
import { siteUrl } from '@/lib/site';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const bangers = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-bangers', display: 'swap' });
const shantell = Shantell_Sans({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-shantell', display: 'swap' });

const description = 'Maratone o Universo Cinematográfico Marvel em ordem cronológica até a estreia de Vingadores: Doutor Destino. Projeto de fã, sem vínculo com a Marvel ou a Disney.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: 'Avengers Countdown', template: '%s · Avengers Countdown' },
  description,
  applicationName: 'Avengers Countdown',
  openGraph: { title: 'Avengers Countdown', description, siteName: 'Avengers Countdown', type: 'website', locale: 'pt_BR' },
  twitter: { card: 'summary_large_image', title: 'Avengers Countdown', description },
};

export const viewport: Viewport = {
  themeColor: '#121318',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${bangers.variable} ${shantell.variable}`}>
      <body>{children}</body>
    </html>
  );
}
