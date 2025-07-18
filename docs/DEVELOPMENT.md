# Guide de Développement

Ce document explique comment configurer l'environnement de développement et les bonnes pratiques à suivre.

## Prérequis

- Node.js (version 20+)
- PostgreSQL (version 15+)
- pnpm (gestionnaire de paquets)

## Installation

```bash
# Cloner le dépôt
git clone [url-du-depot]
cd Nalabo

# Installer les dépendances
pnpm install

# Copier le fichier .env.example vers .env
cp .env.example .env

# Configurer les variables d'environnement
# Éditer le fichier .env avec vos paramètres
```

## Démarrage en développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Lancer les tests
pnpm test

# Lancer le linter
pnpm lint

# Lancer le formateur de code
pnpm format
```

## Structure du Projet

```
Nalabo/
├── client/           # Code source du frontend
├── server/           # Code source du backend
├── shared/           # Code partagé entre le frontend et le backend
├── public/           # Fichiers statiques
├── tests/            # Tests automatisés
└── docs/             # Documentation du projet
```

## Bonnes Pratiques

- Suivre les conventions de commit (Conventional Commits)
- Écrire des tests unitaires pour les nouvelles fonctionnalités
- Documenter le code avec JSDoc
- Garder les commits atomiques et bien décrits
- Créer des branches avec la convention : `type/description-courte`

## Gestion des Branches

- `main` : Branche principale (production)
- `staging` : Branche de pré-production
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `docs/*` : Mises à jour de documentation

## Tests

```bash
# Lancer tous les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch

# Générer un rapport de couverture
pnpm test:coverage
```

## Débogage

Pour déboguer le serveur :

1. Ajouter `debugger` dans votre code
2. Lancer `pnpm debug`
3. Ouvrir Chrome/Edge à l'adresse `chrome://inspect`
4. Cliquer sur "Open dedicated DevTools for Node"

## État Actuel du Projet (18 décembre 2024)

### ✅ Fonctionnalités Opérationnelles
- Système d'authentification utilisateur
- Interface de création d'ateliers (frontend)
- Base de données PostgreSQL avec Neon
- Architecture modulaire backend/frontend
- Composants UI avec Tailwind CSS

### ⚠️ Problèmes Identifiés
- Interface admin manquante
- Isolation des données utilisateur incomplète
- Workflow d'ateliers non fonctionnel
- Erreurs de connexion base de données

### 🔧 En Cours de Correction
- Stabilisation de la connexion Neon
- Création de l'interface admin
- Implémentation de l'isolation des données
- Correction du workflow d'ateliers

### 📊 Métriques Actuelles
- Pages frontend : 8 pages principales
- Routes API : 15+ endpoints
- Composants UI : 35+ composants
- Services backend : 5 services principaux

## Questions ?

Pour toute question, ouvrez une discussion ou contacte