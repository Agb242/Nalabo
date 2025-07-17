# Documentation de l'API

Ce dossier contient la documentation complète de l'API du projet Nalabo.

## Structure

- `REST.md` : Standards et conventions REST
- `ENDPOINTS.md` : Documentation complète des endpoints
- `AUTHENTICATION.md` : Flux d'authentification et autorisation
- `ERRORS.md` : Gestion des erreurs et codes d'état

## Standards

- Format des réponses : JSON
- Authentification : JWT
- Versionnage : Via le header `Accept`
- Pagination : Utilisation de `limit` et `offset`
- Filtrage : Paramètres de requête
- Tri : Paramètre `sort` (ex: `?sort=created_at:desc`)
