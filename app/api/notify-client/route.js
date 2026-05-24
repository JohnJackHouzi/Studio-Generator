import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// L'admin pousse des modifs => email aux clients « veuillez valider » + repasse les posts en attente.
export async function POST(req) {
  const { projectId } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Non connecté.' }, { status: 401 });
  if (!projectId) return NextResponse.json({ ok: false, error: 'Projet manquant.' }, { status: 400 });

  const admin = createAdmin();
  const { data: prof } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  const { data: meMem } = await admin.from('project_members').select('role').eq('project_id', projectId).eq('user_id', user.id).maybeSingle();
  if (!prof?.is_admin && meMem?.role !== 'studjoow') return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 403 });

  const { data: proj } = await admin.from('projects').select('name').eq('id', projectId).single();
  const { data: mem } = await admin.from('project_members').select('user_id').eq('project_id', projectId).eq('role', 'client');
  const ids = (mem || []).map(m => m.user_id);
  const { data: profs } = ids.length ? await admin.from('profiles').select('email').in('id', ids) : { data: [] };
  const emails = (profs || []).map(p => p.email).filter(Boolean);

  // Les posts en « à modifier » repassent en attente de validation.
  await admin.from('plan_items').update({ validation: 'en_attente' }).eq('project_id', projectId).eq('validation', 'a_modifier');

  let emailed = 0;
  const key = process.env.RESEND_API_KEY;
  if (key && emails.length) {
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://studio.studjoow.com';
    const projName = proj?.name || 'votre projet';
    for (const to of emails) {
      const html = `
        <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#26221E">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;margin-bottom:6px">Studjoow Studio</div>
          <p style="font-size:15px;line-height:1.55">Des modifications ont été apportées à <strong>${projName}</strong>.</p>
          <p style="font-size:15px;line-height:1.55">Connecte-toi pour relire les posts et les valider.</p>
          <p style="margin:24px 0"><a href="${origin}/login" style="background:#26221E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px">Voir et valider</a></p>
        </div>`;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: 'Studjoow Studio <studio@studjoow.com>', to, subject: 'À valider · ' + projName, html }),
        });
        if (res.ok) emailed++;
      } catch (_) {}
    }
  }
  return NextResponse.json({ ok: true, emailed, clients: emails.length });
}
