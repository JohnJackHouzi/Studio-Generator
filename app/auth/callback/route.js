import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';

// Transforme les invitations en attente (par email) en adhésions au projet.
async function resolveInvites(user) {
  if (!user?.email) return;
  const admin = createAdmin();
  const { data: invites } = await admin
    .from('invites')
    .select('id,project_id,role')
    .ilike('email', user.email)
    .is('accepted_at', null);
  for (const inv of invites || []) {
    await admin.from('project_members')
      .insert({ project_id: inv.project_id, user_id: user.id, role: inv.role })
      .select();
    await admin.from('invites').update({ accepted_at: new Date().toISOString() }).eq('id', inv.id);
  }
}

// Échange le code du lien magique contre une session, puis renvoie vers l'app.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try { await resolveInvites(data?.user); } catch (_) {}
      return NextResponse.redirect(origin + next);
    }
  }
  return NextResponse.redirect(origin + '/login?error=auth');
}
