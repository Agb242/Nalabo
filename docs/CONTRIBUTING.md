
# Guide de Contribution Nalabo

## Processus de Contribution

1. **Fork** le dépôt
2. **Branche** : `git checkout -b feature/nom-fonctionnalite`
3. **Développement** avec tests
4. **Commit** : [Conventional Commits](https://www.conventionalcommits.org/)
5. **Push** : `git push origin feature/nom-fonctionnalite`
6. **Pull Request** vers `main`

## Types de Commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage code
refactor: refactoring
test: ajout de tests
chore: maintenance
```

## Standards de Code

### TypeScript
- Types stricts activés
- Pas de `any` sauf exception justifiée
- Interfaces préférées aux types

### React
- Composants fonctionnels avec hooks
- Props typées avec interfaces
- Déstructuration recommandée

### Backend
- Validation des entrées avec Zod
- Gestion d'erreurs centralisée
- Logs structurés

## Tests

```bash
# Lancer tous les tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Couverture
pnpm test:coverage
```

### Couverture Minimale
- Nouvelles fonctionnalités : 80%
- Corrections de bugs : Tests de régression

## Revue de Code

### Checklist PR
- [ ] Tests passent
- [ ] Code linté
- [ ] Documentation mise à jour
- [ ] Types TypeScript corrects
- [ ] Pas de console.log oubliés

### Critères d'Acceptation
- Au moins 1 approbation
- Tests CI passent
- Conflicts résolus
- Documentation à jour

## Issues

### Template Bug
```
**Description**
Description claire du problème

**Reproduction**
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Attendu vs Réel**
- Attendu : ...
- Réel : ...

**Environnement**
- OS : [ex: macOS]
- Navigateur : [ex: Chrome 120]
- Version Node : [ex: 20.10]
```

### Template Feature
```
**Fonctionnalité**
Description de la fonctionnalité

**Motivation**
Pourquoi cette fonctionnalité est nécessaire

**Solution Proposée**
Comment implémenter cette fonctionnalité

**Alternatives**
Autres solutions considérées
```

## Priorités Actuelles

### 🔴 Critique
1. Interface admin fonctionnelle
2. Workflow ateliers end-to-end
3. Infrastructure Docker stable

### 🟡 Important
1. Tests d'intégration
2. Documentation API
3. Monitoring erreurs

---
*Questions ? Ouvrir une discussion GitHub*
