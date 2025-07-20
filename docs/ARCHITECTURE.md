# Architecture Technique Nalabo

## Vue d'Ensemble

Architecture monolithique modulaire avec séparation frontend/backend.

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React)                       │
│              client/src/                            │
└───────────────────────────┬─────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────┐
│              Backend (Express)                      │
│              server/src/                            │
└───────────────────────────┬─────────────────────────┘
                            │ SQL
┌───────────────────────────▼─────────────────────────┐
│           Database (PostgreSQL)                     │
│               Neon Cloud                            │
└─────────────────────────────────────────────────────┘
```

## Stack Technique

### Frontend
- **Framework** : React 18 + TypeScript
- **Build** : Vite
- **UI** : Tailwind CSS + shadcn/ui
- **State** : React Query + Context
- **Routing** : React Router

### Backend  
- **Runtime** : Node.js + TypeScript
- **Framework** : Express.js
- **Database** : PostgreSQL (Neon) + Drizzle ORM
- **Auth** : JWT + HTTP-Only cookies

### Infrastructure
- **Hosting** : Replit (développement)
- **Database** : Neon (PostgreSQL serverless)
- **Containers** : Docker (ateliers)
- **Orchestration** : Kubernetes (prévu)

## Modules Principaux

### Frontend (`client/src/`)
```
├── components/
│   ├── auth/          # Authentification
│   ├── ui/            # Composants réutilisables
│   ├── workshop/      # Création d'ateliers
│   └── layout/        # Layout principal
├── pages/             # Pages de l'application
├── hooks/             # Hooks personnalisés
└── lib/               # Utilitaires
```

### Backend (`server/`)
```
├── routes/            # Endpoints API
├── services/          # Logique métier
├── middleware/        # Middlewares Express
└── auth.ts            # Authentification JWT
```

### Partagé (`shared/`)
```
├── schema.ts          # Schémas base de données
└── freemium-limits.ts # Limites par plan
```

## Base de Données

### Tables Principales
- `users` - Utilisateurs et authentification
- `workshops` - Ateliers créés
- `workshop_sessions` - Sessions d'exécution
- `challenges` - Défis techniques
- `user_sessions` - Sessions utilisateur

### Relations
```sql
users (1) → (n) workshops
users (1) → (n) workshop_sessions  
workshops (1) → (n) workshop_sessions
```

## Authentification

### Flow JWT
1. Login → JWT généré + cookie HTTP-Only
2. Requête → Middleware vérifie JWT
3. Accès → User attaché à `req.user`

### Rôles
- `user` - Utilisateur standard
- `admin` - Administrateur plateforme
- `super_admin` - Super administrateur

## 🚨 Problèmes Architecture Actuels

### 1. Déconnexion Modules
- `workshop-builder` (frontend) ↔ `workshop-orchestrator` (backend)
- Création d'ateliers non liée à l'exécution

### 2. Infrastructure Instable
- Service Kubernetes non opérationnel
- Fallback Docker non robuste

### 3. Isolation Incomplète
- Certaines routes ne filtrent pas par `userId`
- Risques de fuite de données

## 🔧 Améliorations Prioritaires

1. **Connecter Workflow Ateliers**
2. **Stabiliser Infrastructure Docker**
3. **Compléter Isolation Utilisateur**
4. **Interface Admin Fonctionnelle**

---
*Architecture évolutive vers microservices si scaling nécessaire*