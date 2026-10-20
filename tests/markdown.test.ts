import test from 'node:test';
import assert from 'node:assert/strict';
import { countdownLine, markdownFor, notFoundMd } from '../src/lib/markdown';
import { progressCode } from '../src/lib/format';
import { catalog, PREMIERE } from './fixtures';

const DAY = 864e5;
const before = PREMIERE - 59 * DAY - 3600e3;

test('home: heading, countdown, the whole ordered list, links to the docs', () => {
  const { status, body } = markdownFor('/', catalog, before);
  assert.equal(status, 200);
  assert.match(body, /^# Avengers Countdown: maratona do MCU/);
  assert.match(body, /Faltam 59 dias, 1 hora e 0 minutos/);
  assert.match(body, /1\. \[Filme 1\]\(.*\/filme\/filme-1\)/);
  assert.match(body, /\[Vingadores: Doutor Destino\]\(.*\/filme\/avengers-doomsday\)/);
  assert.match(body, /\/llms\.txt/);
  assert.match(body, /\/sitemap\.xml/);
  assert.ok(body.length > 500);
});

test('film page: facts and where to watch', () => {
  const { status, body } = markdownFor('/filme/filme-1', catalog, before);
  assert.equal(status, 200);
  assert.match(body, /^# Filme 1/);
  assert.match(body, /Assinatura: Disney\+/);
  assert.match(body, /Aluguel: Apple TV \(R\$ 12,90\)/);
});

test('premiere page, extra page, shared progress and institutional pages exist', () => {
  assert.match(markdownFor('/filme/avengers-doomsday', catalog, before).body, /Faltam 59 dias/);
  assert.match(markdownFor('/extra/wandavision', catalog, before).body, /^# WandaVision/);
  const code = progressCode([1, 3], 3);
  assert.match(markdownFor(`/progresso/${code}`, catalog, before).body, /Um amigo viu 2 de 3 filmes/);
  for (const p of ['about', 'contact', 'privacy']) {
    const r = markdownFor(`/${p}`, catalog, before);
    assert.equal(r.status, 200, p);
    assert.ok(r.body.length > 500, `${p} has substance`);
  }
});

test('trailing slashes and query strings do not matter', () => {
  assert.equal(markdownFor('/filme/filme-2/?x=1', catalog, before).status, 200);
});

test('unknown paths answer 404 with an explanation and a way forward', () => {
  for (const p of ['/nada', '/filme/nao-existe', '/extra/x', '/progresso/zzzzzzzzzzzz', '/filme/filme-1/extra', '/%E0%A4%A']) {
    const r = markdownFor(p, catalog, before);
    assert.equal(r.status, 404, p);
    assert.ok(r.body.length >= 20);
    assert.match(r.body, /\]\(https?:\/\/[^)]*\/(llms\.txt|sitemap\.xml)\)/);
  }
  assert.ok(!notFoundMd('/a`b\nc').includes('a`b'), 'the path cannot break out of the code span');
});

test('countdown wording never says "0 dias"', () => {
  assert.match(countdownLine(catalog.finale, PREMIERE + 3600e3), /Hoje: .* estreia nos cinemas/);
  assert.match(countdownLine(catalog.finale, PREMIERE + 3 * DAY + 3600e3), /há 3 dias, desde 17\.12\.2026/);
  assert.match(countdownLine(catalog.finale, PREMIERE + DAY + 3600e3), /há 1 dia,/);
  assert.match(countdownLine(catalog.finale, PREMIERE - 3600e3 - 5 * 6e4), /^Faltam 1 hora e 5 minutos para/);
  assert.match(countdownLine(catalog.finale, PREMIERE - 30e3), /^Falta menos de 1 minuto para/);
  assert.doesNotMatch(countdownLine(catalog.finale, PREMIERE - 3600e3), /\b0 dias/);
});
