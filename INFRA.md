# Infra Studjoow (VPS + Coolify)

Documentation des services hébergés, du déploiement et des pannes déjà rencontrées.
Tout tourne sur un seul VPS, orchestré par Coolify (build Nixpacks, proxy Traefik intégre « coolify-proxy »).

> Les informations d'accès au serveur (IP, SSH, identifiants) ne figurent PAS ici : ce dépôt est public.
> Elles sont conservées dans les notes privées de l'administrateur.

## Services et liens

| Lien | Rôle |
| --- | --- |
| https://studio.studjoow.com | **Studio carrousels** : génération des carrousels à la charte client, calendrier éditorial, envoi des brouillons vers Postiz. Connexion par lien magique (email). Repo : ce dépôt. |
| https://postiz.studjoow.com | **Postiz** : canaux sociaux connectés (Instagram, Facebook...) et programmation / planification des posts (calendrier `/launches`). Connexion propre, indépendante du Studio. |
| https://n8n.studjoow.com | **n8n** : automatisations (orchestration Studio vers Postiz, etc.). |
| https://coolify.studjoow.com | **Coolify** : dashboard d'administration (déploiements, conteneurs, logs). |

## Déploiement du Studio

- Build géré par Coolify (Nixpacks) à partir de la branche `main`.
- **L'auto-deploy n'est PAS activé.** Après un `git push`, il faut **cliquer Redeploy** dans Coolify (app Studio), ou activer le webhook GitHub.
- Vérifier qu'un déploiement est bien pris en compte :
  ```bash
  curl -sD - -o /dev/null "https://studio.studjoow.com/auth/callback?code=FAKE" | grep -i location
  # doit pointer vers studio.studjoow.com (et non une adresse interne 0.0.0.0)
  ```
- Variable d'env recommandée côté Coolify (rend le callback du lien magique infaillible) :
  ```
  NEXT_PUBLIC_SITE_URL=https://studio.studjoow.com
  ```

## Postiz (architecture)

- Image « all-in-one » : un seul conteneur qui exécute via pm2 quatre process :
  `frontend` (Next.js, port 4200), `backend` (NestJS, port 3000), `workers`, `cron`.
  Le healthcheck Docker ne teste que le frontend : un conteneur « healthy » peut avoir un backend mort.
- Le frontend appelle le backend sur `https://postiz.studjoow.com/api`.
- Diagnostic rapide depuis n'importe où :
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://postiz.studjoow.com/api/health
  # 502 = backend tombé (souvent manque de RAM) | 404 = backend vivant (route /health absente, OK) | 503 = redémarrage en cours
  ```
- En cas de page noire : redémarrer le conteneur Postiz côté serveur, puis Cmd+Shift+R dans le navigateur (vide le cache de l'erreur Next « Failed to find Server Action »).

## Pannes déjà rencontrées (2026-05-25)

1. **Postiz, page noire.** Backend en 502 par manque de RAM (le VPS n'avait aucun swap). Corrigé par un redémarrage du conteneur + ajout de swap (cause racine).
2. **Studio, boucle de connexion infinie.** Le callback du lien magique dérivait l'`origin` de `request.url` ; derrière le proxy cela donnait une adresse interne injoignable (`0.0.0.0:3000`). Corrigé dans `app/auth/callback/route.js` via `publicOrigin()` (priorité à l'en-tete `x-forwarded-host`, repli `NEXT_PUBLIC_SITE_URL`). Penser au Redeploy manuel.
3. **coolify.studjoow.com en 503 sans HTTPS.** Le champ URL d'instance (Coolify : Settings, Configuration, General) n'avait jamais été renseigné. Corrigé en y mettant `https://coolify.studjoow.com` puis Save (certificat Let's Encrypt provisionné automatiquement).

## Réflexes de dépannage

- Page noire / 502 / 503 sur un de ces sites : regarder d'abord la RAM du serveur, puis l'état des conteneurs et leurs logs (via Coolify ou en SSH).
- Via le proxy Coolify : un 502 = conteneur applicatif tombé ; un 503 = service pas (ou mal) routé, ou pas encore prêt.
