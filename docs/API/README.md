
# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentification

### POST /auth/register
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

### POST /auth/login
```json
{
  "email": "string",
  "password": "string"
}
```

### GET /auth/me
Retourne l'utilisateur connecté.

### POST /auth/logout
Déconnecte l'utilisateur.

## Workshops

### GET /workshops
Liste les ateliers de l'utilisateur connecté.

### POST /workshops
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "beginner|intermediate|advanced",
  "duration": "number",
  "steps": []
}
```

### GET /workshops/:id
Récupère un atelier spécifique.

### PUT /workshops/:id
Met à jour un atelier.

### DELETE /workshops/:id
Supprime un atelier.

## Challenges

### GET /challenges/active
Liste les défis actifs.

### GET /leaderboard
Classement des utilisateurs.

## Réponses API

### Succès
```json
{
  "success": true,
  "data": {}
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description de l'erreur"
  }
}
```

## Codes d'Erreur

- `NOT_AUTHENTICATED` (401) - Non authentifié
- `FORBIDDEN` (403) - Accès refusé
- `NOT_FOUND` (404) - Ressource non trouvée
- `VALIDATION_ERROR` (400) - Données invalides
- `INTERNAL_ERROR` (500) - Erreur serveur
