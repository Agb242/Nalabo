# Guide de Développement Nalabo

## Prérequis

- Node.js 20+
- pnpm
- Compte Neon Database (PostgreSQL)

## Installation

```bash
# Cloner et installer
git clone [url-du-depot]
cd Nalabo
pnpm install

# Configuration environnement
cp .env.example .env
```

### Variables d'environnement requises

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="votre-secret-jwt"
NODE_ENV="development"
```

## Démarrage

```bash
# Développement (frontend + backend)
pnpm dev

# Tests
pnpm test

# Linting
pnpm lint
```

## Structure du Projet

```
Nalabo/
├── client/           # Frontend React + TypeScript
├── server/           # Backend Express + TypeScript  
├── shared/           # Types et schémas partagés
├── docs/             # Documentation
└── migrations/       # Migrations base de données
```

## 🎯 Fonctionnalités par État

### ✅ Opérationnel
- **Authentification** : JWT + sessions HTTP-Only
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Frontend** : React 18 + TypeScript + Tailwind
- **API** : Routes auth, users, workshops, challenges
- **Dashboard** : Interface utilisateur de base

### 🔧 En Développement
- **Interface Admin** : Routes existent, UI à créer
- **Workflow Ateliers** : Déconnexion création/exécution
- **Infrastructure K8s** : Service non stable
- **Isolation Données** : Filtrage utilisateur incomplet

## 🐛 Problèmes Connus

### Critique
1. **Interface Admin Manquante** → `client/src/pages/admin-dashboard.tsx` à compléter
2. **Workflow Ateliers Cassé** → Connecter `workshop-builder` à `workshop-orchestrator`
3. **Infrastructure K8s** → Service `kubernetes-infrastructure.ts` instable

### Corrections Prioritaires
```bash
# 1. Vérifier connexion DB
npm run check-db

# 2. Créer utilisateur admin
node scripts/create-admin.js

# 3. Tester isolation utilisateur
# Vérifier que les routes filtrent par userId
```

## 🔄 Workflow de Développement

1. **Branches** : `feature/nom-fonctionnalite`
2. **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
3. **Tests** : Obligatoires pour nouvelles fonctionnalités
4. **Review** : PR requise pour `main`

## 📊 Métriques Techniques

- **Pages Frontend** : 9 pages principales
- **Routes API** : 15+ endpoints
- **Composants UI** : 50+ composants
- **Services Backend** : 7 services principaux

---
*Pour questions techniques, ouvrir une issue GitHub*