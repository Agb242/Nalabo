# Gestion des Erreurs

## Format des Réponses d'Erreur

Toutes les erreurs renvoyées par l'API suivent le format standard suivant :

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

## Codes d'Erreur

### Erreurs d'Authentification (AUTH_*)
- `AUTH_REQUIRED` : Authentification requise
- `INVALID_CREDENTIALS` : Identifiants invalides
- `TOKEN_EXPIRED` : Token expiré
- `INSUFFICIENT_PERMISSIONS` : Droits insuffisants

### Erreurs de Validation (VALIDATION_*)
- `VALIDATION_ERROR` : Erreur de validation des données
- `INVALID_EMAIL` : Format d'email invalide
- `PASSWORD_TOO_WEAK` : Mot de passe trop faible

### Erreurs de Base de Données (DB_*)
- `DB_CONNECTION_ERROR` : Erreur de connexion à la base de données
- `DB_QUERY_ERROR` : Erreur lors de l'exécution d'une requête
- `DB_RECORD_NOT_FOUND` : Enregistrement non trouvé

### Erreurs de Ressources (RESOURCE_*)
- `RESOURCE_NOT_FOUND` : Ressource non trouvée
- `RESOURCE_EXISTS` : La ressource existe déjà
- `RESOURCE_CONFLICT` : Conflit de ressource

## Structure des Dossiers d'Issues

Chaque issue documentée suit la structure suivante :

```
/issues
  /001-nom-de-l-issue
    README.md       # Description du problème et contexte
    solution.md     # Solution mise en place
    screenshots/    # Captures d'écran si nécessaire
    scripts/        # Scripts de correction
```

### Convention de Nommage des Dossiers d'Issues
- Format : `{numéro-à-trois-chiffres}-nom-descriptif`
- Exemple : `001-database-connection`
- Numérotation séquentielle à trois chiffres
- Noms en minuscules avec des tirets

## Journalisation des Erreurs

Les erreurs sont journalisées avec les informations suivantes :
- Horodatage
- Niveau de sévérité (error, warn, info, debug)
- Code d'erreur
- Message descriptif
- Pile d'appel (stack trace)
- Contexte utilisateur (si disponible)
- Données de requête pertinentes
