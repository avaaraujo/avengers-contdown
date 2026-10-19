'use client';
/* eslint-disable @next/next/no-img-element -- small cover thumbnails in the HUD and list */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Catalog, Extra, Film } from '@/lib/types';
import { countdownParts, dec, dotDate, extraPath, filmPath, hm, pad, progressCode, saga, shelfOrder, thumb } from '@/lib/format';
import type { SortMode } from '@/lib/format';
import type { Rect, ShelfScene } from './shelf/ShelfScene';
import { ComicPage, Offers } from './ComicPage';
import { Check, Close } from './Burst';
import { LOCAL_KEY, useProgress } from './useProgress';
import { AuthPanel } from './AuthPanel';
import { trapTab } from './focus';

type Phase = 'closed' | 'flying' | 'open' | 'closing';
const subscribeClock = (tick: () => void) => { const t = setInterval(tick, 1000); return () => clearInterval(t); };
const clockSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const insetFor = (r: Rect) =>
  `inset(${Math.max(0, r.t)}px ${Math.max(0, innerWidth - r.r)}px ${Math.max(0, innerHeight - r.b)}px ${Math.max(0, r.l)}px round 6px)`;

const NARROW = '(max-width: 860px)';
const subscribeNarrow = (cb: () => void) => { const m = matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); };
const narrowSnapshot = () => matchMedia(NARROW).matches;

type Tab = 'films' | 'series' | 'xmen';

type Toast = { id: number; text: string; undo?: () => void };

const TOAST_MS = 10000;
/** how long the Próximo card keeps showing the film just marked, so a second tap cannot mark the next one */
const HOLD_MS = 700;

type NextCardProps = {
  slot: 0 | 1;
  film: Film | null;
  held: boolean;
  firstVisit: boolean;
  finale: Catalog['finale'];
  released: boolean;
  filmCount: number;
  /** set while looking at a friend's shelf: how many films they have seen */
  friendSeen: number | null;
  setBtn(slot: 0 | 1, el: HTMLButtonElement | null): void;
  onMark(film: Film): void;
  onOpen(n: number): void;
  onLeaveFriend(): void;
};

/**
 * The Próximo card. It exists twice: beside the countdown on wide screens, above the stats (in thumb reach)
 * on phones; CSS shows one. While looking at a friend's shelf it says whose it is and offers the way back.
 */
function NextCard({ slot, film, held, firstVisit, finale, released, filmCount, friendSeen, setBtn, onMark, onOpen, onLeaveFriend }: NextCardProps) {
  const place = slot ? 'bottom' : 'top';
  const ref = (el: HTMLButtonElement | null) => setBtn(slot, el);
  if (friendSeen !== null) {
    return (
      <div className={`next ${place} done`} data-ui>
        <img src={thumb(finale.cover)} alt="" />
        <div className="label">Estante do seu amigo</div>
        <div className="t">{friendSeen} de {filmCount} filmes vistos</div>
        <div className="actions"><button className="btn btn-ink" ref={ref} onClick={onLeaveFriend}>Voltar para a minha</button></div>
      </div>
    );
  }
  return (
    <div className={`next ${place}${film ? '' : ' done'}${film && firstVisit ? ' first' : ''}`} data-ui>
      {film ? (
        <>
          <img src={thumb(film.cover)} alt="" />
          <div className="label">{firstVisit ? 'Comece por aqui' : 'Próximo'} · Nº {film.n}</div>
          <div className="t">{film.title}</div>
          {firstVisit && <div className="hint">A ordem é a da história, não a de lançamento.</div>}
          <div className="actions">
            <button className={`btn btn-ink${held ? ' held' : ''}`} ref={ref} aria-disabled={held ? true : undefined}
              aria-label={`${held ? 'Visto' : 'Marcar como visto'}: ${film.title}`}
              onClick={() => { if (!held) onMark(film); }}>{held ? 'Visto!' : 'Marcar como visto'}</button>
            <button className="btn btn-ghost" onClick={() => onOpen(film.n)}>Abrir o gibi</button>
          </div>
        </>
      ) : (
        <>
          <img src={thumb(finale.cover)} alt="" />
          <div className="label">Maratona completa: {filmCount} de {filmCount}</div>
          <div className="t">{released ? 'Hora de ver no cinema.' : 'Você está pronto para o Doutor Destino.'}</div>
          <div className="actions"><button className="btn btn-ink" ref={ref} onClick={() => onOpen(finale.n)}>Ver a última edição</button></div>
        </>
      )}
    </div>
  );
}

const WELCOME_KEY = 'ac-welcomed';
const ORDER_KEY = 'ac-order';

export function CountdownApp({ catalog, initialN = null, initialExtra = null, sharedSeen }: { catalog: Catalog; initialN?: number | null; initialExtra?: number | null; sharedSeen?: number[] }) {
  const { films, finale, extras } = catalog;
  const total = useMemo(() => films.reduce((a, f) => a + f.runtime, 0), [films]);
  const items = useMemo(() => [...films.map(f => ({ id: f.id, n: f.n })), ...extras.map(x => ({ id: x.id, n: x.key }))], [films, extras]);
  const progress = useProgress(items);
  const { watched: ownWatched, toggle: flip, reset, restore } = progress;
  // a friend's shelf (from a shared link) can be looked at, read-only; everything on screen follows the shelf being viewed
  const [welcome, setWelcome] = useState(false);
  const [friendView, setFriendView] = useState(false);
  const friendRef = useRef(false);
  const friendSet = useMemo(() => new Set(sharedSeen ?? []), [sharedSeen]);
  const watched = friendView ? friendSet : ownWatched;
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
  const narrow = useSyncExternalStore(subscribeNarrow, narrowSnapshot, () => false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('story');
  const [toastHover, setToastHover] = useState(false);
  const [toastFocus, setToastFocus] = useState(false);
  const [held, setHeld] = useState<Film | null>(null);
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
  const instantOpen = useRef(false);
  // focus goes back where it came from when a panel closes
  const returnFocus = useRef<HTMLElement | null>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const listCloseRef = useRef<HTMLButtonElement>(null);
  const authBtnRef = useRef<HTMLButtonElement>(null);
  const titled = useRef(false);
  const authOpenRef = useRef(false);
  const closeAuthRef = useRef<() => void>(() => {});
  const nextBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** the main action of whichever Próximo card is on screen */
  const mainAction = useCallback(() => nextBtnRefs.current.find(b => b && b.getClientRects().length > 0) ?? listBtnRef.current, []);
  const holding = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusFallback = useRef(false);
  const focusTitle = useRef(false);
  const toastLeft = useRef({ id: 0, ms: TOAST_MS });

  /* a visitor arriving by a friend's link, with no progress of their own, gets one welcome */
  useEffect(() => {
    if (!sharedSeen || !progress.authReady || progress.user) return;
    try {
      if (localStorage.getItem(WELCOME_KEY) === '1') return;
      if ((JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as number[]).length > 0) return;
    } catch { /* storage blocked: show it, it only costs one click */ }
    // after the first paint, so the welcome never flashes for a visitor who already has progress
    const t = setTimeout(() => setWelcome(true), 0);
    return () => clearTimeout(t);
  }, [sharedSeen, progress.authReady, progress.user]);
  const closeWelcome = useCallback((toFriend: boolean) => {
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch { /* shown again next visit, harmless */ }
    setWelcome(false);
    if (toFriend) setFriendView(true);
    // the buttons are inert while the welcome is up: wait a frame for them to wake before moving focus
    requestAnimationFrame(() => mainAction()?.focus({ preventScroll: true }));
  }, [mainAction]);
  const leaveFriendView = useCallback(() => {
    setFriendView(false);
    requestAnimationFrame(() => mainAction()?.focus({ preventScroll: true }));
  }, [mainAction]);

  const showToast = useCallback((text: string, undo?: () => void) => setToast({ id: Date.now(), text, undo }), []);
  const toastHold = toastHover || toastFocus;
  // the toast stays 10 s, and stops counting while the pointer or focus is on it
  useEffect(() => {
    if (!toast) return;
    if (toastLeft.current.id !== toast.id) toastLeft.current = { id: toast.id, ms: TOAST_MS };
    if (toastHold) return;
    const started = Date.now();
    const t = setTimeout(() => { setToast(null); setToastHover(false); setToastFocus(false); }, toastLeft.current.ms);
    return () => { clearTimeout(t); if (toastLeft.current.id === toast.id) toastLeft.current.ms -= Date.now() - started; };
  }, [toast, toastHold]);
  useEffect(() => () => clearTimeout(holdTimer.current), []);

  /* offline and installable: the service worker only runs in production builds */
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => { /* the site works without it */ });
  }, []);

  const nextFilm = films.find(f => !watched.has(f.n)) ?? null;
  const order = useMemo(() => shelfOrder(films.length, finale.n, sortMode), [films.length, finale.n, sortMode]);
  // the chosen order is remembered; read after the first paint so the server's markup still matches
  useEffect(() => {
    const t = setTimeout(() => { try { if (localStorage.getItem(ORDER_KEY) === 'release') setSortMode('release'); } catch { /* default order */ } }, 0);
    return () => clearTimeout(t);
  }, []);
  const chooseOrder = useCallback((m: SortMode) => { setSortMode(m); try { localStorage.setItem(ORDER_KEY, m); } catch { /* not remembered */ } }, []);
  useEffect(() => { sceneRef.current?.setOrder(order); }, [order, ready]);
  /** the issues before and after `n` in the shelf's current order */
  const neighbors = useCallback((n: number) => { const i = order.indexOf(n); return { prev: i > 0 ? order[i - 1] : null, next: i >= 0 && i < order.length - 1 ? order[i + 1] : null }; }, [order]);
  useEffect(() => { friendRef.current = friendView; }, [friendView]);

  /* the 3D shelf (client only, loaded on demand) */
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current!;
    import('./shelf/ShelfScene').then(({ ShelfScene }) => {
      if (disposed) return;
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { setNoWebgl(true); setReady(true); return; }
      const scene = new ShelfScene(canvas,
        films.map(f => ({ n: f.n, title: f.title, year: f.year, runtime: f.runtime, cover: f.cover, phase: f.phase })),
        { n: finale.n, title: finale.title, cover: finale.cover, premiereAt: finale.premiereAt },
        {
          onReady: () => setReady(true),
          onHover: (n, x, y) => setTag(prev => (n === null ? (prev ? null : prev) : prev?.n === n && prev.x === x && prev.y === y ? prev : { n, x, y })),
          onPick: n => { if (authOpenRef.current) closeAuthRef.current(); else openDetailRef.current(n); },
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
    const measure = () => {
      sceneRef.current?.setInsets(topRef.current?.offsetHeight ?? 0, botRef.current?.offsetHeight ?? 0);
      // the toast sits just above the bottom HUD, whatever its height
      document.documentElement.style.setProperty('--hud-bottom', `${botRef.current?.offsetHeight ?? 0}px`);
    };
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
    focusFallback.current = returnFocus.current === null;
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
    if (phase !== 'open' || !el) return;
    if (instantOpen.current) {
      // a direct link: the page is simply there, the shelf loads behind it
      instantOpen.current = false;
      el.style.transition = 'none';
      el.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
      el.scrollTop = 0;
      (el.querySelector('[data-autofocus]') as HTMLElement | null)?.focus({ preventScroll: true });
      return;
    }
    if (!handoffRect.current) return;
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
    if (phase !== 'closed') return;
    const el = returnFocus.current;
    if (!el) {
      // opened by a direct link, so there is no button to go back to: land on the main action
      if (focusFallback.current) { focusFallback.current = false; mainAction()?.focus({ preventScroll: true }); }
      return;
    }
    returnFocus.current = null;
    el.focus({ preventScroll: true });
    // opened from the list, which has closed since: land on the button that opens it
    if (document.activeElement !== el && el.closest('#list')) listBtnRef.current?.focus({ preventScroll: true });
  }, [phase, mainAction]);

  // after the arrow keys change the issue, focus follows to its title
  useEffect(() => {
    if (!focusTitle.current) return;
    focusTitle.current = false;
    document.getElementById('cp-title')?.focus({ preventScroll: true });
  }, [pageN]);

  const closeList = useCallback(() => {
    setListOpen(false);
    if (location.pathname.startsWith('/extra/')) history.replaceState(history.state, '', '/');
    // on phones the HUD is inert behind the open list: focus waits for it to wake
    requestAnimationFrame(() => listBtnRef.current?.focus({ preventScroll: true }));
  }, []);
  const closeAuth = useCallback(() => { setAuthOpen(false); authBtnRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { authOpenRef.current = authOpen; closeAuthRef.current = closeAuth; }, [authOpen, closeAuth]);
  useEffect(() => { if (listOpen && !startExtra) listCloseRef.current?.focus({ preventScroll: true }); }, [listOpen, startExtra]);

  /* deep link on load, and the browser's back/forward buttons */
  const nFromPath = useCallback((path: string) => {
    const m = /^\/filme\/([^/]+)\/?$/.exec(path);
    if (!m) return null;
    return m[1] === finale.slug ? finale.n : films.find(f => f.slug === m[1])?.n ?? null;
  }, [films, finale]);
  useEffect(() => {
    if (initialDone.current) return;
    initialDone.current = true;
    if (initialN === null) return;
    queueMicrotask(() => {
      if (phaseRef.current !== 'closed') return;
      instantOpen.current = true;
      focusFallback.current = true;
      setPageN(initialN);
      go('open');
    });
  }, [initialN, go]);
  // once the shelf exists, it takes down the comic the page is showing
  useEffect(() => {
    if (ready && phase === 'open' && pageN !== null && sceneRef.current && sceneRef.current.current !== pageN) sceneRef.current.openInstant(pageN);
  }, [ready, phase, pageN]);
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
      if (e.key === 'Escape') { if (welcome) closeWelcome(false); else if (phaseRef.current === 'open') closeDetail(); else if (authOpen) closeAuth(); else if (listOpen) closeList(); }
      if (phaseRef.current !== 'open' || pageN === null) return;
      const nb = neighbors(pageN);
      if (e.key === 'ArrowRight' && nb.next) { focusTitle.current = true; openDetail(nb.next); }
      if (e.key === 'ArrowLeft' && nb.prev) { focusTitle.current = true; openDetail(nb.prev); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [closeDetail, openDetail, pageN, neighbors, authOpen, listOpen, closeAuth, closeList, welcome, closeWelcome]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('page-open', phase === 'open' || phase === 'closing');
    root.classList.toggle('page-busy', phase !== 'closed');
  }, [phase]);

  const toggle = useCallback((n: number) => {
    if (friendRef.current) return friendSet.has(n);
    const becomesSeen = flip(n);
    if (phaseRef.current === 'closed') { if (becomesSeen) sceneRef.current?.popStamp(n); }
    else markedInPage.current = becomesSeen;
    return becomesSeen;
  }, [flip, friendSet]);
  /** after an undo the toast button disappears: focus goes back to what made the change, or to the main action */
  const refocus = useCallback((origin: HTMLElement | null) => {
    if (origin?.isConnected) origin.focus({ preventScroll: true });
    if (!origin || document.activeElement !== origin) mainAction()?.focus({ preventScroll: true });
  }, [mainAction]);
  /** marking from the HUD or the list is one tap, so it gets an undo */
  const toggleWithUndo = useCallback((t: Film | Extra, n: number, onUndo?: () => void) => {
    if (friendRef.current) { showToast('Esta é a estante do seu amigo. Volte para a sua para marcar filmes.'); return; }
    const origin = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const on = toggle(n);
    showToast(on ? `${t.title}: visto.` : `${t.title}: desmarcado.`, () => { toggle(n); onUndo?.(); refocus(origin); });
  }, [toggle, showToast, refocus]);
  /** the Próximo card: marking holds the card on "Visto!" before the next film comes up */
  const markNext = useCallback((film: Film) => {
    if (holding.current || friendRef.current) return;
    holding.current = true;
    setHeld(film);
    toggleWithUndo(film, film.n, () => { clearTimeout(holdTimer.current); holding.current = false; setHeld(null); });
    holdTimer.current = setTimeout(() => {
      holding.current = false;
      setHeld(null);
      if (!document.activeElement || document.activeElement === document.body) mainAction()?.focus({ preventScroll: true });
    }, HOLD_MS);
  }, [toggleWithUndo, mainAction]);
  const resetWithUndo = useCallback(() => {
    if (friendRef.current) return;
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
  // milestones are words, not decoration: "Hoje" on premiere day, "dias em cartaz" after, never "0 dias"
  const premiereDay = released && sinceDays === 0;
  const todayWord = premiereDay || (!released && cd !== null && cd.d === 0);
  const countUnit = premiereDay ? 'estreia nos cinemas'
    : released ? `${sinceDays === 1 ? 'dia' : 'dias'} em cartaz`
    : cd && cd.d === 0 ? 'estreia em'
    : cd && cd.d === 1 ? 'dia' : 'dias';
  // screen readers get one sentence that only changes once a minute, not three pieces that tick every second
  const minuteNow = now === null ? null : Math.floor(now / 6e4) * 6e4;
  const cdMin = minuteNow === null ? null : countdownParts(finale.premiereAt, minuteNow);
  const plural = (v: number, one: string, many: string) => `${v} ${v === 1 ? one : many}`;
  const countdownSentence = cdMin === null ? '' : premiereDay ? `${finale.title} estreia hoje nos cinemas do Brasil.`
    : released ? `${finale.title} está nos cinemas do Brasil há ${plural(sinceDays, 'dia', 'dias')}.`
    : `Faltam ${plural(cdMin.d, 'dia', 'dias')}, ${plural(cdMin.h, 'hora', 'horas')} e ${plural(cdMin.m, 'minuto', 'minutos')} para a estreia de ${finale.title}, em ${dotDate(finale.premiereAt)}.`;
  const days = now === null ? null : Math.max((finale.premiereAt - now) / 864e5, 0.01);
  // the legend has a short form for phones, where four stats share one row
  let pace = '—', paceK = 'filmes por dia', paceShort = 'filmes por dia';
  if (days !== null) {
    const perDay = leftFilms / days;
    if (released) { pace = 'Em cartaz'; paceK = leftFilms === 0 ? 'e você estava pronto' : 'a maratona segue, sem pressa'; paceShort = leftFilms === 0 ? 'e você estava pronto' : 'sem pressa'; }
    else if (leftFilms === 0) { pace = 'Pronto'; paceK = paceShort = 'para a estreia'; }
    else if (perDay < 1) { pace = `1 a cada ${dec(1 / perDay, 0)}`; paceK = `dias · ${hm(leftMin / days)} por dia`; paceShort = 'dias, por filme'; }
    else { pace = dec(perDay); paceK = `filmes por dia · ${hm(leftMin / days)}`; paceShort = 'filmes por dia'; }
  }
  const shownFilm = held ?? nextFilm;
  const setNextBtn = useCallback((slot: 0 | 1, el: HTMLButtonElement | null) => { nextBtnRefs.current[slot] = el; }, []);
  const nextCardFor = (slot: 0 | 1) => (
    <NextCard slot={slot} film={shownFilm} held={held !== null} firstVisit={ownWatched.size === 0} finale={finale} released={released}
      filmCount={films.length} friendSeen={friendView ? seenFilms.length : null} setBtn={setNextBtn}
      onMark={markNext} onOpen={openDetail} onLeaveFriend={leaveFriendView} />
  );
  // the list is in story order, which interleaves the release phases, so it is grouped in tens: landmarks that keep the numbering
  const groups = useMemo(() => {
    const seq = order.slice(0, films.length).map(n => films[n - 1]);
    if (sortMode === 'release') {
      return [...new Set(seq.map(f => f.phase))].map(p => ({ key: `p${p}`, title: `Fase ${p} · ${saga(p)}`, list: seq.filter(f => f.phase === p) }));
    }
    return Array.from({ length: Math.ceil(seq.length / 10) }, (_, i) => {
      const list = seq.slice(i * 10, i * 10 + 10);
      return { key: `n${list[0].n}`, title: `Nº ${list[0].n} a ${list[list.length - 1].n}`, list };
    });
  }, [films, order, sortMode]);
  const tabs = ([['films', 'Maratona', films.length], ['series', 'Séries', extras.filter(x => x.kind === 'series').length], ['xmen', 'X-Men', extras.filter(x => x.kind === 'xmen').length]] as const)
    .filter(([k, , c]) => k === 'films' || c > 0);
  // arrows, Home and End move between the tabs; only the selected one is in the Tab order
  const onTabKeys = (e: React.KeyboardEvent) => {
    const keys = tabs.map(t => t[0]);
    const at = keys.indexOf(tab);
    const to = e.key === 'ArrowRight' ? (at + 1) % keys.length : e.key === 'ArrowLeft' ? (at - 1 + keys.length) % keys.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? keys.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    setTab(keys[to]);
    document.getElementById(`tab-${keys[to]}`)?.focus();
  };
  const tagFilm = tag ? (tag.n === finale.n ? null : films[tag.n - 1]) : null;
  // while the comic page is up, everything behind it is out of reach for keyboard and screen readers
  const behind = phase !== 'closed' || welcome;

  return (
    <div className={noWebgl ? 'no-webgl' : undefined}>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <div id="track" style={{ height: trackH || undefined }} />

      <h1 className="sr-only">Avengers Countdown: maratona até {finale.title}</h1>
      <header className="hud-top" ref={topRef} inert={behind || (narrow && listOpen)}>
        <div className="brand" data-ui>
          <span className="logo">Avengers <b>Countdown</b></span>
          <nav style={{ display: 'flex', gap: 6 }}>
            <label className="chip order-pick">
              Ordenar
              <select aria-label="Ordenar filmes" value={sortMode} onChange={e => chooseOrder(e.target.value as SortMode)}>
                <option value="story">Ordem da história</option>
                <option value="release">Lançamento e fases</option>
              </select>
            </label>
            <button className="chip" ref={listBtnRef} onClick={() => (listOpen ? closeList() : setListOpen(true))} aria-controls="list" aria-expanded={listOpen}>Lista</button>
            <button className="chip" ref={authBtnRef} onClick={() => (authOpen ? closeAuth() : setAuthOpen(true))} aria-expanded={authOpen} aria-controls="auth"
              title={progress.user ? undefined : 'Opcional: entre para levar seu progresso a qualquer aparelho'}
              aria-label={progress.user ? undefined : 'Entrar (opcional) para sincronizar o progresso'}>
              {progress.user ? 'Conta' : 'Entrar'}
            </button>
          </nav>
        </div>
        <div className="count" data-ui>
          <p className="sr-only">{countdownSentence}</p>
          <div className="days num" aria-hidden="true">{todayWord ? 'Hoje' : released ? sinceDays : cd ? cd.d : '--'}</div>
          <div className="rest">
            <div className="unit" aria-hidden="true">{countUnit}</div>
            <div className="clock num" aria-hidden="true">{released ? (premiereDay ? dotDate(finale.premiereAt) : `desde ${dotDate(finale.premiereAt)}`) : cd ? `${pad(cd.h)}:${pad(cd.m)}:${pad(cd.s)}` : '--:--:--'}</div>
            {released
              ? <div className="to" aria-hidden="true">{premiereDay ? <><strong>{finale.title}</strong><br />estreou hoje no Brasil</> : <><strong>{finale.title}</strong><br />nos cinemas do Brasil</>}</div>
              : <div className="to" aria-hidden="true">até <strong>{finale.title}</strong><br />estreia no Brasil · {dotDate(finale.premiereAt)}</div>}
            {finale.ticketsUrl && <a className="tickets" href={finale.ticketsUrl} target="_blank" rel="noopener">Comprar ingresso</a>}
          </div>
        </div>
        {nextCardFor(0)}
      </header>

      <footer className="hud-bottom" ref={botRef} inert={behind || (narrow && listOpen)}>
        {nextCardFor(1)}
        <div className="stats" data-ui>
          <div className="stat"><div className="v num">{hm(seenMin)}</div><div className="k">assistidas</div></div>
          <div className="stat"><div className="v num">{hm(leftMin)}</div><div className="k">faltam</div></div>
          <div className="stat"><div className="v num">{leftFilms}</div><div className="k">{leftFilms === 1 ? 'filme pela frente' : 'filmes pela frente'}</div></div>
          <div className="stat pace"><div className="v num">{pace}</div><div className="k"><span className="k-long">{paceK}</span><span className="k-short">{paceShort}</span></div></div>
        </div>
        <div className="bar" data-ui>
          <div className="track" role="progressbar" aria-label="Progresso da maratona" aria-valuemin={0} aria-valuemax={films.length} aria-valuenow={seenFilms.length}>
            <div className="fill" style={{ width: `${(seenMin / total) * 100}%` }} />
          </div>
          <div className="pct num">{seenFilms.length} de {films.length}</div>
          {seenFilms.length > 0 && !friendView && <button className="chip share" onClick={() => void share()}>Compartilhar</button>}
        </div>
        <div className="demo" data-ui>
          {progress.error
            ? <span className="err">{progress.error}</span>
            : progress.user
              ? <span>Progresso salvo na sua conta.</span>
              : <span>Seu progresso fica salvo neste navegador. <button onClick={() => setAuthOpen(true)}>Entre</button> para levar para qualquer aparelho.</span>}
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
            prevN={neighbors(pageN).prev} nextN={neighbors(pageN).next} friend={friendView} onLeaveFriend={leaveFriendView}
            onToggle={toggle} onClose={() => closeDetail()} onGo={n => openDetail(n)} />
        )}
      </section>

      <nav id="list" className={listOpen ? 'open' : undefined} aria-label="Todos os filmes em ordem cronológica" data-ui inert={behind || (!listOpen && !noWebgl)}
        onKeyDown={e => { if (narrow && listOpen) trapTab(e, e.currentTarget); }}>
        <header>
          <h2>Ordem cronológica</h2>
          <button className="icon-btn" ref={listCloseRef} onClick={closeList} aria-label="Fechar lista"><Close /></button>
        </header>
        <p className="list-sum num">{seenFilms.length} de {films.length} · {hm(seenMin)} vistas</p>
        <div className="tabs" role="tablist" aria-label="Seções da lista" onKeyDown={onTabKeys}>
          {tabs.map(([k, label, c]) => (
            <button key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls={k === 'films' ? 'panel-films' : 'panel-extras'}
              tabIndex={tab === k ? 0 : -1} className={tab === k ? 'on' : undefined} onClick={() => setTab(k)}>{label} <small>{c}</small></button>
          ))}
        </div>
        <div id="panel-extras" role="tabpanel" aria-labelledby={`tab-${tab}`} hidden={tab === 'films'}>
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
        </div>
        <div id="panel-films" role="tabpanel" aria-labelledby="tab-films" hidden={tab !== 'films'}>
          {groups.map(g => (
            <section key={g.key} aria-labelledby={`grp-${g.key}`}>
              <h3 className="phase-head" id={`grp-${g.key}`}>{g.title}</h3>
              <ol>
                {g.list.map(f => {
                  const seen = watched.has(f.n), isNext = nextFilm?.n === f.n;
                  return (
                    <li key={f.n}>
                      <div className={`frow${seen ? ' seen' : ''}`}>
                        <button className="fopen" onClick={() => openDetail(f.n)} aria-label={`Nº ${f.n}, ${f.title}${isNext ? ', o próximo' : ''}`}>
                          <span className="n num">{pad(f.n)}</span>
                          <img src={thumb(f.cover)} alt="" loading="lazy" />
                          <span className="lt">{f.title}{isNext && <em className="next-tag">Próximo</em>}<small>{f.year} · {hm(f.runtime)}</small></span>
                        </button>
                        <button className={`xcheck${seen ? ' seen' : ''}`} aria-pressed={seen} aria-label={`${seen ? 'Desmarcar' : 'Marcar como visto'}: ${f.title}`} onClick={() => toggleWithUndo(f, f.n)}>
                          <span className="ck"><Check /></span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
          <section aria-labelledby="phase-premiere">
            <h3 className="phase-head" id="phase-premiere">A estreia</h3>
            <ol>
              <li>
                <div className="frow">
                  <button className="fopen" onClick={() => openDetail(finale.n)} aria-label={`Nº ${finale.n}, ${finale.title}, a estreia`}>
                    <span className="n num">{pad(finale.n)}</span>
                    <img src={thumb(finale.cover)} alt="" loading="lazy" />
                    <span className="lt">{finale.title}<small>estreia {dotDate(finale.premiereAt)}</small></span>
                  </button>
                </div>
              </li>
            </ol>
          </section>
        </div>
        {ownWatched.size > 0 && !friendView && (
          <div className="list-foot">
            <button className="btn btn-light" onClick={resetWithUndo}>Zerar progresso</button>
          </div>
        )}
        <p className="credit">
          Capas: Marvel Database. Streaming: JustWatch{catalog.tmdb ? ' via TMDB. Este produto usa a API do TMDB, mas não é endossado nem certificado por ele' : ''}.
        </p>
      </nav>

      <div className="toast-slot" role="status" aria-live="polite">
        {toast && !behind && (
          <div className="toast" key={toast.id}
            onMouseEnter={() => setToastHover(true)} onMouseLeave={() => setToastHover(false)}
            onFocus={() => setToastFocus(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setToastFocus(false); }}>
            <span>{toast.text}</span>
            {toast.undo && <button onClick={() => { toast.undo!(); setToast(null); }}>Desfazer</button>}
          </div>
        )}
      </div>

      {welcome && (
        <div className="welcome-scrim" data-ui>
          <section className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
            <p className="eyebrow">Um amigo te mandou a estante dele</p>
            <h2 id="welcome-title">Um amigo já viu {sharedSeen!.length} de {films.length} filmes antes de {finale.title}.</h2>
            <p>A fila segue a ordem cronológica da história, não a de lançamento. Por isso o Nº 1 é {films[0].title}.</p>
            <div className="welcome-actions">
              <button className="btn btn-yellow" autoFocus onClick={() => closeWelcome(false)}>Começar a minha maratona</button>
              <button className="btn btn-light" onClick={() => closeWelcome(true)}>Ver a estante do meu amigo</button>
            </div>
            <p className="note">Sem conta: seu progresso fica salvo neste navegador.</p>
          </section>
        </div>
      )}

      <div id="loading" className={ready ? 'gone' : undefined} aria-hidden="true">Arrumando a estante…</div>
    </div>
  );
}
