import { getCatalog } from '@/lib/catalog';
import { llmsTxt } from '@/lib/llms';

export async function GET() {
  return new Response(llmsTxt(await getCatalog()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
