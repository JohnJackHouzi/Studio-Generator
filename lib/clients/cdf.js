// Configuration du projet « Conte de Faits ».
// Modèle de référence : pour ajouter un client, copier ce fichier, adapter les valeurs.
//
// Particularité CDF : le décor (coin corné + logo + cadre) est fourni en CALQUES PNG
// transparents (un par format, variantes A/B), posés au-dessus de la photo par Post.jsx.
// Le coin + le logo sont DANS les PNG, donc on n'affiche pas de logo dans l'en-tête.

// Wordmark blanc « Conte de Faits » (pour le masque Fin / CTA sur fond bleu nuit).
const CDF_WORD_WHITE = `<svg class="brandWordCdf" viewBox="0 0 525.43 109.72" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><path d="M22.69,93.6c.86.89,1.29,2.19,1.29,3.88v8.48h-1.41v-8.44c0-1.32-.33-2.31-.99-2.98-.66-.67-1.57-1-2.71-1-1.21,0-2.15.35-2.84,1.06-.68.7-1.02,1.78-1.02,3.23v8.13h-1.41v-8.44c0-1.32-.32-2.31-.96-2.98-.64-.67-1.54-1-2.68-1-1.22,0-2.18.35-2.86,1.06-.69.7-1.03,1.78-1.03,3.23v8.13h-1.43v-13.58h1.37v2.27c.37-.78.93-1.37,1.66-1.78s1.6-.61,2.6-.61c1.05,0,1.96.22,2.71.67s1.3,1.07,1.63,1.87c.39-.83.97-1.46,1.74-1.89.78-.43,1.69-.65,2.73-.65,1.54,0,2.75.45,3.61,1.34h0Z"/><path d="M49.98,66.38s-.02-.06-.04-.09l-.02-.02c-4.66,4.89-10.39,7.33-17.19,7.33-4.54,0-8.64-1.02-12.31-3.05-3.67-2.04-6.53-4.84-8.6-8.42s-3.1-7.58-3.1-12,1.03-8.42,3.1-12c2.06-3.58,4.93-6.39,8.6-8.42,3.67-2.04,7.77-3.05,12.31-3.05,6.57,0,12.09,2.21,16.58,6.63,1.71-2.01,3.75-3.69,6.15-5.03-2.77-3.07-6.1-5.4-9.99-6.97-3.96-1.6-8.32-2.4-13.09-2.4-6.11,0-11.64,1.35-16.58,4.06-4.95,2.71-8.81,6.43-11.61,11.17C1.4,38.86,0,44.2,0,50.13s1.4,11.27,4.19,16.02c2.79,4.74,6.65,8.47,11.56,11.17,4.92,2.71,10.43,4.06,16.54,4.06,4.77,0,9.15-.81,13.14-2.44,2.91-1.19,5.48-2.81,7.75-4.81-.23-.36-.46-.72-.68-1.09-1.19-2.06-2.02-4.28-2.53-6.65h0Z"/><path d="M288.4,16.09v64.24h-4.24v-10.65c-1.79,3.52-4.3,6.23-7.53,8.14-3.23,1.9-6.9,2.86-11,2.86s-8.02-.98-11.43-2.94-6.08-4.67-8.01-8.14c-1.93-3.46-2.9-7.42-2.9-11.86s.97-8.41,2.9-11.9,4.6-6.2,8.01-8.14c3.4-1.93,7.21-2.9,11.43-2.9s7.66.95,10.87,2.86c3.2,1.9,5.73,4.56,7.58,7.97v-29.52h4.33v-.02Z"/><path d="M150.34,39.09c3.46,3.4,5.19,8.39,5.19,14.97v26.62h-8.38v-25.66c0-4.48-1.08-7.86-3.23-10.12-2.15-2.27-5.24-3.4-9.25-3.4-4.54,0-8.12,1.32-10.74,3.97-2.62,2.65-3.93,6.45-3.93,11.39v23.83h-8.38v-46.26h8.03v6.98c1.69-2.38,3.97-4.22,6.85-5.5,2.88-1.28,6.15-1.92,9.82-1.92,5.88,0,10.55,1.7,14.01,5.11h0Z"/></g><g fill="#d946a9"><path d="M453.85,14.9c-.39-.51-.75-1.05-1.09-1.6-.47-.77-.86-1.59-1.22-2.43-.54-1.26-.93-2.59-1.18-3.95-.35-1.93-.39-3.93-.1-5.96.05-.32.07-.64.14-.96-.29,1.1-.68,2.14-1.15,3.14-.54,1.16-1.18,2.25-1.93,3.25-.35.47-.72.91-1.1,1.34-1.16,1.28-2.49,2.4-3.95,3.31-.49.3-.99.59-1.5.84-.83.42-1.7.76-2.59,1.05-1.3.43-2.65.73-4.04.86-.31.03-.62.04-.94.05-.13,0-.26.02-.39.02h-.55c-.54,0-1.09-.03-1.64-.08-.62-.06-1.24-.14-1.86-.26,1.34.35,2.6.84,3.79,1.45.39.2.78.42,1.16.65,1,.61,1.93,1.31,2.79,2.08.86.77,1.64,1.62,2.33,2.54.69.91,1.3,1.89,1.82,2.91.57,1.12,1.01,2.31,1.34,3.54.27,1.01.47,2.04.57,3.09.05.58.08,1.17.08,1.77s-.03,1.17-.09,1.77l.29.07c.79-2.13,1.96-4.05,3.39-5.69,1.2-1.38,2.58-2.57,4.11-3.54.51-.32,1.03-.62,1.57-.89.09-.04.18-.08.26-.12,1.46-.71,3.01-1.24,4.63-1.54.59-.11,1.2-.19,1.8-.24.2-.02.41-.02.61-.03.34-.02.68-.05,1.02-.05h.39c1.08.02,2.18.12,3.28.34-2.38-.63-4.53-1.69-6.39-3.08-1.4-1.04-2.63-2.27-3.67-3.64h.01Z"/></g></svg>`;

const cdf = {
  key: 'cdf',
  name: 'Conte de Faits',
  token: '',
  footerUrl: 'contedefaits.com',
  defaultBadge: '', // pas de badge par défaut (les pilules sont posées au cas par cas)
  fonts: {
    // Le titre utilise var(--serif) dans Post : on y met Red Hat Display (le skin l'affiche en droit, gras).
    serif: "'Red Hat Display', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
  },
  // Le coin + le logo sont dans le calque PNG : pas de logo dans l'en-tête.
  logo: {},

  // ===== DÉCOR (calques PNG transparents posés au-dessus de la photo) =====
  decor: {
    style: 'cdf',
    titleAccent: '#d946a9',      // magenta pour le mot-clé / titres accentués
    variantLabels: { a: 'A · image nette', b: 'B · cadre + dégradé' },
    defaultVariant: 'b',
    // un calque par format ; A = coin+logo seuls (centre transparent), B = + cadre + dégradé sombre
    layers: {
      post: { a: '/decor/cdf/cdf-4x5-a.png', b: '/decor/cdf/cdf-4x5-b.png' },
      square: { a: '/decor/cdf/cdf-1x1-a.png', b: '/decor/cdf/cdf-1x1-b.png' },
      story: { a: '/decor/cdf/cdf-9x16.png', b: '/decor/cdf/cdf-9x16.png' },
    },
    // pilules posées par-dessus (texte dynamique, donc pas dans le PNG)
    badge: { bg: '#d946a9', color: '#ffffff' },     // ex. « blog » en haut à droite
    urlPill: { bg: '#2f3c77', color: '#ffffff' },   // ex. contedefaits.com/magazine en bas
    ctaPill: { bg: '#d946a9', color: '#ffffff' },   // bouton final
    endWord: CDF_WORD_WHITE,                          // wordmark blanc pour le masque Fin / CTA
  },

  voice: `Tu es la voix de Conte de Faits, une marque française de livres illustrés ultra personnalisés et de cartes cadeaux. Ton chaleureux, complice, premium mais accessible. Tu tutoies (« tu »). Aucun emoji. Aucun tiret (court, long ou cadratin) : remplace par une virgule, deux points ou rien. Ponctuation française stricte (espace insécable avant ; : ? ! »). Tu parles d'histoires, de souvenirs, d'émotion, d'un cadeau qui marque. Tu ne promets pas de résultats et n'inventes pas de statistiques. Tu restes concret et sincère.`,

  // Catégories = familles éditoriales (palette de secours quand il n'y a pas de photo).
  // Sur CDF, le fond est presque toujours une photo + le calque de décor ; ces couleurs
  // servent au fond uni (masque Fin / CTA, ou slide sans image) et aux accents.
  categories: {
    c1: { name: 'Couverture', sub: 'Couverture', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'BUY_BOOK', prompt: `Slide de couverture Conte de Faits : titre fort, accroche, image plein cadre.` },
    c2: { name: 'Magazine / blog', sub: 'Blog', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'BLOG_ARTICLE', prompt: `Slide d'article du magazine Conte de Faits : titre éditorial sur photo, pilule URL en bas.` },
    c3: { name: 'Conseils', sub: 'Conseil', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'BLOG_ARTICLE', prompt: `Slide de conseil ou idée cadeau Conte de Faits.` },
    c4: { name: 'Avis client', sub: 'Avis', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'BUY_BOOK', prompt: `Slide de témoignage ou avis client Conte de Faits (anonymisable).` },
    c5: { name: 'Cartes cadeaux', sub: 'Cadeau', bg: '#3a1145', ink: '#ffffff', accent: '#e879c9', subt: '#f0d4ec', cta: 'GIFT', prompt: `Slide autour des cartes cadeaux Conte de Faits.` },
    c6: { name: 'Citation', sub: 'Citation', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'NEWSLETTER', prompt: `Slide citation ou phrase inspirante autour de l'histoire et du souvenir.` },
    c7: { name: 'Coulisses', sub: 'Coulisses', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'NEWSLETTER', prompt: `Slide coulisses, annonce ou nouveauté Conte de Faits.` },
    c8: { name: 'Fin / CTA', sub: '', bg: '#070b25', ink: '#ffffff', accent: '#d946a9', subt: '#cbd5e1', cta: 'BUY_BOOK', prompt: `Slide final Conte de Faits : fond bleu nuit, gros wordmark, appel à l'action.` },
  },

  ctas: {
    BUY_BOOK: { label: 'contedefaits.com', tone: 'Crée ton livre personnalisé sur contedefaits.com, lien dans la bio.' },
    BLOG_ARTICLE: { label: 'contedefaits.com/magazine', tone: 'Article complet sur le magazine, lien dans la bio.' },
    GIFT: { label: 'Offre une carte cadeau', tone: 'Offre une carte cadeau Conte de Faits, lien dans la bio.' },
    NEWSLETTER: { label: 'Rejoins la communauté', tone: 'Rejoins la communauté Conte de Faits, lien dans la bio.' },
  },

  mdExample: `[meta] category=c2 cta=BLOG_ARTICLE

[cover]
title: Le livre numérique personnalisé : quand la technologie réinvente la lecture
subtitle: contedefaits.com/magazine

[text]
title: Quand l'intelligence artificielle transforme nos livres en expériences uniques
subtitle: contedefaits.com/magazine

[quote]
title: Un cadeau qu'on n'oublie pas, parce qu'il raconte ta propre histoire
auteur: Conte de Faits

[end]
title: Crée ton histoire
subtitle: Sur

[caption]
Et si ton prochain cadeau racontait une vraie histoire ? Découvre les livres ultra personnalisés Conte de Faits.

#contedefaits #livrepersonnalise #cadeauoriginal`,
};

export default cdf;
