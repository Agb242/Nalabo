# Guide de Contribution

Merci de votre intérêt pour le projet Nalabo ! Ce document explique comment contribuer au projet de manière efficace.

## Avant de Commencer

1. Vérifiez les [issues](https://github.com/your-org/Nalabo/issues) existantes pour éviter les doublons
2. Pour les nouvelles fonctionnalités, ouvrez d'abord une issue pour discuter des changements proposés
3. Assurez-vous d'avoir lu le [code de conduite](CODE_OF_CONDUCT.md)

## Processus de Contribution

1. **Fork** le dépôt
2. Créez une **branche** pour votre fonctionnalité :
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```
3. **Commitez** vos changements :
   ```bash
   git commit -m "feat: ajouter une nouvelle fonctionnalité"
   ```
4. **Poussez** vers votre fork :
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```
5. Créez une **Pull Request**

## Conventions de Code

### Messages de Commit

Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(portée): description

[corps optionnel]

[pied de page optionnel]
```

Types de commit :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Mise en forme, point-virgule manquant, etc.
- `refactor` : Refactoring du code
- `test` : Ajout de tests
- `chore` : Mise à jour des tâches de construction, gestionnaire de paquets, etc.

### Style de Code

- Suivez le [guide de style Airbnb](https://github.com/airbnb/javascript)
- Utilisez Prettier pour le formatage du code
- Maintenez une couverture de test élevée
- Documentez les nouvelles fonctionnalités

## Tests

- Écrivez des tests unitaires pour le nouveau code
- Exécutez tous les tests avant de soumettre une PR
- Assurez-vous que les tests passent sur toutes les plateformes supportées

## Revue de Code

- Les PR doivent être revues par au moins un mainteneur
- Les commentaires de revue doivent être constructifs et respectueux
- Répondez aux commentaires de revue et effectuez les modifications demandées

## Signalement de Problèmes

Utilisez le template d'issue fourni et incluez :
- Description claire du problème
- Étapes pour reproduire
- Comportement attendu vs. réel
- Captures d'écran si applicable
- Version de l'application/navigateur/système d'exploitation

## Questions ?

Pour toute question, ouvrez une discussion ou contactez les mainteneurs via les issues.
