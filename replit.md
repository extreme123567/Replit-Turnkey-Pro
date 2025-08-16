# ServicePro - Business Management Platform

## Overview

ServicePro is a comprehensive property management platform designed for professional service companies. The application provides role-based functionality for property managers, office staff, technicians, and inspectors with specialized dashboards and access controls. Built as a full-stack web application, it features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and a modern component-based UI built with shadcn/ui and Tailwind CSS.

## Recent Changes (August 2025)

### General Dashboard with Bi-Weekly Financial Reset (Latest)
- **Comprehensive Metrics Tracking**: Real-time monitoring of scheduled jobs, active jobs, jobs completed & inspected, revenue billed, and total payout
- **Bi-Weekly Reset Cycles**: Automatic financial period management that resets every 2 weeks with countdown timer showing days remaining
- **Profit Analysis**: Real-time net profit calculation with color-coded profitability indicators (green ≥30%, yellow ≥15%, red <15%)
- **Financial Accountability**: Live tracking of revenue vs. payout with per-day averages and margin calculations
- **Period Management**: Automated creation of new financial periods with complete audit trail of business performance

### Photo-Based Callback Resolution System
- **Efficient Callback Workflow**: When inspections fail, technicians receive callback notifications and can fix issues without requiring inspector return visits
- **Photo Upload System**: Technicians upload before/after photos of completed callback work with detailed resolution notes
- **Remote Verification**: Inspectors review photos remotely and approve/reject work without physical site visits
- **Automated Notifications**: Complete messaging workflow - technician completes work → photos uploaded → inspector and office automatically notified
- **Time Tracking**: Full accountability with time tracking for callback resolution work
- **Status Management**: Complete audit trail from callback creation to photo verification to final approval

### Geofencing and Location Verification
- **100-Meter Radius Verification**: Inspectors must be within 100 meters of property before starting unit timers
- **Unit-Specific Timers**: Individual timer tracking for each unit inspection with start/stop functionality
- **Location-Based Controls**: Timer controls only activate when inspector is physically on-site

### Role-Based Dashboard System
- **Property Manager Dashboard**: Property oversight, work order management, occupancy tracking, revenue monitoring, job scheduling and progress tracking with real-time status updates
- **Office Staff Dashboard**: Lease management, approval workflows, tenant coordination, administrative tasks
- **Technician Dashboard**: Work order execution, daily scheduling, time tracking, mobile-friendly interface, callback resolution with photo uploads
- **Inspector Dashboard**: Property inspections, compliance tracking, report generation, quality assurance, remote photo verification for callbacks, geofenced timer system
- **General Dashboard**: Overview metrics accessible to all roles with appropriate data filtering

### Access Control Implementation
- Comprehensive permission system with role-based access controls
- User permissions stored in database with expiration and audit capabilities
- Route-level access restrictions based on user roles and permissions
- Dedicated API endpoints for permission checking and management

### Role-Specific Features and Access

#### Property Manager Role
- **Responsibilities**: Property oversight, tenant relations, work order approval, revenue tracking, job scheduling and progress monitoring
- **Access**: Properties, tenants, work orders, inspections, revenue reports, job scheduling interface, real-time progress tracking, approval queue for repairs and extra dirty units
- **Restrictions**: Cannot complete work orders or inspections directly, limited staff management
- **Enhanced Features**: Comprehensive job tracking with eight specific job types (punch, repairs, paint, clean, carpet, inspected, unit trash out, onsite bulk trash), real-time elapsed time tracking for each job, detailed phase-by-phase progress indicators with percentages, focused approval workflow for extra dirty units and extra drywall repairs with technician → office staff → property manager workflow, photo requirements tracking for trash jobs (2 photos required to office), comprehensive job scheduling system for unit preparation with multi-job booking, move-in dates, and completion targets, weekly schedule overview with progress tracking

#### Office Staff Role  
- **Responsibilities**: Administrative tasks, lease processing, application management, coordination
- **Access**: Tenant management, lease processing, basic reporting, messaging, invoice processing
- **Restrictions**: Limited property management, cannot approve high-value expenses

#### Technician Role
- **Responsibilities**: Work order execution, field operations, time tracking, equipment maintenance, callback resolution work
- **Access**: Assigned work orders, scheduling, messaging, mobile-optimized interface, callback notifications, photo upload system for callback completion
- **Restrictions**: Cannot create or assign work orders, limited reporting access
- **Enhanced Features**: Complete callback resolution workflow with photo documentation, automatic notification system when callback work is completed

#### Inspector Role
- **Responsibilities**: Property inspections, compliance monitoring, quality assurance, reporting, remote callback verification
- **Access**: Inspection scheduling, report generation, property access, compliance tracking, geofenced timer system, photo-based callback approval
- **Restrictions**: Cannot manage properties or tenants directly, focused on inspection workflows
- **Enhanced Features**: Unit-specific timer tracking with geofencing verification, remote photo verification for callback work eliminating need for return site visits

#### Admin Role
- **Responsibilities**: System administration, user management, full oversight
- **Access**: All system functions, user management, system configuration, audit logs
- **Restrictions**: None - full system access

### Data Models Extended
- **Users**: Enhanced with role-based permissions and regional assignments
- **Inspections**: Complete inspection workflow with findings, ratings, and compliance tracking
- **Work Orders**: Property-specific work orders with technician assignment and approval workflows
- **Properties**: Comprehensive property management with units, occupancy, and manager assignment
- **Tenants**: Lease management with expiration tracking and contact information
- **User Permissions**: Granular permission system with resource-level access control
- **Audit Log**: Complete action tracking for compliance and security monitoring

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