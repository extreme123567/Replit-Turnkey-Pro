# ServicePro - Business Management Platform

## Overview

ServicePro is a comprehensive business management platform designed for professional service companies. The application provides core functionality for managing clients, staff, scheduling, messaging, payroll, and invoicing in a unified system. Built as a full-stack web application, it features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and a modern component-based UI built with shadcn/ui and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool and development server
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom ServicePro design tokens and CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **API Design**: RESTful API structure with dedicated routes for each resource (clients, staff, jobs, etc.)
- **Validation**: Shared Zod schemas between frontend and backend for consistent data validation
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Data Models**: Strongly typed schemas with relationships between clients, staff, jobs, time entries, invoices, and messages

### Component Architecture
- **Layout System**: App layout with sidebar navigation and header components
- **Form Components**: Reusable form components for each entity (ClientForm, StaffForm, JobForm, etc.)
- **UI Components**: Comprehensive set of accessible UI components from shadcn/ui including tables, dialogs, cards, and form controls
- **Page Components**: Feature-specific pages for dashboard, scheduling, clients, staff, messaging, payroll, and invoices

### Development and Build
- **Development**: Vite dev server with hot module replacement and TypeScript checking
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Comprehensive TypeScript coverage across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared schemas and clear separation between client and server code

## External Dependencies

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL connection for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible, unstyled UI primitives for components
- **tailwindcss**: Utility-first CSS framework for responsive design and styling
- **class-variance-authority**: For creating consistent component variants
- **clsx**: Utility for constructing className strings conditionally

### State Management and Data Fetching
- **@tanstack/react-query**: Powerful data synchronization and server state management
- **@hookform/resolvers**: Validation resolvers for React Hook Form integration with Zod

### Form Handling and Validation
- **react-hook-form**: Performant forms with easy validation and minimal re-renders
- **zod**: TypeScript-first schema declaration and validation library

### Date and Time Management
- **date-fns**: Modern JavaScript date utility library for date manipulation and formatting

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for better debugging experience
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment integration

### Additional Utilities
- **cmdk**: Command palette component for enhanced user interactions
- **embla-carousel-react**: Carousel component for content navigation
- **lucide-react**: Icon library with consistent design and wide variety of icons