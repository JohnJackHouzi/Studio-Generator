import { NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export const runtime = 'nodejs';

// Upload d'une image (data URL) vers Postiz, renvoie { id, path } ou null.
async function uploadImage(base, key, dataUrl, name) {
  try {
    const mime = (String(dataUrl).match(/^data:([^;]+);base64,/) || [])[1] || 'image/png';
    const ext = mime === 'image/jpeg' ? 'jpg' : (mime.split('/')[1] || 'png');
    const fileName = name.replace(/\.[a-z0-9]+$/i, '') + '.' + ext;
    const b64 = String(dataUrl).split(',')[1];
    if (!b64) return null;
    const buf = Buffer.from(b64, 'base64');
    const form = new FormData();
    form.append('file', new Blob([buf], { type: mime }), fileName);
    const r = await fetch(base + '/upload', { method: 'POST', headers: { Authorization: key }, body: form });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j) return null;
    return { id: j.id, path: j.path || j.url || j.location };
  } catch (e) { return null; }
}

// Anti-doublon : quand la réponse d'une tentative précédente se perd en route
// (timeout réseau) alors que Postiz avait déjà bien créé le post, un simple clic
// sur "réessayer" reprogrammait le même contenu une deuxième fois. On vérifie donc
// si un post identique (même légende, même horaire) existe déjà pour chaque canal
// avant d'en recréer un.
async function findExistingIntegrations(base, key, integrationIds, caption, scheduleAt) {
  try {
    const at = new Date(scheduleAt).getTime();
    const from = new Date(at - 5 * 60000).toISOString();
    const to = new Date(at + 5 * 60000).toISOString();
    const r = await fetch(base + '/posts?startDate=' + encodeURIComponent(from) + '&endDate=' + encodeURIComponent(to), { headers: { Authorization: key } });
    if (!r.ok) return new Set();
    const j = await r.json().catch(() => null);
    const posts = (j && j.posts) || [];
    const cap = String(caption).trim();
    const found = new Set();
    for (const p of posts) {
      if ((p.content || '').trim() === cap && p.integration?.id && integrationIds.includes(p.integration.id)) found.add(p.integration.id);
    }
    return found;
  } catch (e) { return new Set(); }
}

export async function POST(req) {
  const { caption, clientKey, channels, images, scheduleAt } = await req.json();
  const base = process.env.POSTIZ_BASE, key = process.env.POSTIZ_KEY;
  const ch = channels || getClient(clientKey).postiz || {};
  const ig = ch.ig || process.env.POSTIZ_IG, fb = ch.fb || process.env.POSTIZ_FB, li = ch.li || process.env.POSTIZ_LI;
  if (!base || !key) return NextResponse.json({ ok: false, error: 'Postiz non configuré (.env.local).' }, { status: 500 });
  if (!ig && !fb && !li) return NextResponse.json({ ok: false, error: 'Aucun canal Postiz pour ce projet.' }, { status: 400 });
  if (!caption) return NextResponse.json({ ok: false, error: 'Légende vide.' }, { status: 400 });

  const scheduled = scheduleAt && !isNaN(new Date(scheduleAt).getTime());
  const targetIds = [ig, fb, li].filter(Boolean);
  const already = scheduled ? await findExistingIntegrations(base, key, targetIds, caption, scheduleAt) : new Set();
  if (scheduled && targetIds.length && targetIds.every(id => already.has(id))) {
    return NextResponse.json({ ok: true, media: 0, alreadyScheduled: true });
  }
  const pending = { ig: ig && !already.has(ig) ? ig : null, fb: fb && !already.has(fb) ? fb : null, li: li && !already.has(li) ? li : null };

  // Upload des images (carrousel) en parallèle, puis on les référence dans les posts.
  let media = [];
  if (Array.isArray(images) && images.length) {
    const uploaded = await Promise.all(images.map((img, i) => uploadImage(base, key, img, 'page-' + (i + 1) + '.png')));
    media = uploaded.filter(m => m && m.id);
  }
  const imageField = () => media.map(m => ({ ...m }));

  const grp = (clientKey || 'studio') + '-' + Date.now();
  const date = scheduled ? new Date(scheduleAt).toISOString() : new Date(Date.now() + 86400000).toISOString();
  const posts = [];
  if (pending.ig) posts.push({ integration: { id: pending.ig }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'instagram', post_type: 'post' } });
  if (pending.fb) posts.push({ integration: { id: pending.fb }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'facebook' } });
  if (pending.li) posts.push({ integration: { id: pending.li }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'linkedin' } });
  if (!posts.length) return NextResponse.json({ ok: true, media: media.length, alreadyScheduled: true });
  const payload = { type: scheduled ? 'schedule' : 'draft', shortLink: false, date, tags: [], posts };
  try {
    const r = await fetch(base + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: key },
      body: JSON.stringify(payload),
    });
    let body = null; try { body = await r.json(); } catch (_) {}
    return NextResponse.json({ ok: r.ok, status: r.status, body, media: media.length }, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }
}
