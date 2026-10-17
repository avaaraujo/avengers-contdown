'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Film } from '@/lib/types';

const LOCAL_KEY = 'ac-watched';
export type SessionUser = { id: string; email: string | null };

function readLocal(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as number[]); } catch { return new Set(); }
}
function writeLocal(s: Set<number>) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...s])); } catch { /* private mode: progress lives in memory */ }
}

/**
 * Which films the viewer has watched. Guests keep it in this browser; once signed in it lives
 * in avengers_watches (RLS: own rows only), and anything marked as a guest is merged in.
 */
export function useProgress(films: Film[]) {
  const [watched, setWatched] = useState<Set<number>>(() => new Set());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idByN = useMemo(() => new Map(films.map(f => [f.n, f.id])), [films]);
  const nById = useMemo(() => new Map(films.map(f => [f.id, f.n])), [films]);

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
      if (event === 'SIGNED_IN' && location.search.includes('code=')) history.replaceState(null, '', location.pathname);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // load progress whenever the account changes
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      if (!user) { await Promise.resolve(); if (!cancelled) setWatched(readLocal()); return; }
      const sb = supabaseBrowser();
      const { data, error } = await sb.from('avengers_watches').select('title_id');
      if (cancelled) return;
      if (error) { setError('Não deu para carregar seu progresso. Recarregue a página.'); return; }
      const fromDb = new Set<number>((data as { title_id: number }[]).map(r => nById.get(r.title_id)).filter((n): n is number => n !== undefined));
      const guest = [...readLocal()].filter(n => !fromDb.has(n) && idByN.has(n));
      if (guest.length) {
        const { error: insErr } = await sb.from('avengers_watches').insert(guest.map(n => ({ title_id: idByN.get(n)! })));
        if (!insErr) { guest.forEach(n => fromDb.add(n)); writeLocal(new Set()); }
      }
      if (!cancelled) setWatched(fromDb);
    })();
    return () => { cancelled = true; };
  }, [user, authReady, idByN, nById]);

  const toggle = useCallback(async (n: number) => {
    const was = watched.has(n);
    const next = new Set(watched);
    if (was) next.delete(n); else next.add(n);
    setWatched(next);
    setError(null);
    if (!user) { writeLocal(next); return; }
    const sb = supabaseBrowser();
    const titleId = idByN.get(n)!;
    const { error } = was
      ? await sb.from('avengers_watches').delete().eq('user_id', user.id).eq('title_id', titleId)
      : await sb.from('avengers_watches').insert({ title_id: titleId });
    if (error) {
      setWatched(prev => { const s = new Set(prev); if (was) s.add(n); else s.delete(n); return s; });
      setError('Não deu para salvar. Confira sua conexão e tente de novo.');
    }
  }, [watched, user, idByN]);

  const reset = useCallback(async () => {
    setWatched(new Set());
    if (!user) { writeLocal(new Set()); return; }
    const { error } = await supabaseBrowser().from('avengers_watches').delete().eq('user_id', user.id);
    if (error) setError('Não deu para zerar agora. Tente de novo.');
  }, [user]);

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
    return error ? (error.status === 429 ? 'Muitos pedidos seguidos. Espere alguns minutos e tente de novo.' : 'Não deu para enviar o link. Confira o e-mail e tente de novo.') : null;
  }, []);
  const signOut = useCallback(async () => { await supabaseBrowser().auth.signOut(); }, []);

  return { watched, user, authReady, error, toggle, reset, signIn, signOut };
}
