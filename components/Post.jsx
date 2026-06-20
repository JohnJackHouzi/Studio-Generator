'use client';
import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { hexA } from '@/lib/brand';

const FITMAP = { cover: [116, 52], text: [96, 46], quote: [104, 44], number: [76, 38], method: [80, 42], list: [80, 42], definition: [118, 56], end: [72, 40], score: [64, 40], versus: [60, 36], tip: [110, 50], graphe: [56, 34], checklist: [80, 42] };

function readImg(file, cb) { const r = new FileReader(); r.onload = e => cb(e.target.result); r.readAsDataURL(file); }

export default function Post({ theme, slide, badgeText, urlText, pageLabel, POSTW, POSTH, elements, onElements, selEl, setSelEl, scale, postRef, logo = {}, fonts, decor, variant = 'b', format = 'post' }) {
  const bodyRef = useRef(null);
  const titleRef = useRef(null);
  const layerRef = useRef(null);

  const L = slide.layout;
  const skinStyle = decor?.style || null; // 'cdf' | 'skovr' | null
  const skin = !!(skinStyle === 'cdf');
  const skinSkovr = !!(skinStyle === 'skovr');
  const skinAny = skin || skinSkovr; // désactive l'italique, active pilules
  const layerSet = skin ? (decor.layers?.[format] || decor.layers?.post || {}) : {};
  const decorSrc = skin ? (layerSet[variant] || layerSet.a || layerSet.b) : null;
  const center = ['text', 'quote', 'number', 'definition', 'end', 'tip'].includes(L);
  const showPhoto = !!slide.photo;
  const roman = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.', 'vii.'];
  const listItems = (slide.listItems && slide.listItems.length ? slide.listItems : ['Première idée', 'Deuxième idée', 'Troisième idée']).slice(0, 5);

  // Score (jauge)
  const scorePct = Math.max(0, Math.min(100, parseInt(slide.percent || String(slide.bigNumber || '').replace(/[^\d]/g, ''), 10) || 0));
  // Versus
  const aItems = (slide.aItems && slide.aItems.length ? slide.aItems : ['Premier point', 'Second point']).slice(0, 4);
  const bItems = (slide.bItems && slide.bItems.length ? slide.bItems : ['Premier point', 'Second point']).slice(0, 4);
  // Graphe (barres)
  const barsRaw = (slide.bars && slide.bars.length ? slide.bars : [{ label: 'A', value: 70 }, { label: 'B', value: 45, hi: true }, { label: 'C', value: 20 }]).slice(0, 6);
  const barMax = Math.max(...barsRaw.map(b => b.value), 1);
  const anyHi = barsRaw.some(b => b.hi);
  const bars = barsRaw.map(b => ({ ...b, hi: b.hi || (!anyHi && b.value === barMax) }));

  const [fontsReady, setFontsReady] = useState(false);
  const fitKey = [L, slide.title, slide.subtitle, (slide.listItems || []).join('|'), slide.kicker, slide.bigNumber, slide.quoteAuthor, POSTW, POSTH, badgeText, urlText, fontsReady].join('~');

  useLayoutEffect(() => {
    const bodyEl = bodyRef.current, titleEl = titleRef.current;
    if (!bodyEl || !titleEl) return;
    const sub = bodyEl.querySelector('.pSub'); const au = bodyEl.querySelector('.pAuthor');
    const items = bodyEl.querySelectorAll('.pList .it .t');
    if (sub) sub.style.fontSize = ''; if (au) au.style.fontSize = ''; items.forEach(it => (it.style.fontSize = ''));
    const [max, min] = FITMAP[L] || [96, 44];
    titleEl.style.fontSize = max + 'px';
    let s = max, g = 0;
    const over = () => bodyEl.scrollHeight > bodyEl.clientHeight + 2;
    while (s > min && over() && g < 120) { s -= 2; titleEl.style.fontSize = s + 'px'; g++; }
    if (over()) {
      let ss = parseFloat(sub ? getComputedStyle(sub).fontSize : '33') || 33, g2 = 0;
      while (over() && ss > 15 && g2 < 90) {
        ss -= 1; if (sub) sub.style.fontSize = ss + 'px';
        items.forEach(it => (it.style.fontSize = Math.max(15, ss - 1) + 'px'));
        if (au) au.style.fontSize = Math.max(13, ss * 0.72) + 'px';
        if (g2 > 40 && s > 26) { s -= 2; titleEl.style.fontSize = s + 'px'; }
        g2++;
      }
    }
  }, [fitKey]);

  // re-fit quand les polices arrivent
  useEffect(() => {
    let cancelled = false;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!cancelled) setFontsReady(true); });
    return () => { cancelled = true; };
  }, []);

  /* ===== couche d'éléments : drag / resize / snap ===== */
  const elsRef = useRef(elements); elsRef.current = elements;
  const selRef = useRef(selEl); selRef.current = selEl;
  const scaleRef = useRef(scale); scaleRef.current = scale;
  const dragRef = useRef(null);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    function onMove(e) {
      const d = dragRef.current; if (!d) return;
      const i = selRef.current; const els = elsRef.current; if (i < 0 || !els[i]) return;
      const sc = scaleRef.current || 0.5;
      const dx = (e.clientX - d.x) / sc, dy = (e.clientY - d.y) / sc;
      const next = els.slice(); const el = { ...next[i] }; next[i] = el;
      if (d.mode === 'move') {
        let nx = Math.round(d.ex + dx), ny = Math.round(d.ey + dy);
        const SNAP = Math.max(10, Math.round(11 / sc));
        const g = [];
        const cx = [{ v: nx, line: 0, set: 0 }, { v: nx + el.w / 2, line: POSTW / 2, set: Math.round(POSTW / 2 - el.w / 2) }, { v: nx + el.w, line: POSTW, set: Math.round(POSTW - el.w) }];
        let bx = null, bdx = SNAP + 1; cx.forEach(c => { const dd = Math.abs(c.v - c.line); if (dd < bdx) { bdx = dd; bx = c; } });
        if (bx && bdx <= SNAP) { nx = bx.set; g.push({ o: 'v', p: bx.line }); }
        const cy = [{ v: ny, line: 0, set: 0 }, { v: ny + el.h / 2, line: POSTH / 2, set: Math.round(POSTH / 2 - el.h / 2) }, { v: ny + el.h, line: POSTH, set: Math.round(POSTH - el.h) }];
        let by = null, bdy = SNAP + 1; cy.forEach(c => { const dd = Math.abs(c.v - c.line); if (dd < bdy) { bdy = dd; by = c; } });
        if (by && bdy <= SNAP) { ny = by.set; g.push({ o: 'h', p: by.line }); }
        el.x = nx; el.y = ny; setGuides(g);
      } else {
        el.w = Math.max(50, Math.round(d.w + dx)); el.h = Math.max(40, Math.round(d.h + dy));
      }
      onElements(next);
    }
    function onUp() { if (dragRef.current) { dragRef.current = null; setGuides([]); } }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [POSTW, POSTH, onElements]);

  function layerMouseDown(e) {
    const del = e.target.closest('.el-del');
    if (del) { const i = selRef.current; const next = elsRef.current.slice(); if (i >= 0) { next.splice(i, 1); onElements(next); setSelEl(-1); } e.preventDefault(); return; }
    const handle = e.target.closest('.el-handle');
    const elDiv = e.target.closest('.el');
    if (!elDiv) { setSelEl(-1); return; }
    const i = +elDiv.dataset.idx; setSelEl(i);
    const el = elsRef.current[i]; if (!el || el.locked) { dragRef.current = null; return; }
    if (handle) dragRef.current = { mode: 'resize', x: e.clientX, y: e.clientY, w: el.w, h: el.h };
    else dragRef.current = { mode: 'move', x: e.clientX, y: e.clientY, ex: el.x, ey: el.y };
    e.preventDefault();
  }

  function dropOn(i, file) { if (file) readImg(file, u => { const next = elsRef.current.slice(); next[i] = { ...next[i], content: u, fx: 50, fy: 50 }; onElements(next); }); }

  const postStyle = { width: POSTW + 'px', height: POSTH + 'px', '--pBg': theme.bg, '--pInk': theme.ink, '--pAccent': theme.accent, '--pSub': theme.subt };
  if (fonts) { if (fonts.serif) postStyle['--serif'] = fonts.serif; if (fonts.sans) postStyle['--sans'] = fonts.sans; }
  if (skinAny) {
    postStyle['--pTitleColor'] = ['cover', 'quote'].includes(L) ? (decor.titleAccent || '#B1338A') : theme.ink;
    if (decor.badge) { postStyle['--badgeBg'] = decor.badge.bg; postStyle['--badgeColor'] = decor.badge.color; }
    if (decor.urlPill) { postStyle['--urlBg'] = decor.urlPill.bg; postStyle['--urlColor'] = decor.urlPill.color; }
    if (decor.ctaPill) { postStyle['--ctaBg'] = decor.ctaPill.bg; postStyle['--ctaColor'] = decor.ctaPill.color; }
  }
  const showUrlPill = skinAny && L !== 'end' && !!(urlText || '').trim();

  return (
    <div className={'post' + (skin ? ' skin-cdf' : '') + (skinSkovr ? ' skin-skovr lay-' + L : '')} id="post" ref={postRef} style={postStyle}>
      {showPhoto && (
        <>
          <div className="bgimg" style={{ backgroundImage: `url(${slide.photo})`, backgroundPosition: `${slide.fx == null ? 50 : slide.fx}% ${slide.fy == null ? 50 : slide.fy}%`, transform: `scale(${slide.zoom || 1})` }} />
          {!skinAny && <div className="bggrad" style={{ background: `linear-gradient(180deg,${hexA(theme.bg, 0.05)} 0%,${hexA(theme.bg, 0.55)} 45%,${hexA(theme.bg, 0.95)} 100%)` }} />}
        </>
      )}
      {skin && decorSrc && <img className="decorLayer" src={decorSrc} alt="" />}
      {skinSkovr && <div className="skovrCorner" />}
      <div className="pad">
        <div className="pHead">
          <div className="pLogo">
            {logo.image
              ? <img src={logo.image} alt="" style={{ maxHeight: 64, maxWidth: 320, objectFit: 'contain', display: 'block' }} />
              : <>
                  {logo.picto && <span dangerouslySetInnerHTML={{ __html: logo.picto }} />}
                  {logo.word && <span dangerouslySetInnerHTML={{ __html: logo.word }} />}
                </>}
          </div>
          <div className="pBadge" id="pBadge">{badgeText}</div>
        </div>
        <div className={'pBody' + (center ? ' center' : '')} id="pBody" ref={bodyRef}>
          {skin && L === 'end' && decor.endWord ? <div className="pEndWord" dangerouslySetInnerHTML={{ __html: decor.endWord }} /> : null}
          {L === 'quote' && <div className="pQuote">&ldquo;</div>}
          {L === 'number' && <div className="pBig">{slide.bigNumber || '3'}</div>}
          {L === 'tip' && skinSkovr && <div className="pTwm">{slide.bigNumber || '01'}</div>}
          {slide.kicker ? <div className="pKick">{slide.kicker}</div> : null}
          {!(L === 'end' && !slide.title) && <div className="pTitle" ref={titleRef} style={skinAny ? undefined : { fontStyle: 'italic' }}>{slide.title || ''}</div>}
          {slide.subtitle ? <div className="pSub">{slide.subtitle}</div> : null}
          {(L === 'method' || L === 'list' || L === 'checklist') && (
            <div className="pList">
              {listItems.map((t, i) => (
                <div className="it" key={i}>{L === 'checklist' ? <div className="ck">✓</div> : <div className="n">{L === 'method' ? roman[i] : (i + 1)}</div>}<div className="t">{t}</div></div>
              ))}
            </div>
          )}
          {L === 'score' && skinSkovr && (
            <div className="pScore">
              <div className="pScoreTop"><div className="pScoreLbl">{slide.label || 'Score'}</div><div className="pScoreVal">{slide.bigNumber || '0'}<b>{slide.total || '/100'}</b></div></div>
              <div className="pGauge"><div className="pGfill" style={{ width: scorePct + '%' }} /></div>
              {slide.caption ? <div className="pScoreCap">{slide.caption}</div> : null}
            </div>
          )}
          {L === 'versus' && skinSkovr && (
            <div className="pVs">
              <div className="pVcol"><div className="pVh">{slide.aHead || 'A'}</div>{aItems.map((t, i) => <div className="pVli" key={i}>{t}</div>)}</div>
              <div className="pVcol fill"><div className="pVh">{slide.bHead || 'B'}</div>{bItems.map((t, i) => <div className="pVli" key={i}>{t}</div>)}</div>
              <div className="pVsdot">VS</div>
            </div>
          )}
          {L === 'graphe' && skinSkovr && (
            <div className="pBars">
              {bars.map((b, i) => (
                <div className={'bar' + (b.hi ? ' acc' : '')} key={i}><div className="col" style={{ height: Math.max(6, (b.value / barMax) * 100) + '%' }} /><div className="bl">{b.label}</div></div>
              ))}
            </div>
          )}
          {L === 'quote' && slide.quoteAuthor ? <div className="pAuthor">{slide.quoteAuthor}</div> : null}
          {L === 'end' && (skinAny ? <div className="pCtaPill">{urlText}</div> : <div className="pBigUrl">{urlText}</div>)}
        </div>
        <div className="pFoot">
          {skinAny
            ? (showUrlPill ? <div className="pUrlPill">{urlText}</div> : <span />)
            : <><div className="pUrl">{urlText}</div><div className="pPage">{pageLabel}</div></>}
        </div>
      </div>
      <div className="elayer" ref={layerRef} onMouseDown={layerMouseDown}>
        {elements.map((el, idx) => (
          <Element key={idx} el={el} idx={idx} selected={idx === selEl} onDrop={dropOn} />
        ))}
        {guides.map((g, i) => (
          <div key={'g' + i} className={'snapGuide ' + g.o} style={g.o === 'v' ? { left: g.p + 'px' } : { top: g.p + 'px' }} />
        ))}
      </div>
    </div>
  );
}

function Element({ el, idx, selected, onDrop }) {
  const style = {
    left: el.x + 'px', top: el.y + 'px', width: el.w + 'px', height: el.h + 'px',
    opacity: (el.opacity == null ? 100 : el.opacity) / 100, transform: `rotate(${el.rot || 0}deg)`,
  };
  const dnd = {
    onDragOver: e => { e.preventDefault(); e.currentTarget.style.boxShadow = '0 0 0 4px #9A6841'; },
    onDragLeave: e => { e.currentTarget.style.boxShadow = ''; },
    onDrop: e => { e.preventDefault(); e.currentTarget.style.boxShadow = ''; onDrop(idx, e.dataTransfer.files[0]); },
  };
  let inner = null;
  if (el.type === 'image') {
    inner = el.content
      ? <img src={el.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${el.fx == null ? 50 : el.fx}% ${el.fy == null ? 50 : el.fy}%`, borderRadius: (el.radius || 0) + 'px', display: 'block', pointerEvents: 'none' }} />
      : <div style={ph(el.radius, 'rgba(255,255,255,.45)')}>Glisse ta photo ici</div>;
  } else if (el.type === 'video') {
    inner = el.content
      ? <video src={el.content} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${el.fx == null ? 50 : el.fx}% ${el.fy == null ? 50 : el.fy}%`, borderRadius: (el.radius || 0) + 'px', display: 'block', pointerEvents: 'none' }} />
      : <div style={ph(el.radius, 'rgba(0,0,0,.05)')}>Glisse ta vidéo ici</div>;
  } else if (el.type === 'text') {
    inner = <div style={{ fontFamily: el.serif ? 'var(--serif)' : 'var(--sans)', fontStyle: el.serif ? 'italic' : 'normal', fontWeight: 600, fontSize: (el.fontSize || 54) + 'px', color: el.color || '#2A2622', lineHeight: 1.12, width: '100%', pointerEvents: 'none', textWrap: 'pretty', overflowWrap: 'break-word' }}>{el.content}</div>;
  } else if (el.type === 'button') {
    inner = <div style={{ background: el.bg || '#2A2622', color: el.color || '#fff', borderRadius: (el.radius == null ? 100 : el.radius) + 'px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: (el.fontSize || 30) + 'px', pointerEvents: 'none' }}>{el.content}</div>;
  }
  const dndProps = (el.type === 'image' || el.type === 'video') ? dnd : {};
  return (
    <div className={'el' + (selected ? ' sel' : '')} data-idx={idx} style={style} {...dndProps}>
      {inner}
      {selected && <><div className="el-handle" /><div className="el-del">×</div></>}
    </div>
  );
}

function ph(radius, bg) {
  return { width: '100%', height: '100%', border: '2px dashed #B8AE9E', borderRadius: (radius || 0) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#9A8E7C', fontSize: '22px', background: bg, pointerEvents: 'none' };
}
