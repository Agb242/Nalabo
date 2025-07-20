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

# Guide de Développement Nalabo

## État Actuel du Projet (Post-Corrections)

### ✅ Fonctionnalités Implémentées et Stabilisées
- ✅ Système d'authentification complet avec sessions sécurisées
- ✅ Dashboard utilisateur avec statistiques isolées par utilisateur
- ✅ Interface de création d'ateliers connectée à l'orchestrateur
- ✅ Base de données PostgreSQL stabilisée avec retry logic
- ✅ Interface admin complète pour gestion clusters Kubernetes
- ✅ Isolation des données utilisateur renforcée (sécurité)
- ✅ Workflow d'ateliers fonctionnel (création → sauvegarde → exécution)
- ✅ Monitoring des ressources infrastructure en temps réel

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

## ⚡ Problèmes Critiques Résolus

### 1. Connexion Base de Données Stabilisée
- Pool de connexions optimisé avec retry logic
- Reconnexion automatique en cas de timeout
- Gestion des erreurs de connexion améliorée

### 2. Interface Admin Fonctionnelle
- Gestion complète des clusters Kubernetes
- Monitoring des ressources en temps réel
- Test de connexion et diagnostic des clusters

### 3. Isolation des Données Sécurisée
- Middleware d'isolation utilisateur renforcé
- Vérification d'ownership des ressources
- Filtrage automatique par userId sur toutes les routes

### 4. Workflow d'Ateliers Connecté
- Workshop Builder intégré à l'orchestrateur backend
- Sauvegarde directe en base avec validation
- Application des limites freemium

## Corrections Prioritaires
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

## Prochaines Étapes

1. **Tests d'Intégration**

---
*Pour questions techniques, ouvrir une issue GitHub*