# ============================================================================
#  Étape 1 — build du bundle React/Vite (génère /app/dist)
# ============================================================================
FROM node:20-alpine AS build
WORKDIR /app

# On copie d'abord les manifestes -> cache Docker sur npm ci tant qu'ils ne changent pas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================================
#  Étape 2 — nginx sert le site ET proxy /api vers le backend
# ============================================================================
FROM nginx:1.27-alpine

# L'image nginx remplace ${PORT} et ${BACKEND_HOST} dans ce template au démarrage,
# puis place le résultat dans /etc/nginx/conf.d/. (Les variables nginx comme $uri
# ne sont PAS touchées : ce ne sont pas des variables d'environnement.)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Le site statique construit à l'étape 1
COPY --from=build /app/dist /usr/share/nginx/html

# PORT : défaut raisonnable (Render fournit/écrase le sien au runtime).
ENV PORT=8080

# BACKEND_HOST : nom d'hôte du backend SANS schéma, ex: tpfinal-backend-9klo.onrender.com
# (le https:// est ajouté dans nginx.conf.template). Câblé automatiquement par
# render.yaml via fromService/host. Si elle manque au runtime, nginx ne démarrera pas.

EXPOSE 8080
