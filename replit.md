# Nalabo - Plateforme Cloud-Native de Workshops Tech

## Overview

Nalabo is a French cloud-native platform designed for immersive tech workshops, positioned as an alternative to Educates.dev. The platform focuses on multi-technology support including AI/ML, Cloud (AWS/Azure/GCP), DevOps, Data Science, and Cybersecurity, with a modular architecture and containerized environments.

## User Preferences

Preferred communication style: Simple, everyday language.

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