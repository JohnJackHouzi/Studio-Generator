// Configuration du projet « Master » (formation Marketing & IA — master.studjoow.com).
// Skin propre partage avec Studjoow (decor.style: 'studjoow'), base sur la reference
// Figma "Post-Studjoow" : police Jost pour les titres, fond sombre #1B0B16, logo+badge en bas.
// Même système que les autres projets Studjoow : 8 templates = 4 couleurs x sombre/clair.
// HEX figés : fuchsia #B1338A, bleu #3B82F6, vert #10B981, jaune #F59E0B, fond clair #FAF9F7.
// Postiz pointe vers le même compte que Studjoow (ig/fb partagés) : Master publie sur @studjoow.

const LOGO_WORD = `<span class="skLogo">master</span>`;

const master = {
  key: 'master',
  name: 'Master Marketing & IA',
  token: '',
  footerUrl: 'master.studjoow.com',
  defaultBadge: 'FORMATION IA',

  fonts: {
    serif: "'Jost', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
  },

  logo: { word: LOGO_WORD },
  decor: { style: 'studjoow' },

  voice: `Tu es la voix de Master, la formation Marketing & IA de Studjoow (master.studjoow.com), par John Houzi. Ton pédagogue, concret, jamais de blabla de coach. Tu parles marketing, IA générative appliquée au business, méthode, résultats d'élèves. Apostrophes droites. Pas de tiret cadratin. Accents complets. CTA : découvrir la formation sur master.studjoow.com.`,

  categories: {
    c1: { name: 'Fuchsia · sombre', sub: 'TÉMOIGNAGE', bg: '#1B0B16', ink: '#FFFFFF', accent: '#B1338A', subt: '#9C8893', cta: 'DECOUVRIR', prompt: `Carrousel autour d'un résultat ou témoignage d'élève concret (avant/après, chiffre). Fond teinté fuchsia.` },
    c2: { name: 'Fuchsia · clair', sub: 'CONCEPT', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#B1338A', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel qui explique un concept marketing ou IA clé enseigné dans la formation. Fond clair, accent fuchsia.` },
    c3: { name: 'Bleu · sombre', sub: 'MODULE', bg: '#06101F', ink: '#FFFFFF', accent: '#3B82F6', subt: '#94A0B2', cta: 'DECOUVRIR', prompt: `Carrousel qui présente le contenu d'un module de la formation. Fond sombre, accent bleu.` },
    c4: { name: 'Bleu · clair', sub: 'MÉTHODE', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#3B82F6', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel pédagogique sur la méthode (déverrouillage progressif, quiz, rythme). Fond clair, accent bleu.` },
    c5: { name: 'Vert · sombre', sub: 'IA', bg: '#04140D', ink: '#FFFFFF', accent: '#10B981', subt: '#82978C', cta: 'DECOUVRIR', prompt: `Carrousel sur un outil ou usage IA concret enseigné dans la formation. Fond teinté vert.` },
    c6: { name: 'Vert · clair', sub: 'RÉSULTAT', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#10B981', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel avec un chiffre fort (nombre d'élèves, taux de complétion, résultat). Fond clair, accent vert.` },
    c7: { name: 'Jaune · sombre', sub: 'TIPS', bg: '#14110A', ink: '#FFFFFF', accent: '#F59E0B', subt: '#9C9176', cta: 'REJOINDRE', prompt: `Carrousel avec un conseil actionnable extrait de la formation. Fond teinté jaune.` },
    c8: { name: 'Jaune · clair', sub: 'OFFRE', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#F59E0B', subt: '#555555', cta: 'REJOINDRE', prompt: `Carrousel qui présente l'offre (accès à vie, certification). Fond clair, accent jaune.` },
  },

  ctas: {
    DECOUVRIR: { label: 'Découvrir la formation → master.studjoow.com', tone: 'Découvre le programme complet sur master.studjoow.com, lien dans la bio.' },
    REJOINDRE: { label: 'Rejoindre la formation → master.studjoow.com', tone: 'Rejoins la formation sur master.studjoow.com, lien dans la bio.' },
  },

  postiz: { ig: 'cmq0keofw0009p48euo433gnu', fb: 'cmq0l1mg0000fp48e2kyc9av2' },

  mdExample: `[meta] category=c6 cta=DECOUVRIR

[cover]
kicker: Marketing & IA
title: Et si tu maîtrisais enfin l'IA pour ton business ?
subtitle: Une formation concrète, pas une collection de promesses.

[number]
chiffre: 85%
title: à débloquer pour passer au module suivant
subtitle: Déverrouillage progressif : chaque étape validée avant la suivante.

[list]
title: Ce que tu apprends
- Marketing piloté par l'IA générative
- Automatisations qui font gagner du temps
- Méthode pas à pas, module après module
- Certification vérifiable en fin de parcours

[end]
title: Prêt à passer à l'action ?
subtitle: master.studjoow.com, accès à vie

[caption]
Marketing & IA, la formation qui va au fond des choses.

Modules débloqués progressivement, certification vérifiable, accès à vie.

Découvre le programme, lien dans la bio.

#MarketingIA #FormationIA #IA #Marketing`,
};

export default master;
