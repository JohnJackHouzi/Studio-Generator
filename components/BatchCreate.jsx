'use client';
import { useState } from 'react';
import { parseMulti } from '@/lib/md';
import { layName } from '@/lib/brand';

const DOW = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MON = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function frDate(ymd, time) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return 'Sans date';
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return DOW[dt.getDay()] + ' ' + d + ' ' + MON[m - 1] + (time ? ' · ' + time : '');
}

// Onglet "Création groupée" : colle un document multi-posts, chaque post
// s'affiche avec sa date/heure et un bouton qui le programme direct sur Postiz.
export default function BatchCreate({ open, onClose, onScheduleOne, onOpen, busy, client }) {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [st, setSt] = useState({});       // index -> 'work' | 'done' | 'err'
  const [running, setRunning] = useState(false);

  if (!open) return null;
  const cats = client.categories || {};

  function analyse(t) { setPosts(parseMulti(t == null ? text : t)); setSt({}); }
  function loadFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => { setText(ev.target.result); analyse(ev.target.result); }; r.readAsText(f);
  }

  async function runOne(i) {
    setSt(s => ({ ...s, [i]: 'work' }));
    const res = await onScheduleOne(posts[i]);
    setSt(s => ({ ...s, [i]: res && res.ok ? 'done' : 'err' }));
    return res;
  }
  async function runAll() {
    setRunning(true);
    const done = { ...st };
    for (let i = 0; i < posts.length; i++) {
      if (done[i] === 'done') continue;
      const res = await runOne(i);
      done[i] = res && res.ok ? 'done' : 'err';
    }
    setRunning(false);
  }

  const dated = posts.filter(p => p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date)).length;
  const doneCount = posts.filter((_, i) => st[i] === 'done').length;

  return (
    <div className="planBackdrop" onClick={onClose}>
      <div className="planPanel" style={{ width: 820 }} onClick={e => e.stopPropagation()}>
        <div className="planHead">
          <h2 style={{ margin: 0 }}>Création groupée · {client.name}</h2>
          <button className="tbtn" style={{ marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
        </div>
        <p className="sublead">Colle ton document (posts séparés par <code>=== JOUR n · Titre ===</code>, avec <code>date=</code> et <code>heure=</code> dans <code>[meta]</code>). Chaque « Valider » programme le post sur Postiz à sa date.</p>
        <textarea className="planInput" value={text} onChange={e => setText(e.target.value)} placeholder="Colle ici ton calendrier multi-posts…" />
        <div className="planBtns">
          <label className="tbtn" style={{ cursor: 'pointer' }}>Charger un .md<input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={loadFile} style={{ display: 'none' }} /></label>
          <button className="tbtn" style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }} onClick={() => analyse()}>Analyser le document</button>
        </div>

        {posts.length > 0 && (
          <>
            <div className="planBar">
              <button className="btn btn-go" disabled={busy || running || !dated} onClick={runAll}>
                {running ? 'Programmation en cours…' : 'Tout valider et programmer'}
              </button>
              <span className="hint" style={{ margin: 0 }}>{doneCount}/{posts.length} programmé(s) · {dated} daté(s)</span>
            </div>
            {dated < posts.length && <div className="hint" style={{ marginTop: 6, color: '#C0892F' }}>⚠ {posts.length - dated} post(s) sans date (ajoute <code>date=</code> et <code>heure=</code> dans leur <code>[meta]</code>).</div>}
            <div className="planList">
              {posts.map((p, i) => {
                const cc = cats[p.cat] || {};
                const s = st[i];
                const noDate = !(p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date));
                return (
                  <div key={i} className={'dayCard' + (s === 'done' ? ' on' : '')}>
                    <div className="dayBody">
                      <div className="dayTop">
                        <span className="dayTag" style={{ background: cc.bg || '#222', color: cc.ink || '#fff' }}>{frDate(p.date, p.time)}</span>
                        <span className="dayCat" style={{ color: cc.accent || '#999' }}>{cc.name || p.cat}</span>
                      </div>
                      <div className="dayTitle">{p.title}</div>
                      <div className="dayMeta">{p.slides.length} pages · {p.slides.map(x => layName(x.layout)).join(', ')}</div>
                    </div>
                    <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      {onOpen && <button className="tbtn" onClick={() => onOpen(posts[i])}>Ouvrir / aperçu</button>}
                      {s === 'done'
                        ? <span style={{ color: '#3FA779', fontWeight: 800 }}>Programmé ✓</span>
                        : s === 'work'
                          ? <span className="hint" style={{ margin: 0 }}>Envoi à Postiz…</span>
                          : <button className="btn btn-go" disabled={busy || running || noDate} onClick={() => runOne(i)}>Valider et programmer</button>}
                      {s === 'err' && <button className="tbtn" style={{ color: '#C0392B' }} onClick={() => runOne(i)}>Erreur · réessayer</button>}
                      {noDate && s !== 'done' && <span className="hint" style={{ margin: 0, fontSize: 11 }}>sans date</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
