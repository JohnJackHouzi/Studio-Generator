'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import Post from '@/components/Post';
import Planning from '@/components/Planning';
import { LAYOUTS, FORMATS, layName, clean, sampleSlide } from '@/lib/brand';
import { CLIENT_LIST, getClient, DEFAULT_CLIENT } from '@/lib/clients';
import { parseMD } from '@/lib/md';

const ALIGN_ICON = {
  left: <svg viewBox="0 0 24 24" className="ai"><rect x="2" y="3" width="2.4" height="18" rx="1.2" /><rect x="6.5" y="6" width="13" height="4" rx="1.5" opacity=".5" /><rect x="6.5" y="14" width="9" height="4" rx="1.5" opacity=".5" /></svg>,
  ch: <svg viewBox="0 0 24 24" className="ai"><rect x="10.8" y="3" width="2.4" height="18" rx="1.2" /><rect x="5" y="6" width="14" height="4" rx="1.5" opacity=".5" /><rect x="8" y="14" width="8" height="4" rx="1.5" opacity=".5" /></svg>,
  right: <svg viewBox="0 0 24 24" className="ai"><rect x="19.6" y="3" width="2.4" height="18" rx="1.2" /><rect x="4.5" y="6" width="13" height="4" rx="1.5" opacity=".5" /><rect x="8.5" y="14" width="9" height="4" rx="1.5" opacity=".5" /></svg>,
  top: <svg viewBox="0 0 24 24" className="ai"><rect x="3" y="2" width="18" height="2.4" rx="1.2" /><rect x="6" y="6.5" width="4" height="13" rx="1.5" opacity=".5" /><rect x="14" y="6.5" width="4" height="9" rx="1.5" opacity=".5" /></svg>,
  cv: <svg viewBox="0 0 24 24" className="ai"><rect x="3" y="10.8" width="18" height="2.4" rx="1.2" /><rect x="6" y="5" width="4" height="14" rx="1.5" opacity=".5" /><rect x="14" y="8" width="4" height="8" rx="1.5" opacity=".5" /></svg>,
  bot: <svg viewBox="0 0 24 24" className="ai"><rect x="3" y="19.6" width="18" height="2.4" rx="1.2" /><rect x="6" y="4.5" width="4" height="13" rx="1.5" opacity=".5" /><rect x="14" y="8.5" width="4" height="9" rx="1.5" opacity=".5" /></svg>,
};

function dl(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
function nextTick(ms) { return new Promise(r => setTimeout(r, ms)); }
function safeName(s) { return (s || '').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60); }

export default function Studio() {
  const [cat, setCat] = useState('c1');
  const [slides, setSlides] = useState([sampleSlide()]);
  const [current, setCurrent] = useState(0);
  const [format, setFormat] = useState('post');
  const [outputs, setOutputs] = useState({});
  const [model, setModel] = useState('claude-sonnet-4-6');
  const [topic, setTopic] = useState('Est-ce le bon moment pour changer de vie ?');
  const [tone, setTone] = useState('doux');
  const [audience, setAudience] = useState('grand public');
  const [count, setCount] = useState('auto');
  const [cta, setCta] = useState('');
  const [hdrBadge, setHdrBadge] = useState('');
  const [ftrUrl, setFtrUrl] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [incLinkedIn, setIncLinkedIn] = useState(false);
  const [selEl, setSelEl] = useState(-1);
  const [status, setStatus] = useState(null);
  const [status2, setStatus2] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [planStatus, setPlanStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [mdText, setMdText] = useState('');
  const [scale, setScale] = useState(0.5);
  const [generating, setGenerating] = useState(false);
  const [clientKey, setClientKey] = useState(DEFAULT_CLIENT);
  const [projectOpen, setProjectOpen] = useState(false);
  const [unlocked, setUnlocked] = useState({ [DEFAULT_CLIENT]: true });
  const [tokenPrompt, setTokenPrompt] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [userProjects, setUserProjects] = useState({});
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [npName, setNpName] = useState('');
  const [npToken, setNpToken] = useState('');
  const [npCharte, setNpCharte] = useState('');
  const [npErr, setNpErr] = useState('');

  const postRef = useRef(null);
  const stageRef = useRef(null);
  const fontCss = useRef(null);

  const client = userProjects[clientKey] || getClient(clientKey);
  const allProjects = [...CLIENT_LIST, ...Object.values(userProjects)];
  const CATEGORIES = client.categories;
  const CTAS = client.ctas;
  const MD_EXAMPLE = client.mdExample;
  const [POSTW, POSTH] = FORMATS[format] || FORMATS.post;
  const c = CATEGORIES[cat] || Object.values(CATEGORIES)[0];
  const slide = slides[current] || sampleSlide();
  const theme = { bg: slide.bg || c.bg, ink: c.ink, accent: c.accent, subt: c.subt };
  const badgeText = (hdrBadge || '').trim() || client.defaultBadge;
  const urlText = (ftrUrl || '').trim() || client.footerUrl;
  const selElement = selEl >= 0 ? (slide.elements || [])[selEl] : null;

  /* ===== init ===== */
  useEffect(() => {
    setModel(localStorage.getItem('pfg-model') || 'claude-sonnet-4-6');
    try { setUserProjects(JSON.parse(localStorage.getItem('pfg-userprojects') || '{}')); } catch (e) {}
    loadDrafts();
  }, []);
  useEffect(() => { localStorage.setItem('pfg-model', model); }, [model]);
  useEffect(() => { loadDrafts(); }, [clientKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===== changement de projet (avec token) ===== */
  function projByKey(key) { return userProjects[key] || getClient(key); }
  function applyProject(key) {
    const cl = projByKey(key);
    setClientKey(key); setSelEl(-1);
    setCat(Object.keys(cl.categories)[0]);
    setSlides([sampleSlide()]); setCurrent(0); setOutputs({}); setCta('');
    setHdrBadge(''); setFtrUrl('');
  }
  function chooseProject(key) {
    setProjectOpen(false);
    if (key === clientKey) return;
    const cl = projByKey(key);
    if (cl.token && !unlocked[key]) { setTokenPrompt(key); setTokenInput(''); return; }
    applyProject(key);
  }
  function submitToken() {
    const cl = projByKey(tokenPrompt);
    if (tokenInput === cl.token) { setUnlocked(u => ({ ...u, [tokenPrompt]: true })); applyProject(tokenPrompt); setTokenPrompt(null); }
    else { setStatus({ cls: 'err', msg: 'Token incorrect pour ' + cl.name + '.' }); }
  }
  function persistProjects(obj) { setUserProjects(obj); try { localStorage.setItem('pfg-userprojects', JSON.stringify(obj)); } catch (e) {} }
  function slug(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'projet'; }
  function createProject() {
    setNpErr('');
    let cfg;
    try { cfg = JSON.parse(npCharte); } catch (e) { setNpErr("La charte n'est pas un JSON valide."); return; }
    if (!cfg || !cfg.categories || !cfg.ctas) { setNpErr('La charte doit contenir « categories » et « ctas ».'); return; }
    const name = (npName || cfg.name || 'Nouveau projet').trim();
    const taken = k => (getClient(k).key === k) || userProjects[k];
    let key = slug(name), n = 2; while (taken(key)) { key = slug(name) + '-' + n; n++; }
    const proj = { ...cfg, key, name, token: npToken || '', footerUrl: cfg.footerUrl || '', defaultBadge: cfg.defaultBadge || '', fonts: cfg.fonts || { serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" }, logo: cfg.logo || {}, postiz: cfg.postiz || {}, voice: cfg.voice || '' };
    persistProjects({ ...userProjects, [key]: proj });
    setUnlocked(u => ({ ...u, [key]: true }));
    setNewProjOpen(false); setNpName(''); setNpToken(''); setNpCharte('');
    applyProject(key);
  }
  function deleteProject(key) {
    const obj = { ...userProjects }; delete obj[key]; persistProjects(obj);
    if (clientKey === key) applyProject(DEFAULT_CLIENT);
  }

  /* fermer les dropdowns au clic extérieur */
  useEffect(() => {
    const close = (e) => { if (e.target && e.target.closest && e.target.closest('.dropWrap')) return; setModelOpen(false); setProjectOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setExportOpen(false); setModelOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ===== fitScale ===== */
  const recalc = useCallback(() => {
    const st = stageRef.current; if (!st) return;
    let aw = st.clientWidth - 56, ah = st.clientHeight - 56;
    if (aw < 120) aw = window.innerWidth - 440; if (ah < 120) ah = window.innerHeight - 300;
    let s = Math.min(0.62, aw / POSTW, ah / POSTH); if (!(s > 0)) s = 0.4;
    setScale(s);
  }, [POSTW, POSTH]);
  useEffect(() => { recalc(); const on = () => recalc(); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, [recalc]);
  useEffect(() => { const t = setTimeout(recalc, 260); return () => clearTimeout(t); }, [collapsed, recalc, slides.length]);

  /* ===== éléments ===== */
  const onElements = useCallback((nextEls) => {
    setSlides(prev => prev.map((s, k) => (k === current ? { ...s, elements: nextEls } : s)));
  }, [current]);

  function addEl(type) {
    const cy = Math.round(POSTH / 2);
    let el;
    if (type === 'image') el = { type: 'image', x: 300, y: cy - 240, w: 480, h: 480, radius: 24, opacity: 100, content: '', fx: 50, fy: 50, rot: 0 };
    else if (type === 'video') el = { type: 'video', x: 240, y: cy - 380, w: 600, h: 760, radius: 24, opacity: 100, content: '', fx: 50, fy: 50, rot: 0 };
    else if (type === 'button') el = { type: 'button', x: 360, y: POSTH - 260, w: 380, h: 100, radius: 100, opacity: 100, content: 'En savoir plus', bg: '#2A2622', color: '#FFFFFF', fontSize: 32, rot: 0 };
    else {
      const pr = { text: { fontSize: 60, serif: true, content: 'Ton texte', color: '#2A2622', h: 130 }, title: { fontSize: 90, serif: true, content: 'Titre', color: '#2A2622', h: 220 }, subtitle: { fontSize: 46, serif: false, content: 'Sous-titre', color: '#7A7066', h: 120 }, label: { fontSize: 26, serif: false, content: 'ÉTIQUETTE', color: '#9A6841', h: 60 } }[type] || {};
      el = { type: 'text', x: 150, y: cy - 90, w: 780, h: pr.h || 130, radius: 0, opacity: 100, content: pr.content, color: pr.color, fontSize: pr.fontSize, serif: pr.serif, rot: 0 };
    }
    const len = (slides[current].elements || []).length;
    setSlides(prev => prev.map((s, k) => (k === current ? { ...s, elements: [...(s.elements || []), el] } : s)));
    setSelEl(len);
  }
  function patchEl(patch) {
    setSlides(prev => prev.map((s, k) => {
      if (k !== current) return s;
      const els = (s.elements || []).slice();
      if (selEl < 0 || !els[selEl]) return s;
      els[selEl] = { ...els[selEl], ...patch };
      return { ...s, elements: els };
    }));
  }
  function elAction(kind) {
    const els0 = slides[current].elements || [];
    if (selEl < 0 || !els0[selEl]) return;
    if (kind === 'dup') { setSelEl(els0.length); }
    else if (kind === 'front') { setSelEl(els0.length - 1); }
    else if (kind === 'back') { setSelEl(0); }
    else if (kind === 'del') { setSelEl(-1); }
    setSlides(prev => prev.map((s, k) => {
      if (k !== current) return s;
      let els = (s.elements || []).slice();
      if (selEl < 0 || !els[selEl]) return s;
      if (kind === 'dup') { const cpy = { ...els[selEl], x: (els[selEl].x || 0) + 34, y: (els[selEl].y || 0) + 34, locked: false }; els.push(cpy); }
      else if (kind === 'front') { els.push(els.splice(selEl, 1)[0]); }
      else if (kind === 'back') { els.unshift(els.splice(selEl, 1)[0]); }
      else if (kind === 'del') { els.splice(selEl, 1); }
      else if (kind === 'lock') { els[selEl] = { ...els[selEl], locked: !els[selEl].locked }; }
      return { ...s, elements: els };
    }));
  }
  function align(dir) {
    const el = selElement; if (!el) return;
    if (dir === 'left') patchEl({ x: 0 });
    else if (dir === 'ch') patchEl({ x: Math.round((POSTW - el.w) / 2) });
    else if (dir === 'right') patchEl({ x: Math.round(POSTW - el.w) });
    else if (dir === 'top') patchEl({ y: 0 });
    else if (dir === 'cv') patchEl({ y: Math.round((POSTH - el.h) / 2) });
    else if (dir === 'bot') patchEl({ y: Math.round(POSTH - el.h) });
  }

  /* clavier : suppr / flèches sur l'élément sélectionné */
  useEffect(() => {
    const onKey = e => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (selEl < 0) return;
      const el = (slides[current].elements || [])[selEl]; if (!el) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { elAction('del'); e.preventDefault(); }
      else if (e.key.indexOf('Arrow') === 0) {
        const st = e.shiftKey ? 20 : 4; const p = {};
        if (e.key === 'ArrowLeft') p.x = el.x - st; else if (e.key === 'ArrowRight') p.x = el.x + st;
        else if (e.key === 'ArrowUp') p.y = el.y - st; else if (e.key === 'ArrowDown') p.y = el.y + st;
        patchEl(p); e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selEl, current, slides]);

  /* ===== génération via API ===== */
  function buildUserPrompt() {
    const ck = cta || c.cta;
    const n = count === 'auto' ? 'le nombre de pages que tu juges nécessaire (entre 4 et 8)' : (count + ' pages');
    return `${c.prompt}

Construis un CARROUSEL Instagram complet et cohérent de ${n}.
Sujet / angle : ${topic}
Ton : ${tone}
Public : ${audience}
${customContext ? 'Contexte : ' + customContext : ''}
CTA à intégrer en dernière page et dans la légende : ${CTAS[ck].label} (${CTAS[ck].tone})
${incLinkedIn ? 'Génère aussi une version LinkedIn dans linkedinPost.' : 'Laisse linkedinPost vide.'}

Exigences de qualité (important, le contenu actuel est trop plat) :
- Apporte un angle NON évident : une donnée concrète, un fait surprenant, un chiffre parlant, un mécanisme psychologique précis. Évite les généralités creuses du type "prends du temps pour toi".
- VARIE les mises en page d'une page à l'autre, jamais deux fois la même d'affilée.
- Inclus OBLIGATOIREMENT au moins une page "number" ET au moins une page "list" ou "method".
- Chaque page doit être SUBSTANTIELLE : un titre court PLUS un texte de soutien d'au moins une phrase pleine (subtitle), ou une liste de 3 à 5 items.
- Pour "definition" : donne le mot (title) ET sa définition complète (subtitle).
- Pour "quote" : donne la phrase (title), l'auteur (quoteAuthor) et une phrase de contexte (subtitle).
- Pour "number" : bigNumber = le chiffre, title = ce qu'il signifie, subtitle = l'enseignement.
- Progression narrative : accroche, constat, idées concrètes, nuance, puis CTA.

Structure :
- Page 1 : layout "cover".
- Pages intermédiaires : layouts variés parmi "text", "number", "method", "list", "quote", "definition".
- Dernière page : layout "end".

Règles d'écriture : aucun emoji, aucun tiret, ponctuation française, pas de capitales abusives.
Utilise l'outil create_carousel.`;
  }
  async function generate() {
    setGenerating(true); setStatus({ cls: 'ok', msg: 'Génération du carrousel…' });
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, userPrompt: buildUserPrompt(), clientKey, voice: client.voice }) });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message || 'Erreur API');
      const tu = (data.content || []).find(x => x.type === 'tool_use'); if (!tu) throw new Error('Réponse inattendue.');
      const o = tu.input;
      const sl = (o.slides || []).map(s => ({ layout: LAYOUTS.includes(s.layout) ? s.layout : 'text', kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] }));
      setSlides(sl.length ? sl : [sampleSlide()]); setCurrent(0); setSelEl(-1);
      setOutputs({ instagramCaption: clean(o.instagramCaption), linkedinPost: clean(o.linkedinPost), seoTitle: clean(o.seoTitle), seoMetaDescription: clean(o.seoMetaDescription), primaryKeyword: o.primaryKeyword, midjourneyPrompt: o.midjourneyPrompt });
      setStatus({ cls: 'ok', msg: 'Carrousel généré : ' + sl.length + ' pages.' });
    } catch (e) { setStatus({ cls: 'err', msg: 'Souci : ' + e.message }); }
    finally { setGenerating(false); }
  }

  /* ===== import markdown ===== */
  function buildFromMD() {
    const p = parseMD(mdText || '');
    if (!p.slides.length) { setStatus({ cls: 'err', msg: 'Aucune page détectée. Clique « Insérer un exemple ».' }); return; }
    if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
    if (p.cta && CTAS[p.cta]) setCta(p.cta);
    setSlides(p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] })));
    setCurrent(0); setSelEl(-1);
    if (p.caption) setOutputs(g => ({ ...g, instagramCaption: clean(p.caption) }));
    setStatus({ cls: 'ok', msg: 'Carrousel construit : ' + p.slides.length + ' pages. Zéro API.' });
  }

  /* ===== exports ===== */
  async function ensureFonts() {
    try { await Promise.all([document.fonts.load("italic 600 120px 'Playfair Display'"), document.fonts.load("italic 500 120px 'Playfair Display'"), document.fonts.load("600 40px 'DM Sans'"), document.fonts.load("700 40px 'DM Sans'"), document.fonts.load("400 40px 'DM Sans'")]); } catch (e) {}
    await document.fonts.ready;
  }
  async function capture() {
    await ensureFonts();
    if (fontCss.current === null) { try { const r = await fetch('/api/fontcss'); fontCss.current = await r.text(); } catch (e) { fontCss.current = ''; } }
    return toPng(postRef.current, { width: POSTW, height: POSTH, pixelRatio: 2, cacheBust: true, fontEmbedCSS: fontCss.current || undefined, style: { transform: 'none' } });
  }
  async function captureAt(i) { setSelEl(-1); setCurrent(i); await nextTick(220); return capture(); }

  async function dlOne() {
    try { const u = await captureAt(current); dl(u, 'pfg-' + cat + '-page' + (current + 1) + '.png'); setStatus2({ cls: 'ok', msg: 'Page téléchargée.' }); }
    catch (e) { setStatus2({ cls: 'err', msg: e.message }); }
  }
  async function dlAll() {
    setStatus2({ cls: 'ok', msg: 'Génération des ' + slides.length + ' pages…' });
    try {
      const zip = new JSZip(); const cur = current; setSelEl(-1);
      for (let i = 0; i < slides.length; i++) { const u = await captureAt(i); zip.file('page-' + (i + 1) + '.png', u.split(',')[1], { base64: true }); }
      setCurrent(cur);
      const blob = await zip.generateAsync({ type: 'blob' }); dl(URL.createObjectURL(blob), 'pfg-carrousel-' + cat + '-' + Date.now() + '.zip');
      setStatus2({ cls: 'ok', msg: 'Carrousel complet téléchargé (ZIP).' });
    } catch (e) { setStatus2({ cls: 'err', msg: e.message }); }
  }
  async function dlPdf() {
    setStatus2({ cls: 'ok', msg: 'Génération du PDF…' });
    try {
      const { jsPDF } = await import('jspdf');
      const cur = current; setSelEl(-1);
      const orient = POSTW > POSTH ? 'l' : 'p';
      const pdf = new jsPDF({ orientation: orient, unit: 'px', format: [POSTW, POSTH], compress: true });
      for (let i = 0; i < slides.length; i++) {
        const u = await captureAt(i);
        if (i > 0) pdf.addPage([POSTW, POSTH], orient);
        pdf.addImage(u, 'PNG', 0, 0, POSTW, POSTH);
      }
      setCurrent(cur);
      pdf.save('pfg-carrousel-' + cat + '-' + Date.now() + '.pdf');
      setStatus2({ cls: 'ok', msg: 'PDF téléchargé (prêt pour LinkedIn).' });
    } catch (e) { setStatus2({ cls: 'err', msg: e.message }); }
  }
  async function copyCap() { try { await navigator.clipboard.writeText(outputs.instagramCaption || ''); setStatus2({ cls: 'ok', msg: 'Légende copiée.' }); } catch (e) { setStatus2({ cls: 'err', msg: 'Copie impossible.' }); } }
  function dlMd() {
    const g = outputs; let md = '# Carrousel · ' + c.name + '\n\n';
    slides.forEach((s, i) => { md += '## Page ' + (i + 1) + ' (' + layName(s.layout) + ')\n- Titre : ' + (s.title || '') + '\n' + (s.subtitle ? '- Texte : ' + s.subtitle + '\n' : '') + (s.listItems && s.listItems.length ? '- Items : ' + s.listItems.join(' / ') + '\n' : '') + '\n'; });
    md += '## Légende Instagram\n' + (g.instagramCaption || '') + '\n' + (g.linkedinPost ? '\n## LinkedIn\n' + g.linkedinPost + '\n' : '') + '\n## SEO\n- Title : ' + (g.seoTitle || '') + '\n- Meta : ' + (g.seoMetaDescription || '') + '\n- Mot clé : ' + (g.primaryKeyword || '') + '\n\n## Prompt image\n' + (g.midjourneyPrompt || '') + '\n';
    dl(URL.createObjectURL(new Blob([md], { type: 'text/markdown' })), 'pfg-carrousel-' + Date.now() + '.md'); setStatus2({ cls: 'ok', msg: 'Markdown exporté.' });
  }
  async function toPostiz() {
    const cap = outputs.instagramCaption; if (!cap) { setStatus2({ cls: 'err', msg: 'Génère d’abord un carrousel.' }); return; }
    setStatus2({ cls: 'ok', msg: 'Capture des images du carrousel…' });
    try {
      const cur = current; setSelEl(-1);
      const imgs = [];
      for (let i = 0; i < slides.length; i++) { imgs.push(await captureAt(i)); }
      setCurrent(cur);
      setStatus2({ cls: 'ok', msg: 'Envoi à Postiz (' + imgs.length + ' images)…' });
      const r = await fetch('/api/postiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: cap, clientKey, channels: client.postiz, images: imgs }) });
      const d = await r.json();
      if (d.ok) setStatus2({ cls: 'ok', msg: 'Brouillon Postiz créé avec ' + (d.media || 0) + ' image(s).' });
      else setStatus2({ cls: 'err', msg: 'Postiz a répondu ' + (d.status || '') + ' ' + (d.error || '') + '.' });
    } catch (e) { setStatus2({ cls: 'err', msg: 'Postiz : ' + e.message }); }
  }

  /* ===== drafts ===== */
  function draftsKey() { return 'pfg-carrousels-' + clientKey; }
  function loadDrafts() { try { setDrafts(JSON.parse(localStorage.getItem(draftsKey()) || '[]')); } catch (e) { setDrafts([]); } }
  function save() { const k = draftsKey(); const a = JSON.parse(localStorage.getItem(k) || '[]'); a.unshift({ at: new Date().toISOString(), cat, slides, global: outputs }); localStorage.setItem(k, JSON.stringify(a.slice(0, 30))); loadDrafts(); setStatus2({ cls: 'ok', msg: 'Carrousel sauvegardé.' }); }
  function openDraft(d) { setCat(d.cat); setSlides(d.slides.map(s => ({ ...s, elements: s.elements || [] }))); setOutputs(d.global || {}); setCurrent(0); setSelEl(-1); setExportOpen(false); }

  /* ===== planning ===== */
  function openPost(p) {
    if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
    if (p.cta && CTAS[p.cta]) setCta(p.cta);
    setSlides(p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] })));
    setCurrent(0); setSelEl(-1);
    if (p.caption) setOutputs(g => ({ ...g, instagramCaption: clean(p.caption) }));
    setPlanningOpen(false);
  }
  async function exportPlanning(posts) {
    setBusy(true); setPlanStatus('Préparation…');
    const savedSlides = slides, savedCur = current, savedCat = cat;
    try {
      const zip = new JSZip(); setSelEl(-1);
      for (let pi = 0; pi < posts.length; pi++) {
        const p = posts[pi];
        if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
        const ps = p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] }));
        setSlides(ps);
        const folder = zip.folder(safeName(p.day + ' ' + p.title) || ('jour-' + (pi + 1)));
        for (let i = 0; i < ps.length; i++) { setCurrent(i); await nextTick(240); const u = await capture(); folder.file('page-' + (i + 1) + '.png', u.split(',')[1], { base64: true }); }
        setPlanStatus('Jour ' + (pi + 1) + '/' + posts.length + ' exporté');
      }
      const blob = await zip.generateAsync({ type: 'blob' }); dl(URL.createObjectURL(blob), 'pfg-planning-' + Date.now() + '.zip');
      setPlanStatus('Export terminé : ' + posts.length + ' jour(s).');
    } catch (e) { setPlanStatus('Souci : ' + e.message); }
    finally { setCat(savedCat); setSlides(savedSlides); setCurrent(Math.min(savedCur, savedSlides.length - 1)); setBusy(false); }
  }
  async function postizPlanning(posts) {
    setBusy(true); let ok = 0;
    const savedSlides = slides, savedCur = current, savedCat = cat;
    try {
      setSelEl(-1);
      for (let pi = 0; pi < posts.length; pi++) {
        const p = posts[pi]; if (!p.caption) continue;
        if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
        const ps = p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] }));
        setSlides(ps);
        const imgs = [];
        for (let i = 0; i < ps.length; i++) { setCurrent(i); await nextTick(240); imgs.push(await capture()); }
        try { const r = await fetch('/api/postiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: p.caption, clientKey, channels: client.postiz, images: imgs }) }); const d = await r.json(); if (d.ok) ok++; } catch (e) {}
        setPlanStatus('Postiz : ' + ok + '/' + posts.length + ' brouillon(s) avec images…');
      }
    } catch (e) {}
    finally { setCat(savedCat); setSlides(savedSlides); setCurrent(Math.min(savedCur, savedSlides.length - 1)); setBusy(false); }
    setPlanStatus('Postiz : ' + ok + ' brouillon(s) avec images créé(s).');
  }

  /* ===== page editor helpers ===== */
  function updateSlide(i, patch) { setSlides(prev => prev.map((s, k) => (k === i ? { ...s, ...patch } : s))); }
  function addPage() { setSlides(prev => [...prev, { layout: 'text', kicker: '', title: 'Nouvelle page', subtitle: '', body: '', bigNumber: '', quoteAuthor: '', listItems: [], elements: [] }]); setCurrent(slides.length); }
  function delPage(i) { if (slides.length <= 1) return; setSlides(prev => prev.filter((_, k) => k !== i)); setCurrent(c2 => Math.min(c2, slides.length - 2)); setSelEl(-1); }
  function movePage(i, dir) { const j = i + dir; if (j < 0 || j >= slides.length) return; setSlides(prev => { const a = prev.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; return a; }); setCurrent(j); setSelEl(-1); }

  const ck = cta || c.cta;
  const pageLabel = (current + 1) + ' / ' + slides.length;
  const TYPE = { image: 'Image', text: 'Texte', button: 'Bouton', video: 'Vidéo' };

  return (
    <>
      <header className="top">
        <button className="collapseBtn" onClick={() => setCollapsed(v => !v)} title="Replier / déplier le menu">☰</button>
        <div className="mark">{client.name}</div><div className="tag">Studio carrousels</div>
        <div className="headSpacer" />
        <div className="modelPick">
          <span className="lbl">Projet</span>
          <div className="dropWrap">
            <button className={'dropBtn' + (projectOpen ? ' open' : '')} onClick={e => { e.stopPropagation(); setProjectOpen(v => !v); }}>
              <span>{client.name}</span><span className="chev">▾</span>
            </button>
            {projectOpen && (
              <div className="dropList open" onClick={e => e.stopPropagation()}>
                {allProjects.map(cl => (
                  <button key={cl.key} className={cl.key === clientKey ? 'sel' : ''} onClick={() => chooseProject(cl.key)}>
                    <span>{cl.name}{cl.token ? <small style={{ marginLeft: 6 }}>privé</small> : null}</span>
                    {userProjects[cl.key] ? <small onClick={e => { e.stopPropagation(); if (window.confirm('Supprimer le projet ' + cl.name + ' ?')) deleteProject(cl.key); }} style={{ cursor: 'pointer', color: '#8A3F26' }}>supprimer</small> : null}
                  </button>
                ))}
                <button onClick={() => { setProjectOpen(false); setNewProjOpen(true); setNpErr(''); }} style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 11, fontWeight: 800, justifyContent: 'flex-start' }}>+ Nouveau projet</button>
              </div>
            )}
          </div>
        </div>
        <button className="tbtn" style={{ padding: '9px 14px' }} onClick={() => setPlanningOpen(true)}>Planning</button>
        <div className="modelPick">
          <span className="lbl">Modèle</span>
          <div className="dropWrap">
            <button className={'dropBtn' + (modelOpen ? ' open' : '')} onClick={e => { e.stopPropagation(); setModelOpen(v => !v); }}>
              <span>{model === 'claude-opus-4-7' ? 'Opus 4.7' : 'Sonnet 4.6'}</span><span className="chev">▾</span>
            </button>
            {modelOpen && (
              <div className="dropList open" onClick={e => e.stopPropagation()}>
                <button className={model === 'claude-sonnet-4-6' ? 'sel' : ''} onClick={() => { setModel('claude-sonnet-4-6'); setModelOpen(false); }}>Sonnet 4.6 <small>~0,02 € · défaut</small></button>
                <button className={model === 'claude-opus-4-7' ? 'sel' : ''} onClick={() => { setModel('claude-opus-4-7'); setModelOpen(false); }}>Opus 4.7 <small>~0,09 € · premium</small></button>
              </div>
            )}
          </div>
        </div>
        <button className={'exportBtn' + (exportOpen ? ' open' : '')} onClick={e => { e.stopPropagation(); setExportOpen(v => !v); }}>Exporter / Partager <span className="chev">▾</span></button>
      </header>

      {exportOpen && <div className="exportBackdrop open" onClick={() => setExportOpen(false)} />}
      {exportOpen && (
        <div className="exportPanel open" onClick={e => e.stopPropagation()}>
          <h2>Exporter &amp; partager</h2>
          <div className="sublead">Tout le carrousel en images, la légende, le brouillon Postiz.</div>
          <div className="exportGrid">
            <button className="btn btn-go span2" onClick={dlAll}>Télécharger le carrousel (ZIP)</button>
            <button className="btn btn-ghost span2" onClick={dlPdf}>Télécharger en PDF (LinkedIn)</button>
            <button className="btn btn-ghost" onClick={dlOne}>Page affichée (PNG)</button>
            <button className="btn btn-ghost" onClick={copyCap}>Copier la légende</button>
            <button className="btn btn-ghost" onClick={toPostiz}>Brouillon Postiz</button>
            <button className="btn btn-ghost" onClick={dlMd}>Export Markdown</button>
            <button className="btn btn-ghost span2" onClick={save}>Sauvegarder le brouillon</button>
          </div>
          {status2 && <div className={'status show ' + status2.cls}>{status2.msg}</div>}
          <h3>Légende Instagram</h3><div className="out">{outputs.instagramCaption || '—'}</div>
          <h3>SEO</h3><div className="out">{outputs.seoTitle ? `Title (${(outputs.seoTitle || '').length}/55) : ${outputs.seoTitle}\nMeta (${(outputs.seoMetaDescription || '').length}/120) : ${outputs.seoMetaDescription}\nMot clé : ${outputs.primaryKeyword || ''}` : '—'}</div>
          {outputs.linkedinPost && (<><h3>LinkedIn</h3><div className="out">{outputs.linkedinPost}</div></>)}
          <h3>Prompt image (Midjourney)</h3><div className="out" style={{ fontSize: 12 }}>{outputs.midjourneyPrompt || '—'}</div>
          <h3>Brouillons sauvegardés</h3>
          <div>{drafts.length ? drafts.map((d, i) => (
            <div className="draft" key={i} onClick={() => openDraft(d)}><b>{(d.slides[0] && d.slides[0].title) || '(carrousel)'}</b><span>{(CATEGORIES[d.cat] || {}).name || d.cat} · {d.slides.length} pages · {new Date(d.at).toLocaleString('fr-FR')}</span></div>
          )) : <div className="hint">Aucun brouillon.</div>}</div>
        </div>
      )}

      {tokenPrompt && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.34)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setTokenPrompt(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22, width: 360, maxWidth: '92%', boxShadow: '0 26px 70px rgba(38,34,30,.24)' }}>
            <h2 style={{ marginBottom: 6 }}>Accès au projet</h2>
            <div className="hint" style={{ marginTop: 0, marginBottom: 12 }}>{getClient(tokenPrompt).name} est protégé. Entre son token d'accès.</div>
            <input type="password" value={tokenInput} onChange={e => setTokenInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitToken(); }} placeholder="Token" autoFocus />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ margin: 0 }} onClick={() => setTokenPrompt(null)}>Annuler</button>
              <button className="btn btn-go" style={{ margin: 0 }} onClick={submitToken}>Ouvrir</button>
            </div>
          </div>
        </div>
      )}

      {newProjOpen && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.34)', zIndex: 70, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 18px' }} onClick={() => setNewProjOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22, width: 520, maxWidth: '94%', boxShadow: '0 26px 70px rgba(38,34,30,.24)' }}>
            <h2 style={{ marginBottom: 6 }}>Nouveau projet</h2>
            <div className="hint" style={{ marginTop: 0, marginBottom: 14 }}>Colle la charte (JSON) produite par l'« Usine à identité ». Le token protège l'accès au projet (optionnel).</div>
            <div className="field"><label>Nom du projet</label><input type="text" value={npName} onChange={e => setNpName(e.target.value)} placeholder="Conte de Faits" /></div>
            <div className="field"><label>Token d'accès (optionnel)</label><input type="text" value={npToken} onChange={e => setNpToken(e.target.value)} placeholder="Vide = accès ouvert" /></div>
            <div className="field"><label>Charte (JSON)</label><textarea value={npCharte} onChange={e => setNpCharte(e.target.value)} placeholder={'{ "footerUrl": "...", "defaultBadge": "...", "voice": "...", "categories": { ... }, "ctas": { ... } }'} style={{ minHeight: 160, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} /></div>
            {npErr && <div className="status show err">{npErr}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost" style={{ margin: 0 }} onClick={() => setNewProjOpen(false)}>Annuler</button>
              <button className="btn btn-go" style={{ margin: 0 }} onClick={createProject}>Créer le projet</button>
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        {/* COLONNE GAUCHE */}
        <aside className={'form col' + (collapsed ? ' collapsed' : '')}>
          {selElement && (
            <div className="elctrl show">
              <div className="ehead">{(TYPE[selElement.type] || 'Élément')} sélectionné</div>
              <div className="row"><label>Largeur</label><input type="number" value={selElement.w} onChange={e => patchEl({ w: Math.max(40, +e.target.value || 40) })} /><label style={{ minWidth: 'auto' }}>Hauteur</label><input type="number" value={selElement.h} onChange={e => patchEl({ h: Math.max(40, +e.target.value || 40) })} /></div>
              <div className="row"><label>Arrondi</label><input type="number" value={selElement.radius || 0} onChange={e => patchEl({ radius: Math.max(0, +e.target.value || 0) })} /><span style={{ color: 'var(--muted)', fontSize: 11 }}>pixels</span></div>
              <div className="row"><label>Opacité</label><input type="range" min="10" max="100" value={selElement.opacity == null ? 100 : selElement.opacity} onChange={e => patchEl({ opacity: +e.target.value })} /></div>
              <div className="row"><label>Rotation</label><input type="range" min="-180" max="180" value={selElement.rot || 0} onChange={e => patchEl({ rot: +e.target.value })} /></div>
              {(selElement.type === 'image' || selElement.type === 'video') && (<>
                <div className="row"><label>Cadrage X</label><input type="range" min="0" max="100" value={selElement.fx == null ? 50 : selElement.fx} onChange={e => patchEl({ fx: +e.target.value })} /></div>
                <div className="row"><label>Cadrage Y</label><input type="range" min="0" max="100" value={selElement.fy == null ? 50 : selElement.fy} onChange={e => patchEl({ fy: +e.target.value })} /></div>
              </>)}
              {(selElement.type === 'text' || selElement.type === 'button') && (<>
                <div className="row"><input type="text" value={selElement.content || ''} onChange={e => patchEl({ content: e.target.value })} /></div>
                <div className="row"><label>Taille</label><input type="number" value={selElement.fontSize || 40} onChange={e => patchEl({ fontSize: Math.max(10, +e.target.value || 10) })} /><label style={{ minWidth: 'auto' }}>Couleur</label><input type="color" value={selElement.color || '#2A2622'} onChange={e => patchEl({ color: e.target.value })} /></div>
              </>)}
              {selElement.type === 'text' && <div className="row"><label>Police</label><button className="tbtn" onClick={() => patchEl({ serif: !selElement.serif })}>{selElement.serif ? 'Serif élégant' : 'Sans moderne'}</button></div>}
              {selElement.type === 'button' && <div className="row"><label>Fond</label><input type="color" value={selElement.bg || '#2A2622'} onChange={e => patchEl({ bg: e.target.value })} /></div>}
              <div className="seclbl">Aligner sur la page</div>
              <div className="alignBlock">
                <div className="alignRow">
                  <button className="alignBtn" onClick={() => align('left')}>{ALIGN_ICON.left}Gauche</button>
                  <button className="alignBtn" onClick={() => align('ch')}>{ALIGN_ICON.ch}Centrer</button>
                  <button className="alignBtn" onClick={() => align('right')}>{ALIGN_ICON.right}Droite</button>
                </div>
                <div className="alignRow">
                  <button className="alignBtn" onClick={() => align('top')}>{ALIGN_ICON.top}Haut</button>
                  <button className="alignBtn" onClick={() => align('cv')}>{ALIGN_ICON.cv}Milieu</button>
                  <button className="alignBtn" onClick={() => align('bot')}>{ALIGN_ICON.bot}Bas</button>
                </div>
              </div>
              <div className="seclbl">Actions</div>
              <div className="btns">
                <button className="tbtn" onClick={() => elAction('dup')}>Dupliquer</button>
                <button className="tbtn" onClick={() => elAction('lock')}>{selElement.locked ? 'Déverrouiller' : 'Verrouiller'}</button>
                <button className="tbtn" onClick={() => elAction('front')}>Devant</button>
                <button className="tbtn" onClick={() => elAction('back')}>Derrière</button>
                <button className="tbtn" style={{ color: '#8A3F26' }} onClick={() => elAction('del')}>Supprimer</button>
              </div>
            </div>
          )}

          <h2>1 · Sujet du carrousel</h2>
          <details className="md">
            <summary>Importer un texte / Markdown (sans API)</summary>
            <textarea value={mdText} onChange={e => setMdText(e.target.value)} placeholder="Colle ici le texte généré ailleurs (Claude, etc.)." />
            <div className="mdbtns">
              <button onClick={() => setMdText(MD_EXAMPLE)}>Insérer un exemple</button>
              <button className="go" onClick={buildFromMD}>Construire depuis le texte</button>
            </div>
          </details>
          <div className="field"><label>Catégorie</label>
            <div className="cats">{Object.entries(CATEGORIES).map(([id, cc]) => (
              <div key={id} className={'cat' + (id === cat ? ' on' : '')} style={{ background: cc.bg, color: cc.ink }} onClick={() => { setCat(id); setSelEl(-1); }}>{cc.name}</div>
            ))}</div>
            <div className="hint">{c.name} · {c.sub}</div>
          </div>
          <div className="field"><label>Sujet / angle du carrousel</label><textarea value={topic} onChange={e => setTopic(e.target.value)} /></div>
          <div className="field"><label>Ton</label><select className="full" value={tone} onChange={e => setTone(e.target.value)}>{['doux', 'direct', 'inspirant', 'pédagogique', 'poétique'].map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>Public</label><select className="full" value={audience} onChange={e => setAudience(e.target.value)}>{['grand public', 'professionnels RH', 'thérapeutes', 'lecteurs PFG existants'].map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>Nombre de pages</label>
            <div className="seg">{['auto', '4', '6', '8'].map(v => <button key={v} className={count === v ? 'on' : ''} onClick={() => setCount(v)}>{v === 'auto' ? 'Auto' : v}</button>)}</div>
          </div>
          <div className="field"><label>CTA (sinon défaut catégorie)</label>
            <select className="full" value={cta} onChange={e => setCta(e.target.value)}>
              <option value="">— défaut catégorie —</option>
              <option value="BUY_BOOK">Acheter le livre</option>
              <option value="DIAGNOSTIC">Faire le diagnostic</option>
              <option value="BLOG_ARTICLE">Lire l’article</option>
              <option value="NEWSLETTER">Newsletter</option>
            </select>
          </div>
          <div className="field"><label>Haut à droite (vide = Découvrir nos livres)</label><input type="text" value={hdrBadge} onChange={e => setHdrBadge(e.target.value)} placeholder={client.defaultBadge} /></div>
          <div className="field"><label>Bas à gauche — site</label><input type="text" value={ftrUrl} onChange={e => setFtrUrl(e.target.value)} placeholder={client.footerUrl} /></div>
          <div className="field"><label>Contexte additionnel (optionnel)</label><textarea value={customContext} onChange={e => setCustomContext(e.target.value)} placeholder="Précisions, angle, mots à inclure…" /></div>
          <label className="chk"><input type="checkbox" checked={incLinkedIn} onChange={e => setIncLinkedIn(e.target.checked)} /> Générer aussi une version LinkedIn</label>
          <button className="btn btn-go" disabled={generating} onClick={generate}>{generating ? 'Génération…' : 'Générer le carrousel complet'}</button>
          {status && <div className={'status show ' + status.cls}>{status.msg}</div>}

          <hr />
          <h2>2 · Pages <span className="hint" style={{ fontWeight: 400 }}>· {slides.length} pages</span></h2>
          <div className="pages">
            {slides.map((s, i) => (
              <div key={i} className={'pcard' + (i === current ? ' on' : '')} onClick={e => { if (e.target.closest('input,textarea,select,button')) return; setCurrent(i); setSelEl(-1); }}>
                <div className="ph">
                  <span className="pn">Page {i + 1}</span>
                  <select className="lay" value={s.layout} onChange={e => { updateSlide(i, { layout: e.target.value }); setCurrent(i); }}>{LAYOUTS.map(l => <option key={l} value={l}>{layName(l)}</option>)}</select>
                  <button className="del" title="Monter" onClick={() => movePage(i, -1)}>↑</button>
                  <button className="del" title="Descendre" onClick={() => movePage(i, 1)}>↓</button>
                  <button className="del" title="Supprimer" onClick={() => delPage(i)}>×</button>
                </div>
                <div className="mini">Titre</div><input value={s.title || ''} onChange={e => updateSlide(i, { title: e.target.value })} />
                {['cover', 'text', 'quote', 'definition', 'end'].includes(s.layout) && (<><div className="mini">Sous-titre / texte</div><textarea value={s.subtitle || ''} onChange={e => updateSlide(i, { subtitle: e.target.value })} /></>)}
                {s.layout === 'number' && (<><div className="mini">Chiffre</div><input value={s.bigNumber || ''} onChange={e => updateSlide(i, { bigNumber: e.target.value })} /></>)}
                {s.layout === 'quote' && (<><div className="mini">Auteur</div><input value={s.quoteAuthor || ''} onChange={e => updateSlide(i, { quoteAuthor: e.target.value })} /></>)}
                {['method', 'list'].includes(s.layout) && (<><div className="mini">Éléments (un par ligne)</div><textarea value={(s.listItems || []).join('\n')} onChange={e => updateSlide(i, { listItems: e.target.value.split('\n').filter(x => x.trim()) })} /></>)}
                {['cover', 'text', 'quote', 'definition', 'number'].includes(s.layout) && (<><div className="mini">Intitulé court (optionnel)</div><input value={s.kicker || ''} onChange={e => updateSlide(i, { kicker: e.target.value })} /></>)}
                <div className="mini">Fond de page</div><input type="color" value={s.bg || c.bg} onChange={e => updateSlide(i, { bg: e.target.value })} style={{ width: 52, height: 30, padding: 2, borderRadius: 7, cursor: 'pointer' }} />
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={addPage}>+ Ajouter une page</button>
        </aside>

        {/* APERÇU */}
        <section className="preview">
          <div className="toolbar">
            <div className="pagerNav">
              <button onClick={() => { if (current > 0) { setCurrent(current - 1); setSelEl(-1); } }}>‹</button>
              <span id="pagerLabel">Page {current + 1}/{slides.length}</span>
              <button onClick={() => { if (current < slides.length - 1) { setCurrent(current + 1); setSelEl(-1); } }}>›</button>
            </div>
            <span className="tdiv" />
            <button className="tbtn" onClick={() => addEl('image')}>+ Image</button>
            <button className="tbtn" onClick={() => addEl('video')}>+ Vidéo</button>
            <button className="tbtn" onClick={() => addEl('title')}>Titre</button>
            <button className="tbtn" onClick={() => addEl('subtitle')}>Sous-titre</button>
            <button className="tbtn" onClick={() => addEl('label')}>Étiquette</button>
            <button className="tbtn" onClick={() => addEl('text')}>Texte</button>
            <button className="tbtn" onClick={() => addEl('button')}>+ Bouton</button>
            <div className="fmtWrap">
              <div className="fmtCards">
                <button className={'fmtCard' + (format === 'post' ? ' on' : '')} onClick={() => setFormat('post')}><b>Post</b><i>4:5</i></button>
                <button className={'fmtCard' + (format === 'story' ? ' on' : '')} onClick={() => setFormat('story')}><b>Story</b><i>9:16</i></button>
                <button className={'fmtCard' + (format === 'square' ? ' on' : '')} onClick={() => setFormat('square')}><b>Carré</b><i>1:1</i></button>
              </div>
            </div>
          </div>
          <div className="stage" ref={stageRef}>
            <div className="scaler" style={{ transform: `scale(${scale})` }}>
              <Post theme={theme} slide={slide} badgeText={badgeText} urlText={urlText} pageLabel={pageLabel} POSTW={POSTW} POSTH={POSTH} elements={slide.elements || []} onElements={onElements} selEl={selEl} setSelEl={setSelEl} scale={scale} postRef={postRef} logo={client.logo} fonts={client.fonts} />
            </div>
          </div>
          <div className="film">
            {slides.map((s, i) => (
              <div key={i} className={'thumb' + (i === current ? ' on' : '')} style={{ background: c.bg }} onClick={() => { setCurrent(i); setSelEl(-1); }}>
                <div className="tw" style={{ color: c.accent }}>PAUSE FEEL GOOD</div>
                <div className="tl" style={{ color: c.accent }}>{layName(s.layout)}</div>
                <div className="tt" style={{ color: c.ink }}>{s.title || layName(s.layout)}</div>
                <div className="tn" style={{ color: c.subt }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Planning open={planningOpen} onClose={() => setPlanningOpen(false)} onOpen={openPost} onExport={exportPlanning} onPostiz={postizPlanning} busy={busy} status={planStatus} />
    </>
  );
}
