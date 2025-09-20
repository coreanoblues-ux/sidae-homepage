# Overview

This is a full-stack academy website built for "시대영재 학원" (Sidae Young Jae Academy), featuring a sophisticated role-based learning management system specialized in middle and high school entrance exam English education. The application provides a polished American tech company aesthetic with minimal design, clean typography, and smooth animations. It supports multi-tier user authentication (guest, pending, verified, admin) with time-controlled video access and comprehensive admin management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **Theme**: Dark navy (#0B1220), focus blue (#2563EB), warm ivory background (#F8FAFC)
- **Typography**: Inter + Pretendard font combination for English/Korean text
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite with custom configuration for Replit environment

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect (OIDC) integration with Passport.js
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with role-based access control

## Database Schema
- **Users**: Role-based system (PENDING, VERIFIED, ADMIN) with profile information
- **Courses**: Structured course content with ordering and metadata
- **Videos**: Individual video content with external URL links and access controls
- **Video Access**: Time-based access control with start/end dates
- **Approvals**: Admin approval workflow for user verification
- **Notices**: Site-wide announcements with scheduling capabilities
- **Sessions**: Secure session storage for authentication state

## Role-Based Access Control
- **Guest**: Public page access, registration capability
- **Pending**: Limited access awaiting admin approval
- **Verified**: Full course access within permitted timeframes
- **Admin**: Complete system management and user approval powers

## Video Access System
- Time-controlled video availability with admin-configurable access windows
- External video hosting support (NAS/cloud storage links)
- Role-based viewing permissions with detailed access tracking
- Admin override capabilities for individual user access

## Development Environment
- **Replit Integration**: Custom Vite plugins for development experience
- **Hot Reload**: Full-stack development with automatic reloading
- **Environment Variables**: Secure configuration for database and authentication
- **TypeScript**: Full type safety across frontend, backend, and shared schemas

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript, Vite
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS for processing
- **Routing**: Wouter for lightweight client-side routing

## Backend Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **ORM**: Drizzle ORM with Drizzle Kit for migrations and schema management
- **Authentication**: Replit OIDC with openid-client and Passport.js
- **Session Storage**: connect-pg-simple for PostgreSQL session persistence

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production bundling
- **Database Management**: Drizzle Kit for schema migrations and database pushes
- **Replit Platform**: Custom plugins for development environment integration

## UI and UX Libraries
- **Form Handling**: React Hook Form with Zod validation and resolvers
- **Data Fetching**: TanStack React Query for server state management
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Date Handling**: date-fns for date manipulation and formatting

## Utility Libraries
- **Styling Utilities**: clsx and tailwind-merge for conditional classes
- **Validation**: Zod for runtime type checking and schema validation
- **Session Management**: Express session with secure cookie configuration
- **Performance**: Memoizee for function memoization and caching