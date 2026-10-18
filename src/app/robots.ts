import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// shared-progress pages stay crawlable (social previews read them) and opt out of the index with their own meta tag
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', siteUrl).href,
  };
}
