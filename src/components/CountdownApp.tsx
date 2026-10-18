'use client';
/* eslint-disable @next/next/no-img-element -- small cover thumbnails in the HUD and list */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Catalog, Extra, Film } from '@/lib/types';
import { countdownParts, dec, dotDate, extraPath, filmPath, hm, pad, progressCode, thumb } from '@/lib/format';
import type { Rect, ShelfScene } from './shelf/ShelfScene';
import { ComicPage, Offers } from './ComicPage';
import { Check, Close } from './Burst';
import { useProgress } from './useProgress';
import { AuthPanel } from './AuthPanel';

type Phase = 'closed' | 'flying' | 'open' | 'closing';
const subscribeClock = (tick: () => void) => { const t = setInterval(tick, 1000); return () => clearInterval(t); };
const clockSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const insetFor = (r: Rect) =>
  `inset(${Math.max(0, r.t)}px ${Math.max(0, innerWidth - r.r)}px ${Math.max(0, innerHeight - r.b)}px ${Math.max(0, r.l)}px round 6px)`;

type Tab = 'films' | 'series' | 'xmen';

type Toast = { id: number; text: string; undo?: () => void };

export function CountdownApp({ catalog, initialN = null, initialExtra = null }: { catalog: Catalog; initialN?: number | null; initialExtra?: number | null }) {
  const { films, finale, extras } = catalog;
  const total = useMemo(() => films.reduce((a, f) => a + f.runtime, 0), [films]);
  const items = useMemo(() => [...films.map(f => ({ id: f.id, n: f.n })), ...extras.map(x => ({ id: x.id, n: x.key }))], [films, extras]);
  const progress = useProgress(items);
  const { watched, toggle: flip, reset, restore } = progress;
  const startExtra = extras.find(x => x.id === initialExtra) ?? null;

  // the clock only exists in the browser; the prerendered shell shows placeholders
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, () => null);
  const [trackH, setTrackH] = useState<number>(0);
  const [tag, setTag] = useState<{ n: number; x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('closed');
  const [pageN, setPageN] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(startExtra !== null);
  const [tab, setTab] = useState<Tab>(startExtra?.kind ?? 'films');
  const [openExtra, setOpenExtra] = useState<number | null>(startExtra?.id ?? null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [noWebgl, setNoWebgl] = useState(false);
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ShelfScene | null>(null);
  const pageRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const botRef = useRef<HTMLElement>(null);
  const handoffRect = useRef<Rect | null>(null);
  const markedInPage = useRef(false);
  const phaseRef = useRef<Phase>('closed');
  const go = useCallback((p: Phase) => { phaseRef.current = p; setPhase(p); }, []);
  const openDetailRef = useRef<(n: number) => void>(() => {});
  const initialDone = useRef(false);
  // focus goes back where it came from when a panel closes
  const returnFocus = useRef<HTMLElement | null>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const listCloseRef = useRef<HTMLButtonElement>(null);
  const authBtnRef = useRef<HTMLButtonElement>(null);
  const titled = useRef(false);

  const showToast = useCallback((text: string, undo?: () => void) => setToast({ id: Date.now(), text, undo }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  /* offline and installable: the service worker only runs in production builds */
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => { /* the site works without it */ });
  }, []);

  const nextFilm = films.find(f => !watched.has(f.n)) ?? null;

  /* the 3D shelf (client only, loaded on demand) */
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current!;
    import('./shelf/ShelfScene').then(({ ShelfScene }) => {
      if (disposed) return;
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { setNoWebgl(true); setReady(true); return; }
      const scene = new ShelfScene(canvas,
        films.map(f => ({ n: f.n, title: f.title, year: f.year, runtime: f.runtime, cover: f.cover })),
        { n: finale.n, title: finale.title, cover: finale.cover, premiereAt: finale.premiereAt },
        {
          onReady: () => setReady(true),
          onHover: (n, x, y) => setTag(prev => (n === null ? (prev ? null : prev) : prev?.n === n && prev.x === x && prev.y === y ? prev : { n, x, y })),
          onPick: n => openDetailRef.current(n),
          onHandoff: (n, rect) => { handoffRect.current = rect; setPageN(n); go('open'); },
          onTrackHeight: px => setTrackH(px),
        });
      sceneRef.current = scene;
      // dev-only testing aid: step the animation where requestAnimationFrame is throttled
      if (process.env.NODE_ENV !== 'production') (window as unknown as { __ac?: unknown }).__ac = { settle: (f?: number) => scene.settle(f) };
    });
    return () => { disposed = true; sceneRef.current?.dispose(); sceneRef.current = null; };
  }, [films, finale, go]);

  /* keep the scene in sync with progress and the HUD's size */
  useEffect(() => { sceneRef.current?.setWatched(watched, nextFilm?.n ?? null); }, [watched, nextFilm, ready]);
  useEffect(() => {
    if (!ready) return;
    const measure = () => sceneRef.current?.setInsets(topRef.current?.offsetHeight ?? 0, botRef.current?.offsetHeight ?? 0);
    measure();
    const ro = new ResizeObserver(measure);
    if (topRef.current) ro.observe(topRef.current);
    if (botRef.current) ro.observe(botRef.current);
    return () => ro.disconnect();
  }, [ready]);

  /* opening and closing the comic page */
  const pathOf = useCallback((n: number) => filmPath(n === finale.n ? finale.slug : films[n - 1].slug), [films, finale]);
  const openDetail = useCallback((n: number, fromHistory = false) => {
    setListOpen(false);
    const p = phaseRef.current;
    if (p === 'open') {
      if (pageN === n) return;
      sceneRef.current?.goTo(n); setPageN(n); pageRef.current?.scrollTo(0, 0);
      if (!fromHistory) history.replaceState(history.state, '', pathOf(n));
      return;
    }
    if (p !== 'closed') return;
    if (!fromHistory && location.pathname !== pathOf(n)) history.pushState({ ac: 1 }, '', pathOf(n));
    returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setAuthOpen(false);
    markedInPage.current = false;
    setTag(null);
    go('flying');
    if (sceneRef.current) sceneRef.current.open(n);
    else { handoffRect.current = { l: innerWidth / 2, r: innerWidth / 2, t: innerHeight / 2, b: innerHeight / 2 }; setPageN(n); go('open'); }
  }, [go, pathOf, pageN]);
  useEffect(() => { openDetailRef.current = n => openDetail(n); }, [openDetail]);

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (phase !== 'open' || !el || !handoffRect.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.transition = 'none';
    el.style.clipPath = insetFor(handoffRect.current);
    el.getBoundingClientRect();
    el.style.transition = reduce ? 'none' : 'clip-path .6s cubic-bezier(.7,0,.2,1)';
    el.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
    el.scrollTop = 0;
    handoffRect.current = null;
    (el.querySelector('[data-autofocus]') as HTMLElement | null)?.focus({ preventScroll: true });
  }, [phase]);

  const closeDetail = useCallback((fromHistory = false) => {
    if (phaseRef.current !== 'open') return;
    if (!fromHistory) {
      // we pushed the film's entry: going back closes it (popstate lands here again); a deep link just rewrites the URL
      if ((history.state as { ac?: number } | null)?.ac) { history.back(); return; }
      history.replaceState(history.state, '', '/');
    }
    const el = pageRef.current!;
    const rect = sceneRef.current?.beginClose() ?? { l: innerWidth / 2, r: innerWidth / 2, t: innerHeight / 2, b: innerHeight / 2 };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    go('closing');
    el.style.transition = reduce ? 'none' : 'clip-path .45s cubic-bezier(.7,0,.2,1)';
    el.style.clipPath = insetFor(rect);
    setTimeout(() => {
      const n = pageN;
      sceneRef.current?.release();
      go('closed');
      if (markedInPage.current && n !== null) sceneRef.current?.popStamp(n);
    }, reduce ? 0 : 460);
  }, [pageN, go]);

  useEffect(() => {
    if (phase !== 'closed' || !returnFocus.current) return;
    const el = returnFocus.current;
    returnFocus.current = null;
    el.focus({ preventScroll: true });
    // opened from the list, which has closed since: land on the button that opens it
    if (document.activeElement !== el && el.closest('#list')) listBtnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const closeList = useCallback(() => {
    setListOpen(false);
    if (location.pathname.startsWith('/extra/')) history.replaceState(history.state, '', '/');
    listBtnRef.current?.focus({ preventScroll: true });
  }, []);
  const closeAuth = useCallback(() => { setAuthOpen(false); authBtnRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (listOpen && !startExtra) listCloseRef.current?.focus({ preventScroll: true }); }, [listOpen, startExtra]);

  /* deep link on load, and the browser's back/forward buttons */
  const nFromPath = useCallback((path: string) => {
    const m = /^\/filme\/([^/]+)\/?$/.exec(path);
    if (!m) return null;
    return m[1] === finale.slug ? finale.n : films.find(f => f.slug === m[1])?.n ?? null;
  }, [films, finale]);
  useEffect(() => {
    if (!ready || initialDone.current) return;
    initialDone.current = true;
    if (initialN !== null) queueMicrotask(() => openDetail(initialN, true));
  }, [ready, initialN, openDetail]);
  useEffect(() => {
    const onPop = () => {
      const n = nFromPath(location.pathname);
      if (n === null) closeDetail(true); else openDetail(n, true);
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [closeDetail, openDetail, nFromPath]);
  useEffect(() => {
    const t = pageN === null || phase === 'closed' ? null : pageN === finale.n ? finale.title : films[pageN - 1]?.title;
    // leave the server's title alone (extras, shared progress) until a comic has been opened
    if (!t && !titled.current) return;
    titled.current = true;
    document.title = t ? `${t} · Avengers Countdown` : 'Avengers Countdown';
  }, [pageN, phase, films, finale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (phaseRef.current === 'open') closeDetail(); else if (authOpen) closeAuth(); else if (listOpen) closeList(); }
      if (phaseRef.current !== 'open' || pageN === null) return;
      if (e.key === 'ArrowRight' && pageN < finale.n) openDetail(pageN + 1);
      if (e.key === 'ArrowLeft' && pageN > 1) openDetail(pageN - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [closeDetail, openDetail, pageN, finale.n, authOpen, listOpen, closeAuth, closeList]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('page-open', phase === 'open' || phase === 'closing');
    root.classList.toggle('page-busy', phase !== 'closed');
  }, [phase]);

  const toggle = useCallback((n: number) => {
    const becomesSeen = flip(n);
    if (phaseRef.current === 'closed') { if (becomesSeen) sceneRef.current?.popStamp(n); }
    else markedInPage.current = becomesSeen;
    return becomesSeen;
  }, [flip]);
  /** marking from the HUD or the list is one tap, so it gets an undo */
  const toggleWithUndo = useCallback((t: Film | Extra, n: number) => {
    const on = toggle(n);
    showToast(on ? `${t.title}: visto.` : `${t.title}: desmarcado.`, () => toggle(n));
  }, [toggle, showToast]);
  const resetWithUndo = useCallback(() => {
    const before = reset();
    if (before.watched.size) showToast('Progresso zerado.', () => restore(before));
  }, [reset, restore, showToast]);
  const expandExtra = useCallback((x: Extra | null) => {
    setOpenExtra(x?.id ?? null);
    history.replaceState(history.state, '', x ? extraPath(x.slug) : '/');
  }, []);

  /* share: a link whose social card shows which comics are in color */
  const share = useCallback(async () => {
    const seen = films.filter(f => watched.has(f.n)).length;
    const url = `${location.origin}/progresso/${progressCode(watched, films.length)}`;
    const text = `Já vi ${seen} de ${films.length} filmes da maratona do MCU antes de ${finale.title}.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Avengers Countdown', text, url }); } catch { /* the share sheet was dismissed */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); showToast('Link copiado. É só colar onde quiser.'); }
    catch { showToast(url); }
  }, [films, watched, finale.title, showToast]);

  /* numbers */
  const seenFilms = films.filter(f => watched.has(f.n));
  const seenMin = seenFilms.reduce((a, f) => a + f.runtime, 0);
  const leftMin = total - seenMin, leftFilms = films.length - seenFilms.length;
  const released = now !== null && now >= finale.premiereAt;
  const sinceDays = released ? Math.floor((now - finale.premiereAt) / 864e5) : 0;
  const cd = now === null ? null : countdownParts(finale.premiereAt, now);
  const days = now === null ? null : Math.max((finale.premiereAt - now) / 864e5, 0.01);
  let pace = '—', paceK = 'filmes por dia';
  if (days !== null) {
    const perDay = leftFilms / days;
    if (released) { pace = 'Em cartaz'; paceK = leftFilms === 0 ? 'e você estava pronto' : 'a maratona segue, sem pressa'; }
    else if (leftFilms === 0) { pace = 'Pronto'; paceK = 'para a estreia'; }
    else if (perDay < 1) { pace = `1 a cada ${dec(1 / perDay, 0)}`; paceK = `dias · ${hm(leftMin / days)} por dia`; }
    else { pace = dec(perDay); paceK = `filmes por dia · ${hm(leftMin / days)}`; }
  }
  const tagFilm = tag ? (tag.n === finale.n ? null : films[tag.n - 1]) : null;
  // while the comic page is up, everything behind it is out of reach for keyboard and screen readers
  const behind = phase !== 'closed';

  return (
    <div className={noWebgl ? 'no-webgl' : undefined}>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <div id="track" style={{ height: trackH || undefined }} />

      <header className="hud-top" ref={topRef} inert={behind}>
        <div className="brand" data-ui>
          <span>Avengers <b>Countdown</b></span>
          <nav style={{ display: 'flex', gap: 6 }}>
            <button className="chip" ref={listBtnRef} onClick={() => (listOpen ? closeList() : setListOpen(true))} aria-controls="list" aria-expanded={listOpen}>Lista</button>
            <button className="chip" ref={authBtnRef} onClick={() => (authOpen ? closeAuth() : setAuthOpen(true))} aria-expanded={authOpen} aria-controls="auth">
              {progress.user ? 'Conta' : 'Entrar'}
            </button>
          </nav>
        </div>
        <div className="count" data-ui>
          <div className="days num">{released ? sinceDays : cd ? cd.d : '--'}</div>
          <div className="rest">
            <div className="unit">{released && sinceDays === 1 ? 'dia' : 'dias'}</div>
            <div className="clock num">{released ? 'Nos cinemas' : cd ? `${pad(cd.h)}:${pad(cd.m)}:${pad(cd.s)}` : '--:--:--'}</div>
            {released
              ? <div className="to"><strong>{finale.title}</strong> estreou<br />no Brasil · {dotDate(finale.premiereAt)}</div>
              : <div className="to">até <strong>{finale.title}</strong><br />estreia no Brasil · {dotDate(finale.premiereAt)}</div>}
            {finale.ticketsUrl && <a className="tickets" href={finale.ticketsUrl} target="_blank" rel="noopener">Comprar ingresso</a>}
          </div>
        </div>
        <div className={`next${nextFilm ? '' : ' done'}`} data-ui>
          {nextFilm ? (
            <>
              <img src={thumb(nextFilm.cover)} alt="" />
              <div className="label">Próximo · Nº {nextFilm.n}</div>
              <div className="t">{nextFilm.title}</div>
              <div className="actions">
                <button className="btn btn-ink" onClick={() => toggleWithUndo(nextFilm, nextFilm.n)}>Marcar como visto</button>
                <button className="btn btn-ghost" onClick={() => openDetail(nextFilm.n)}>Abrir o gibi</button>
              </div>
            </>
          ) : (
            <>
              <img src={thumb(finale.cover)} alt="" />
              <div className="label">Maratona completa</div>
              <div className="t">{released ? 'Hora de ver o Doutor Destino no cinema.' : 'Você está pronto para o Doutor Destino.'}</div>
              <div className="actions"><button className="btn btn-ink" onClick={() => openDetail(finale.n)}>Ver a última edição</button></div>
            </>
          )}
        </div>
      </header>

      <footer className="hud-bottom" ref={botRef} inert={behind}>
        <div className="stats" data-ui>
          <div className="stat"><div className="v num">{hm(seenMin)}</div><div className="k">assistidas</div></div>
          <div className="stat"><div className="v num">{hm(leftMin)}</div><div className="k">faltam</div></div>
          <div className="stat"><div className="v num">{leftFilms}</div><div className="k">{leftFilms === 1 ? 'filme pela frente' : 'filmes pela frente'}</div></div>
          <div className="stat pace"><div className="v num">{pace}</div><div className="k">{paceK}</div></div>
        </div>
        <div className="bar" data-ui>
          <div className="track" role="progressbar" aria-label="Progresso da maratona" aria-valuemin={0} aria-valuemax={films.length} aria-valuenow={seenFilms.length}>
            <div className="fill" style={{ width: `${(seenMin / total) * 100}%` }} />
          </div>
          <div className="pct num">{seenFilms.length} de {films.length}</div>
          {seenFilms.length > 0 && <button className="chip share" onClick={() => void share()}>Compartilhar</button>}
        </div>
        <div className="demo" data-ui role="status">
          {progress.error
            ? <span className="err">{progress.error}</span>
            : progress.user
              ? <span>Progresso salvo na sua conta.</span>
              : <span>Seu progresso fica salvo neste navegador. <button onClick={() => setAuthOpen(true)}>Entre</button> para levar para qualquer aparelho.</span>}
          {watched.size > 0 && <button onClick={resetWithUndo}>Zerar</button>}
        </div>
      </footer>

      {tag && phase === 'closed' && (
        <div id="tag" className="on" style={{ left: tag.x, top: tag.y }}>
          Nº {tag.n} · {tagFilm ? tagFilm.title : finale.title}
          <small>{tagFilm ? `${tagFilm.year} · ${hm(tagFilm.runtime)}` : dotDate(finale.premiereAt)}</small>
        </div>
      )}

      <AuthPanel open={authOpen} onClose={closeAuth} user={progress.user} signIn={progress.signIn} signOut={progress.signOut} />

      <section id="page" ref={pageRef} role="dialog" aria-modal="true" aria-labelledby="cp-title"
        className={phase === 'open' || phase === 'closing' ? `open${phase === 'open' ? ' shown' : ''}` : undefined} data-ui>
        {pageN !== null && phase !== 'closed' && phase !== 'flying' && (
          <ComicPage n={pageN} films={films} finale={finale} watched={watched} now={now} offersCheckedAt={catalog.offersCheckedAt}
            onToggle={toggle} onClose={() => closeDetail()} onGo={n => openDetail(n)} />
        )}
      </section>

      <nav id="list" className={listOpen ? 'open' : undefined} aria-label="Todos os filmes em ordem cronológica" data-ui inert={behind || (!listOpen && !noWebgl)}>
        <header>
          <h2>Ordem cronológica</h2>
          <button className="icon-btn" ref={listCloseRef} onClick={closeList} aria-label="Fechar lista"><Close /></button>
        </header>
        <div className="tabs" role="tablist" aria-label="Seções da lista">
          {([['films', 'Maratona', films.length], ['series', 'Séries', extras.filter(x => x.kind === 'series').length], ['xmen', 'X-Men', extras.filter(x => x.kind === 'xmen').length]] as const)
            .filter(([k, , c]) => k === 'films' || c > 0)
            .map(([k, label, c]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : undefined} onClick={() => setTab(k)}>{label} <small>{c}</small></button>
            ))}
        </div>
        {tab !== 'films' && (
          <ul className="extras">
            <li className="extras-note">Extras ficam fora da conta do countdown: são para quem quer ir além da fila principal.</li>
            {extras.filter(x => x.kind === tab).map(x => {
              const seen = watched.has(x.key), isOpen = openExtra === x.id;
              return (
                <li key={x.id} className={isOpen ? 'open' : undefined}>
                  <div className="xrow">
                    <button className="xhead" aria-expanded={isOpen} onClick={() => expandExtra(isOpen ? null : x)}>
                      <span className="lt">{x.title}<small>{x.year} · {x.runtime ? hm(x.runtime) : x.note}</small></span>
                    </button>
                    <button className={`xcheck${seen ? ' seen' : ''}`} aria-pressed={seen} aria-label={`${seen ? 'Desmarcar' : 'Marcar como visto'}: ${x.title}`} onClick={() => toggleWithUndo(x, x.key)}>
                      <span className="ck"><Check /></span>
                    </button>
                  </div>
                  {isOpen && (
                    <div className="xbody">
                      <p>{x.synopsis}</p>
                      <p className="xmeta">{x.kind === 'series' ? 'Criação' : 'Direção'}: {x.director ?? '—'}{x.runtime && x.note ? ` · ${x.note}` : ''}{x.runtime ? '' : x.note ? ` · ${x.note}` : ''}</p>
                      <div className="where">
                        <Offers offers={x.offers} empty={catalog.tmdb ? 'Não está em nenhum streaming no Brasil agora.' : 'Streaming ainda sem dados para este título.'} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <ol hidden={tab !== 'films'}>
          {films.map(f => (
            <li key={f.n}>
              <button className={watched.has(f.n) ? 'seen' : undefined} onClick={() => openDetail(f.n)}
                aria-label={`Nº ${f.n}, ${f.title}, ${watched.has(f.n) ? 'visto' : 'não visto'}`}>
                <span className="n num">{pad(f.n)}</span>
                <img src={thumb(f.cover)} alt="" loading="lazy" />
                <span className="lt">{f.title}<small>{f.year} · {hm(f.runtime)}</small></span>
                <span className="ck"><Check /></span>
              </button>
            </li>
          ))}
        </ol>
        <p className="credit">
          Capas: Marvel Database. Streaming: JustWatch{catalog.tmdb ? ' via TMDB. Este produto usa a API do TMDB, mas não é endossado nem certificado por ele' : ''}.
        </p>
      </nav>

      <div className="toast-slot" role="status" aria-live="polite">
        {toast && !behind && (
          <div className="toast" key={toast.id}>
            <span>{toast.text}</span>
            {toast.undo && <button onClick={() => { toast.undo!(); setToast(null); }}>Desfazer</button>}
          </div>
        )}
      </div>

      <div id="loading" className={ready ? 'gone' : undefined}>Arrumando a estante…</div>
    </div>
  );
}
