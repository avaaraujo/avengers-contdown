'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export const LOCAL_KEY = 'ac-watched';
export type SessionUser = { id: string; email: string | null };

function readLocal(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as number[]); } catch { return new Set(); }
}
function writeLocal(s: Set<number>) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...s])); } catch { /* private mode: progress lives in memory */ }
}
/** inserting a row that is already there means it is already watched: not an error */
const isDuplicate = (e: { code?: string } | null) => e?.code === '23505';

/**
 * Which films the viewer has watched. Guests keep it in this browser; once signed in it lives
 * in avengers_watches (RLS: own rows only), and anything marked as a guest is merged in.
 * Other tabs stay in step: guests through the storage event, accounts by reloading when the tab comes back.
 */
export function useProgress(items: { id: number; n: number }[]) {
  const [watched, setWatchedState] = useState<Set<number>>(() => new Set());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idByN = useMemo(() => new Map(items.map(f => [f.n, f.id])), [items]);
  const nById = useMemo(() => new Map(items.map(f => [f.id, f.n])), [items]);

  // the latest set, readable synchronously: rapid clicks must not build on a stale render
  const watchedRef = useRef(watched);
  const setWatched = useCallback((next: Set<number>) => { watchedRef.current = next; setWatchedState(next); }, []);
  // when each title was marked, so undoing a reset puts back the original dates
  const stamps = useRef(new Map<number, string>());
  // writes go out one at a time, in click order
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = useCallback((job: () => Promise<unknown>) => { queue.current = queue.current.then(job, job); return queue.current; }, []);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null);
      setAuthReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      setUser(prev => (prev?.id === u?.id ? prev : u ? { id: u.id, email: u.email ?? null } : null));
      setAuthReady(true);
      if (event === 'SIGNED_IN' && location.search.includes('code=')) history.replaceState(history.state, '', location.pathname);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadFromDb = useCallback(async () => {
    const { data, error } = await supabaseBrowser().from('avengers_watches').select('title_id, watched_at');
    if (error) return null;
    const set = new Set<number>();
    stamps.current.clear();
    for (const r of data as { title_id: number; watched_at: string }[]) {
      const n = nById.get(r.title_id);
      if (n === undefined) continue;
      set.add(n);
      stamps.current.set(n, r.watched_at);
    }
    return set;
  }, [nById]);

  // load progress whenever the account changes
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      if (!user) { await Promise.resolve(); if (!cancelled) setWatched(readLocal()); return; }
      const fromDb = await loadFromDb();
      if (cancelled) return;
      if (!fromDb) { setError('Não deu para carregar seu progresso. Recarregue a página.'); return; }
      const guest = [...readLocal()].filter(n => !fromDb.has(n) && idByN.has(n));
      if (guest.length) {
        const { error: insErr } = await supabaseBrowser().from('avengers_watches').insert(guest.map(n => ({ title_id: idByN.get(n)! })));
        if (!insErr) { guest.forEach(n => fromDb.add(n)); writeLocal(new Set()); }
      }
      if (!cancelled) setWatched(fromDb);
    })();
    return () => { cancelled = true; };
  }, [user, authReady, idByN, loadFromDb, setWatched]);

  // other tabs: a guest's localStorage write fires `storage` here; an account reloads when this tab is shown again
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      const onStorage = (e: StorageEvent) => { if (e.key === LOCAL_KEY || e.key === null) setWatched(readLocal()); };
      addEventListener('storage', onStorage);
      return () => removeEventListener('storage', onStorage);
    }
    const onShow = () => {
      if (document.visibilityState !== 'visible') return;
      void enqueue(async () => { const s = await loadFromDb(); if (s) setWatched(s); });
    };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, [user, authReady, loadFromDb, enqueue, setWatched]);

  /** flips one title and returns whether it is now watched; saving happens in the background */
  const toggle = useCallback((n: number) => {
    const was = watchedRef.current.has(n);
    const next = new Set(watchedRef.current);
    if (was) next.delete(n); else next.add(n);
    setWatched(next);
    setError(null);
    if (!user) { writeLocal(next); return !was; }
    const titleId = idByN.get(n)!;
    void enqueue(async () => {
      const sb = supabaseBrowser();
      const { error } = was
        ? await sb.from('avengers_watches').delete().eq('user_id', user.id).eq('title_id', titleId)
        : await sb.from('avengers_watches').insert({ title_id: titleId });
      if (!error || isDuplicate(error)) {
        if (was) stamps.current.delete(n); else stamps.current.set(n, new Date().toISOString());
        return;
      }
      // undo only this title: later clicks on other titles stay as they are
      const s = new Set(watchedRef.current);
      if (was) s.add(n); else s.delete(n);
      setWatched(s);
      setError('Não deu para salvar. Confira sua conexão e tente de novo.');
    });
    return !was;
  }, [user, idByN, enqueue, setWatched]);

  /** clears everything and hands back what was there, for `restore` */
  const reset = useCallback(() => {
    const before = { watched: new Set(watchedRef.current), stamps: new Map(stamps.current) };
    setWatched(new Set());
    if (!user) { writeLocal(new Set()); return before; }
    void enqueue(async () => {
      const { error } = await supabaseBrowser().from('avengers_watches').delete().eq('user_id', user.id);
      if (error) { setWatched(before.watched); setError('Não deu para zerar agora. Tente de novo.'); }
      else stamps.current.clear();
    });
    return before;
  }, [user, enqueue, setWatched]);

  const restore = useCallback((before: ReturnType<typeof reset>) => {
    const merged = new Set([...watchedRef.current, ...before.watched]);
    setWatched(merged);
    if (!user) { writeLocal(merged); return; }
    void enqueue(async () => {
      const rows = [...before.watched].filter(n => idByN.has(n)).map(n => {
        const at = before.stamps.get(n);
        return at ? { title_id: idByN.get(n)!, watched_at: at } : { title_id: idByN.get(n)! };
      });
      if (!rows.length) return;
      const { error } = await supabaseBrowser().from('avengers_watches').upsert(rows, { onConflict: 'user_id,title_id', ignoreDuplicates: true });
      if (error) { setError('Não deu para desfazer. Recarregue a página.'); return; }
      before.stamps.forEach((at, n) => stamps.current.set(n, at));
    });
  }, [user, idByN, enqueue, setWatched]);

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + '/' } });
    return error ? (error.status === 429 ? 'Muitos pedidos seguidos. Espere alguns minutos e tente de novo.' : 'Não deu para enviar o link. Confira o e-mail e tente de novo.') : null;
  }, []);
  const signOut = useCallback(async () => { await supabaseBrowser().auth.signOut(); }, []);

  return { watched, user, authReady, error, toggle, reset, restore, signIn, signOut };
}
