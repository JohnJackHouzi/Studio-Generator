'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBell({ onOpenItem }) {
  const supa = useMemo(() => createClient(), []);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supa.from('notifications').select('id,body,read,plan_item_id,created_at').order('created_at', { ascending: false }).limit(40);
    setItems(data || []);
  }
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = items.filter(i => !i.read).length;
  async function markRead(id) { setItems(items.map(i => (i.id === id ? { ...i, read: true } : i))); await supa.from('notifications').update({ read: true }).eq('id', id); }
  async function markAll() { setItems(items.map(i => ({ ...i, read: true }))); await supa.from('notifications').update({ read: true }).eq('read', false); }

  return (
    <div className="dropWrap" style={{ position: 'relative' }}>
      <button className="tbtn" style={{ padding: '9px 12px', position: 'relative' }} onClick={e => { e.stopPropagation(); setOpen(v => !v); }} title="Notifications">
        🔔{unread > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: '#B85C3C', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, minWidth: 16, height: 16, lineHeight: '16px', textAlign: 'center', padding: '0 3px' }}>{unread}</span>}
      </button>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 320, maxHeight: 380, overflowY: 'auto', background: '#fff', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 18px 50px rgba(38,34,30,.18)', zIndex: 80, padding: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 8px' }}>
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            {unread > 0 && <small onClick={markAll} style={{ cursor: 'pointer', color: 'var(--accent)' }}>tout marquer lu</small>}
          </div>
          {items.length ? items.map(n => (
            <div key={n.id} onClick={() => { markRead(n.id); if (n.plan_item_id && onOpenItem) onOpenItem(n.plan_item_id); setOpen(false); }}
              style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: n.read ? 'transparent' : 'var(--cream)', marginBottom: 2, fontSize: 13, lineHeight: 1.4 }}>
              <div>{n.body}</div>
              <small style={{ color: 'var(--muted)' }}>{new Date(n.created_at).toLocaleString('fr-FR')}</small>
            </div>
          )) : <div className="hint" style={{ padding: 8 }}>Aucune notification.</div>}
        </div>
      )}
    </div>
  );
}
