# ServicePro Platform Demo Guide

## Overview
ServicePro is a comprehensive property management platform for apartment maintenance and service professionals with role-based dashboards, callback functionality, and mobile-responsive design.

## Demo Credentials
- **Admin**: admin@servicepro.com / adminpass123
- **Office Staff**: office@servicepro.com / officepass123  
- **Property Manager**: manager@servicepro.com / managerpass123
- **Technician**: tech@servicepro.com / techpass123
- **Inspector**: inspector@servicepro.com / inspectorpass123

## Demo Script (10-15 minutes)

### 1. Login & Authentication (1 minute)
- Show the clean login interface at the root URL
- Demonstrate role-based access with different credentials
- Highlight secure email-based authentication

### 2. Admin Dashboard - Complete Business Oversight (3 minutes)
**Login as Admin (admin@servicepro.com/adminpass123)**

**Business Metrics Overview:**
- Total Revenue: $47,250 (work-based revenue tracking)
- Monthly Payouts: $12,350 (automated technician payouts)
- Net Profit: $34,900 (real-time profitability)
- Active Properties: 12 properties under management

**Staff Performance Analytics:**
- Individual technician performance metrics
- Completed jobs vs callback ratios
- Staff efficiency tracking without hourly rates

**Exclusive Financial Access:**
- Revenue breakdown by property and job type
- Automated payout calculations for paint/cleaning work
- Profit margin analysis and business insights

### 3. Property Manager Dashboard - Quality Control (3 minutes)
**Login as Property Manager (manager@servicepro.com/managerpass123)**

**Job Monitoring:**
- View all work orders across properties
- Track job status and progress
- Monitor technician assignments (view-only access)

**Callback Request with Photo Evidence:**
- Find a completed job and click "Request Callback"
- Show the comprehensive callback form:
  - Reason selection (Quality Issue, Incomplete Work, etc.)
  - Priority setting
  - **Photo Evidence Requirements:** Upload 2-3 photos
  - Detailed notes for each photo explaining the issue
- Demonstrate form validation requiring photos and notes

**Communication Tools:**
- Message office staff directly
- Request quotes for additional work

### 4. Inspector Dashboard - Quality Assurance (3 minutes)
**Login as Inspector (inspector@servicepro.com/inspectorpass123)**

**Inspection Process:**
- View scheduled inspections with geofencing
- Start inspection timer (location-based)
- Complete inspection with two outcomes:
  - ✅ Pass - Job Approved
  - ⚠️ Callback Required (with photo evidence)

**Enhanced Callback Documentation:**
- When marking "Callback Required":
  - Upload 2-3 photos showing quality issues
  - Add detailed notes for each photo
  - Explain why callback is needed
- Show validation requiring photo evidence

**Geofencing Features:**
- Location verification for on-site inspections
- Timer system for inspection duration tracking

### 5. Office Staff Dashboard - Operations Management (2 minutes)
**Login as Office Staff (office@servicepro.com/officepass123)**

**Operational Functions:**
- Property portfolio management
- Job assignment capabilities (only office staff can assign)
- Staff coordination and scheduling
- Work-based revenue tracking (not financial access)

**Approval Workflows:**
- Review and process callback requests
- Coordinate with technicians for rework
- Manage job scheduling and assignments

### 6. Technician Dashboard - Work Execution (2 minutes)
**Login as Technician (tech@servicepro.com/techpass123)**

**Daily Work Management:**
- View assigned work orders
- Track job progress and status
- Mobile-friendly interface for field work
- Receive callback notifications with photo evidence

**Callback Resolution:**
- View callback requests with original photos and notes
- Complete rework with photo documentation
- Update job status upon completion

### 7. Mobile Responsiveness (1 minute)
- Demonstrate mobile compatibility across all dashboards
- Show touch-friendly navigation
- Highlight app-like experience for field workers

## Key Features to Highlight

### ✅ Role-Based Access Control
- Hierarchical permissions: Admin > Office Staff > Property Manager > Technician/Inspector
- Secure role-specific functionality and data access

### ✅ Photo-Based Callback System
- Property Managers and Inspectors require 2-3 photos with notes
- Quality documentation for all callback requests
- Visual evidence attached to notifications

### ✅ Financial Management (Admin Only)
- Work-based revenue tracking (not rental income)
- Automated technician payouts
- Real-time business profitability analysis

### ✅ Mobile-First Design
- Responsive interface for both mobile and desktop
- Touch-friendly controls for field workers
- Professional presentation for office users

### ✅ Workflow Management
- Job assignment restricted to office staff only
- Progress tracking with image verification
- Multi-job scheduling with status updates

## Demo Tips

1. **Start with Admin** to show complete business oversight
2. **Emphasize callback photo requirements** - this is a unique quality control feature
3. **Show mobile responsiveness** by resizing browser window
4. **Demonstrate role restrictions** by trying to access admin features as other roles
5. **Highlight real-time updates** across different dashboards

## Technical Highlights
- React frontend with TypeScript
- Express.js backend with PostgreSQL
- JWT authentication with role-based security
- Mobile-responsive design with Tailwind CSS
- Real-time data synchronization

## Recording Suggestions
- Use screen recording software (OBS, Loom, etc.)
- Record in 1080p for clarity
- Use a clean browser window without extensions
- Prepare test data beforehand for smooth demo flow
- Consider adding voiceover explaining features during recording