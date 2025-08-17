# ServicePro - Business Management Platform

## Overview

ServicePro is a comprehensive property management platform designed for professional service companies, providing role-based functionality for property managers, office staff, technicians, and inspectors. It offers specialized dashboards and access controls. The platform supports comprehensive property management, including photo documentation, communication, quote requests, schedule management, real-time job status tracking, and enhanced work coordination. It also features a critical role-based job assignment workflow where only office staff can assign jobs. Financial features include property revenue tracking, automated technician payouts, and a general dashboard with bi-weekly financial resets and profit analysis. ServicePro also implements a photo-based callback resolution system and geofencing for location verification during inspections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- Modern component-based UI built with shadcn/ui and Tailwind CSS.
- Visual status tracking for photo documentation.
- Visual weekly schedule overview.
- Color-coded profitability indicators for financial analysis.
- Role-based dashboards tailored for Property Managers, Office Staff, Technicians, and Inspectors.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for state management, shadcn/ui for UI components, React Hook Form with Zod for forms, and Tailwind CSS for styling.
- **Backend**: Node.js with Express.js, TypeScript with ESM modules, RESTful API design, shared Zod schemas for validation, and centralized error handling.
- **Data Storage**: PostgreSQL with Drizzle ORM for type-safe operations, Drizzle Kit for migrations, and Neon Database for cloud hosting.
- **Component Architecture**: Reusable form and UI components, feature-specific pages, and a layout system with sidebar navigation and headers.
- **Development**: Vite dev server, esbuild for backend compilation, comprehensive TypeScript coverage, and a monorepo structure.

### Feature Specifications
- **Role-Based Access Control**: Comprehensive permission system with route-level restrictions based on user roles (Property Manager, Office Staff, Technician, Inspector, Admin).
- **Property Manager Dashboard**: Features include job scheduling (eight job types), real-time elapsed time tracking, phase-by-phase progress, approval workflows for extra dirty units and drywall repairs, photo requirements tracking, multi-job booking, weekly schedule overview, photo documentation (before/progress/completion), direct messaging, and quote request system.
- **Office Staff Role**: Exclusive authority to assign jobs to technicians.
- **Technician Role**: Work order execution, daily scheduling, time tracking, mobile-friendly interface, callback resolution with photo uploads and automatic notifications.
- **Inspector Role**: Property inspections, compliance tracking, report generation, quality assurance, remote photo verification for callbacks, and geofenced unit timer system (within 100 meters).
- **Automated Payout System**: Size-based pricing for paint and cleaning jobs, real-time payout tracking.
- **General Dashboard**: Tracks scheduled jobs, active jobs, completed jobs, revenue billed, and total payouts with bi-weekly financial resets and profit analysis.
- **Data Models**: Extended models for Users, Inspections, Work Orders, Properties, Tenants, User Permissions, and Audit Logs.

### System Design Choices
- Full-stack web application with React frontend and Node.js/Express backend.
- PostgreSQL for data persistence.
- Component-based UI for modularity and reusability.
- Shared Zod schemas for consistent data validation across frontend and backend.
- Monorepo structure for code organization.

## External Dependencies

### Database and ORM
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-zod`

### UI and Styling
- `@radix-ui/react-*`
- `tailwindcss`
- `class-variance-authority`
- `clsx`

### State Management and Data Fetching
- `@tanstack/react-query`
- `@hookform/resolvers`

### Form Handling and Validation
- `react-hook-form`
- `zod`

### Date and Time Management
- `date-fns`

### Development Tools
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer`

### Additional Utilities
- `cmdk`
- `embla-carousel-react`
- `lucide-react`