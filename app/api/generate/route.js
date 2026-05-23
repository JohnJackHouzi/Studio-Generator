import { NextResponse } from 'next/server';
import { LAYOUTS } from '@/lib/brand';
import { getClient } from '@/lib/clients';

export const runtime = 'nodejs';

export async function POST(req) {
  const { model, userPrompt, clientKey } = await req.json();
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: { message: 'Clé API absente côté serveur (.env.local).' } }, { status: 500 });
  const system = getClient(clientKey).voice;

  const SLIDE_SCHEMA = {
    type: 'object',
    properties: {
      layout: { type: 'string', enum: LAYOUTS },
      kicker: { type: 'string' }, title: { type: 'string' }, subtitle: { type: 'string' },
      body: { type: 'string' }, bigNumber: { type: 'string' }, quoteAuthor: { type: 'string' },
      listItems: { type: 'array', items: { type: 'string' } },
    },
    required: ['layout', 'title'],
  };
  const CAROUSEL_SCHEMA = {
    type: 'object',
    properties: {
      slides: { type: 'array', items: SLIDE_SCHEMA },
      instagramCaption: { type: 'string' }, linkedinPost: { type: 'string' },
      seoTitle: { type: 'string' }, seoMetaDescription: { type: 'string' },
      primaryKeyword: { type: 'string' }, midjourneyPrompt: { type: 'string' },
    },
    required: ['slides', 'instagramCaption', 'seoTitle', 'seoMetaDescription', 'primaryKeyword', 'midjourneyPrompt'],
  };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 3000,
        system,
        tools: [{ name: 'create_carousel', description: 'Renvoie un carrousel complet', input_schema: CAROUSEL_SCHEMA }],
        tool_choice: { type: 'tool', name: 'create_carousel' },
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (e) {
    return NextResponse.json({ error: { message: String(e?.message || e) } }, { status: 502 });
  }
}
