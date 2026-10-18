import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Avengers Countdown',
    short_name: 'Countdown',
    description: 'Maratone o MCU em ordem cronológica até a estreia de Vingadores: Doutor Destino.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#121318',
    theme_color: '#121318',
    // the icon is full-bleed with the letter inside the safe zone, so the same files work as maskable
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
