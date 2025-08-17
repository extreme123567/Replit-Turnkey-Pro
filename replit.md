# ServicePro - Business Management Platform

## Overview

ServicePro is a comprehensive property management platform designed for professional service companies, providing role-based functionality for administrators, office staff, property managers, technicians, and inspectors. It offers specialized dashboards with hierarchical access controls where Admin has complete oversight including exclusive financial access, Office Staff handles operational functions without financial permissions, and Property Managers have view/request-only access. The platform supports comprehensive property management, including photo documentation, communication, quote requests, schedule management, real-time job status tracking, and enhanced work coordination. It also features a critical role-based job assignment workflow where only office staff can assign jobs. Financial features include work-based revenue tracking (not rental income), automated technician payouts, and comprehensive financial oversight exclusively available to Admin users. ServicePro also implements a photo-based callback resolution system and geofencing for location verification during inspections.

## User Preferences

- Preferred communication style: Simple, everyday language
- Dashboard preference: Direct role-based routing without general dashboard (implemented August 2025)
- Authentication method: Email-based login system (reverted from phone number August 2025)

## System Architecture

### UI/UX Decisions
- Modern component-based UI built with shadcn/ui and Tailwind CSS.
- Visual status tracking for photo documentation.
- Visual weekly schedule overview.
- Color-coded profitability indicators for financial analysis.
- Role-based dashboards tailored for Property Managers, Office Staff, Technicians, and Inspectors.
- Direct role selection interface - no general dashboard (users go straight to role-specific dashboards).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for state management, shadcn/ui for UI components, React Hook Form with Zod for forms, and Tailwind CSS for styling.
- **Backend**: Node.js with Express.js, TypeScript with ESM modules, RESTful API design, shared Zod schemas for validation, and centralized error handling.
- **Data Storage**: PostgreSQL with Drizzle ORM for type-safe operations, Drizzle Kit for migrations, and Neon Database for cloud hosting.
- **Component Architecture**: Reusable form and UI components, feature-specific pages, and a layout system with sidebar navigation and headers.
- **Development**: Vite dev server, esbuild for backend compilation, comprehensive TypeScript coverage, and a monorepo structure.

### Feature Specifications
- **Authentication System**: Email-based login with JWT tokens, bcrypt password hashing, and role-based access control. Supports individual user accounts with secure session management.
- **Role-Based Access Control**: Hierarchical permission system with route-level restrictions: Admin (complete oversight + exclusive financial access) > Office Staff (operational functions only) > Property Manager (view/request only) > Technician/Inspector (execution roles).
- **Admin Dashboard**: Complete business oversight with exclusive financial access including total revenue, payouts, net profit, property performance analysis, staff management, operations monitoring, business reports, and system settings.
- **Office Staff Dashboard**: Operational management including property portfolio (work-based revenue tracking), job assignments, staff coordination, and scheduling - financial access removed and moved to Admin only.
- **Property Manager Dashboard**: View-only access for job monitoring, photo requirements tracking, progress oversight, and communication - no assignment authority.
- **Technician Role**: Work order execution, daily scheduling, time tracking, mobile-friendly interface, callback resolution with photo uploads and automatic notifications.
- **Inspector Role**: Property inspections, compliance tracking, report generation, quality assurance, remote photo verification for callbacks, and geofenced unit timer system (within 100 meters).
- **Work-Based Revenue Tracking**: Year-to-date revenue based on actual work completed per property (not rental income), job completion metrics, and average job values.
- **Automated Payout System**: Size-based pricing for paint and cleaning jobs, real-time payout tracking accessible only to Admin.
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