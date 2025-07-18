# Nalabo - Plateforme Cloud-Native de Workshops Tech

## Overview

Nalabo is a French cloud-native platform designed for immersive tech workshops, positioned as an alternative to Educates.dev. The platform focuses on multi-technology support including AI/ML, Cloud (AWS/Azure/GCP), DevOps, Data Science, and Cybersecurity, with a modular architecture and containerized environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-01-18 - Migration to Replit + Master Workshop Page
- ✓ Migrated project from Replit Agent to Replit environment
- ✓ Set up PostgreSQL database with proper connection
- ✓ Created comprehensive .env configuration
- ✓ Applied database schema migrations successfully
- ✓ Created workshop master page with advanced Kubernetes tools
- ✓ Removed Docker infrastructure, keeping only Kubernetes for robustness
- ✓ Implemented resizable panels for optimal workspace layout
- ✓ Added comprehensive Kubernetes toolset (pods, services, deployments, etc.)
- ✓ Integrated real-time terminal for kubectl commands
- ✓ Added monitoring panel for cluster resources

### 2024-12-18 - Audit Complet et Plan de Correction

#### Problèmes Critiques Identifiés
- ❌ Interface admin backoffice manquante (UI inexistante)
- ❌ Isolation des données utilisateur incomplète (problème sécurité)
- ❌ Workflow d'ateliers cassé (création/exécution déconnectées)
- ❌ Connexion base de données instable (erreurs Neon fréquentes)

#### Plan de Correction Prioritaire
1. **Stabiliser la base de données** (critique pour tout le reste)
2. **Créer interface admin** (pour gérer les infrastructures K8s)
3. **Implémenter isolation des données** (sécurité utilisateur)
4. **Corriger workflow d'ateliers** (fonctionnalité principale)

### 2024-01-13 - Phase 1 Authentication System Complete
- ✓ Complete authentication system with registration, login, and session management
- ✓ User profile management with editing capabilities
- ✓ Password hashing with bcrypt and secure session storage
- ✓ Role-based access control for admin and user roles
- ✓ Advanced workshop builder with step-by-step creation
- ✓ Protected routes and authentication middleware
- ✓ User dashboard with stats and badge system
- ✓ Complete database schema with users, workshops, challenges, certifications, and communities
- ✓ Modern React frontend with French interface and dark mode support
- ✓ Professional logo with geometric icon inspired by Deloitte
- ✓ Orange and blue color scheme implementation

## Next Steps Required

### Phase 1: Core Authentication & User Management
1. **Authentication System**
   - User registration and login system
   - Session management with Express sessions
   - Password hashing with bcrypt
   - Role-based access control

2. **User Profile Management**
   - Profile creation and editing
   - Avatar upload functionality
   - Points and achievement system
   - User dashboard with personal stats

### Phase 2: Workshop System Enhancement
1. **Workshop Builder Advanced Features**
   - Save workshop functionality
   - Workshop preview system
   - Step validation and testing
   - Environment configuration UI

2. **Workshop Execution Environment**
   - Docker container orchestration
   - Real-time terminal access
   - Code execution environment
   - Progress tracking and validation

### Phase 3: Community & Gamification
1. **Community Features**
   - Community creation and management
   - Private workspace for organizations
   - Discussion forums and chat
   - Event calendar and webinars

2. **Gamification System**
   - Points and badges system
   - Leaderboards and rankings
   - Achievement unlocks
   - Certification generation

### Phase 4: Advanced Features
1. **AI Integration**
   - Workshop content generation
   - Personalized learning paths
   - Code review and suggestions
   - Automated grading system

2. **Analytics & Monitoring**
   - Resource usage tracking
   - User behavior analytics
   - Performance metrics
   - Cost optimization insights

### Phase 5: Marketplace & Monetization
1. **Workshop Marketplace**
   - Public/private workshop sharing
   - Rating and review system
   - Premium content monetization
   - Quality assurance process

2. **Integration Ecosystem**
   - Cloud provider integrations (AWS, Azure, GCP)
   - GitHub/GitLab integration
   - CI/CD pipeline connections
   - Third-party tool integrations

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, Zustand for local state (if needed)
- **UI Components**: Radix UI primitives with shadcn/ui components and Tailwind CSS for styling
- **Theme**: Dark/light mode support with CSS variables
- **Language**: French-first interface with multilingue support

### Backend Architecture
- **Runtime**: Node.js with Express.js and TypeScript
- **Module System**: ES Modules (ESM) for modern JavaScript
- **API Design**: RESTful API with structured routing
- **Validation**: Zod for schema validation and type safety
- **Error Handling**: Centralized error handling middleware

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### User Management
- User registration and authentication
- Role-based access control (user, admin, moderator)
- User profiles with avatars and points system
- Community-based gamification

### Workshop System
- Workshop creation and management
- Step-by-step workshop structure stored as JSON
- Multiple difficulty levels (beginner, intermediate, advanced, expert)
- Category-based organization (docker, kubernetes, ai-ml, etc.)
- Public/private workshop visibility

### Challenge System
- Time-based coding challenges
- Community participation tracking
- Leaderboard and ranking system
- Challenge categories and difficulty levels

### Session Management
- Workshop session tracking
- Progress monitoring
- Completion statistics
- Time tracking for workshops

## Data Flow

1. **Client Requests**: React components make API calls using TanStack React Query
2. **API Layer**: Express.js routes handle requests with Zod validation
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response**: Structured JSON responses with proper error handling
5. **State Updates**: React Query manages cache invalidation and updates

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based connection with connection pooling

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production
- **TypeScript**: Static type checking
- **Replit Integration**: Development environment support

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless database with development credentials
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build process generates optimized static assets
- **Backend**: ESBuild bundles server code for Node.js runtime
- **Assets**: Static files served from dist/public directory
- **Database**: Production Neon database with migration support

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **Build Scripts**: Separate commands for development, build, and production
- **Database Migration**: Drizzle Kit handles schema changes

The architecture supports a scalable, type-safe, and maintainable platform that can grow with the French tech education community while maintaining high performance and developer experience.