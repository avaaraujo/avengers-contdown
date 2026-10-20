/** Canonical origin, for metadata and social images. Set NEXT_PUBLIC_SITE_URL to override. */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.NODE_ENV === 'production' ? 'https://mcu.avaaraujo.com' : 'http://localhost:3000'),
);

const repo = 'https://github.com/avaaraujo/avengers-countdown';

/**
 * Who runs the site, for the About/Contact/Privacy pages, llms.txt and the structured data.
 * The e-mail and the postal address are never invented: they appear only when the owner sets them
 * (NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_ADDRESS_LOCALITY, NEXT_PUBLIC_ADDRESS_REGION).
 */
export const site = {
  name: 'Avengers Countdown',
  tagline: 'Maratone o MCU em ordem cronológica até a estreia de Vingadores: Doutor Destino.',
  author: { name: 'Avá Araujo', url: 'https://avaaraujo.com' },
  repo,
  issues: `${repo}/issues`,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  address: {
    country: 'BR',
    locality: process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || null,
    region: process.env.NEXT_PUBLIC_ADDRESS_REGION || null,
  },
} as const;

/** the absolute URL of a path on this site */
export const absUrl = (path: string) => new URL(path, siteUrl).href;
