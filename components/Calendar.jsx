'use client';
import { useState } from 'react';

export const STATUSES = ['idée', 'à valider', 'prêt', 'publié'];
const STATUS_COLOR = { 'idée': '#B8AE9E', 'à valider': '#C9892F', 'prêt': '#5C7D6E', 'publié': '#B85C3C' };
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DOW = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

export function ymdLocal(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function Calendar({ open, onClose, plan, onUpdateItem, onRemoveItem, onOpenPost, onSchedule, canEdit = true, busy, status, client }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  if (!open) return null;
  const cats = client.categories || {};
  const year = month.getFullYear(), m = month.getMonth();
  const startDow = (new Date(year, m, 1).getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const byDate = {}; plan.forEach(p => { (byDate[p.date] = byDate[p.date] || []).push(p); });

  function updateItem(id, patch) { onUpdateItem(id, patch); }
  function removeItem(id) { onRemoveItem(id); }

  return (
    <div className="planBackdrop" onClick={onClose}>
      <div className="planPanel" style={{ width: 900 }} onClick={e => e.stopPropagation()}>
        <div className="planHead">
          <h2 style={{ margin: 0 }}>Calendrier éditorial · {client.name}</h2>
          {status ? <span className="hint" style={{ marginLeft: 12 }}>{status}</span> : null}
          <button className="tbtn" style={{ marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
        </div>
        <div className="calNav">
          <button className="tbtn" onClick={() => setMonth(new Date(year, m - 1, 1))}>‹</button>
          <span className="calMonth">{MONTHS[m]} {year}</span>
          <button className="tbtn" onClick={() => setMonth(new Date(year, m + 1, 1))}>›</button>
          <span className="hint" style={{ marginLeft: 'auto' }}>{plan.length} post(s) planifié(s)</span>
        </div>
        <div className="calGrid">
          {DOW.map((d, i) => <div key={'h' + i} className="calDow">{d}</div>)}
          {cells.map((c, i) => (
            <div key={i} className={'calCell' + (c ? '' : ' empty')}>
              {c && <div className="calNum">{c.getDate()}</div>}
              {c && (byDate[ymdLocal(c)] || []).map(p => {
                const cc = cats[p.cat] || {};
                return (
                  <div key={p.id} className="calChip" style={{ background: cc.bg || '#EEE', color: cc.ink || '#222' }} title={p.title} onClick={() => onOpenPost(p)}>
                    <span className="calDot" style={{ background: STATUS_COLOR[p.status] || '#999' }} />{p.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <h3 style={{ margin: '18px 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Posts planifiés</h3>
        <div className="calList">
          {plan.length ? plan.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(p => {
            const cc = cats[p.cat] || {};
            return (
              <div key={p.id} className="calRow">
                <input type="date" value={p.date || ''} disabled={!canEdit} onChange={e => updateItem(p.id, { date: e.target.value })} />
                <input type="time" value={p.time || '10:00'} disabled={!canEdit} onChange={e => updateItem(p.id, { time: e.target.value })} style={{ width: 92 }} />
                <span className="calRowTitle" style={{ borderLeft: '4px solid ' + (cc.accent || '#999') }}>{p.title}</span>
                <select value={p.status} onChange={e => updateItem(p.id, { status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                <button className="tbtn" onClick={() => onOpenPost(p)}>Ouvrir</button>
                {canEdit && onSchedule && <button className="tbtn" disabled={busy} onClick={() => onSchedule(p)}>Programmer</button>}
                {canEdit && <button className="tbtn" style={{ color: '#8A3F26' }} onClick={() => removeItem(p.id)}>Retirer</button>}
              </div>
            );
          }) : <div className="hint">Aucun post planifié. Va dans Planning, coche des jours, puis « Ajouter au calendrier ».</div>}
        </div>
      </div>
    </div>
  );
}
