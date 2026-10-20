import test from 'node:test';
import assert from 'node:assert/strict';
import { prefersMarkdown } from '../src/lib/negotiate';

test('asks for markdown', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('Text/Markdown; charset=utf-8'), true);
  assert.equal(prefersMarkdown('text/markdown, */*;q=0.1'), true);
});

test('browsers and plain requests keep HTML', () => {
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown(''), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown('text/html'), false);
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'), false);
});

test('quality values and order decide between the two', () => {
  assert.equal(prefersMarkdown('text/html;q=0.5, text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown;q=0.5, text/html'), false);
  assert.equal(prefersMarkdown('text/markdown, text/html'), true, 'a tie goes to the one listed first');
  assert.equal(prefersMarkdown('text/html, text/markdown'), false);
  assert.equal(prefersMarkdown('text/markdown;q=0'), false, 'q=0 refuses it');
});
