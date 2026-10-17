'use client';
/* eslint-disable @next/next/no-img-element -- small cover thumbnails in the HUD and list */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Catalog } from '@/lib/types';
import { countdownParts, dec, hm, pad } from '@/lib/format';
import type { Rect, ShelfScene } from './shelf/ShelfScene';
import { ComicPage } from './ComicPage';
import { Check, Close } from './Burst';
import { useProgress } from './useProgress';
import { AuthPanel } from './AuthPanel';

type Phase = 'closed' | 'flying' | 'open' | 'closing';
const subscribeClock = (tick: () => void) => { const t = setInterval(tick, 1000); return () => clearInterval(t); };
const clockSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const insetFor = (r: Rect) =>
  `inset(${Math.max(0, r.t)}px ${Math.max(0, innerWidth - r.r)}px ${Math.max(0, innerHeight - r.b)}px ${Math.max(0, r.l)}px round 6px)`;

export function CountdownApp({ catalog }: { catalog: Catalog }) {
  const { films, finale } = catalog;
  const total = useMemo(() => films.reduce((a, f) => a + f.runtime, 0), [films]);
  const progress = useProgress(films);
  const { watched } = progress;

  // the clock only exists in the browser; the prerendered shell shows placeholders
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, () => null);
  const [trackH, setTrackH] = useState<number>(0);
  const [tag, setTag] = useState<{ n: number; x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('closed');
  const [pageN, setPageN] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
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
  const openDetail = useCallback((n: number) => {
    setListOpen(false);
    const p = phaseRef.current;
    if (p === 'open') { sceneRef.current?.goTo(n); setPageN(n); pageRef.current?.scrollTo(0, 0); return; }
    if (p !== 'closed') return;
    markedInPage.current = false;
    setTag(null);
    go('flying');
    if (sceneRef.current) sceneRef.current.open(n);
    else { handoffRect.current = { l: innerWidth / 2, r: innerWidth / 2, t: innerHeight / 2, b: innerHeight / 2 }; setPageN(n); go('open'); }
  }, [go]);
  useEffect(() => { openDetailRef.current = openDetail; }, [openDetail]);

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

  const closeDetail = useCallback(() => {
    if (phaseRef.current !== 'open') return;
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (phaseRef.current === 'open') closeDetail(); else { setListOpen(false); setAuthOpen(false); } }
      if (phaseRef.current !== 'open' || pageN === null) return;
      if (e.key === 'ArrowRight' && pageN < finale.n) openDetail(pageN + 1);
      if (e.key === 'ArrowLeft' && pageN > 1) openDetail(pageN - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [closeDetail, openDetail, pageN, finale.n]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('page-open', phase === 'open' || phase === 'closing');
    root.classList.toggle('page-busy', phase !== 'closed');
  }, [phase]);

  const toggle = useCallback((n: number) => {
    const becomesSeen = !watched.has(n);
    void progress.toggle(n);
    if (phaseRef.current === 'closed') { if (becomesSeen) sceneRef.current?.popStamp(n); }
    else markedInPage.current = becomesSeen;
  }, [watched, progress]);

  /* numbers */
  const seenMin = films.filter(f => watched.has(f.n)).reduce((a, f) => a + f.runtime, 0);
  const leftMin = total - seenMin, leftFilms = films.length - watched.size;
  const cd = now === null ? null : countdownParts(finale.premiereAt, now);
  const days = now === null ? null : Math.max((finale.premiereAt - now) / 864e5, 0.01);
  let pace = '—', paceK = 'filmes por dia';
  if (days !== null) {
    const perDay = leftFilms / days;
    if (leftFilms === 0) { pace = 'Pronto'; paceK = 'para a estreia'; }
    else if (perDay < 1) { pace = `1 a cada ${dec(1 / perDay, 0)}`; paceK = `dias · ${hm(leftMin / days)} por dia`; }
    else { pace = dec(perDay); paceK = `filmes por dia · ${hm(leftMin / days)}`; }
  }
  const tagFilm = tag ? (tag.n === finale.n ? null : films[tag.n - 1]) : null;

  return (
    <div className={noWebgl ? 'no-webgl' : undefined}>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <div id="track" style={{ height: trackH || undefined }} />

      <header className="hud-top" ref={topRef}>
        <div className="brand" data-ui>
          <span>Avengers <b>Countdown</b></span>
          <nav style={{ display: 'flex', gap: 6 }}>
            <button className="chip" onClick={() => setListOpen(o => !o)} aria-controls="list" aria-expanded={listOpen}>Lista</button>
            <button className="chip" onClick={() => setAuthOpen(o => !o)} aria-expanded={authOpen} aria-controls="auth">
              {progress.user ? 'Conta' : 'Entrar'}
            </button>
          </nav>
        </div>
        <div className="count" data-ui>
          <div className="days num">{cd ? cd.d : '--'}</div>
          <div className="rest">
            <div className="unit">dias</div>
            <div className="clock num">{cd ? `${pad(cd.h)}:${pad(cd.m)}:${pad(cd.s)}` : '--:--:--'}</div>
            <div className="to">até <strong>{finale.title}</strong><br />estreia no Brasil · 17.12.2026</div>
          </div>
        </div>
        <div className={`next${nextFilm ? '' : ' done'}`} data-ui>
          {nextFilm ? (
            <>
              <img src={nextFilm.cover} alt="" />
              <div className="label">Próximo · Nº {nextFilm.n}</div>
              <div className="t">{nextFilm.title}</div>
              <div className="actions">
                <button className="btn btn-ink" onClick={() => toggle(nextFilm.n)}>Marcar como visto</button>
                <button className="btn btn-ghost" onClick={() => openDetail(nextFilm.n)}>Abrir o gibi</button>
              </div>
            </>
          ) : (
            <>
              <img src={finale.cover} alt="" />
              <div className="label">Maratona completa</div>
              <div className="t">Você está pronto para o Doutor Destino.</div>
              <div className="actions"><button className="btn btn-ink" onClick={() => openDetail(finale.n)}>Ver a última edição</button></div>
            </>
          )}
        </div>
      </header>

      <footer className="hud-bottom" ref={botRef}>
        <div className="stats" data-ui>
          <div className="stat"><div className="v num">{hm(seenMin)}</div><div className="k">assistidas</div></div>
          <div className="stat"><div className="v num">{hm(leftMin)}</div><div className="k">faltam</div></div>
          <div className="stat"><div className="v num">{leftFilms}</div><div className="k">{leftFilms === 1 ? 'filme pela frente' : 'filmes pela frente'}</div></div>
          <div className="stat pace"><div className="v num">{pace}</div><div className="k">{paceK}</div></div>
        </div>
        <div className="bar" data-ui>
          <div className="track" role="progressbar" aria-label="Progresso da maratona" aria-valuemin={0} aria-valuemax={films.length} aria-valuenow={watched.size}>
            <div className="fill" style={{ width: `${(seenMin / total) * 100}%` }} />
          </div>
          <div className="pct num">{watched.size} de {films.length}</div>
        </div>
        <div className="demo" data-ui role="status">
          {progress.error
            ? <span className="err">{progress.error}</span>
            : progress.user
              ? <span>Progresso salvo na sua conta.</span>
              : <span>Seu progresso fica salvo neste navegador. <button onClick={() => setAuthOpen(true)}>Entre</button> para levar para qualquer aparelho.</span>}
          {watched.size > 0 && <button onClick={() => { if (confirm('Zerar todo o progresso da maratona?')) void progress.reset(); }}>Zerar</button>}
        </div>
      </footer>

      {tag && phase === 'closed' && (
        <div id="tag" className="on" style={{ left: tag.x, top: tag.y }}>
          Nº {tag.n} · {tagFilm ? tagFilm.title : finale.title}
          <small>{tagFilm ? `${tagFilm.year} · ${hm(tagFilm.runtime)}` : '17.12.2026'}</small>
        </div>
      )}

      <AuthPanel open={authOpen} onClose={() => setAuthOpen(false)} user={progress.user} signIn={progress.signIn} signOut={progress.signOut} />

      <section id="page" ref={pageRef} role="dialog" aria-modal="true" aria-labelledby="cp-title"
        className={phase === 'open' || phase === 'closing' ? `open${phase === 'open' ? ' shown' : ''}` : undefined} data-ui>
        {pageN !== null && phase !== 'closed' && phase !== 'flying' && (
          <ComicPage n={pageN} films={films} finale={finale} watched={watched} now={now} offersCheckedAt={catalog.offersCheckedAt}
            onToggle={toggle} onClose={closeDetail} onGo={openDetail} />
        )}
      </section>

      <nav id="list" className={listOpen ? 'open' : undefined} aria-label="Todos os filmes em ordem cronológica" data-ui>
        <header>
          <h2>Ordem cronológica</h2>
          <button className="icon-btn" onClick={() => setListOpen(false)} aria-label="Fechar lista"><Close /></button>
        </header>
        <ol>
          {films.map(f => (
            <li key={f.n}>
              <button className={watched.has(f.n) ? 'seen' : undefined} onClick={() => openDetail(f.n)}
                aria-label={`Nº ${f.n}, ${f.title}, ${watched.has(f.n) ? 'visto' : 'não visto'}`}>
                <span className="n num">{pad(f.n)}</span>
                <img src={f.cover} alt="" loading="lazy" />
                <span className="lt">{f.title}<small>{f.year} · {hm(f.runtime)}</small></span>
                <span className="ck"><Check /></span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div id="loading" className={ready ? 'gone' : undefined}>Arrumando a estante…</div>
    </div>
  );
}
