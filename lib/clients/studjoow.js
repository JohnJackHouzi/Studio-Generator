// Configuration du projet « Studjoow » (studio créatif — studjoow.com).
// Skin propre (decor.style: 'studjoow'), base sur la reference Figma "Post-Studjoow" :
// police Jost pour les titres, fond sombre #1B0B16, logo+badge en bas.
// Identité fuchsia premium. 8 templates = 4 couleurs x sombre/clair.
// HEX figés (le CSS du skin keye dessus) : fuchsia #B1338A, bleu #3B82F6,
// vert #10B981, jaune #F59E0B, fond clair #FAF9F7. Ne pas changer.

const LOGO_WORD = `<span class="skLogo">studjoow</span>`;

const studjoow = {
  key: 'studjoow',
  name: 'Studjoow',
  token: '',
  footerUrl: 'studjoow.com',
  defaultBadge: 'STUDIO CRÉATIF',

  fonts: {
    serif: "'Jost', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
  },

  logo: { word: LOGO_WORD },
  decor: { style: 'studjoow' },

  voice: `Tu es la voix de Studjoow, studio créatif indépendant (studjoow.com). Un seul interlocuteur, de l'idée au lancement, par John Houzi. Ton premium, direct, sûr, un brin "waouh", jamais creux. Tu parles identité de marque, web Next.js sur mesure, IA et automatisation, SEO et GEO. Apostrophes droites. Pas de tiret cadratin. Accents complets. CTA : parler de ton projet sur studjoow.com.`,

  categories: {
    c1: { name: 'Fuchsia · sombre', sub: 'RÉALISATION', bg: '#1B0B16', ink: '#FFFFFF', accent: '#B1338A', subt: '#9C8893', cta: 'PROJET', prompt: `Carrousel autour d'une réalisation ou d'un résultat client Studjoow. Fond teinté fuchsia.` },
    c2: { name: 'Fuchsia · clair', sub: 'VISION', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#B1338A', subt: '#555555', cta: 'PROJET', prompt: `Carrousel autour d'une vision, d'un parti pris ou d'une citation studio. Fond clair, accent fuchsia.` },
    c3: { name: 'Bleu · sombre', sub: 'WEB', bg: '#06101F', ink: '#FFFFFF', accent: '#3B82F6', subt: '#94A0B2', cta: 'DECOUVRIR', prompt: `Carrousel sur le web sur mesure (Next.js, performance, design system). Fond teinté bleu.` },
    c4: { name: 'Bleu · clair', sub: 'PROCESS', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#3B82F6', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel pédagogique sur le process ou une étape projet. Fond clair, accent bleu.` },
    c5: { name: 'Vert · sombre', sub: 'IA', bg: '#04140D', ink: '#FFFFFF', accent: '#10B981', subt: '#82978C', cta: 'PROJET', prompt: `Carrousel sur l'IA et l'automatisation au service du business. Fond teinté vert.` },
    c6: { name: 'Vert · clair', sub: 'MÉTHODE', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#10B981', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel méthode ou checklist. Fond clair, accent vert.` },
    c7: { name: 'Jaune · sombre', sub: 'TIPS', bg: '#14110A', ink: '#FFFFFF', accent: '#F59E0B', subt: '#9C9176', cta: 'DEVIS', prompt: `Carrousel avec des conseils concrets (design, web, IA). Fond teinté jaune.` },
    c8: { name: 'Jaune · clair', sub: 'OFFRE', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#F59E0B', subt: '#555555', cta: 'PROJET', prompt: `Carrousel offre ou appel à projet. Fond clair, accent jaune.` },
  },

  ctas: {
    PROJET: { label: 'Parler de ton projet → studjoow.com', tone: 'Parle-nous de ton projet sur studjoow.com, lien dans la bio.' },
    DECOUVRIR: { label: 'En savoir plus → studjoow.com', tone: 'Découvre le studio sur studjoow.com, lien dans la bio.' },
    DEVIS: { label: 'Demander un devis → studjoow.com', tone: 'Demande ton devis sur studjoow.com, lien dans la bio.' },
  },

  postiz: { ig: 'cmq0keofw0009p48euo433gnu', fb: 'cmq0l1mg0000fp48e2kyc9av2' },

  mdExample: `[meta] category=c3 cta=DECOUVRIR

[cover]
kicker: Web sur mesure
title: Un site qui te ressemble vraiment
subtitle: Pensé, codé et lancé par un seul interlocuteur.

[number]
chiffre: 250+
title: projets livrés en 18 ans
subtitle: De l'identité au site, jusqu'aux automatisations IA.

[list]
title: Ce qu'on construit
- Identité de marque et direction artistique
- Web Next.js premium, rapide, sur mesure
- IA et automatisations qui font gagner du temps
- SEO et GEO pour exister sur Google et les IA

[end]
title: On parle de ton projet ?
subtitle: studjoow.com, un seul interlocuteur

[caption]
Un studio, un interlocuteur, de l'idée au lancement.

Identité, web Next.js, IA, SEO et GEO : tout au même endroit.

Parlons de ton projet, lien dans la bio.

#Studio #WebDesign #NextJS #IA #SEO`,
};

export default studjoow;
