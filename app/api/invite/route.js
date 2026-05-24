import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req) {
  const { projectId, email, role } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Non connecté.' }, { status: 401 });
  if (!projectId || !email) return NextResponse.json({ ok: false, error: 'Champs manquants.' }, { status: 400 });

  const admin = createAdmin();

  // Autorisation : seul un admin global ou un « studjoow » du projet peut inviter.
  const { data: prof } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  const { data: mem } = await admin.from('project_members').select('role').eq('project_id', projectId).eq('user_id', user.id).maybeSingle();
  if (!prof?.is_admin && mem?.role !== 'studjoow') {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 403 });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const r = role === 'client' ? 'client' : 'collaborator';
  const { data: proj } = await admin.from('projects').select('name').eq('id', projectId).single();

  const { error: invErr } = await admin.from('invites')
    .upsert({ project_id: projectId, email: cleanEmail, role: r, invited_by: user.id }, { onConflict: 'project_id,email' });
  if (invErr) return NextResponse.json({ ok: false, error: invErr.message }, { status: 500 });

  // Envoi de l'email (si Resend configuré côté serveur).
  const key = process.env.RESEND_API_KEY;
  let emailed = false;
  if (key) {
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://studio.studjoow.com';
    const loginUrl = origin + '/login';
    const projName = proj?.name || 'un projet';
    const html = `
      <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#26221E">
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;margin-bottom:6px">Studjoow Studio</div>
        <p style="font-size:15px;line-height:1.55">Tu es invité à rejoindre <strong>${projName}</strong> sur le Studio, l'outil de création de carrousels.</p>
        <p style="font-size:15px;line-height:1.55">Connecte-toi avec cette adresse (<strong>${cleanEmail}</strong>) et tu rejoindras le projet automatiquement.</p>
        <p style="margin:24px 0">
          <a href="${loginUrl}" style="background:#26221E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px">Rejoindre le Studio</a>
        </p>
        <p style="font-size:12px;color:#857B6E">Si tu n'attendais pas cette invitation, ignore cet email.</p>
      </div>`;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Studjoow Studio <studio@studjoow.com>',
          to: cleanEmail,
          subject: 'Invitation au Studio · ' + projName,
          html,
        }),
      });
      emailed = res.ok;
    } catch (_) {}
  }

  return NextResponse.json({ ok: true, emailed });
}
