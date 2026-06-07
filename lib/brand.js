// Données de marque Pause Feel Good

export const CATEGORIES = {
  c1: { name: 'Livres et collections', sub: 'Éditions', bg: '#F2DDC4', ink: '#5A3C24', accent: '#9A6841', subt: '#9A6841', cta: 'BUY_BOOK' },
  c2: { name: 'Tests et diagnostics', sub: 'Diagnostic', bg: '#F2D9C8', ink: '#7A3520', accent: '#B85C3C', subt: '#B85C3C', cta: 'DIAGNOSTIC' },
  c3: { name: 'Conseils et méthodes', sub: 'Méthode', bg: '#F8F3E9', ink: '#5A3C24', accent: '#9A6841', subt: '#8A7A60', cta: 'BLOG_ARTICLE' },
  c4: { name: 'Témoignages et histoires', sub: 'Histoire', bg: '#DCE5D9', ink: '#33493E', accent: '#5C7D6E', subt: '#5C7D6E', cta: 'BLOG_ARTICLE' },
  c5: { name: 'Exercices et rituels', sub: 'Atelier', bg: '#DBE3E6', ink: '#26414E', accent: '#4A6B78', subt: '#4A6B78', cta: 'NEWSLETTER' },
  c6: { name: 'Citations et inspiration', sub: 'Citation', bg: '#4A2D3C', ink: '#FAF7F2', accent: '#E8A87C', subt: '#D9B8C4', cta: 'DIAGNOSTIC' },
  c7: { name: 'Communauté et coulisses', sub: 'Coulisses', bg: '#E8EBDE', ink: '#3E481F', accent: '#6B7A4F', subt: '#6B7A4F', cta: 'NEWSLETTER' },
  c8: { name: 'Lectures du dimanche', sub: 'Lecture', bg: '#5C7D6E', ink: '#FAF7F2', accent: '#C9D4C5', subt: '#C9D4C5', cta: 'BLOG_ARTICLE' },
};

export const CTAS = {
  BUY_BOOK: { label: 'Disponible sur pausefeelgood.fr', tone: 'Découvrez le livre en boutique, lien dans la bio.' },
  DIAGNOSTIC: { label: 'Diagnostic gratuit en 4 minutes', tone: 'Commentez REPOS, BURNOUT ou LIVRE pour recevoir votre diagnostic.' },
  BLOG_ARTICLE: { label: 'Article complet sur le blog', tone: 'Lien dans la bio pour lire l’article complet.' },
  NEWSLETTER: { label: 'Recevez la newsletter du dimanche', tone: 'Inscrivez-vous à la newsletter, lien dans la bio.' },
};

export const LAYOUTS = ['cover', 'text', 'quote', 'number', 'method', 'list', 'definition', 'end', 'score', 'versus', 'tip', 'graphe', 'checklist'];

export const FORMATS = { post: [1080, 1350], story: [1080, 1920], square: [1080, 1080] };

export const LAYALIAS = {
  titre: 'text', texte: 'text', citation: 'quote', chiffre: 'number', nombre: 'number',
  methode: 'method', 'méthode': 'method', liste: 'list', definition: 'definition',
  'définition': 'definition', couverture: 'cover', fin: 'end', cta: 'end',
  vs: 'versus', score: 'score', versus: 'versus', tip: 'tip', conseil: 'tip', astuce: 'tip',
  graphe: 'graphe', graph: 'graphe', graphique: 'graphe', barres: 'graphe',
  checklist: 'checklist', 'check-list': 'checklist',
};

export const SYS_GLOBAL = `Tu es l'éditeur en chef de Pause Feel Good, une marque éditoriale française premium (repos, burnout, changement de vie, bien-être psychologique).
Ton de marque : posé, éditorial, jamais racoleur, inspiré de Kinfolk, The Gentlewoman, Cereal. Français impeccable. Aucun emoji. Aucun tiret (court, long ou cadratin). Capitales seulement en début de phrase, noms propres ou acronymes. Ponctuation française stricte (espace insécable avant ; : ? ! »). Tu privilégies la nuance, la question plutôt que l'ordre, le récit court. Tu ne promets pas de résultats, n'inventes pas de statistiques, n'utilises ni "tu mérites" ni les codes du développement personnel anglo-saxon traduit.`;

export const CAT_PROMPT = {
  c1: `Carrousel autour d'un livre ou d'une collection Pause Feel Good.`,
  c2: `Carrousel autour d'un diagnostic en ligne Pause Feel Good.`,
  c3: `Carrousel de conseils ou méthode pratique Pause Feel Good.`,
  c4: `Carrousel autour d'un témoignage (mentionne qu'il peut être anonymisé ou composite).`,
  c5: `Carrousel autour d'un exercice ou rituel Pause Feel Good.`,
  c6: `Carrousel autour d'une citation ou inspiration (citations d'auteurs réels uniquement si authentiques).`,
  c7: `Carrousel d'annonce, événement ou coulisses Pause Feel Good.`,
  c8: `Carrousel pour la rubrique Lectures du dimanche.`,
};

export const MD_EXAMPLE = `[meta] category=c2 cta=DIAGNOSTIC

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

#bienetre #changementdevie #pausefeelgood`;

export function layName(l) {
  return ({ cover: 'Couverture', text: 'Texte', quote: 'Citation', number: 'Chiffre', method: 'Méthode', list: 'Liste', definition: 'Définition', end: 'Fin / CTA', score: 'Score', versus: 'Versus', tip: 'Conseil', graphe: 'Graphe', checklist: 'Checklist' })[l] || l;
}

export function clean(t) {
  if (!t) return '';
  return String(t)
    .replace(/[—–]/g, ', ')
    .replace(/ - /g, ', ')
    .replace(/([\wÀ-ÿ])\s*([;:?!»])/g, '$1 $2')
    .replace(/«\s*/g, '« ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function hexA(hex, a) {
  const h = hex.replace('#', '');
  return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
}

export function sampleSlide() {
  return { layout: 'cover', kicker: '', title: 'Est-ce le bon moment pour changer de vie ?', subtitle: 'Quelques repères doux pour y voir clair, sans pression.', body: '', bigNumber: '', quoteAuthor: '', listItems: [], elements: [] };
}
