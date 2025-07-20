# Documentation Nalabo

Nalabo est une plateforme française cloud-native pour l'apprentissage technologique par la pratique.

## 📚 Documentation Essentielle

### Pour les Développeurs
- [**DEVELOPMENT.md**](DEVELOPMENT.md) - Guide de développement et configuration
- [**ARCHITECTURE.md**](ARCHITECTURE.md) - Architecture technique du projet
- [**API/**](API/) - Documentation des endpoints API

### Business & Produit
- [**PRD_NALABO.md**](PRD_NALABO.md) - Product Requirements Document complet

## 🚀 Démarrage Rapide

```bash
# Installation
pnpm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Lancement
pnpm dev
```

## 📊 État Actuel (Décembre 2024)

### ✅ Opérationnel
- Authentification utilisateur
- Interface React moderne
- Base de données PostgreSQL
- Dashboard utilisateur
- Système de rôles

### 🔧 En Développement
- Interface admin complète
- Workflow d'ateliers end-to-end
- Infrastructure Kubernetes stable
- Marketplace d'ateliers

## 🔐 Sécurité

- **Authentification** : Sessions sécurisées avec bcrypt
- **Isolation** : Données utilisateur strictement séparées  
- **Permissions** : Contrôle d'accès basé sur les rôles
- **Audit** : Logs complets des actions administratives
- **Conformité RGPD** : Protection données personnelles
- **Super Admin** : Droits étendus avec responsabilités légales

### Super Administrateur
Le Super Admin Nalabo dispose des **droits maximaux** avec des **responsabilités critiques** :
- 🏗️ **Infrastructure** : Gestion complète clusters Kubernetes
- 👥 **Utilisateurs** : Conformité RGPD, export/suppression données
- 💰 **Facturation** : Gestion abonnements et remboursements  
- 🔍 **Audit** : Accès logs complets et monitoring sécurité
- ⚖️ **Légal** : Traitement demandes autorités, conformité réglementaire

📋 **Documentation détaillée** : [Super Admin Permissions](./SUPER_ADMIN_PERMISSIONS.md)

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

---
*Dernière mise à jour : 18 décembre 2024*