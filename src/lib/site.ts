/** Canonical origin, for metadata and social images. Set NEXT_PUBLIC_SITE_URL to override. */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.NODE_ENV === 'production' ? 'https://mcu.avaaraujo.com' : 'http://localhost:3000'),
);
