import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prefersMarkdown } from '@/lib/negotiate';

/**
 * Content negotiation (https://acceptmarkdown.com): the same URL answers HTML to browsers and Markdown to
 * agents that ask for `Accept: text/markdown`. The Markdown response carries `Vary: Accept` (set by its route).
 * Next owns the Vary header of its pages and overwrites any other value, so the HTML cannot add it; the two
 * never share a cache entry anyway, because this proxy runs before the cache and rewrites to another path.
 */
export function proxy(request: NextRequest) {
  const read = request.method === 'GET' || request.method === 'HEAD';
  if (!read || !prefersMarkdown(request.headers.get('accept'))) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/api/markdown${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

// pages only: not the API, Next's own files, or anything with an extension (icons, sitemap.xml, llms.txt, covers)
export const config = { matcher: ['/((?!api/|_next/|.*\\..*).*)'] };
