# Architecture du Projet

Ce document décrit l'architecture technique du projet Nalabo.

## Vue d'Ensemble

Nalabo suit une architecture modulaire organisée en plusieurs couches :

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                   │
└───────────────────────────┬─────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────┐
│                    API Gateway                      │
└───────────────┬───────────────────┬─────────────────┘
                │                   │
┌───────────────▼───┐   ┌───────────▼───────────────┐
│  Service Auth    │   │  Service Principal       │
└───────────────────┘   └───────────────────────────┘
```

## Technologies Principales

### Frontend
- **Framework** : React 18+
- **Gestion d'état** : React Query
- **Styling** : Tailwind CSS
- **Routage** : React Router
- **Validation** : Zod

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : PostgreSQL
- **ORM** : Drizzle ORM
- **Authentification** : JWT + sessions

## Structure des Dossiers

```
Nalabo/
├── client/                 # Application frontend
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── services/      # Appels API
│   │   └── styles/        # Feuilles de style globales
│
├── server/                 # Application backend
│   ├── src/
│   │   ├── controllers/   # Contrôleurs
│   │   ├── middleware/    # Middlewares
│   │   ├── routes/        # Définition des routes
│   │   ├── services/      # Logique métier
│   │   └── utils/         # Utilitaires
│
├── shared/                # Code partagé
│   ├── schemas/          # Schémas de validation
│   └── types/            # Types TypeScript partagés
│
└── tests/                # Tests automatisés
    ├── unit/            # Tests unitaires
    ├── integration/     # Tests d'intégration
    └── e2e/             # Tests end-to-end
```

## Flux de Données

1. **Authentification** :
   - L'utilisateur se connecte via le formulaire d'authentification
   - Le serveur valide les identifiants et renvoie un JWT
   - Le token est stocké dans un cookie HTTP-Only

2. **Requêtes API** :
   - Le client envoie des requêtes avec le token dans le header
   - Le middleware vérifie le token et attache l'utilisateur à la requête
   - Le contrôleur traite la requête et renvoie une réponse

3. Gestion des Erreurs :
   - Middleware d'erreur centralisé
   - Format standardisé des réponses d'erreur :
     ```json
     {
       "success": false,
       "error": {
         "code": "ERROR_CODE",
         "message": "Message d'erreur lisible",
         "details": {}
       }
     }
     ```
   - Journalisation structurée des erreurs
   - Documentation des codes d'erreur dans `/docs/ERRORS.md`
   - Structure des dossiers d'issues :
     ```
     /issues
       /001-database-connection
         README.md       # Description du problème et contexte
         solution.md     # Solution mise en place
         screenshots/    # Captures d'écran si nécessaire
         scripts/        # Scripts de correction
     ```

## Sécurité

- Validation des entrées utilisateur
- Protection contre les attaques CSRF
- Headers de sécurité HTTP
- Rate limiting
- Hachage des mots de passe avec bcrypt

## Performance

- Mise en cache des données fréquemment accédées
- Pagination des listes
- Chargement paresseux des composants
- Optimisation des images
- Compression des réponses HTTP

## Évolutivité

- Architecture modulaire
- Séparation claire des responsabilités
- Configuration externalisée
- Logs et monitoring

## Problèmes Identifiés (18 décembre 2024)

### 🔴 Critiques
1. **Interface Admin Manquante** : Pas d'UI pour gérer les infrastructures K8s
2. **Isolation des Données** : Dashboard non filtré par utilisateur
3. **Workflow d'Ateliers** : Déconnexion entre création et exécution
4. **Stabilité Base de Données** : Erreurs de connexion Neon fréquentes

### 🟡 Importantes
- Gestion des erreurs de base de données
- Système d'authentification admin
- Monitoring des ressources K8s
- Validation des templates d'ateliers

### Corrections Prioritaires
1. Stabiliser la connexion base de données
2. Créer l'interface admin backoffice
3. Implémenter l'isolation des données utilisateur
4. Corriger le workflow de création d'ateliers
