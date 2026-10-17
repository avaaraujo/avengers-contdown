import type { Metadata, Viewport } from 'next';
import { Archivo, Bangers, Shantell_Sans } from 'next/font/google';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const bangers = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-bangers', display: 'swap' });
const shantell = Shantell_Sans({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-shantell', display: 'swap' });

export const metadata: Metadata = {
  title: 'Avengers Countdown',
  description: 'Maratone o MCU em ordem cronológica até a estreia de Vingadores: Doutor Destino. Projeto de fã, sem afiliação com Marvel ou Disney.',
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
