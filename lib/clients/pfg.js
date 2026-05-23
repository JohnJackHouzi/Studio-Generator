import { PICTO_SVG, WORD_SVG, FOOTER_PICTO_SVG } from '@/lib/logos';

// Configuration du projet « Pause Feel Good ».
// Modèle de référence : pour ajouter un client, copier ce fichier, adapter les valeurs.
const pfg = {
  key: 'pfg',
  name: 'Pause Feel Good',
  token: '', // vide = accès ouvert. Mettre un mot de passe pour protéger ce projet.
  footerUrl: 'pausefeelgood.fr',
  defaultBadge: 'Découvrir nos livres',
  fonts: {
    serif: "'Playfair Display', Georgia, serif",
    sans: "'DM Sans', system-ui, sans-serif",
  },
  logo: { picto: PICTO_SVG, word: WORD_SVG, footerPicto: FOOTER_PICTO_SVG },
  postiz: { ig: 'cmpi2846v0001ovsuriqpbcyc', fb: 'cmpi2hbmw0003ovsu95w0r0rd' },

  voice: `Tu es l'éditeur en chef de Pause Feel Good, une marque éditoriale française premium (repos, burnout, changement de vie, bien-être psychologique).
Ton de marque : posé, éditorial, jamais racoleur, inspiré de Kinfolk, The Gentlewoman, Cereal. Français impeccable. Aucun emoji. Aucun tiret (court, long ou cadratin). Capitales seulement en début de phrase, noms propres ou acronymes. Ponctuation française stricte (espace insécable avant ; : ? ! »). Tu privilégies la nuance, la question plutôt que l'ordre, le récit court. Tu ne promets pas de résultats, n'inventes pas de statistiques, n'utilises ni "tu mérites" ni les codes du développement personnel anglo-saxon traduit.`,

  categories: {
    c1: { name: 'Livres et collections', sub: 'Éditions', bg: '#F2DDC4', ink: '#5A3C24', accent: '#9A6841', subt: '#9A6841', cta: 'BUY_BOOK', prompt: `Carrousel autour d'un livre ou d'une collection Pause Feel Good.` },
    c2: { name: 'Tests et diagnostics', sub: 'Diagnostic', bg: '#F2D9C8', ink: '#7A3520', accent: '#B85C3C', subt: '#B85C3C', cta: 'DIAGNOSTIC', prompt: `Carrousel autour d'un diagnostic en ligne Pause Feel Good.` },
    c3: { name: 'Conseils et méthodes', sub: 'Méthode', bg: '#F8F3E9', ink: '#5A3C24', accent: '#9A6841', subt: '#8A7A60', cta: 'BLOG_ARTICLE', prompt: `Carrousel de conseils ou méthode pratique Pause Feel Good.` },
    c4: { name: 'Témoignages et histoires', sub: 'Histoire', bg: '#DCE5D9', ink: '#33493E', accent: '#5C7D6E', subt: '#5C7D6E', cta: 'BLOG_ARTICLE', prompt: `Carrousel autour d'un témoignage (mentionne qu'il peut être anonymisé ou composite).` },
    c5: { name: 'Exercices et rituels', sub: 'Atelier', bg: '#DBE3E6', ink: '#26414E', accent: '#4A6B78', subt: '#4A6B78', cta: 'NEWSLETTER', prompt: `Carrousel autour d'un exercice ou rituel Pause Feel Good.` },
    c6: { name: 'Citations et inspiration', sub: 'Citation', bg: '#4A2D3C', ink: '#FAF7F2', accent: '#E8A87C', subt: '#D9B8C4', cta: 'DIAGNOSTIC', prompt: `Carrousel autour d'une citation ou inspiration (citations d'auteurs réels uniquement si authentiques).` },
    c7: { name: 'Communauté et coulisses', sub: 'Coulisses', bg: '#E8EBDE', ink: '#3E481F', accent: '#6B7A4F', subt: '#6B7A4F', cta: 'NEWSLETTER', prompt: `Carrousel d'annonce, événement ou coulisses Pause Feel Good.` },
    c8: { name: 'Lectures du dimanche', sub: 'Lecture', bg: '#5C7D6E', ink: '#FAF7F2', accent: '#C9D4C5', subt: '#C9D4C5', cta: 'BLOG_ARTICLE', prompt: `Carrousel pour la rubrique Lectures du dimanche.` },
  },

  ctas: {
    BUY_BOOK: { label: 'Disponible sur pausefeelgood.fr', tone: 'Découvrez le livre en boutique, lien dans la bio.' },
    DIAGNOSTIC: { label: 'Diagnostic gratuit en 4 minutes', tone: 'Commentez REPOS, BURNOUT ou LIVRE pour recevoir votre diagnostic.' },
    BLOG_ARTICLE: { label: 'Article complet sur le blog', tone: 'Lien dans la bio pour lire l’article complet.' },
    NEWSLETTER: { label: 'Recevez la newsletter du dimanche', tone: 'Inscrivez-vous à la newsletter, lien dans la bio.' },
  },

  mdExample: `[meta] category=c2 cta=DIAGNOSTIC

[cover]
kicker: Le bon moment
title: Est-ce le bon moment pour changer de vie ?
subtitle: Quelques repères doux, sans pression.

[number]
chiffre: 7 sur 10
title: ressentent ce besoin sans oser se lancer

[list]
title: 3 signes que quelque chose doit bouger
- Tu te réveilles déjà fatigué
- Tes émotions débordent vite
- Tout te coûte un effort inhabituel

[quote]
title: On ne change pas par hasard, on change par choix
auteur: Pause Feel Good

[end]
title: Et toi, où en es-tu ?
subtitle: Fais le point sur

[caption]
Votre corps vous parle depuis longtemps. Et si ce n'était pas le mauvais moment, mais le bon ?

#bienetre #changementdevie #pausefeelgood`,
};

export default pfg;
