import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';

// Origine publique réelle : derrière le proxy (Coolify/Traefik) request.url renvoie
// l'adresse interne 0.0.0.0:3000 ; on privilégie l'en-tête forwardé, puis l'env, sinon repli.
function publicOrigin(request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = request.headers;
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) return `${h.get('x-forwarded-proto') || 'https'}://${host}`;
  return new URL(request.url).origin;
}

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
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
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
