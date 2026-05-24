import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Geist:wght@400;500;600;700&display=swap';

// Récupère le CSS @font-face côté serveur pour que l'export (html-to-image)
// puisse intégrer les polices sans se heurter au CORS sur la feuille de style.
export async function GET() {
  try {
    const r = await fetch(FONT_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' },
    });
    const css = await r.text();
    return new NextResponse(css, { headers: { 'Content-Type': 'text/css', 'Cache-Control': 'public, max-age=86400' } });
  } catch (e) {
    return new NextResponse('', { status: 200, headers: { 'Content-Type': 'text/css' } });
  }
}
