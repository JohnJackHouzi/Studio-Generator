import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Le client envoie ses annotations + un commentaire => statut "à modifier" + notifications équipe.
export async function POST(req) {
  const { projectId, planItemId, annotations, comment, tagTeam } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Non connecté.' }, { status: 401 });
  if (!projectId || !planItemId) return NextResponse.json({ ok: false, error: 'Champs manquants.' }, { status: 400 });

  const admin = createAdmin();
  const { data: mem } = await admin.from('project_members').select('user_id,role').eq('project_id', projectId);
  const me = (mem || []).find(m => m.user_id === user.id);
  const { data: prof } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!me && !prof?.is_admin) return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 403 });

  if (Array.isArray(annotations) && annotations.length) {
    await admin.from('annotations').insert(annotations.map(a => ({
      plan_item_id: planItemId, project_id: projectId, author_id: user.id,
      slide_index: a.slideIndex || 0, x: a.x ?? 50, y: a.y ?? 50, body: (a.body || '').slice(0, 500),
    })));
  }

  await admin.from('plan_items').update({ validation: 'a_modifier' }).eq('id', planItemId);

  const { data: item } = await admin.from('plan_items').select('title').eq('id', planItemId).single();
  const { data: authorProf } = await admin.from('profiles').select('email,display_name').eq('id', user.id).single();
  const who = authorProf?.display_name || authorProf?.email || 'Le client';
  const title = item?.title || 'un post';
  const recipients = (mem || []).filter(m => m.user_id !== user.id && (tagTeam || m.role === 'studjoow'));
  if (recipients.length) {
    await admin.from('notifications').insert(recipients.map(m => ({
      user_id: m.user_id, project_id: projectId, plan_item_id: planItemId, kind: 'modif',
      body: who + ' demande une modif sur « ' + title + ' »' + (comment ? ' : ' + comment.slice(0, 200) : ''),
    })));
  }

  return NextResponse.json({ ok: true });
}
