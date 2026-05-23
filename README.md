# Pause Feel Good · Studio (Next.js / React)

Version React de la machine à carrousels Instagram. Reprend tout le mono-fichier HTML d'origine, plus le **mode Planning** (charger un .md multi-posts, cocher les jours, générer en lot).

## Lancer en local
```bash
cd ~/Desktop/pfg-studio
npm install        # déjà fait
npm run dev        # http://localhost:3000
```

## Clés (côté serveur uniquement)
Tout est dans `.env.local` (ignoré par git), jamais exposé au navigateur :
- `ANTHROPIC_API_KEY` : utilisée par la route `/api/generate`.
- `POSTIZ_BASE`, `POSTIZ_KEY`, `POSTIZ_IG`, `POSTIZ_FB` : route `/api/postiz`.

Avantage par rapport au mono-fichier : la clé n'est plus dans la page, et **Postiz passe côté serveur, donc plus de blocage CORS** (le brouillon Postiz marche désormais aussi en local).

## Architecture
```
app/
  layout.jsx        polices + styles globaux
  globals.css       tout le CSS (porté du mono-fichier + Planning)
  page.jsx          le studio (état, UI, exports, câblage Planning)
  api/generate/     proxy Anthropic (tool create_carousel)
  api/postiz/       proxy Postiz (brouillon IG + FB)
components/
  Post.jsx          rendu d'une page (mises en page, auto-ajustement, image de fond, éléments Canva + repères magnétiques)
  Planning.jsx      panneau Planning (parse multi-posts, cartes par jour, sélection)
lib/
  brand.js          catégories, CTA, layouts, prompts, helpers
  md.js             parseMD (un post) + parseMulti (document multi-jours)
  logos.js          SVG du logo (extraits du mono-fichier)
```

## Mode Planning
Bouton « Planning » en haut. Colle un document ou charge un `.md` dont chaque post est séparé par un en-tête :
```
=== JOUR 1 · Titre du post ===
[meta] category=c3 cta=BLOG_ARTICLE
[cover] ...
...
[caption] ...

=== JOUR 2 · Autre titre ===
...
```
L'outil affiche une carte par jour (catégorie, pages, aperçu), avec cases à cocher. Puis :
- **Ouvrir** : charge ce jour dans l'éditeur pour retoucher.
- **Exporter la sélection (ZIP)** : un dossier de PNG par jour coché.
- **Brouillons Postiz de la sélection** : crée un brouillon par jour coché.

Le parseur est tolérant : s'il n'y a pas d'en-tête `=== … ===`, il traite le document comme un seul post.

## État des fonctionnalités
- Rendu, thèmes par catégorie, 3 formats, éditeur Canva (déplacement, redimension, rotation, opacité, arrondi, cadrage), 6 alignements + repères magnétiques, pages, miniatures : **portés et vérifiés**.
- Export PNG / ZIP, copie légende, export Markdown, sauvegarde locale : **portés** (PNG vérifié).
- Génération via API et brouillons Postiz : **câblés** (non testés en direct pour ne pas consommer de crédits / créer de vrais brouillons).
- Mode Planning : **nouveau, vérifié** (parse, cartes, ouvrir).

## Déploiement (à faire par toi)
Prévu sur Vercel. Penser à reporter les variables de `.env.local` dans les *Environment Variables* du projet Vercel. Le studio pourra ensuite être dupliqué par client (changer la charte dans `lib/brand.js` et `lib/logos.js`).
