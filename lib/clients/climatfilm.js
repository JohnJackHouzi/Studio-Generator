// Configuration du projet « Climatfilm » (pose de films de fenêtres — climatfilm.fr).
// Réutilise le skin « tech / dashboard » de Skovr (decor.style: 'skovr'), en
// dominante BLEUE (le bleu est l'accent de marque). On n'utilise pas le fuchsia.
// HEX figés (le CSS du skin keye dessus) : bleu #3B82F6, vert #10B981,
// jaune #F59E0B, fond clair #FAF9F7. Ne pas changer.

const LOGO_WORD = `<span class="skLogo">climatfilm</span>`;

const climatfilm = {
  key: 'climatfilm',
  name: 'Climatfilm',
  token: '',
  footerUrl: 'climatfilm.fr',
  defaultBadge: 'FILMS FENÊTRES',

  fonts: {
    serif: "'Space Grotesk', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
  },

  logo: { word: LOGO_WORD },
  decor: { style: 'skovr' },

  voice: `Tu es la voix de Climatfilm, expert de la pose de films de fenêtres à Paris depuis 15 ans (climatfilm.fr) : films solaires, anti vis-à-vis, sécurité, thermiques, anti-UV, et adhésifs déco Climatstyl. Ton professionnel, rassurant, chaleureux et pédagogue, jamais agressif. Tu vouvoies. Tu mets en avant des bénéfices concrets : confort, température, lumière préservée, intimité, économies, protection. Apostrophes droites. Pas de tiret cadratin. Accents complets. Ponctuation française. Pas de promesse exagérée ni de statistique inventée. CTA : devis gratuit sur climatfilm.fr.`,

  categories: {
    c1: { name: 'Bleu · sombre', sub: 'CHIFFRE', bg: '#06101F', ink: '#FFFFFF', accent: '#3B82F6', subt: '#94A0B2', cta: 'DEVIS', prompt: `Carrousel autour d'un bénéfice chiffré (degrés gagnés, UV bloqués, économies). Fond teinté bleu.` },
    c2: { name: 'Bleu · clair', sub: 'INFO', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#3B82F6', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel pédagogique : comment fonctionne un film, quelle solution pour quel besoin. Fond clair, accent bleu.` },
    c3: { name: 'Jaune · sombre', sub: 'SOLAIRE', bg: '#14110A', ink: '#FFFFFF', accent: '#F59E0B', subt: '#9C9176', cta: 'DEVIS', prompt: `Carrousel sur les films solaires et le confort d'été (chaleur, éblouissement). Fond teinté jaune.` },
    c4: { name: 'Jaune · clair', sub: 'CONFORT', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#F59E0B', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel conseils confort (été, lumière, vis-à-vis). Fond clair, accent jaune.` },
    c5: { name: 'Vert · sombre', sub: 'THERMIQUE', bg: '#04140D', ink: '#FFFFFF', accent: '#10B981', subt: '#82978C', cta: 'DEVIS', prompt: `Carrousel sur le film thermique et les économies (hiver/été, isolation). Fond teinté vert.` },
    c6: { name: 'Vert · clair', sub: 'CHECKLIST', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#10B981', subt: '#555555', cta: 'DECOUVRIR', prompt: `Carrousel checklist : suis-je concerné, quel film choisir. Fond clair, accent vert.` },
    c7: { name: 'Sécurité · sombre', sub: 'SÉCURITÉ', bg: '#06101F', ink: '#FFFFFF', accent: '#3B82F6', subt: '#94A0B2', cta: 'DEVIS', prompt: `Carrousel sur le film de sécurité anti-effraction et la protection. Fond teinté bleu.` },
    c8: { name: 'Bleu · clair · CTA', sub: 'DEVIS', bg: '#FAF9F7', ink: '#0A0A0A', accent: '#3B82F6', subt: '#555555', cta: 'DEVIS', prompt: `Carrousel avis client ou appel au devis gratuit. Fond clair, accent bleu.` },
  },

  ctas: {
    DEVIS: { label: 'Devis gratuit → climatfilm.fr', tone: 'Demandez votre devis gratuit sur climatfilm.fr, lien dans la bio.' },
    DECOUVRIR: { label: 'En savoir plus → climatfilm.fr', tone: 'Découvrez nos solutions sur climatfilm.fr, lien dans la bio.' },
    RDV: { label: 'Prendre rendez-vous → climatfilm.fr', tone: 'Prenez rendez-vous sur climatfilm.fr, lien dans la bio.' },
  },

  postiz: {},

  mdExample: `[meta] category=c3 cta=DEVIS

[cover]
kicker: Confort d'été
title: Gardez la lumière, pas la chaleur
subtitle: Un film solaire change tout, sans travaux.

[number]
chiffre: 8°C
title: de moins derrière vos fenêtres
subtitle: Le film solaire réduit la chaleur sans assombrir la pièce.

[list]
title: Ce que vous y gagnez
- Moins de chaleur et d'éblouissement
- Jusqu'à 99% des UV bloqués
- La lumière du jour préservée
- Pose rapide, garantie jusqu'à 10 ans

[end]
title: Votre devis gratuit en quelques clics
subtitle: climatfilm.fr, expert depuis 15 ans

[caption]
L'été, vos fenêtres laissent entrer la chaleur. Un film solaire la stoppe, tout en gardant la lumière.

Pose rapide, sans travaux, garantie jusqu'à 10 ans.

Devis gratuit, lien dans la bio.

#FilmSolaire #Confort #Fenetres #Paris`,
};

export default climatfilm;
