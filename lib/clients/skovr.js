// Configuration du projet « SK:VR » (Skovr — outil d'audit SEO + GEO).
// Dark tech premium : fond #0A0A0A, texte blanc, accent magenta #B1338A.

const LOGO_SVG = `<span style="font-family:'Inter',system-ui,sans-serif;font-weight:800;font-size:32px;letter-spacing:0.04em;line-height:1;display:inline-flex;align-items:center;gap:1px;color:#FFFFFF">SK<span style="color:#B1338A">:</span>VR</span>`;

const skovr = {
  key: 'skovr',
  name: 'SK:VR',
  token: '',
  footerUrl: 'skovr.fr',
  defaultBadge: 'SEO · GEO · SCORE',

  fonts: {
    serif: "'Inter', system-ui, sans-serif",
    sans:  "'Inter', system-ui, sans-serif",
  },

  logo: { word: LOGO_SVG },

  // Décor minimal : pas de calque PNG, mais active le mode skin pour
  // désactiver l'italique et activer le trait magenta coin bas-gauche.
  decor: {
    style: 'skovr',
    titleAccent: '#B1338A', // accent sur cover + quote
    badge: { bg: '#1A1A1A', color: '#888888' },
    urlPill: { bg: '#1A1A1A', color: '#888888' },
    ctaPill: { bg: '#B1338A', color: '#FFFFFF' },
  },

  voice: `Tu es le community manager de SK:VR, un outil d'audit SEO + GEO instantané (skovr.fr).
Ton de marque : expert, direct, sans jargon inutile. Tu dis la vérité sur le référencement avec des données concrètes. Pas de fioritures, pas de promesses vides. Apostrophes droites. Pas de tiret cadratin. 1 à 3 emojis max. CTA toujours "→ skovr.fr".`,

  categories: {
    c1: {
      name: 'Stat / Insight',      sub: 'DATA',
      bg: '#0A0A0A', ink: '#FFFFFF', accent: '#B1338A', subt: '#888888',
      cta: 'SCANNER',
      prompt: `Carrousel autour d'une statistique ou donnée choc sur le SEO, le GEO ou la visibilité web.`,
    },
    c2: {
      name: 'Éducation SEO',       sub: 'SEO',
      bg: '#0D0D0D', ink: '#FFFFFF', accent: '#B1338A', subt: '#888888',
      cta: 'DECOUVRIR',
      prompt: `Carrousel éducatif sur un concept SEO classique (mots-clés, backlinks, Core Web Vitals, etc.).`,
    },
    c3: {
      name: 'Éducation GEO',       sub: 'GEO',
      bg: '#0A0A0A', ink: '#FFFFFF', accent: '#B1338A', subt: '#888888',
      cta: 'DECOUVRIR',
      prompt: `Carrousel éducatif sur le GEO (Generative Engine Optimization) : visibilité dans ChatGPT, Perplexity, Gemini.`,
    },
    c4: {
      name: 'Citation / Vérité',   sub: 'INSIGHT',
      bg: '#111111', ink: '#FFFFFF', accent: '#B1338A', subt: '#666666',
      cta: 'SCANNER',
      prompt: `Carrousel autour d'une citation ou vérité qui dérange sur le SEO, Google ou la visibilité web.`,
    },
    c5: {
      name: 'Audit live',          sub: 'AUDIT',
      bg: '#0A0A0A', ink: '#FFFFFF', accent: '#B1338A', subt: '#888888',
      cta: 'SCANNER',
      prompt: `Carrousel "audit live" d'un site connu (ex: lemonde.fr, airbnb.fr). Score SEO + GEO + point critique.`,
    },
    c6: {
      name: 'Tips actionnable',    sub: 'TIPS',
      bg: '#0D0D0D', ink: '#FFFFFF', accent: '#B1338A', subt: '#888888',
      cta: 'AUDIT',
      prompt: `Carrousel avec 3 à 5 actions concrètes pour améliorer son SEO ou sa visibilité IA rapidement.`,
    },
  },

  ctas: {
    SCANNER: { label: 'Scanner mon site → skovr.fr', tone: 'Scanne ton site gratuitement en 30 secondes, lien dans la bio.' },
    AUDIT:   { label: 'Audit gratuit → skovr.fr',    tone: 'Lance un audit gratuit sur skovr.fr, lien dans la bio.' },
    DECOUVRIR: { label: 'En savoir plus → skovr.fr', tone: 'Découvre SK:VR, lien dans la bio.' },
  },

  postiz: { ig: 'cmq0nh8ty0001p87toor9ttmq' },

  mdExample: `[meta] category=c1 cta=SCANNER

[cover]
kicker: Le chiffre du jour
title: 67% des clics vont au top 3
subtitle: Et toi, t'es où ?

[number]
chiffre: 67%
title: des clics vont aux 3 premiers résultats
subtitle: Si tu n'es pas dans le top 3, tu touches moins d'un tiers du trafic.

[list]
title: 3 raisons pour lesquelles tu n'y es pas
- Vitesse de chargement trop lente
- Contenu qui ne répond pas aux vraies questions
- Zéro balisage structuré (schema.org)

[quote]
title: Ce que Google voit ≠ ce que tu crois montrer.
auteur: SK:VR

[end]
title: Sache où tu en es. Vraiment.
subtitle: Audit gratuit en 30 secondes

[caption]
67% des clics vont au top 3 Google. 📊

Si ton site n'est pas dans les 3 premiers, tu passes à côté de la majorité du trafic. Et ça empire avec les IA qui répondent directement sans cliquer.

SK:VR scanne ton site en 30 secondes et te dit exactement où agir.

→ skovr.fr

#SEO #AuditSEO #RéférencementNaturel #Google #MarketingDigital #SEO2025`,
};

export default skovr;
