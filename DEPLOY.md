# Déploiement — EKOD Booking

## Architecture du dépôt

```
.
├── backend/            # API Spring Boot (Java 17, Maven, Dockerfile)
│   ├── src/
│   ├── pom.xml
│   ├── mvnw / .mvn/
│   └── Dockerfile
├── frontend/           # SPA React/Vite servie par nginx (Dockerfile)
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf.template
├── docker-compose.yml  # Dev local : Postgres (+ backend optionnel)
├── render.yaml         # Blueprint Render : Postgres + backend + frontend
└── .env                # Variables locales (NE PAS committer en vrai projet)
```

## En production : comment ça se parle

```
Navigateur ──> ekod-frontend (nginx)
                 │  sert le site statique (React build)
                 │  /api/*  ──proxy──>  ekod-backend (Spring Boot) ──> ekod-db (Postgres)
```

Le frontend (nginx) **proxy** tout ce qui commence par `/api` vers le backend.
→ Aucun changement de code, aucun souci de CORS : pour le navigateur, tout vient
du même domaine (celui du frontend). C'est `nginx.conf.template` qui fait le pont,
avec le host du backend injecté dans la variable `BACKEND_HOST`.

## Déployer sur Render (Blueprint)

1. Pousse le code sur GitHub (branche `master`).
2. Sur Render : **New > Blueprint**, sélectionne ce dépôt.
3. Render lit `render.yaml` et crée **3 ressources** : `ekod-db`, `ekod-backend`,
   `ekod-frontend`. Les variables de la base et `BACKEND_HOST` sont câblées
   automatiquement ; `JWT_SECRET` est généré.
4. Attends que `ekod-backend` soit *live* (les migrations Flyway créent le schéma
   + les données de seed au premier démarrage), puis `ekod-frontend`.
5. Ouvre l'URL de `ekod-frontend`. Connexion de test : `admin.principal@ekod.school`
   / `testtest`.

> Plans `free` : les services s'endorment après inactivité ; le 1er appel peut
> mettre ~30 s à réveiller le backend.

## Lancer en local

**Option A — backend depuis l'IDE (le plus simple pour développer) :**
```bash
docker compose up -d postgres     # juste la base
cd backend && ./mvnw spring-boot:run
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxy /api -> 8080)
```

**Option B — backend en conteneur :**
```bash
docker compose up -d postgres backend   # base + API sur http://localhost:8080
cd frontend && npm run dev
```

Le frontend en dev passe par le proxy Vite (`vite.config.ts`), pas par nginx :
le conteneur nginx (`frontend/Dockerfile`) ne sert qu'en production.

## Note sur le workflow GitHub `deploy.yml`

C'est l'**ancienne** méthode (build l'image backend, push sur GHCR, déclenche un
deploy hook Render). Elle a été mise à jour pour le dossier `backend/`. Si tu
utilises le Blueprint `render.yaml`, ce workflow fait double emploi pour le
backend — tu peux le garder ou le supprimer.