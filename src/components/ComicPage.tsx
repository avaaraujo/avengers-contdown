/* eslint-disable @next/next/no-img-element -- comic covers and provider logos are small fixed assets */
import { useRef, useState } from 'react';
import type { Film, Finale, Offer, OfferKind } from '@/lib/types';
import { countdownParts, dotDate, hm, longDate, pad, saga } from '@/lib/format';
import { ArrowLeft, ArrowRight, BackArrow, Burst } from './Burst';

const OFFER_LABEL: Record<OfferKind, string> = { flatrate: 'Assinatura', free: 'Grátis', ads: 'Com anúncios', rent: 'Aluguel', buy: 'Compra' };
const ORDER: OfferKind[] = ['flatrate', 'free', 'ads', 'rent', 'buy'];
const TILT = [-2, 1.5, -1, 2];

/** "Thor" and "THOR" are the same title: the English line is only worth showing when it adds something */
const plain = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

function titleLines(title: string): [string, string] {
  const i = title.indexOf(':');
  return i > 0 ? [title.slice(0, i + 1), title.slice(i + 1).trim()] : [title, ''];
}

export function Offers({ offers, empty = 'Este filme não está em nenhum streaming no Brasil agora.' }: { offers: Offer[]; empty?: string }) {
  if (!offers.length) return <p className="none">{empty}</p>;
  let k = 0;
  return (
    <>
      {ORDER.filter(kind => offers.some(o => o.kind === kind)).map(kind => (
        <div className="grp" key={kind}>
          <b>{OFFER_LABEL[kind]}</b>
          {offers.filter(o => o.kind === kind).map(o => (
            <span className="sticker" key={o.providerKey} style={{ '--r': `${TILT[k++ % 4]}deg` } as React.CSSProperties}>
              {o.logo && <img src={o.logo} alt="" loading="lazy" width={30} height={30} />}
              {o.name}
              {o.price && <small>{o.price.replace(/^([\d,]+) R\$$/, 'R$ $1')}</small>}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

type Props = {
  n: number;
  films: Film[];
  finale: Finale;
  watched: Set<number>;
  now: number | null;
  offersCheckedAt: string | null;
  /** looking at a friend's shelf: read-only, with a way back to one's own */
  /** the Nº of the issue before and after this one in the order the shelf is showing (null at the ends) */
  prevN: number | null;
  nextN: number | null;
  friend?: boolean;
  onLeaveFriend?(): void;
  onToggle(n: number): void;
  onClose(): void;
  onGo(n: number): void;
};

/** The detail screen: one full comic-book page for the issue. */
export function ComicPage({ n, films, finale, watched, now, offersCheckedAt, prevN, nextN, friend, onLeaveFriend, onToggle, onClose, onGo }: Props) {
  const powRef = useRef<HTMLButtonElement>(null);
  // the issue marked during this visit gets "Desfazer"; one that was already seen gets "Desmarcar"
  const [markedHere, setMarkedHere] = useState<number | null>(null);
  const c = now === null ? null : countdownParts(finale.premiereAt, now);
  const released = now !== null && now >= finale.premiereAt;
  const sinceDays = released ? Math.floor((now - finale.premiereAt) / 864e5) : 0;
  const seenCount = films.filter(f => watched.has(f.n)).length;
  const upNext = films.find(f => !watched.has(f.n)) ?? null;
  const top = (
    <div className="cp-top panel">
      <button className="back" onClick={onClose} data-autofocus aria-label="Voltar para a estante">
        <BackArrow /><span className="full" aria-hidden="true">Voltar para a estante</span><span className="short" aria-hidden="true">Voltar</span>
      </button>
      <div className="mast lettering" aria-hidden="true"><span className="a">Avengers</span><span className="b">Countdown</span></div>
      <div className="burst days-burst lettering"><Burst points={13} inner={0.62} seed={3} /><span>{n === finale.n ? dotDate(finale.premiereAt) : released ? (sinceDays === 0 ? 'Hoje!' : 'Estreou!') : c ? (c.d === 0 ? 'Hoje!' : `${c.d} ${c.d === 1 ? 'dia' : 'dias'}!`) : '…'}</span></div>
    </div>
  );

  if (n === finale.n) {
    const [l1, l2] = titleLines(finale.title);
    const last = prevN ? films[prevN - 1] : films[films.length - 1];
    return (
      <div className="cp">
        {top}
        <div className="cp-splash panel">
          <img src={finale.cover} alt={`Capa de ${finale.comic}`} />
          <div className="issue-box">Nº {finale.n}</div>
          <div className="splash-text">
            <h2 id="cp-title" className="lettering" tabIndex={-1}><span className="l1">{l1}</span>{l2 && <span className="l2">{l2}</span>}</h2>
            {plain(finale.en) !== plain(finale.title) && <p className="en" aria-hidden="true">{finale.en}</p>}
          </div>
        </div>
        <div className="cp-col">
          <div className="caption panel"><span className="phase">A estreia</span><p>{finale.synopsis} {released ? 'Já está em cartaz nos cinemas.' : 'Até lá, termine a maratona.'}</p></div>
          <div className="ficha panel">
            <div className="tag"><div className="burst lettering"><Burst seed={7} /><span>Ficha<br />técnica</span></div></div>
            <dl>
              <div><dt>Estreia</dt><dd className="red">{longDate(finale.premiereAt)}</dd></div>
              <div><dt>Gibi na estante</dt><dd>{finale.comic}</dd></div>
              <div><dt>Maratona</dt><dd>{seenCount} de {films.length} filmes vistos</dd></div>
            </dl>
          </div>
          <div className="action panel halftone-red" style={{ gridTemplateColumns: '1fr' }}>
            <div className="finale-count">
              {released ? (sinceDays === 0 ? 'Hoje' : 'Em cartaz') : c ? (c.d === 0 ? 'Hoje' : `${c.d} ${c.d === 1 ? 'dia' : 'dias'}`) : '…'}
              <small>{released ? (sinceDays === 0 ? 'estreia nos cinemas' : `estreou há ${sinceDays} ${sinceDays === 1 ? 'dia' : 'dias'}`) : c ? `${pad(c.h)}h ${pad(c.m)}min até a estreia` : ''}</small>
            </div>
            {finale.ticketsUrl && <a className="cp-tickets" href={finale.ticketsUrl} target="_blank" rel="noopener">Comprar ingresso</a>}
          </div>
          <div className="marathon panel">
            <h3 className="lettering">Sua maratona</h3>
            <p>{seenCount === films.length ? `Maratona completa: ${seenCount} de ${films.length}. ${released ? 'Hora de ver no cinema.' : 'Você está pronto para a estreia.'}` : `Você viu ${seenCount} de ${films.length} filmes antes da estreia.`}</p>
            <div className="mbar" role="progressbar" aria-label="Progresso da maratona" aria-valuemin={0} aria-valuemax={films.length} aria-valuenow={seenCount}><div style={{ width: `${(seenCount / films.length) * 100}%` }} /></div>
            {upNext && <button className="cp-cta" onClick={() => onGo(upNext.n)}>Ir para o Nº {upNext.n}: {upNext.title}</button>}
          </div>
        </div>
        <nav className="cp-nav" aria-label="Edições">
          <button onClick={() => onGo(last.n)}><ArrowLeft /><span><small>Edição anterior:</small><strong>{last.title}</strong></span></button>
          <button disabled aria-hidden="true" />
        </nav>
      </div>
    );
  }

  const f = films[n - 1], seen = watched.has(n), prev = prevN ? films[prevN - 1] : undefined, next = nextN && nextN !== finale.n ? films[nextN - 1] : undefined;
  const [l1, l2] = titleLines(f.title);
  const checked = offersCheckedAt ? new Date(offersCheckedAt).toLocaleDateString('pt-BR') : null;
  return (
    <div className="cp">
      {top}
      <div className="cp-splash panel">
        <img src={f.cover} alt={`Capa de ${f.comic}`} />
        <div className="issue-box">Nº {n}</div>
        <div className="splash-text">
          <h2 id="cp-title" className="lettering" tabIndex={-1}><span className="l1">{l1}</span>{l2 && <span className="l2">{l2}</span>}</h2>
          {plain(f.en) !== plain(f.title) && <p className="en" aria-hidden="true">{f.en}</p>}
        </div>
      </div>
      <div className="cp-col">
        <div className="caption panel"><span className="phase">Fase {f.phase}</span><p>{f.synopsis}</p></div>
        <div className="ficha panel">
          <div className="tag"><div className="burst lettering"><Burst seed={n} /><span>Ficha<br />técnica</span></div></div>
          <dl>
            <div><dt>Ano</dt><dd className="red">{f.year}</dd></div>
            <div><dt>Duração</dt><dd>{hm(f.runtime)}</dd></div>
            <div><dt>Fase</dt><dd><span className="red">{f.phase}</span> · {saga(f.phase)}</dd></div>
            <div><dt>Direção</dt><dd>{f.director ?? '—'}</dd></div>
            <div><dt>Gibi na estante</dt><dd>{f.comic}</dd></div>
          </dl>
        </div>
        <div className="where panel">
          <h3 className="lettering">Onde assistir no Brasil</h3>
          <Offers offers={f.offers} />
          <p className="src">Dados de streaming: JustWatch{checked ? `, ${checked}` : ''}.</p>
        </div>
        <div className="action panel halftone-red">
          {friend ? (
            <div className="friend-note">
              <p>Você está vendo a estante do seu amigo. {seen ? 'Ele já viu este filme.' : 'Ele ainda não viu este filme.'}</p>
              <button className="undo" onClick={onLeaveFriend}>Voltar para a minha</button>
            </div>
          ) : (
          <div>
            <button ref={powRef} className={`pow burst lettering${seen ? ' seen' : ''}`} aria-pressed={seen}
              onClick={() => { const on = !seen; onToggle(n); setMarkedHere(on ? n : null); }}>
              <Burst points={18} inner={0.66} seed={n + 2} fill={seen ? '#ffffff' : '#f7c600'} />
              <span>{seen ? 'Visto!' : 'Marcar como visto!'}</span>
            </button>
            {seen && <button className="undo" onClick={() => { onToggle(n); setMarkedHere(null); powRef.current?.focus({ preventScroll: true }); }}>{markedHere === n ? 'Desfazer' : 'Desmarcar'}</button>}
          </div>
          )}
          <div className="balloon"><b>Nº <em>{n}</em> de {films.length}</b><small>na ordem cronológica</small></div>
        </div>
      </div>
      <nav className="cp-nav" aria-label="Edições">
        <button onClick={() => prev && onGo(prev.n)} disabled={!prev}>
          <ArrowLeft /><span><small>Edição anterior:</small><strong>{prev?.title ?? ''}</strong></span>
        </button>
        <button onClick={() => onGo(next ? next.n : finale.n)}>
          {next
            ? <span><small>Próxima edição:</small><strong>{next.title}</strong></span>
            : <span><small>Última edição:</small><strong>{finale.title}</strong></span>}
          <ArrowRight />
        </button>
      </nav>
    </div>
  );
}
