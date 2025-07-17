# Gestion des Issues

Ce document décrit la procédure à suivre pour gérer les issues dans le projet Nalabo.

## Structure d'une Issue

Chaque issue doit suivre ce format :

```markdown
## Description
[Description claire et concise du problème ou de la fonctionnalité]

## Objectifs
- [ ] Objectif 1
- [ ] Objectif 2
- [ ] ...

## Critères d'acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] ...

## Informations complémentaires
- **Priorité** : [Haute/Moyenne/Basse]
- **Type** : [Bug/Amélioration/Nouvelle fonctionnalité/Documentation]
- **Système d'exploitation** : [si applicable]
- **Navigateur** : [si applicable]
```

## Étiquettes (Labels)

Utilisez les étiquettes suivantes pour catégoriser les issues :

- **bug** : Problème à corriger
- **enhancement** : Amélioration de fonctionnalité existante
- **feature** : Nouvelle fonctionnalité
- **documentation** : Amélioration ou ajout de documentation
- **help wanted** : Demande d'aide
- **question** : Question nécessitant des éclaircissements
- **wontfix** : Ne sera pas corrigé
- **duplicate** : Problème en double
- **good first issue** : Bon point de départ pour les nouveaux contributeurs

## Workflow des Issues

1. **Création**
   - Vérifier que l'issue n'existe pas déjà
   - Utiliser le template approprié
   - Ajouter les labels pertinents
   - Assigner la priorité

2. **En cours**
   - Assigner un responsable
   - Mettre à jour le statut (ex: "en cours")
   - Créer une branche avec la référence de l'issue (ex: `fix/123-description-courte`)

3. **Révision**
   - Créer une Pull Request liée à l'issue
   - Ajouter des reviewers
   - Mettre à jour la description de l'issue avec les détails de la PR

4. **Fermeture**
   - Vérifier que tous les critères d'acceptation sont remplis
   - Fermer l'issue avec le numéro de commit ou de PR
   - Ajouter des notes de version si nécessaire

## Bonnes Pratiques

- Une issue = un problème/une fonctionnalité
- Être précis dans la description
- Utiliser des captures d'écran quand c'est pertinent
- Référencer les issues liées avec #numéro
- Mettre à jour régulièrement le statut de l'issue

## Modèle de Pull Request

```markdown
## Description
[Description des changements apportés]

## Type de changement
- [ ] Correction de bug
- [ ] Nouvelle fonctionnalité
- [ ] Documentation
- [ ] Autre (précisez)

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué des tests
- [ ] La documentation a été mise à jour si nécessaire
- [ ] Les tests passent avec succès

## Issues liées
Fixes #numéro
```
