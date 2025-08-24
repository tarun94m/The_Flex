# Flex Living Reviews Dashboard

## Overview

This is a React-based property management dashboard application built specifically for managing guest reviews from Hostaway. The system provides property managers with a centralized interface to view, filter, and moderate guest reviews across multiple properties. The application features real-time data synchronization with Hostaway's API, comprehensive analytics through charts and KPIs, and an approval workflow for review moderation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Charts**: Recharts for data visualization and analytics

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request/response logging
- **Development Setup**: Vite middleware integration for hot module replacement during development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development and testing

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Model**: Basic username/password authentication system
- **Authorization**: Role-based access control for review approval workflows

### External Dependencies

#### Third-party Services
- **Hostaway API**: Property management platform integration for fetching guest reviews
- **Neon Database**: Serverless PostgreSQL hosting platform

#### Key Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **drizzle-orm**: Type-safe ORM for database operations
- **recharts**: Charting library for analytics dashboard
- **axios**: HTTP client for API requests
- **wouter**: Lightweight routing library
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities

#### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

The application follows a clean separation of concerns with shared types and schemas between client and server, comprehensive error handling, and a responsive design system optimized for property management workflows.