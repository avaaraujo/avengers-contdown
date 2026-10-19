'use client';

import { useEffect, useRef, useState } from 'react';
import type { SessionUser } from './useProgress';
import { Close } from './Burst';
import { trapTab } from './focus';

type Props = {
  open: boolean;
  onClose(): void;
  user: SessionUser | null;
  signIn(email: string): Promise<string | null>;
  signOut(): Promise<void>;
};

/** Sign in with a magic link, or see which account the progress is saved to. */
export function AuthPanel({ open, onClose, user, signIn, signOut }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open && !user) inputRef.current?.focus(); }, [open, user]);

  if (!open) return null;
  return (
    <div id="auth" className="auth" role="dialog" aria-labelledby="auth-title" data-ui onKeyDown={e => trapTab(e, e.currentTarget)}>
      <div className="auth-head">
        <h2 id="auth-title">{user ? 'Sua conta' : 'Entrar (opcional)'}</h2>
      </div>
      {user ? (
        <>
          <p>Seu progresso está salvo em <strong>{user.email}</strong> e aparece em qualquer aparelho em que você entrar.</p>
          <button className="btn btn-light" onClick={() => { void signOut(); onClose(); }}>Sair</button>
        </>
      ) : state === 'sent' ? (
        <>
          <p>Enviamos um link para <strong>{email}</strong>. Abra o e-mail neste mesmo navegador para entrar.</p>
          <button className="btn btn-light" onClick={() => setState('idle')}>Usar outro e-mail</button>
        </>
      ) : (
        <form onSubmit={async e => {
          e.preventDefault();
          setState('sending'); setError(null);
          const err = await signIn(email.trim());
          if (err) { setError(err); setState('idle'); } else setState('sent');
        }}>
          <p>Receba um link por e-mail, sem senha. O que você já marcou neste navegador vai junto para a conta.</p>
          <label htmlFor="auth-email">E-mail</label>
          <input id="auth-email" ref={inputRef} type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn btn-yellow" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar link de acesso'}</button>
        </form>
      )}
      {/* last in the DOM so Tab goes field, send, close; the panel keeps focus until it closes */}
      <button className="icon-btn" onClick={onClose} aria-label="Fechar"><Close /></button>
    </div>
  );
}
