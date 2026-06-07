// Configuration du projet « SK:VR » (Skovr — outil d'audit SEO + GEO).
// Skin « tech / dashboard » : titres Space Grotesk, textes Inter, labels JetBrains Mono.
// 8 templates = 4 couleurs (fuchsia, bleu, vert, jaune) x 2 fonds (sombre / clair).
//
// IMPORTANT : le rendu (grille, halo, mode clair) est pilote par le CSS via les
// HEX exacts ci-dessous. Ne PAS changer les valeurs accent/bg sinon la grille
// et le mode clair ne s'activent plus. Accents : fuchsia #B1338A, bleu #3B82F6,
// vert #10B981, jaune #F59E0B. Fond clair : #FAF9F7.

// Logo adaptatif : les lettres suivent --pInk (blanc sur sombre, noir sur clair),
// le « : » prend la couleur du template (--pAccent). Les couleurs sont gerees en CSS.
const LOGO_WORD = `<span class="skLogo">SK<span class="skColon">:</span>VR</span>`;

const skovr = {
  key: 'skovr',
  name: 'SK:VR',
  token: '',
  footerUrl: 'skovr.fr',
  defaultBadge: 'SEO · GEO',

  fonts: {
    serif: "'Space Grotesk', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
  },

  logo: { word: LOGO_WORD },

  // Active le skin Skovr (grille, panneau, crochets, pilules, pas d'italique).
  decor: {
    style: 'skovr',
  },

  voice: `Tu es le community manager de SK:VR, un outil d'audit SEO + GEO instantane (skovr.fr).
Ton de marque : expert, direct, sans jargon inutile. Tu dis la verite sur le referencement avec des donnees concretes. Pas de fioritures, pas de promesses vides. Apostrophes droites. Pas de tiret cadratin. CTA toujours : Scanner mon site sur skovr.fr.`,

  categories: {
    c1: {
      name: 'Fuchsia · sombre', sub: 'STAT',
      bg: '#16060F', ink: '#FFFFFF', accent: '#B1338A', subt: '#9C8893',
      cta: 'SCANNER',
      prompt: `Carrousel autour d'une statistique ou donnee choc sur le SEO, le GEO ou la visibilite web. Fond teinte fuchsia.`,
    },
    c2: {
      name: 'Fuchsia · clair', sub: 'INSIGHT',
      bg: '#FAF9F7', ink: '#0A0A0A', accent: '#B1338A', subt: '#555555',
      cta: 'SCANNER',
      prompt: `Carrousel autour d'une citation ou verite qui derange sur le SEO ou la visibilite web. Fond clair, accent fuchsia.`,
    },
    c3: {
      name: 'Bleu · sombre', sub: 'SEO',
      bg: '#06101F', ink: '#FFFFFF', accent: '#3B82F6', subt: '#94A0B2',
      cta: 'DECOUVRIR',
      prompt: `Carrousel educatif sur un concept SEO (mots-cles, backlinks, Core Web Vitals, indexation). Fond sombre, accent bleu.`,
    },
    c4: {
      name: 'Bleu · clair', sub: 'SEO',
      bg: '#FAF9F7', ink: '#0A0A0A', accent: '#3B82F6', subt: '#555555',
      cta: 'DECOUVRIR',
      prompt: `Carrousel educatif SEO pedagogique et accessible. Fond clair, accent bleu.`,
    },
    c5: {
      name: 'Vert · sombre', sub: 'AUDIT',
      bg: '#04140D', ink: '#FFFFFF', accent: '#10B981', subt: '#82978C',
      cta: 'AUDIT',
      prompt: `Carrousel audit live d'un site connu : score SEO + GEO + point critique. Fond sombre, accent vert.`,
    },
    c6: {
      name: 'Vert · clair', sub: 'AUDIT',
      bg: '#FAF9F7', ink: '#0A0A0A', accent: '#10B981', subt: '#555555',
      cta: 'AUDIT',
      prompt: `Carrousel audit ou checklist de visibilite. Fond clair, accent vert.`,
    },
    c7: {
      name: 'Jaune · sombre', sub: 'TIPS',
      bg: '#14110A', ink: '#FFFFFF', accent: '#F59E0B', subt: '#9C9176',
      cta: 'AUDIT',
      prompt: `Carrousel avec 3 a 5 actions concretes pour ameliorer son SEO ou sa visibilite IA. Fond sombre, accent jaune.`,
    },
    c8: {
      name: 'Jaune · clair', sub: 'TIPS',
      bg: '#FAF9F7', ink: '#0A0A0A', accent: '#F59E0B', subt: '#555555',
      cta: 'AUDIT',
      prompt: `Carrousel tips rapides et actionnables. Fond clair, accent jaune.`,
    },
  },

  ctas: {
    SCANNER: { label: 'Scanner mon site → skovr.fr', tone: 'Scanne ton site gratuitement en 30 secondes, lien dans la bio.' },
    AUDIT: { label: 'Audit gratuit → skovr.fr', tone: 'Lance un audit gratuit sur skovr.fr, lien dans la bio.' },
    DECOUVRIR: { label: 'En savoir plus → skovr.fr', tone: 'Decouvre SK:VR, lien dans la bio.' },
  },

  postiz: { ig: 'cmq0nh8ty0001p87toor9ttmq' },

  mdExample: `[meta] category=c3 cta=DECOUVRIR

[cover]
kicker: SEO vs GEO
title: Le SEO ne suffit plus en 2026
subtitle: Les IA decident desormais qui merite d'etre cite.

[number]
chiffre: 73%
title: des recherches finissent sans clic
subtitle: La reponse s'affiche directement. Si tu n'es pas la source, tu n'existes pas.

[definition]
title: GEO
subtitle: Generative Engine Optimization : optimiser ta visibilite dans ChatGPT, Perplexity et Gemini.

[list]
title: Ce que SK:VR analyse
- Indexation et balises techniques
- Donnees structurees schema.org
- Visibilite dans les reponses IA
- Score de citation GEO

[quote]
title: Si l'IA ne te cite pas, tu n'existes pas.
auteur: SK:VR

[end]
title: Sache ou tu en es. Vraiment.
subtitle: Audit gratuit en 30 secondes

[caption]
Le SEO ne suffit plus. Les IA generatives repondent directement, sans clic.

SK:VR scanne ton site en 30 secondes et te dit exactement ou agir, cote Google ET cote IA.

→ skovr.fr

#SEO #GEO #AuditSEO #ReferencementNaturel #MarketingDigital`,
};

export default skovr;
