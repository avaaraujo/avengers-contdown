/**
 * Content negotiation for agents (https://acceptmarkdown.com): a request that asks for `text/markdown`
 * more than for `text/html` gets the Markdown twin of the page. Browsers send `text/html` first and
 * `*` wildcards, which never select Markdown.
 */
type Range = { type: string; q: number; at: number };

function parse(accept: string): Range[] {
  return accept.split(',').map((part, at) => {
    const [type, ...params] = part.trim().split(';');
    const qp = params.map(p => p.trim()).find(p => /^q\s*=/i.test(p));
    const q = qp ? Number.parseFloat(qp.split('=')[1]) : 1;
    return { type: type.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0, at };
  }).filter(r => r.type);
}

export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const ranges = parse(accept);
  const md = ranges.find(r => r.type === 'text/markdown');
  if (!md || md.q <= 0) return false;
  const html = ranges.find(r => r.type === 'text/html');
  if (!html) return true; // wildcards alone never select Markdown, but an explicit ask with no HTML rival does
  if (md.q !== html.q) return md.q > html.q;
  return md.at < html.at; // a tie goes to whichever the client listed first
}
