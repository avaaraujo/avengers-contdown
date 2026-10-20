// Checks the agent-facing surface of a running site: node scripts/verify-agent-readiness.mjs [baseUrl]
// Needs the site running (npm run build && npm start -- -p 3100, then pass http://localhost:3100).
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
let failed = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `\n        ${detail}` : ''}`);
};
const get = (path, accept) => fetch(base + path, { headers: accept ? { Accept: accept } : {}, redirect: 'follow' });
const varies = res => res.headers.get('vary') ?? '';
const varyAccept = res => varies(res).split(',').some(t => t.trim().toLowerCase() === 'accept');
const textOf = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// 1. content without JavaScript
{
  const html = await (await get('/', 'text/html')).text();
  const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? '';
  const chars = textOf(main).length;
  check(chars >= 500, `home: ${chars} characters of text in <main> in the raw HTML (needs 500+)`);
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  check(h1 === 1, `home: exactly one <h1> (found ${h1})`);
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
  check(levels.every((l, i) => i === 0 || l <= levels[i - 1] + 1), `home: heading levels never skip (${levels.join(',')})`);
  // metadata
  check(/<link rel="canonical" href="[^"]+"/.test(html), 'home: <link rel="canonical">');
  check(/<html[^>]* lang="[^"]+"/.test(html), 'home: <html lang>');
  check(/<meta property="og:image" content="[^"]+"/.test(html), 'home: og:image');
  check(/<meta property="og:type" content="[^"]+"/.test(html), 'home: og:type');
  // JSON-LD
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const nodes = ld.flatMap(d => d['@graph'] ?? [d]);
  check(nodes.some(n => n['@type'] === 'WebApplication'), 'home JSON-LD: WebApplication');
  const org = nodes.find(n => n['@type'] === 'Organization');
  check(!!org?.contactPoint?.contactType && org?.address?.['@type'] === 'PostalAddress', 'home JSON-LD: Organization with contactPoint and PostalAddress');
}

// 2 + 3. Markdown negotiation
{
  const md = await get('/', 'text/markdown');
  const body = await md.text();
  check(md.status === 200 && (md.headers.get('content-type') ?? '').startsWith('text/markdown'), 'home with Accept: text/markdown -> 200 text/markdown', `${md.status} ${md.headers.get('content-type')}`);
  check(varyAccept(md),'markdown response has Vary: Accept', varies(md));
  check(body.startsWith('# ') && body.length > 500, `markdown body is non-empty Markdown (${body.length} chars)`);
  const html = await get('/', 'text/html');
  check((html.headers.get('content-type') ?? '').startsWith('text/html'), 'home with Accept: text/html -> HTML');
  // informational: Next owns the Vary header of its pages, and the proxy keeps the two variants on separate paths
  console.log(`INFO  html response Vary: ${varies(html)}${varyAccept(html) ? '' : ' (no Accept: Next overwrites it on pages; Markdown is rewritten to its own path before the cache)'}`);
  const head = await fetch(base + '/', { method: 'HEAD', headers: { Accept: 'text/markdown' } });
  check((head.headers.get('content-type') ?? '').startsWith('text/markdown'), 'HEAD with Accept: text/markdown -> text/markdown');
  const film = await get('/filme/thor', 'text/markdown');
  check(film.status === 200 && (await film.text()).startsWith('# Thor'), 'film page in Markdown');
}

// 2. agent-friendly 404
{
  const res = await get('/__ora-404-probe-0amiapmb', 'text/markdown');
  const body = await res.text();
  check(res.status === 404, 'unknown path with Accept: text/markdown -> HTTP 404', String(res.status));
  check((res.headers.get('content-type') ?? '').startsWith('text/markdown'), '404 body is text/markdown', res.headers.get('content-type') ?? '');
  check(body.length >= 20 && /\]\(https?:\/\/[^)]*(llms\.txt|sitemap\.xml)\)/.test(body), '404 body explains the error and links to llms.txt / sitemap');
  const html = await get('/__ora-404-probe-0amiapmb', 'text/html');
  check(html.status === 404 && (html.headers.get('content-type') ?? '').startsWith('text/html'), 'unknown path as HTML is still a 404 page');
}

// 6. llms.txt
{
  const res = await get('/llms.txt');
  const t = await res.text();
  check(res.status === 200 && t.startsWith('# '), 'llms.txt: 200 and starts with an H1');
  check(/^> /m.test(t), 'llms.txt: has the blockquote summary');
  check(/^## When to use this/m.test(t), 'llms.txt: has a "When to use this" section');
  const urls = [...t.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => new URL(m[1]).pathname);
  const sample = [...new Set(urls)].slice(0, 6);
  for (const p of sample) check((await get(p)).status === 200, `llms.txt link resolves: ${p}`);
}

// 8. trust pages
for (const p of ['/about', '/contact', '/privacy']) {
  const res = await get(p, 'text/html');
  const html = await res.text();
  const main = textOf(/<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? '');
  check(res.status === 200 && main.length >= 500, `${p}: 200 with ${main.length} characters of content (needs 500+)`);
  check(/<link rel="canonical"/.test(html), `${p}: canonical`);
}

// sitemap and robots
{
  const sm = await (await get('/sitemap.xml')).text();
  for (const p of ['/about', '/contact', '/privacy']) check(sm.includes(p + '</loc>'), `sitemap lists ${p}`);
  const robots = await (await get('/robots.txt')).text();
  check(/Sitemap: /i.test(robots), 'robots.txt points to the sitemap');
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
