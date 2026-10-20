import type { Catalog } from './types';
import { dotDate } from './format';
import { infoPath } from './pages';
import { absUrl, site } from './site';

/**
 * Homepage structured data: the site, the app and who is behind it, linked by @id.
 * Contact e-mail and address fields appear only when the owner configured them (see site.ts).
 */
export function homeLd(catalog: Catalog) {
  const { finale, films } = catalog;
  const org = absUrl('/#organization');
  const address = {
    '@type': 'PostalAddress', addressCountry: site.address.country,
    ...(site.address.locality && { addressLocality: site.address.locality }),
    ...(site.address.region && { addressRegion: site.address.region }),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': absUrl('/#website'), url: absUrl('/'), name: site.name, inLanguage: 'pt-BR',
        description: site.tagline, publisher: { '@id': org },
      },
      {
        '@type': 'WebApplication', '@id': absUrl('/#app'), url: absUrl('/'), name: site.name, applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Qualquer navegador moderno', inLanguage: 'pt-BR',
        description: `${site.tagline} ${films.length} filmes em ordem cronológica, contagem regressiva para a estreia em ${dotDate(finale.premiereAt)} e onde assistir no Brasil.`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        isAccessibleForFree: true, author: { '@id': org }, publisher: { '@id': org }, license: 'https://opensource.org/licenses/MIT',
        codeRepository: site.repo,
      },
      {
        '@type': 'Organization', '@id': org, name: site.name, url: absUrl('/'), logo: absUrl('/icon-512.png'),
        description: 'Projeto de fã, sem fins lucrativos e sem afiliação com a Marvel ou a Disney.',
        founder: { '@type': 'Person', name: site.author.name, url: site.author.url },
        sameAs: [site.author.url, site.repo],
        contactPoint: {
          '@type': 'ContactPoint', contactType: 'customer support', availableLanguage: ['pt-BR'],
          url: absUrl(infoPath('contact')), ...(site.email && { email: site.email }),
        },
        address,
      },
    ],
  };
}
