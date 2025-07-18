# Documentation Infrastructure des Ateliers

## Vue d'ensemble

Le système d'ateliers Nalabo supporte deux types d'infrastructure pour l'exécution des environnements d'apprentissage :

- **Kubernetes** avec vCluster pour l'isolation complète
- **Docker** pour des environnements légers et rapides

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workshop Orchestrator                    │
├─────────────────────────────────────────────────────────────┤
│                Infrastructure Factory                       │
├─────────────────────┬───────────────────────────────────────┤
│  Kubernetes Service │           Docker Service             │
│  (vCluster)         │           (Containers)               │
└─────────────────────┴───────────────────────────────────────┘
```

## Types d'Infrastructure

### 1. Kubernetes (vCluster)

**Avantages :**
- Isolation complète des environnements
- Support natif pour les workloads Kubernetes
- Gestion avancée des ressources et du réseau
- Scalabilité horizontale

**Cas d'usage :**
- Ateliers Kubernetes avancés
- Formations DevOps complexes
- Environnements multi-services
- Simulations de production

**Configuration :**
```typescript
const kubernetesConfig = {
  type: 'kubernetes',
  name: 'production-k8s',
  endpoint: process.env.KUBECONFIG,
  namespace: 'nalabo',
  context: 'production',
};
```

### 2. Docker

**Avantages :**
- Démarrage rapide des environnements
- Consommation de ressources réduite
- Simplicité de configuration
- Support Docker-in-Docker

**Cas d'usage :**
- Ateliers Docker et containerisation
- Développement d'applications
- Formations de base
- Prototypage rapide

**Configuration :**
```typescript
const dockerConfig = {
  type: 'docker',
  name: 'local-docker',
  dockerHost: 'unix:///var/run/docker.sock',
  dockerNetwork: 'nalabo-network',
};
```

## Configuration des Environnements

### Variables d'Environnement

```bash
# Configuration Kubernetes
KUBECONFIG=/path/to/kubeconfig
K8S_NAMESPACE=nalabo
K8S_CONTEXT=production
K8S_ENDPOINT=https://k8s-api.example.com
K8S_TOKEN=your-service-account-token

# Configuration Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_NETWORK=nalabo-network
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password
```

### Templates d'Ateliers

#### Template Kubernetes
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: workshop
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-demo
  namespace: workshop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-demo
  template:
    metadata:
      labels:
        app: nginx-demo
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

#### Template Docker Compose
```yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  
  app:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./app:/app
    command: npm start
    depends_on:
      - web
```

## API Endpoints

### Sessions d'Ateliers

```http
POST /api/workshops/sessions
Content-Type: application/json

{
  "workshopId": "123",
  "infrastructureType": "kubernetes", // ou "docker"
  "duration": 240,
  "resources": {
    "cpu": "2000m",
    "memory": "4Gi",
    "storage": "20Gi"
  }
}
```

### Exécution de Commandes

```http
POST /api/workshops/sessions/{sessionId}/execute
Content-Type: application/json

{
  "command": "kubectl get pods",
  "timeout": 30000
}
```

### Application de Configurations

```http
POST /api/workshops/sessions/{sessionId}/apply
Content-Type: application/json

{
  "configuration": "apiVersion: v1\nkind: Pod\n...",
  "type": "yaml" // ou "dockerfile", "compose"
}
```

## Gestion des Ressources

### Kubernetes (vCluster)

**Ressources par défaut :**
- CPU: 2000m (2 cores)
- Mémoire: 4Gi
- Stockage: 20Gi
- Durée: 4 heures

**Isolation :**
- Namespace dédié par session
- vCluster isolé avec sa propre API
- RBAC configuré pour l'utilisateur
- Réseau isolé

### Docker

**Ressources par défaut :**
- CPU: 1000m (1 core)
- Mémoire: 2Gi
- Stockage: 10Gi
- Durée: 4 heures

**Isolation :**
- Conteneur dédié par session
- Réseau Docker isolé
- Volumes temporaires
- Limitations de ressources

## Sécurité

### Kubernetes
- RBAC strict par namespace
- Network Policies pour l'isolation réseau
- Pod Security Standards
- Secrets management intégré

### Docker
- Conteneurs non-privilégiés par défaut
- Isolation des volumes
- Limitations de ressources
- Réseau isolé par session

## Monitoring et Observabilité

### Métriques Collectées
- Utilisation CPU/Mémoire
- Trafic réseau
- Durée des sessions
- Taux de réussite des validations
- Erreurs et exceptions

### Health Checks
- Connectivité aux APIs
- État des environnements
- Disponibilité des ressources
- Performance des commandes

## Déploiement

### Prérequis Kubernetes
```bash
# Installation vCluster CLI
curl -L -o vcluster "https://github.com/loft-sh/vcluster/releases/latest/download/vcluster-linux-amd64"
chmod +x vcluster
sudo mv vcluster /usr/local/bin

# Configuration kubectl
kubectl config current-context
kubectl auth can-i create namespaces
```

### Prérequis Docker
```bash
# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Configuration Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Troubleshooting

### Problèmes Courants

#### Kubernetes
- **vCluster ne démarre pas** : Vérifier les permissions RBAC
- **Timeout de création** : Augmenter les timeouts dans la configuration
- **Problèmes réseau** : Vérifier les Network Policies

#### Docker
- **Conteneur ne démarre pas** : Vérifier les logs avec `docker logs`
- **Problèmes de permissions** : Vérifier les volumes et les utilisateurs
- **Réseau inaccessible** : Vérifier la configuration du réseau Docker

### Logs et Debugging

```bash
# Logs Kubernetes
kubectl logs -n nalabo-session-xxx vcluster-xxx

# Logs Docker
docker logs nalabo-session-xxx

# Monitoring des ressources
kubectl top pods -n nalabo-session-xxx
docker stats nalabo-session-xxx
```

## Bonnes Pratiques

### Performance
- Utiliser Docker pour les ateliers simples
- Réserver Kubernetes pour les cas complexes
- Implémenter le cleanup automatique
- Monitorer l'utilisation des ressources

### Sécurité
- Limiter les permissions au minimum nécessaire
- Utiliser des images de base sécurisées
- Implémenter des timeouts appropriés
- Auditer les accès et les actions

### Maintenance
- Nettoyer régulièrement les environnements expirés
- Surveiller les métriques de performance
- Mettre à jour les images de base
- Sauvegarder les configurations importantes

## Évolution Future

### Roadmap
- Support pour d'autres orchestrateurs (Nomad, Swarm)
- Intégration avec les clouds publics (EKS, AKS, GKE)
- Support GPU pour les workloads IA/ML
- Environnements persistants pour les projets longs
- Intégration avec les registries privés