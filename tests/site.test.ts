import test from 'node:test';
import assert from 'node:assert/strict';
import { llmsTxt } from '../src/lib/llms';
import { homeLd } from '../src/lib/structured';
import { INFO_PAGES, infoText } from '../src/lib/pages';
import { catalog } from './fixtures';

test('llms.txt follows the format and tells agents when to use the site', () => {
  const t = llmsTxt(catalog);
  assert.match(t, /^# Avengers Countdown\n\n> /);
  assert.match(t, /^## When to use this/m);
  assert.match(t, /Accept: text\/markdown/);
  assert.match(t, /^- \[1\. Filme 1\]\(https?:\/\/[^)]+\/filme\/filme-1\): /m);
  assert.match(t, /^## Optional$/m);
  assert.match(t, /\/about\)/);
});

test('home JSON-LD names the app and an Organization with contactPoint and address', () => {
  const ld = homeLd(catalog);
  type Node = { '@type': string; '@id': string; author?: { '@id': string }; contactPoint?: Record<string, string>; address?: Record<string, string> };
  const graph = ld['@graph'] as Node[];
  assert.deepEqual(graph.map(n => n['@type']), ['WebSite', 'WebApplication', 'Organization']);
  const org = graph[2];
  assert.equal(org.contactPoint?.['@type'], 'ContactPoint');
  assert.ok(org.contactPoint?.contactType);
  assert.equal(org.address?.['@type'], 'PostalAddress');
  assert.equal(org.address?.addressCountry, 'BR');
  assert.equal(graph[1].author?.['@id'], org['@id']);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
});

test('the trust pages exist at /about, /contact, /privacy with real content', () => {
  assert.deepEqual(INFO_PAGES.map(p => p.slug), ['about', 'contact', 'privacy']);
  for (const p of INFO_PAGES) assert.ok(infoText(p).length >= 500, `${p.slug} has at least 500 characters`);
});
