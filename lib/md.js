import { LAYOUTS, LAYALIAS } from './brand';

// Parse un seul carrousel au format d'import.
export function parseMD(text) {
  const lines = (text || '').split('\n');
  let slides = [], caption = '', cat = null, cta = null, cur = null, mode = null;
  const flush = () => {
    if (cur) {
      if (cur._subs.length) cur.subtitle = cur._subs.join(' ').trim();
      delete cur._subs;
      slides.push(cur);
      cur = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^\[([\wéè]+)\]\s*(.*)$/i);
    if (m) {
      const tag = m[1].toLowerCase(), rest = m[2];
      if (tag === 'meta') {
        flush(); mode = 'meta';
        const a = rest.match(/category=(\w+)/i); if (a) cat = a[1];
        const b = rest.match(/cta=(\w+)/i); if (b) cta = b[1].toUpperCase();
        continue;
      }
      if (tag === 'caption' || tag === 'legende' || tag === 'légende') { flush(); mode = 'caption'; continue; }
      flush(); mode = 'page';
      const lay = LAYOUTS.includes(tag) ? tag : (LAYALIAS[tag] || 'text');
      cur = { layout: lay, kicker: '', title: '', subtitle: '', body: '', bigNumber: '', quoteAuthor: '', listItems: [], _subs: [] };
      continue;
    }
    if (mode === 'caption') { caption += (caption ? '\n' : '') + raw; continue; }
    if (mode === 'page' && cur) {
      if (!line) continue;
      let mm;
      if ((mm = line.match(/^(kicker|intitulé|intitule)\s*:\s*(.*)$/i))) { cur.kicker = mm[2]; continue; }
      if ((mm = line.match(/^(chiffre|number|nombre)\s*:\s*(.*)$/i))) { cur.bigNumber = mm[2]; continue; }
      if ((mm = line.match(/^(auteur|author)\s*:\s*(.*)$/i))) { cur.quoteAuthor = mm[2]; continue; }
      if ((mm = line.match(/^(title|titre)\s*:\s*(.*)$/i))) { cur.title = mm[2]; continue; }
      if ((mm = line.match(/^(subtitle|sous-titre|texte|body)\s*:\s*(.*)$/i))) { cur._subs.push(mm[2]); continue; }
      if ((mm = line.match(/^[-*•]\s+(.*)$/))) { cur.listItems.push(mm[1]); continue; }
      if (!cur.title) cur.title = line; else cur._subs.push(line);
    }
  }
  flush();
  return { slides, caption: caption.trim(), cat, cta };
}

// Découpe un document multi-posts (en-têtes === JOUR n · Titre ===) en posts.
export function parseMulti(text) {
  const src = (text || '').replace(/\r\n/g, '\n');
  const headerRe = /^\s*={2,}\s*(.+?)\s*={2,}\s*$/;
  const lines = src.split('\n');
  const blocks = [];
  let curHeader = null, buf = [];
  const push = () => {
    if (curHeader === null && buf.join('').trim() === '') return;
    if (curHeader === null && blocks.length === 0 && buf.join('').trim() === '') return;
    blocks.push({ header: curHeader, text: buf.join('\n') });
  };
  for (const line of lines) {
    const m = line.match(headerRe);
    if (m) {
      if (curHeader !== null || buf.join('').trim() !== '') push();
      curHeader = m[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  push();

  const posts = blocks
    .filter(b => b.text.trim() !== '' || b.header)
    .map((b, i) => {
      const parsed = parseMD(b.text);
      let day = '', title = '';
      if (b.header) {
        const parts = b.header.split(/\s*[·:•|–—-]\s*/);
        if (parts.length > 1) { day = parts[0].trim(); title = parts.slice(1).join(' · ').trim(); }
        else { title = b.header.trim(); }
      }
      if (!title) title = (parsed.slides[0] && parsed.slides[0].title) || ('Post ' + (i + 1));
      if (!day) day = 'Jour ' + (i + 1);
      return { day, title, ...parsed };
    })
    .filter(p => p.slides.length > 0);

  return posts;
}
