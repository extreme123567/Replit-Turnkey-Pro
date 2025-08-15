# ServicePro Role-Based Dashboard Demonstration

## Available Dashboards and Access Levels

### 1. General Dashboard (All Roles)
**URL**: `/dashboard`
**Access**: All authenticated users
**Features**:
- Overview metrics (active jobs, revenue, clients, staff hours)
- Recent job activity
- Quick action buttons
- Role-neutral content

### 2. Property Manager Dashboard 
**URL**: `/property-manager`
**Role**: Property Manager, Admin
**Features**:
- Property portfolio overview
- Occupancy tracking and analytics
- Work order approval queue
- Revenue monitoring by property
- Tenant lease expirations
- Maintenance priority management
- Property performance metrics

### 3. Office Staff Dashboard
**URL**: `/office-staff`
**Role**: Office Staff, Admin
**Features**:
- Lease application processing
- Tenant coordination tools
- Administrative task queue
- Invoice processing workflow
- Approval request management
- Basic reporting access
- Communication center

### 4. Technician Dashboard
**URL**: `/technician`
**Role**: Technician, Admin
**Features**:
- Assigned work orders
- Daily schedule optimization
- Time tracking tools
- Mobile-friendly interface
- Equipment status
- Route planning
- Field reporting tools

### 5. Inspector Dashboard
**URL**: `/inspector`
**Role**: Inspector, Admin
**Features**:
- Inspection scheduling calendar
- Property compliance tracking
- Quality assurance reports
- Inspection findings documentation
- Compliance monitoring
- Report generation tools
- Safety checklist management

## Access Control Matrix

| Feature | Admin | Property Manager | Office Staff | Technician | Inspector |
|---------|-------|------------------|--------------|------------|-----------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Properties | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Tenants | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create Work Orders | ✓ | ✓ | ✓ | ✗ | ✓ |
| Assign Work Orders | ✓ | ✓ | ✓ | ✗ | ✗ |
| Complete Work Orders | ✓ | ✗ | ✗ | ✓ | ✗ |
| Schedule Inspections | ✓ | ✓ | ✓ | ✗ | ✓ |
| Complete Inspections | ✓ | ✗ | ✗ | ✗ | ✓ |
| Approve Expenses | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Staff | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✗ | ✓ |
| Access Messaging | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Payroll | ✓ | ✗ | ✗ | ✗ | ✗ |
| Process Invoices | ✓ | ✗ | ✓ | ✗ | ✗ |

## Navigation Instructions

1. **General Dashboard**: Click "General Dashboard" in sidebar - shows universal metrics
2. **Property Manager**: Click "Property Manager" - property oversight and management
3. **Office Staff**: Click "Office Staff" - administrative and lease management
4. **Technician**: Click "Technician" - field work and mobile-optimized tools
5. **Inspector**: Click "Inspector" - inspection scheduling and compliance tracking

Each dashboard is tailored to specific role responsibilities with appropriate access controls and specialized tools.