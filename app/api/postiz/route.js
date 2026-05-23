import { NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export const runtime = 'nodejs';

export async function POST(req) {
  const { caption, clientKey } = await req.json();
  const base = process.env.POSTIZ_BASE, key = process.env.POSTIZ_KEY;
  const ch = getClient(clientKey).postiz || {};
  const ig = ch.ig || process.env.POSTIZ_IG, fb = ch.fb || process.env.POSTIZ_FB;
  if (!base || !key) return NextResponse.json({ ok: false, error: 'Postiz non configuré (.env.local).' }, { status: 500 });
  if (!ig && !fb) return NextResponse.json({ ok: false, error: 'Aucun canal Postiz pour ce projet.' }, { status: 400 });
  if (!caption) return NextResponse.json({ ok: false, error: 'Légende vide.' }, { status: 400 });

  const grp = (clientKey || 'studio') + '-' + Date.now();
  const date = new Date(Date.now() + 86400000).toISOString();
  const posts = [];
  if (ig) posts.push({ integration: { id: ig }, value: [{ content: caption, image: [] }], group: grp, settings: { __type: 'instagram', post_type: 'post' } });
  if (fb) posts.push({ integration: { id: fb }, value: [{ content: caption, image: [] }], group: grp, settings: { __type: 'facebook' } });
  const payload = { type: 'draft', shortLink: false, date, tags: [], posts };
  try {
    const r = await fetch(base + '/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: key },
      body: JSON.stringify(payload),
    });
    let body = null; try { body = await r.json(); } catch (_) {}
    return NextResponse.json({ ok: r.ok, status: r.status, body }, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }
}
