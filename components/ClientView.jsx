'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Post from '@/components/Post';
import { FORMATS } from '@/lib/brand';

const PLATFORMS = [['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['facebook', 'Facebook'], ['x', 'X'], ['tiktok', 'TikTok']];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DOW = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

export default function ClientView({ project, me, onSignOut }) {
  const supa = useMemo(() => createClient(), []);
  const cats = project.categories || {};
  const [POSTW, POSTH] = FORMATS.post;

  const [items, setItems] = useState([]);
  const [platform, setPlatform] = useState('instagram');
  const [view, setView] = useState('grid');
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(0);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [pins, setPins] = useState([]);
  const [existing, setExisting] = useState([]);
  const [comment, setComment] = useState('');
  const [tagTeam, setTagTeam] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  async function load() {
    const { data } = await supa.from('plan_items').select('id,title,cat,cta,slides,caption,date,validation').eq('project_id', project.id).order('date');
    setItems(data || []);
  }
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const openItem = items.find(i => i.id === openId) || null;
  const openSlides = (openItem && openItem.slides) || [];

  function themeFor(it, slide) { const c = cats[it.cat] || Object.values(cats)[0] || {}; return { bg: (slide && slide.bg) || c.bg, ink: c.ink, accent: c.accent, subt: c.subt }; }

  async function openPreview(it) {
    setOpenId(it.id); setPage(0); setAnnotateMode(false); setPins([]); setComment(''); setMsg('');
    const { data } = await supa.from('annotations').select('id,slide_index,x,y,body').eq('plan_item_id', it.id).order('created_at');
    setExisting(data || []);
  }
  async function validateItem(id) {
    setItems(items.map(i => (i.id === id ? { ...i, validation: 'valide' } : i)));
    await supa.from('plan_items').update({ validation: 'valide' }).eq('id', id);
    setOpenId(null);
  }
  async function validateAll() {
    setBusy(true);
    const todo = items.filter(i => i.validation !== 'valide');
    setItems(items.map(i => ({ ...i, validation: 'valide' })));
    for (const it of todo) await supa.from('plan_items').update({ validation: 'valide' }).eq('id', it.id);
    setBusy(false);
  }
  function addPin(e) {
    if (!annotateMode) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    setPins([...pins, { slideIndex: page, x, y, body: '' }]);
  }
  async function sendModif() {
    setBusy(true); setMsg('');
    const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: project.id, planItemId: openId, annotations: pins, comment, tagTeam }) });
    const d = await r.json(); setBusy(false);
    if (!d.ok) { setMsg(d.error || 'Erreur'); return; }
    setItems(items.map(i => (i.id === openId ? { ...i, validation: 'a_modifier' } : i)));
    setOpenId(null);
  }

  const Badge = ({ v }) => v === 'valide'
    ? <span title="Validé" style={{ background: '#5C7D6E', color: '#fff', borderRadius: 999, width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</span>
    : v === 'a_modifier'
      ? <span title="Modif demandée" style={{ background: '#E0A23C', color: '#fff', borderRadius: 999, width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✕</span>
      : null;

  function Cover({ it, scale }) {
    const slide = (it.slides && it.slides[0]) || {};
    return (
      <div style={{ width: POSTW * scale, height: POSTH * scale, overflow: 'hidden', position: 'relative', borderRadius: 8, boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => openPreview(it)}>
        <div style={{ width: POSTW, height: POSTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Post theme={themeFor(it, slide)} slide={slide} badgeText={project.defaultBadge || ''} urlText={project.footerUrl || ''} pageLabel={'1 / ' + ((it.slides || []).length || 1)} POSTW={POSTW} POSTH={POSTH} elements={slide.elements || []} onElements={() => {}} selEl={-1} setSelEl={() => {}} scale={scale} postRef={null} logo={project.logo || {}} fonts={project.fonts} />
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8 }}><Badge v={it.validation} /></div>
      </div>
    );
  }

  // calendrier
  const year = month.getFullYear(), m = month.getMonth();
  const startDow = (new Date(year, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = []; for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const byDate = {}; items.forEach(p => { (byDate[p.date] = byDate[p.date] || []).push(p); });

  const pending = items.filter(i => i.validation !== 'valide').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header className="top">
        <div className="pLogoHead" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {project.logo?.picto && <span style={{ width: 28, height: 28, display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: project.logo.picto }} />}
          <div className="mark">{project.name}</div>
        </div>
        <div className="tag">Validation</div>
        <div className="headSpacer" style={{ flex: 1 }} />
        <div className="seg" style={{ display: 'flex', gap: 4 }}>
          <button className={'tbtn' + (view === 'grid' ? ' on' : '')} onClick={() => setView('grid')}>Grille</button>
          <button className={'tbtn' + (view === 'calendar' ? ' on' : '')} onClick={() => setView('calendar')}>Calendrier</button>
        </div>
        <button className="btn btn-go" style={{ margin: 0, padding: '9px 14px' }} disabled={busy || !pending} onClick={validateAll}>Tout valider{pending ? ' (' + pending + ')' : ''}</button>
        <button className="tbtn" style={{ padding: '9px 12px' }} onClick={onSignOut}>Déconnexion</button>
      </header>

      <div style={{ display: 'flex', gap: 6, padding: '10px 18px', borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        {PLATFORMS.map(([k, label]) => (
          <button key={k} className={'tbtn' + (platform === k ? ' on' : '')} onClick={() => setPlatform(k)}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg)' }}>
        {!items.length && <div className="hint">Aucun post à valider pour le moment.</div>}

        {view === 'grid' && items.length > 0 && (
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {items.map(it => <Cover key={it.id} it={it} scale={236 / POSTW} />)}
            </div>
          </div>
        )}

        {view === 'calendar' && items.length > 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
            <div className="calNav" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button className="tbtn" onClick={() => setMonth(new Date(year, m - 1, 1))}>‹</button>
              <span className="calMonth" style={{ fontWeight: 700 }}>{MONTHS[m]} {year}</span>
              <button className="tbtn" onClick={() => setMonth(new Date(year, m + 1, 1))}>›</button>
            </div>
            <div className="calGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {DOW.map((d, i) => <div key={'h' + i} className="calDow" style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: 4 }}>{d}</div>)}
              {cells.map((c, i) => (
                <div key={i} className="calCell" style={{ minHeight: 64, border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: c ? '#fff' : 'transparent' }}>
                  {c && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.getDate()}</div>}
                  {c && (byDate[ymd(c)] || []).map(p => {
                    const cc = cats[p.cat] || {};
                    return (
                      <div key={p.id} onClick={() => openPreview(p)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: cc.bg || '#EEE', color: cc.ink || '#222', borderRadius: 6, padding: '3px 5px', marginTop: 3, cursor: 'pointer', fontSize: 11 }}>
                        <Badge v={p.validation} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {openItem && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.5)', zIndex: 90, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 18px' }} onClick={() => setOpenId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 18, width: 720, maxWidth: '96%', boxShadow: '0 26px 70px rgba(38,34,30,.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{openItem.title}</h2>
              <button className="tbtn" onClick={() => setOpenId(null)}>Fermer</button>
            </div>

            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <div style={{ width: POSTW * 0.34, height: POSTH * 0.34, overflow: 'hidden', position: 'relative', borderRadius: 10, boxShadow: 'var(--shadow)', cursor: annotateMode ? 'crosshair' : 'default' }} onClick={addPin}>
                  <div style={{ width: POSTW, height: POSTH, transform: `scale(${0.34})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                    <Post theme={themeFor(openItem, openSlides[page])} slide={openSlides[page] || {}} badgeText={project.defaultBadge || ''} urlText={project.footerUrl || ''} pageLabel={(page + 1) + ' / ' + (openSlides.length || 1)} POSTW={POSTW} POSTH={POSTH} elements={(openSlides[page] && openSlides[page].elements) || []} onElements={() => {}} selEl={-1} setSelEl={() => {}} scale={0.34} postRef={null} logo={project.logo || {}} fonts={project.fonts} />
                  </div>
                  {existing.filter(a => a.slide_index === page).map((a, i) => (
                    <span key={a.id} title={a.body} style={{ position: 'absolute', left: a.x + '%', top: a.y + '%', transform: 'translate(-50%,-50%)', background: '#E0A23C', color: '#fff', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
                  ))}
                  {pins.filter(p => p.slideIndex === page).map((p, i) => (
                    <span key={'n' + i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', transform: 'translate(-50%,-50%)', background: '#B85C3C', color: '#fff', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>•</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                  <button className="tbtn" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{page + 1} / {openSlides.length || 1}</span>
                  <button className="tbtn" disabled={page >= openSlides.length - 1} onClick={() => setPage(page + 1)}>›</button>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 240 }}>
                {!annotateMode ? (
                  <>
                    <h3 style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Légende</h3>
                    <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>{openItem.caption || '—'}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                      <button className="btn btn-go" style={{ margin: 0, flex: 1 }} onClick={() => validateItem(openItem.id)}>Valider ce post</button>
                      <button className="btn btn-ghost" style={{ margin: 0, flex: 1 }} onClick={() => setAnnotateMode(true)}>Demander une modif</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Annotations</h3>
                    <div className="hint" style={{ marginTop: 0 }}>Clique sur l'aperçu pour poser une note à un endroit précis.</div>
                    {pins.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{ background: '#B85C3C', color: '#fff', borderRadius: 999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{i + 1}</span>
                        <input type="text" value={p.body} placeholder="Ici je voudrais…" onChange={e => setPins(pins.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} style={{ flex: 1 }} />
                        <small onClick={() => setPins(pins.filter((_, j) => j !== i))} style={{ cursor: 'pointer', color: '#8A3F26' }}>×</small>
                      </div>
                    ))}
                    <h3 style={{ margin: '14px 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Commentaire</h3>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Explique ce que tu voudrais changer…" style={{ width: '100%', minHeight: 80 }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, textTransform: 'none', letterSpacing: 0, marginTop: 8 }}>
                      <input type="checkbox" checked={tagTeam} onChange={e => setTagTeam(e.target.checked)} style={{ width: 'auto' }} /> Notifier toute l'équipe
                    </label>
                    {msg && <div className="status show err" style={{ marginTop: 8 }}>{msg}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-ghost" style={{ margin: 0, flex: 1 }} onClick={() => { setAnnotateMode(false); setPins([]); }}>Annuler</button>
                      <button className="btn btn-go" style={{ margin: 0, flex: 1 }} disabled={busy} onClick={sendModif}>Envoyer</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
