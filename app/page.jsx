'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import JSZip from 'jszip';
import Post from '@/components/Post';
import Planning from '@/components/Planning';
import Calendar, { ymdLocal } from '@/components/Calendar';
import ClientView from '@/components/ClientView';
import NotificationBell from '@/components/NotificationBell';
import { LAYOUTS, FORMATS, layName, clean, sampleSlide } from '@/lib/brand';
import { getClient, DEFAULT_CLIENT, CLIENT_LIST } from '@/lib/clients';
import { parseMD } from '@/lib/md';
import { createClient as createSupabase } from '@/lib/supabase/client';

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [plan, setPlan] = useState([]);
  const [planStatus, setPlanStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [mdText, setMdText] = useState('');
  const [scale, setScale] = useState(0.5);
  const [generating, setGenerating] = useState(false);
  const [clientKey, setClientKey] = useState(DEFAULT_CLIENT);
  const [variant, setVariant] = useState('b');
  const [projectOpen, setProjectOpen] = useState(false);
  const [dbProjects, setDbProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [npName, setNpName] = useState('');
  const [npCharte, setNpCharte] = useState('');
  const [npErr, setNpErr] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState('collaborator');
  const [projMsg, setProjMsg] = useState('');
  const [openItemId, setOpenItemId] = useState(null);
  const [postAnnotations, setPostAnnotations] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stPicto, setStPicto] = useState('');
  const [stWord, setStWord] = useState('');
  const [stFooter, setStFooter] = useState('');
  const [stIg, setStIg] = useState('');
  const [stFb, setStFb] = useState('');
  const [stLi, setStLi] = useState('');
  const [stFooterUrl, setStFooterUrl] = useState('');
  const [stBadge, setStBadge] = useState('');
  const [stLogoImg, setStLogoImg] = useState('');
  const [stBrandImg, setStBrandImg] = useState('');
  const supa = useMemo(() => createSupabase(), []);

  const postRef = useRef(null);
  const stageRef = useRef(null);
  const fontCss = useRef(null);

  const selectedProject = dbProjects.find(p => p.key === clientKey) || null;
  const client = selectedProject
    ? { id: selectedProject.id, key: selectedProject.key, name: selectedProject.name, role: selectedProject.role, ...selectedProject.charte }
    : getClient(clientKey);
  const dbKeys = new Set(dbProjects.map(p => p.key));
  const staticProjects = CLIENT_LIST.filter(cl => !dbKeys.has(cl.key)).map(cl => ({ key: cl.key, name: cl.name, charte: cl, static: true }));
  const allProjects = [...staticProjects, ...dbProjects.filter(p => !p.archived_at)];
  const archivedProjects = dbProjects.filter(p => p.archived_at);
  const canManage = isAdmin || client.role === 'studjoow';
  const isClient = !isAdmin && client.role === 'client';
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
    loadProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { localStorage.setItem('pfg-model', model); }, [model]);
  useEffect(() => { loadPlan(); loadDrafts(); }, [clientKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===== projets (base partagée Supabase) ===== */
  async function loadProjects() {
    const { data: { user } } = await supa.auth.getUser();
    setMe(user || null);
    if (!user) { setProjectsLoaded(true); return; }
    const { data: prof } = await supa.from('profiles').select('is_admin').eq('id', user.id).single();
    const admin = !!prof?.is_admin; setIsAdmin(admin);
    const { data: projs } = await supa.from('projects').select('id,key,name,charte,archived_at').order('created_at');
    const { data: mem } = await supa.from('project_members').select('project_id,role').eq('user_id', user.id);
    const roleByProj = {}; (mem || []).forEach(m => { roleByProj[m.project_id] = m.role; });
    const list = (projs || []).map(p => ({ ...p, role: roleByProj[p.id] || (admin ? 'studjoow' : null) }));
    setDbProjects(list);
    setProjectsLoaded(true);
    const live = list.filter(p => !p.archived_at);
    const activeKey = live.find(p => p.key === clientKey) ? clientKey : live[0]?.key;
    if (activeKey) {
      if (activeKey !== clientKey) applyProject(activeKey);
      await loadPlan(activeKey, list);
      await loadDrafts(activeKey, list);
    }
  }
  function projByKey(key) {
    const p = dbProjects.find(x => x.key === key);
    return p ? { id: p.id, key: p.key, name: p.name, ...p.charte } : getClient(key);
  }
  function applyProject(key) {
    const cl = projByKey(key);
    setClientKey(key); setSelEl(-1);
    setCat(Object.keys(cl.categories || { c1: 1 })[0]);
    setSlides([sampleSlide()]); setCurrent(0); setOutputs({}); setCta('');
    setHdrBadge(''); setFtrUrl('');
    setVariant((cl.decor && cl.decor.defaultVariant) || 'b');
  }
  function chooseProject(key) {
    setProjectOpen(false);
    if (key === clientKey) return;
    applyProject(key);
  }
  function slug(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'projet'; }
  async function createProject() {
    setNpErr('');
    let cfg;
    try { cfg = JSON.parse(npCharte); } catch (e) { setNpErr("La charte n'est pas un JSON valide."); return; }
    if (!cfg || !cfg.categories || !cfg.ctas) { setNpErr('La charte doit contenir « categories » et « ctas ».'); return; }
    const name = (npName || cfg.name || 'Nouveau projet').trim();
    const { name: _n, key: _k, token: _t, ...charte } = cfg;
    const taken = k => dbProjects.some(p => p.key === k);
    let key = slug(name), n = 2; while (taken(key)) { key = slug(name) + '-' + n; n++; }
    const { data, error } = await supa.from('projects').insert({ key, name, charte, owner_id: me?.id }).select('id,key,name,charte').single();
    if (error) { setNpErr('Création impossible : ' + error.message); return; }
    setNewProjOpen(false); setNpName(''); setNpCharte('');
    await loadProjects();
    applyProject(data.key);
  }
  async function seedPfg() {
    const pfg = getClient('pfg');
    const { name, key, token, ...charte } = pfg;
    const { error } = await supa.from('projects').insert({ key: 'pfg', name: 'Pause Feel Good', charte, owner_id: me?.id });
    if (error) { setProjMsg('Import impossible : ' + error.message); return; }
    await loadProjects();
    applyProject('pfg');
    setProjectOpen(false);
  }
  async function archiveProject(key) {
    const p = dbProjects.find(x => x.key === key);
    if (!p) return;
    const { error } = await supa.from('projects').update({ archived_at: new Date().toISOString() }).eq('id', p.id);
    if (error) { setProjMsg('Archivage impossible : ' + error.message); return; }
    const live = dbProjects.filter(x => x.key !== key && !x.archived_at);
    await loadProjects();
    if (clientKey === key) applyProject(live[0] ? live[0].key : DEFAULT_CLIENT);
  }
  async function restoreProject(key) {
    const p = dbProjects.find(x => x.key === key);
    if (!p) return;
    const { error } = await supa.from('projects').update({ archived_at: null }).eq('id', p.id);
    if (error) { setProjMsg('Restauration impossible : ' + error.message); return; }
    await loadProjects();
  }
  async function deleteProject(key) {
    const p = dbProjects.find(x => x.key === key);
    if (!p) return;
    const { error } = await supa.from('projects').delete().eq('id', p.id);
    if (error) { setProjMsg('Suppression impossible : ' + error.message); return; }
    const rest = dbProjects.filter(x => x.key !== key);
    await loadProjects();
    if (clientKey === key) applyProject(rest[0] ? rest[0].key : DEFAULT_CLIENT);
  }
  /* ===== membres & invitations ===== */
  async function openInvite() {
    setProjMsg(''); setInvEmail(''); setInviteOpen(true);
    if (!client.id) return;
    const { data: mem } = await supa.from('project_members').select('user_id,role').eq('project_id', client.id);
    const ids = (mem || []).map(m => m.user_id);
    const { data: profs } = ids.length ? await supa.from('profiles').select('id,email').in('id', ids) : { data: [] };
    const emailById = {}; (profs || []).forEach(p => { emailById[p.id] = p.email; });
    setMembers((mem || []).map(m => ({ ...m, email: emailById[m.user_id] || m.user_id })));
    const { data: inv } = await supa.from('invites').select('id,email,role,accepted_at').eq('project_id', client.id).order('created_at');
    setInvites(inv || []);
  }
  async function sendInvite() {
    const email = invEmail.trim().toLowerCase();
    if (!email || !client.id) return;
    const r = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: client.id, email, role: invRole }) });
    const d = await r.json();
    if (!d.ok) { setProjMsg('Invitation impossible : ' + (d.error || '')); return; }
    setInvEmail('');
    setProjMsg(d.emailed ? ('Invitation envoyée à ' + email + '.') : (email + ' pourra rejoindre à sa connexion (email non envoyé : Resend non configuré).'));
    const { data: inv } = await supa.from('invites').select('id,email,role,accepted_at').eq('project_id', client.id).order('created_at');
    setInvites(inv || []);
  }
  async function removeInvite(id) {
    await supa.from('invites').delete().eq('id', id);
    setInvites(invites.filter(i => i.id !== id));
  }
  function openSettings() {
    const ch = selectedProject?.charte || {};
    const logo = ch.logo || {}; const pz = ch.postiz || {};
    setStPicto(logo.picto || ''); setStWord(logo.word || ''); setStFooter(logo.footerPicto || '');
    setStIg(pz.ig || ''); setStFb(pz.fb || ''); setStLi(pz.li || '');
    setStFooterUrl(ch.footerUrl || ''); setStBadge(ch.defaultBadge || '');
    setStLogoImg(logo.image || ''); setStBrandImg(ch.brandImage || '');
    setProjMsg(''); setSettingsOpen(true);
  }
  function readFileToData(file, cb) { if (!file) return; const r = new FileReader(); r.onload = e => cb(e.target.result); r.readAsDataURL(file); }
  async function saveSettings() {
    if (!client.id) return;
    const base = selectedProject?.charte || {};
    const charte = { ...base, logo: { picto: stPicto, word: stWord, footerPicto: stFooter, image: stLogoImg }, postiz: { ig: stIg, fb: stFb, li: stLi }, footerUrl: stFooterUrl, defaultBadge: stBadge, brandImage: stBrandImg };
    const { error } = await supa.from('projects').update({ charte }).eq('id', client.id);
    if (error) { setProjMsg('Enregistrement impossible : ' + error.message); return; }
    await loadProjects();
    setSettingsOpen(false);
  }
  async function signOut() { await supa.auth.signOut(); window.location.href = '/login'; }
  async function loadPlan(key = clientKey, projects = dbProjects) {
    const proj = projects.find(p => p.key === key);
    if (!proj?.id) { setPlan([]); return; }
    const { data } = await supa.from('plan_items').select('id,title,day,cat,cta,slides,caption,date,time,status,validation').eq('project_id', proj.id).order('date');
    setPlan((data || []).map(r => ({ ...r, slides: r.slides || [], time: r.time || '' })));
  }
  async function addToPlan(posts) {
    const proj = dbProjects.find(p => p.key === clientKey);
    if (!proj?.id) { setPlanStatus('Sélectionne un projet enregistré.'); return; }
    const start = new Date(); start.setDate(start.getDate() + 1);
    const rows = posts.map((p, i) => {
      const d = new Date(start); d.setDate(start.getDate() + (plan.length + i) * 2);
      return { project_id: proj.id, title: p.title || 'Post', day: p.day || '', cat: (p.cat && CATEGORIES[p.cat]) ? p.cat : Object.keys(CATEGORIES)[0], cta: p.cta || '', slides: p.slides || [], caption: p.caption || '', date: ymdLocal(d), status: 'à valider' };
    });
    const { error } = await supa.from('plan_items').insert(rows);
    if (error) { setPlanStatus('Ajout impossible : ' + error.message); return; }
    await loadPlan();
    setPlanningOpen(false); setCalendarOpen(true);
  }
  async function updatePlanItem(id, patch) {
    setPlan(plan.map(p => (p.id === id ? { ...p, ...patch } : p)));
    await supa.from('plan_items').update(patch).eq('id', id);
  }
  async function removePlanItem(id) {
    setPlan(plan.filter(p => p.id !== id));
    await supa.from('plan_items').delete().eq('id', id);
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
  function addBrandImage() {
    if (!client.brandImage) return;
    const cy = Math.round(POSTH / 2);
    const el = { type: 'image', x: 300, y: cy - 240, w: 480, h: 480, radius: 24, opacity: 100, content: client.brandImage, fx: 50, fy: 50, rot: 0 };
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
    try { await Promise.all([document.fonts.load("italic 600 120px 'Playfair Display'"), document.fonts.load("italic 500 120px 'Playfair Display'"), document.fonts.load("600 40px 'DM Sans'"), document.fonts.load("700 40px 'DM Sans'"), document.fonts.load("400 40px 'DM Sans'"), document.fonts.load("600 120px 'Geist'"), document.fonts.load("500 40px 'Geist'"), document.fonts.load("700 40px 'Geist'"), document.fonts.load("400 40px 'Geist'"), document.fonts.load("800 120px 'Red Hat Display'"), document.fonts.load("900 120px 'Red Hat Display'"), document.fonts.load("700 40px 'Red Hat Display'"), document.fonts.load("500 40px 'Inter'"), document.fonts.load("600 40px 'Inter'"), document.fonts.load("400 40px 'Inter'")]); } catch (e) {}
    await document.fonts.ready;
  }
  async function capture() {
    await ensureFonts();
    if (fontCss.current === null) { try { const r = await fetch('/api/fontcss'); fontCss.current = await r.text(); } catch (e) { fontCss.current = ''; } }
    return toPng(postRef.current, { width: POSTW, height: POSTH, pixelRatio: 2, cacheBust: true, fontEmbedCSS: fontCss.current || undefined, style: { transform: 'none' } });
  }
  async function captureAt(i) { setSelEl(-1); setCurrent(i); await nextTick(220); return capture(); }
  // Capture JPEG compressée pour Postiz : les slides avec photo de fond pèsent
  // beaucoup moins lourd qu'en PNG, ce qui évite que le proxy rejette le POST.
  async function captureJpeg() {
    await ensureFonts();
    if (fontCss.current === null) { try { const r = await fetch('/api/fontcss'); fontCss.current = await r.text(); } catch (e) { fontCss.current = ''; } }
    return toJpeg(postRef.current, { width: POSTW, height: POSTH, pixelRatio: 2, quality: 0.9, backgroundColor: '#000000', cacheBust: true, fontEmbedCSS: fontCss.current || undefined, style: { transform: 'none' } });
  }
  async function captureJpegAt(i) { setSelEl(-1); setCurrent(i); await nextTick(220); return captureJpeg(); }

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
      for (let i = 0; i < slides.length; i++) { imgs.push(await captureJpegAt(i)); }
      setCurrent(cur);
      setStatus2({ cls: 'ok', msg: 'Envoi à Postiz (' + imgs.length + ' images)…' });
      const r = await fetch('/api/postiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: cap, clientKey, channels: client.postiz, images: imgs }) });
      const text = await r.text();
      let d = null; try { d = JSON.parse(text); } catch (_) {}
      if (d && d.ok) setStatus2({ cls: 'ok', msg: 'Brouillon Postiz créé avec ' + (d.media || 0) + ' image(s).' });
      else if (d) setStatus2({ cls: 'err', msg: 'Postiz a répondu ' + (d.status || r.status || '') + ' ' + (d.error || '') + '.' });
      else setStatus2({ cls: 'err', msg: 'Postiz a répondu ' + r.status + ' (réponse non JSON, sûrement images trop lourdes). ' + text.slice(0, 100) });
    } catch (e) { setStatus2({ cls: 'err', msg: 'Postiz : ' + e.message }); }
  }

  /* ===== drafts (base partagée) ===== */
  async function loadDrafts(key = clientKey, projects = dbProjects) {
    const proj = projects.find(p => p.key === key);
    if (!proj?.id) { setDrafts([]); return; }
    const { data } = await supa.from('drafts').select('id,cat,slides,outputs,created_at').eq('project_id', proj.id).order('created_at', { ascending: false }).limit(30);
    setDrafts((data || []).map(d => ({ at: d.created_at, cat: d.cat, slides: d.slides || [], global: d.outputs || {} })));
  }
  async function save() {
    const proj = dbProjects.find(p => p.key === clientKey);
    if (!proj?.id) { setStatus2({ cls: 'err', msg: 'Sélectionne un projet enregistré.' }); return; }
    const { error } = await supa.from('drafts').insert({ project_id: proj.id, created_by: me?.id, cat, slides, outputs });
    if (error) { setStatus2({ cls: 'err', msg: 'Sauvegarde impossible : ' + error.message }); return; }
    await loadDrafts();
    setStatus2({ cls: 'ok', msg: 'Carrousel sauvegardé.' });
  }
  async function saveDraftsBulk(posts) {
    const proj = dbProjects.find(p => p.key === clientKey);
    if (!proj?.id) { setPlanStatus('Sélectionne un projet enregistré.'); return; }
    if (!posts.length) { setPlanStatus('Aucun post sélectionné.'); return; }
    const norm = s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] });
    const rows = posts.map(p => ({
      project_id: proj.id,
      created_by: me?.id,
      cat: (p.cat && CATEGORIES[p.cat]) ? p.cat : Object.keys(CATEGORIES)[0],
      slides: (p.slides || []).map(norm),
      outputs: p.caption ? { instagramCaption: clean(p.caption) } : {},
    }));
    const { error } = await supa.from('drafts').insert(rows);
    if (error) { setPlanStatus('Enregistrement impossible : ' + error.message); return; }
    await loadDrafts();
    setPlanStatus(rows.length + ' brouillon(s) enregistré(s).');
    setPlanningOpen(false);
  }
  function openDraft(d) { setCat(d.cat); setSlides((d.slides || []).map(s => ({ ...s, elements: s.elements || [] }))); setOutputs(d.global || {}); setCurrent(0); setSelEl(-1); setExportOpen(false); }

  /* ===== planning ===== */
  function openPost(p) {
    if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
    if (p.cta && CTAS[p.cta]) setCta(p.cta);
    setSlides(p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] })));
    setCurrent(0); setSelEl(-1);
    if (p.caption) setOutputs(g => ({ ...g, instagramCaption: clean(p.caption) }));
    setPlanningOpen(false); setCalendarOpen(false);
    if (p.id) loadAnnotations(p.id); else { setOpenItemId(null); setPostAnnotations([]); }
  }
  async function loadAnnotations(itemId) {
    setOpenItemId(itemId);
    const { data } = await supa.from('annotations').select('id,slide_index,x,y,body,resolved,created_at').eq('plan_item_id', itemId).order('created_at');
    setPostAnnotations(data || []);
  }
  async function resolveAnnotation(id) {
    setPostAnnotations(postAnnotations.filter(a => a.id !== id));
    await supa.from('annotations').delete().eq('id', id);
  }
  async function notifyClient() {
    if (!client.id) return;
    setStatus({ cls: 'ok', msg: 'Envoi au client…' });
    const r = await fetch('/api/notify-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: client.id }) });
    const d = await r.json();
    if (d.ok) setStatus({ cls: 'ok', msg: d.clients ? ('Client notifié (' + d.emailed + '/' + d.clients + ' email(s)).') : 'Aucun client sur ce projet.' });
    else setStatus({ cls: 'err', msg: d.error || 'Échec de la notification.' });
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
  function planIso(ymd, hm) {
    const [y, mo, d] = (ymd || '').split('-').map(Number);
    const [h, mi] = (hm || '10:00').split(':').map(Number);
    if (!y || !mo || !d) return null;
    return new Date(y, mo - 1, d, h || 10, mi || 0).toISOString();
  }
  async function schedulePost(p) {
    if (!p.caption) { setPlanStatus('Ce post n’a pas de légende.'); return; }
    const scheduleAt = planIso(p.date, p.time);
    if (!scheduleAt) { setPlanStatus('Donne une date à ce post avant de le programmer.'); return; }
    setBusy(true); setPlanStatus('Programmation : capture des images…');
    const savedSlides = slides, savedCur = current, savedCat = cat;
    try {
      setSelEl(-1);
      if (p.cat && CATEGORIES[p.cat]) setCat(p.cat);
      const ps = p.slides.map(s => ({ layout: s.layout, kicker: clean(s.kicker), title: clean(s.title), subtitle: clean(s.subtitle), body: clean(s.body), bigNumber: (s.bigNumber || '').toString().trim(), quoteAuthor: clean(s.quoteAuthor), listItems: (s.listItems || []).map(clean), elements: [] }));
      setSlides(ps);
      const imgs = [];
      for (let i = 0; i < ps.length; i++) { setCurrent(i); await nextTick(240); imgs.push(await capture()); }
      setPlanStatus('Envoi à Postiz (' + imgs.length + ' images)…');
      const r = await fetch('/api/postiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: p.caption, clientKey, channels: client.postiz, images: imgs, scheduleAt }) });
      const d = await r.json();
      if (d.ok) { await updatePlanItem(p.id, { status: 'prêt' }); setPlanStatus('Programmé sur Postiz pour le ' + p.date + ' à ' + (p.time || '10:00') + '.'); }
      else setPlanStatus('Postiz a répondu ' + (d.status || '') + ' ' + (d.error || '') + '.');
    } catch (e) { setPlanStatus('Postiz : ' + e.message); }
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
        for (let i = 0; i < ps.length; i++) { setCurrent(i); await nextTick(240); imgs.push(await captureJpeg()); }
        try { const r = await fetch('/api/postiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: p.caption, clientKey, channels: client.postiz, images: imgs }) }); const text = await r.text(); let d = null; try { d = JSON.parse(text); } catch (_) {} if (d && d.ok) ok++; } catch (e) {}
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

  if (isClient && client.id) return <ClientView project={client} me={me} onSignOut={signOut} />;

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
                    <span>{cl.name}{cl.role && cl.role !== 'studjoow' ? <small style={{ marginLeft: 6 }}>{cl.role === 'client' ? 'client' : 'collab.'}</small> : null}</span>
                    {(!cl.static && (isAdmin || cl.role === 'studjoow')) ? <small onClick={e => { e.stopPropagation(); if (window.confirm('Archiver le projet ' + cl.name + ' ? Le client n’y aura plus accès. Tu pourras le restaurer depuis les archives.')) archiveProject(cl.key); }} style={{ cursor: 'pointer', color: '#857B6E' }}>archiver</small> : null}
                  </button>
                ))}
                {archivedProjects.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', padding: '0 4px 4px' }}>Archives</div>
                    {archivedProjects.map(cl => (
                      <div key={cl.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', fontSize: 13, color: 'var(--muted)' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl.name}</span>
                        <span style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <small onClick={() => restoreProject(cl.key)} style={{ cursor: 'pointer', color: '#5C7D6E' }}>restaurer</small>
                          <small onClick={() => { if (window.confirm('Supprimer DÉFINITIVEMENT « ' + cl.name +' » et toutes ses données ? Action irréversible.')) deleteProject(cl.key); }} style={{ cursor: 'pointer', color: '#8A3F26' }}>supprimer</small>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {!isClient && projectsLoaded && !allProjects.some(p => p.key === 'pfg') && (
                  <button onClick={seedPfg} style={{ justifyContent: 'flex-start', color: 'var(--accent)' }}>↧ Importer la charte Pause Feel Good</button>
                )}
                {!isClient && <button onClick={() => { setProjectOpen(false); setNewProjOpen(true); setNpErr(''); }} style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 11, fontWeight: 800, justifyContent: 'flex-start' }}>+ Nouveau projet</button>}
              </div>
            )}
          </div>
        </div>
        {canManage && client.id && <button className="tbtn" style={{ padding: '9px 14px' }} onClick={openSettings}>Réglages</button>}
        {canManage && client.id && <button className="tbtn" style={{ padding: '9px 14px' }} onClick={openInvite}>Inviter</button>}
        {canManage && client.id && <button className="tbtn" style={{ padding: '9px 14px' }} onClick={notifyClient}>Notifier le client</button>}
        {me && <NotificationBell onOpenItem={(id) => { const it = plan.find(p => p.id === id); if (it) { setCalendarOpen(false); openPost(it); } }} />}
        <button className="tbtn" style={{ padding: '9px 14px' }} onClick={() => setPlanningOpen(true)}>Planning</button>
        <button className="tbtn" style={{ padding: '9px 14px' }} onClick={() => setCalendarOpen(true)}>Calendrier{plan.length ? ' · ' + plan.length : ''}</button>
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
        {me && <button className="tbtn" style={{ padding: '9px 12px' }} title={me.email} onClick={signOut}>Déconnexion</button>}
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

      {inviteOpen && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.34)', zIndex: 70, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 18px' }} onClick={() => setInviteOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22, width: 460, maxWidth: '94%', boxShadow: '0 26px 70px rgba(38,34,30,.24)' }}>
            <h2 style={{ marginBottom: 6 }}>Partager « {client.name} »</h2>
            <div className="hint" style={{ marginTop: 0, marginBottom: 14 }}>Invite par email. La personne rejoint le projet dès sa première connexion avec cette adresse.</div>
            <div className="field"><label>Email à inviter</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" inputMode="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendInvite(); }} placeholder="micka@exemple.com" style={{ flex: 1 }} />
                <select value={invRole} onChange={e => setInvRole(e.target.value)} style={{ width: 130 }}>
                  <option value="collaborator">Collaborateur</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
            <button className="btn btn-go" style={{ margin: '4px 0 0', width: '100%' }} onClick={sendInvite}>Inviter</button>
            {projMsg && <div className="status show ok" style={{ marginTop: 10 }}>{projMsg}</div>}

            {members.length > 0 && (<>
              <h3 style={{ margin: '18px 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Membres</h3>
              {members.map(m => <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span>{m.email}</span><small style={{ color: 'var(--muted)' }}>{m.role}</small></div>)}
            </>)}
            {invites.filter(i => !i.accepted_at).length > 0 && (<>
              <h3 style={{ margin: '18px 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>Invitations en attente</h3>
              {invites.filter(i => !i.accepted_at).map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0' }}>
                  <span>{i.email} <small style={{ color: 'var(--muted)' }}>· {i.role}</small></span>
                  <small onClick={() => removeInvite(i.id)} style={{ cursor: 'pointer', color: '#8A3F26' }}>retirer</small>
                </div>
              ))}
            </>)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-ghost" style={{ margin: 0 }} onClick={() => setInviteOpen(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.34)', zIndex: 70, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 18px' }} onClick={() => setSettingsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22, width: 560, maxWidth: '94%', boxShadow: '0 26px 70px rgba(38,34,30,.24)' }}>
            <h2 style={{ marginBottom: 6 }}>Réglages · {client.name}</h2>
            <div className="hint" style={{ marginTop: 0, marginBottom: 14 }}>Logo (SVG recolorable), canaux de publication et pied de page. Le logo se colle en SVG : il sera recoloré automatiquement par la couleur d'accent de chaque catégorie.</div>
            <div className="field"><label>Cartouche par défaut (haut à droite)</label><input type="text" value={stBadge} onChange={e => setStBadge(e.target.value)} placeholder="Découvrir nos livres" /></div>
            <div className="field"><label>URL pied de page</label><input type="text" value={stFooterUrl} onChange={e => setStFooterUrl(e.target.value)} placeholder="client.fr" /></div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Logo du client (image)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {stLogoImg ? <img src={stLogoImg} alt="logo" style={{ width: 48, height: 48, objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} /> : null}
                  <input type="file" accept="image/*" onChange={e => readFileToData(e.target.files[0], setStLogoImg)} />
                  {stLogoImg ? <small onClick={() => setStLogoImg('')} style={{ cursor: 'pointer', color: '#8A3F26' }}>retirer</small> : null}
                </div>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Image de marque (réutilisable)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {stBrandImg ? <img src={stBrandImg} alt="marque" style={{ width: 48, height: 48, objectFit: 'cover', border: '1px solid var(--line)', borderRadius: 8 }} /> : null}
                  <input type="file" accept="image/*" onChange={e => readFileToData(e.target.files[0], setStBrandImg)} />
                  {stBrandImg ? <small onClick={() => setStBrandImg('')} style={{ cursor: 'pointer', color: '#8A3F26' }}>retirer</small> : null}
                </div>
              </div>
            </div>
            <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>Le logo image s'affiche dans l'en-tête des posts (si pas de SVG). L'image de marque s'insère sur n'importe quel post via le bouton « + Image marque » de l'éditeur.</div>
            <div className="field"><label>Logo · picto (SVG)</label><textarea value={stPicto} onChange={e => setStPicto(e.target.value)} placeholder="<svg …>…</svg>" style={{ minHeight: 70, fontFamily: 'ui-monospace, monospace', fontSize: 11 }} /></div>
            <div className="field"><label>Logo · nom/mot (SVG, optionnel)</label><textarea value={stWord} onChange={e => setStWord(e.target.value)} placeholder="<svg …>…</svg>" style={{ minHeight: 70, fontFamily: 'ui-monospace, monospace', fontSize: 11 }} /></div>
            <div className="field"><label>Logo · pied de page (SVG, optionnel)</label><textarea value={stFooter} onChange={e => setStFooter(e.target.value)} placeholder="<svg …>…</svg>" style={{ minHeight: 70, fontFamily: 'ui-monospace, monospace', fontSize: 11 }} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="field" style={{ flex: 1 }}><label>Postiz · Instagram</label><input type="text" value={stIg} onChange={e => setStIg(e.target.value)} placeholder="id du canal" /></div>
              <div className="field" style={{ flex: 1 }}><label>Postiz · Facebook</label><input type="text" value={stFb} onChange={e => setStFb(e.target.value)} placeholder="id du canal" /></div>
              <div className="field" style={{ flex: 1 }}><label>Postiz · LinkedIn</label><input type="text" value={stLi} onChange={e => setStLi(e.target.value)} placeholder="id du canal" /></div>
            </div>
            {projMsg && <div className="status show err" style={{ marginTop: 4 }}>{projMsg}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost" style={{ margin: 0 }} onClick={() => setSettingsOpen(false)}>Annuler</button>
              <button className="btn btn-go" style={{ margin: 0 }} onClick={saveSettings}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {newProjOpen && (
        <div className="exportBackdrop open" style={{ background: 'rgba(38,34,30,.34)', zIndex: 70, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 18px' }} onClick={() => setNewProjOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22, width: 520, maxWidth: '94%', boxShadow: '0 26px 70px rgba(38,34,30,.24)' }}>
            <h2 style={{ marginBottom: 6 }}>Nouveau projet</h2>
            <div className="hint" style={{ marginTop: 0, marginBottom: 14 }}>Colle la charte (JSON) produite par l'« Usine à identité ». Le projet est enregistré dans la base partagée.</div>
            <div className="field"><label>Nom du projet</label><input type="text" value={npName} onChange={e => setNpName(e.target.value)} placeholder="Conte de Faits" /></div>
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
              {Object.entries(CTAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
                {(client.decor || ['cover', 'text', 'end'].includes(s.layout)) && (
                  <>
                    <div className="mini">Photo de fond</div>
                    {s.photo ? (
                      <>
                        <div style={{ position: 'relative', marginBottom: 6 }}>
                          <img src={s.photo} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                          <button className="del" onClick={() => updateSlide(i, { photo: '' })} style={{ position: 'absolute', top: 6, right: 6 }}>×</button>
                        </div>
                        <div className="zoomrow"><span className="zl">Zoom</span><input type="range" min="1" max="2.5" step="0.01" value={s.zoom || 1} onChange={e => updateSlide(i, { zoom: +e.target.value })} /></div>
                        <div className="zoomrow"><span className="zl">X</span><input type="range" min="0" max="100" value={s.fx == null ? 50 : s.fx} onChange={e => updateSlide(i, { fx: +e.target.value })} /><span className="zl">Y</span><input type="range" min="0" max="100" value={s.fy == null ? 50 : s.fy} onChange={e => updateSlide(i, { fy: +e.target.value })} /></div>
                      </>
                    ) : (
                      <label className="imgdrop" onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('over'); }} onDragLeave={e => e.currentTarget.classList.remove('over')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('over'); readFileToData(e.dataTransfer.files[0], u => updateSlide(i, { photo: u })); }}>
                        Glisse ta photo ici, ou clique
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => readFileToData(e.target.files[0], u => updateSlide(i, { photo: u }))} />
                      </label>
                    )}
                  </>
                )}
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
            {client.brandImage && <button className="tbtn" onClick={addBrandImage}>+ Image marque</button>}
            <button className="tbtn" onClick={() => addEl('video')}>+ Vidéo</button>
            <button className="tbtn" onClick={() => addEl('title')}>Titre</button>
            <button className="tbtn" onClick={() => addEl('subtitle')}>Sous-titre</button>
            <button className="tbtn" onClick={() => addEl('label')}>Étiquette</button>
            <button className="tbtn" onClick={() => addEl('text')}>Texte</button>
            <button className="tbtn" onClick={() => addEl('button')}>+ Bouton</button>
            {client.decor && (
              <>
                <span className="tdiv" />
                <span className="tlabel">Décor</span>
                {Object.entries(client.decor.variantLabels || { a: 'A', b: 'B' }).map(([k, lbl]) => (
                  <button key={k} className={'tbtn' + (variant === k ? ' on' : '')} onClick={() => setVariant(k)} style={variant === k ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : undefined}>{lbl}</button>
                ))}
              </>
            )}
            <div className="fmtWrap">
              <div className="fmtCards">
                <button className={'fmtCard' + (format === 'post' ? ' on' : '')} onClick={() => setFormat('post')}><b>Post</b><i>4:5</i></button>
                <button className={'fmtCard' + (format === 'story' ? ' on' : '')} onClick={() => setFormat('story')}><b>Story</b><i>9:16</i></button>
                <button className={'fmtCard' + (format === 'square' ? ' on' : '')} onClick={() => setFormat('square')}><b>Carré</b><i>1:1</i></button>
              </div>
            </div>
          </div>
          <div className="stage" ref={stageRef}>
            <div className="scaler" style={{ transform: `scale(${scale})`, position: 'relative' }}>
              <Post theme={theme} slide={slide} badgeText={badgeText} urlText={urlText} pageLabel={pageLabel} POSTW={POSTW} POSTH={POSTH} elements={slide.elements || []} onElements={onElements} selEl={selEl} setSelEl={setSelEl} scale={scale} postRef={postRef} logo={client.logo} fonts={client.fonts} decor={client.decor} variant={variant} format={format} />
              {postAnnotations.filter(a => a.slide_index === current).map((a, i) => (
                <div key={a.id} title={a.body} style={{ position: 'absolute', left: a.x + '%', top: a.y + '%', transform: 'translate(-50%,-50%)', zIndex: 5 }}>
                  <span style={{ background: '#E0A23C', color: '#fff', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.3)' }}>{i + 1}</span>
                </div>
              ))}
            </div>
            {postAnnotations.length > 0 && (
              <div style={{ position: 'absolute', left: 14, bottom: 14, width: 280, maxHeight: 240, overflowY: 'auto', background: '#fff', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: 12, zIndex: 10 }}>
                <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#C9892F' }}>Retours client ({postAnnotations.length})</strong>
                {postAnnotations.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 8, fontSize: 12.5 }}>
                    <span style={{ background: '#E0A23C', color: '#fff', borderRadius: 999, width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{i + 1}</span>
                    <span style={{ flex: 1 }}>{a.body || '(note)'} <small style={{ color: 'var(--muted)' }}>· p.{(a.slide_index || 0) + 1}</small></span>
                    <small onClick={() => resolveAnnotation(a.id)} style={{ cursor: 'pointer', color: '#5C7D6E' }}>résolu</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="film">
            {slides.map((s, i) => (
              <div key={i} className={'thumb' + (i === current ? ' on' : '')} style={{ background: c.bg }} onClick={() => { setCurrent(i); setSelEl(-1); }}>
                <div className="tw" style={{ color: c.accent }}>{(client.name || '').toUpperCase()}</div>
                <div className="tl" style={{ color: c.accent }}>{layName(s.layout)}</div>
                <div className="tt" style={{ color: c.ink }}>{s.title || layName(s.layout)}</div>
                <div className="tn" style={{ color: c.subt }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Planning open={planningOpen} onClose={() => setPlanningOpen(false)} onOpen={openPost} onExport={exportPlanning} onPostiz={postizPlanning} onAddToPlan={addToPlan} onSaveDrafts={saveDraftsBulk} busy={busy} status={planStatus} />
      <Calendar open={calendarOpen} onClose={() => setCalendarOpen(false)} plan={plan} onUpdateItem={updatePlanItem} onRemoveItem={removePlanItem} onOpenPost={openPost} onSchedule={schedulePost} canEdit={!isClient} busy={busy} status={planStatus} client={client} />
    </>
  );
}
