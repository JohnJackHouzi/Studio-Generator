'use client';
import { useState } from 'react';
import { parseMulti } from '@/lib/md';
import { CATEGORIES, layName } from '@/lib/brand';

const SAMPLE = `=== JOUR 1 · Pourquoi on procrastine le repos ===
[meta] category=c3 cta=BLOG_ARTICLE

[cover]
title: Pourquoi on procrastine le repos
subtitle: Ce n'est pas de la paresse, c'est un réflexe de protection.

[number]
chiffre: 1 sur 3
title: actifs déclarent culpabiliser en se reposant
subtitle: Le repos est devenu une performance de plus.

[list]
title: 3 signaux à écouter
- Tu remplis chaque créneau libre
- Tu te sens coupable à l'arrêt
- Tu repousses la pause à plus tard

[end]
title: Et si la pause était productive ?
subtitle: Lis l'article complet sur le blog.

[caption]
On confond souvent repos et oisiveté. Pourtant, ralentir n'est pas reculer.

#repos #charge #pausefeelgood

=== JOUR 2 · Le mythe du sommeil rattrapé ===
[meta] category=c5 cta=NEWSLETTER

[cover]
title: Le mythe du sommeil rattrapé
subtitle: Dormir douze heures le dimanche ne répare pas la semaine.

[text]
title: La dette de sommeil existe vraiment
subtitle: Mais elle ne se solde pas en une nuit, elle se prévient.

[method]
title: Un rituel du soir en 3 temps
- Couper les écrans trente minutes avant
- Baisser la lumière de la pièce
- Noter ce qui peut attendre demain

[end]
title: Un meilleur sommeil, sans méthode miracle
subtitle: Recevez le rituel complet dans la newsletter.

[caption]
Le sommeil se cultive le jour, pas seulement la nuit.

#sommeil #rituel #pausefeelgood`;

export default function Planning({ open, onClose, onOpen, onExport, onPostiz, onAddToPlan, busy, status }) {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [sel, setSel] = useState({});

  function analyse(t) {
    const list = parseMulti(t == null ? text : t);
    setPosts(list);
    const s = {}; list.forEach((_, i) => (s[i] = true)); setSel(s);
  }
  function loadFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => { const t = ev.target.result; setText(t); analyse(t); }; r.readAsText(f);
  }
  const selected = posts.filter((_, i) => sel[i]);
  const allOn = posts.length > 0 && posts.every((_, i) => sel[i]);

  if (!open) return null;
  return (
    <div className="planBackdrop" onClick={onClose}>
      <div className="planPanel" onClick={e => e.stopPropagation()}>
        <div className="planHead">
          <h2 style={{ margin: 0 }}>Planning · charger un document</h2>
          <button className="tbtn" onClick={onClose}>Fermer</button>
        </div>
        <p className="sublead">Colle ton document (plusieurs posts séparés par <code>=== JOUR n · Titre ===</code>) ou charge un fichier .md. Coche les jours, puis génère.</p>
        <textarea className="planInput" value={text} onChange={e => setText(e.target.value)} placeholder="Colle ici le planning multi-posts…" />
        <div className="planBtns">
          <button className="tbtn" onClick={() => { setText(SAMPLE); analyse(SAMPLE); }}>Insérer un exemple</button>
          <label className="tbtn" style={{ cursor: 'pointer' }}>Charger un .md<input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={loadFile} style={{ display: 'none' }} /></label>
          <button className="tbtn" style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }} onClick={() => analyse()}>Analyser le document</button>
        </div>

        {posts.length > 0 && (
          <>
            <div className="planBar">
              <label className="chk" style={{ margin: 0 }}>
                <input type="checkbox" checked={allOn} onChange={() => { const s = {}; posts.forEach((_, i) => (s[i] = !allOn)); setSel(s); }} />
                {allOn ? 'Tout décocher' : 'Tout cocher'}
              </label>
              <span className="hint" style={{ margin: 0 }}>{selected.length} jour(s) sélectionné(s) sur {posts.length}</span>
            </div>
            <div className="planList">
              {posts.map((p, i) => {
                const c = CATEGORIES[p.cat] || CATEGORIES.c1;
                return (
                  <div key={i} className={'dayCard' + (sel[i] ? ' on' : '')}>
                    <label className="dayPick"><input type="checkbox" checked={!!sel[i]} onChange={() => setSel(s => ({ ...s, [i]: !s[i] }))} /></label>
                    <div className="dayBody">
                      <div className="dayTop"><span className="dayTag" style={{ background: c.bg, color: c.ink }}>{p.day}</span><span className="dayCat" style={{ color: c.accent }}>{c.name}</span></div>
                      <div className="dayTitle">{p.title}</div>
                      <div className="dayMeta">{p.slides.length} pages · {p.slides.map(s => layName(s.layout)).join(', ')}</div>
                    </div>
                    <button className="tbtn" onClick={() => onOpen(p)}>Ouvrir</button>
                  </div>
                );
              })}
            </div>
            <div className="planFooter">
              <button className="btn btn-go" disabled={busy || !selected.length} onClick={() => onExport(selected)}>Exporter la sélection (ZIP)</button>
              <button className="btn btn-ghost" disabled={busy || !selected.length} onClick={() => onPostiz(selected)}>Brouillons Postiz de la sélection</button>
              {onAddToPlan ? <button className="btn btn-ghost" disabled={!selected.length} onClick={() => onAddToPlan(selected)}>Ajouter au calendrier</button> : null}
            </div>
            {status && <div className="status show ok" style={{ marginTop: 10 }}>{status}</div>}
          </>
        )}
      </div>
    </div>
  );
}
