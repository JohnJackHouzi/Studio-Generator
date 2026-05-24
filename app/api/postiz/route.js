import { NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export const runtime = 'nodejs';

// Upload d'une image (data URL) vers Postiz, renvoie { id, path } ou null.
async function uploadImage(base, key, dataUrl, name) {
  try {
    const b64 = String(dataUrl).split(',')[1];
    if (!b64) return null;
    const buf = Buffer.from(b64, 'base64');
    const form = new FormData();
    form.append('file', new Blob([buf], { type: 'image/png' }), name);
    const r = await fetch(base + '/upload', { method: 'POST', headers: { Authorization: key }, body: form });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j) return null;
    return { id: j.id, path: j.path || j.url || j.location };
  } catch (e) { return null; }
}

export async function POST(req) {
  const { caption, clientKey, channels, images, scheduleAt } = await req.json();
  const base = process.env.POSTIZ_BASE, key = process.env.POSTIZ_KEY;
  const ch = channels || getClient(clientKey).postiz || {};
  const ig = ch.ig || process.env.POSTIZ_IG, fb = ch.fb || process.env.POSTIZ_FB, li = ch.li || process.env.POSTIZ_LI;
  if (!base || !key) return NextResponse.json({ ok: false, error: 'Postiz non configuré (.env.local).' }, { status: 500 });
  if (!ig && !fb && !li) return NextResponse.json({ ok: false, error: 'Aucun canal Postiz pour ce projet.' }, { status: 400 });
  if (!caption) return NextResponse.json({ ok: false, error: 'Légende vide.' }, { status: 400 });

  // Upload des images (carrousel) d'abord, puis on les référence dans les posts.
  let media = [];
  if (Array.isArray(images) && images.length) {
    for (let i = 0; i < images.length; i++) {
      const m = await uploadImage(base, key, images[i], 'page-' + (i + 1) + '.png');
      if (m && m.id) media.push(m);
    }
  }
  const imageField = () => media.map(m => ({ ...m }));

  const grp = (clientKey || 'studio') + '-' + Date.now();
  const scheduled = scheduleAt && !isNaN(new Date(scheduleAt).getTime());
  const date = scheduled ? new Date(scheduleAt).toISOString() : new Date(Date.now() + 86400000).toISOString();
  const posts = [];
  if (ig) posts.push({ integration: { id: ig }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'instagram', post_type: 'post' } });
  if (fb) posts.push({ integration: { id: fb }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'facebook' } });
  if (li) posts.push({ integration: { id: li }, value: [{ content: caption, image: imageField() }], group: grp, settings: { __type: 'linkedin' } });
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
