'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function send(e) {
    e.preventDefault();
    if (!email) return;
    setErr(''); setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/auth/callback' },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 380, maxWidth: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 18, padding: 32, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Studio</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Connecte-toi pour accéder à tes projets.</div>

        {sent ? (
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>Lien de connexion envoyé à <strong>{email}</strong>.</p>
            <p style={{ margin: '10px 0 0', color: 'var(--muted)' }}>Ouvre l’email et clique sur le lien pour entrer. Pense à vérifier les indésirables.</p>
            <button onClick={() => { setSent(false); setEmail(''); }} style={{ marginTop: 18, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, padding: 0 }}>Utiliser une autre adresse</button>
          </div>
        ) : (
          <form onSubmit={send}>
            <label>Adresse email</label>
            <input type="text" inputMode="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="toi@exemple.com" style={{ width: '100%' }} />
            {err ? <div style={{ color: 'var(--accent)', fontSize: 12.5, marginTop: 8 }}>{err}</div> : null}
            <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 16, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Envoi…' : 'Recevoir le lien de connexion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
