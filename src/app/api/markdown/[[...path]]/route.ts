import { connection } from 'next/server';
import { getCatalog } from '@/lib/catalog';
import { markdownFor } from '@/lib/markdown';

/**
 * The Markdown twin of every page. proxy.ts rewrites a request here when it asks for `Accept: text/markdown`;
 * an unknown path answers 404 with a Markdown body, so an agent that lands on a dead link still learns where to go.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  await connection(); // the countdown line depends on the current time
  const { path = [] } = await params;
  const { status, body } = markdownFor(`/${path.join('/')}`, await getCatalog(), Date.now());
  return new Response(`${body}\n`, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
