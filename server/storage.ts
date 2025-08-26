import { 
  type Client, 
  type InsertClient, 
  type Staff, 
  type InsertStaff, 
  type Job, 
  type InsertJob, 
  type TimeEntry, 
  type InsertTimeEntry, 
  type Invoice, 
  type InsertInvoice, 
  type Message, 
  type InsertMessage, 
  type User, 
  type InsertUser, 
  type WorkOrder, 
  type InsertWorkOrder, 
  type Property, 
  type InsertProperty, 
  type Tenant, 
  type InsertTenant, 
  type MaintenanceSchedule, 
  type InsertMaintenanceSchedule, 
  type Inspection, 
  type InsertInspection 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;

  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByClient(clientId: string): Promise<Job[]>;
  getJobsByStaff(staffId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;

  // Time Entries
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntry(id: string): Promise<TimeEntry | undefined>;
  getTimeEntriesByStaff(staffId: string): Promise<TimeEntry[]>;
  getTimeEntriesByJob(jobId: string): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByClient(clientId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  getConversations(userId: string, userType: string): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;

  // Quote Requests
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: string): Promise<QuoteRequest | undefined>;
  getQuoteRequestsByRequester(requesterId: string): Promise<QuoteRequest[]>;
  getPendingQuoteRequests(): Promise<QuoteRequest[]>;
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: string, quoteRequest: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined>;
  approveQuoteRequestAndSchedule(id: string, scheduleData: {
    scheduledDate: Date;
    assignedTechnicianId: string;
    estimatedCost: string;
    scheduledBy: string;
    notes?: string;
  }): Promise<{ quoteRequest: QuoteRequest; workOrder: WorkOrder }>;
  rejectQuoteRequest(id: string, rejectionData: {
    rejectionReason: string;
    rejectedBy: string;
  }): Promise<QuoteRequest>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;

  // Authentication
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<boolean>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Work Orders
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  getWorkOrdersByProperty(propertyId: string): Promise<WorkOrder[]>;
  getWorkOrdersByTechnician(technicianId: string): Promise<WorkOrder[]>;
  getWorkOrdersByStatus(status: string): Promise<WorkOrder[]>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: string, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: string): Promise<boolean>;

  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByManager(managerId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Tenants
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantsByProperty(propertyId: string): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: string): Promise<boolean>;

  // Maintenance Schedule
  getMaintenanceSchedule(): Promise<MaintenanceSchedule[]>;
  getMaintenanceItem(id: string): Promise<MaintenanceSchedule | undefined>;
  getMaintenanceByProperty(propertyId: string): Promise<MaintenanceSchedule[]>;
  getUpcomingMaintenance(days: number): Promise<MaintenanceSchedule[]>;
  createMaintenanceItem(item: InsertMaintenanceSchedule): Promise<MaintenanceSchedule>;
  updateMaintenanceItem(id: string, item: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined>;
  deleteMaintenanceItem(id: string): Promise<boolean>;

  // Inspections
  getInspections(): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  getInspectionsByInspector(inspectorId: string): Promise<Inspection[]>;
  getInspectionsByProperty(propertyId: string): Promise<Inspection[]>;
  getInspectionsByStatus(status: string): Promise<Inspection[]>;
  getTodaysInspections(inspectorId: string): Promise<Inspection[]>;
  getPendingReports(inspectorId: string): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  deleteInspection(id: string): Promise<boolean>;

  // User Permissions
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  checkPermission(userId: string, resourceType: string, resourceId: string, permission: string): Promise<boolean>;
  grantPermission(permission: InsertUserPermission): Promise<UserPermission>;
  revokePermission(id: string): Promise<boolean>;

  // Audit Log
  logAction(action: InsertAuditLog): Promise<AuditLog>;
  getAuditLog(userId?: string, resourceType?: string): Promise<AuditLog[]>;

  // Callback Resolutions
  getCallbackResolutions(): Promise<CallbackResolution[]>;
  getCallbackResolution(id: string): Promise<CallbackResolution | undefined>;
  getCallbacksByTechnician(technicianId: string): Promise<CallbackResolution[]>;
  getCallbacksByJob(jobId: string): Promise<CallbackResolution[]>;
  createCallbackResolution(resolution: InsertCallbackResolution): Promise<CallbackResolution>;
  updateCallbackResolution(id: string, resolution: Partial<InsertCallbackResolution>): Promise<CallbackResolution | undefined>;
  deleteCallbackResolution(id: string): Promise<boolean>;

  // Staff Payroll
  getStaffPayroll(staffId: string): Promise<StaffPayroll[]>;
  getPayrollByPeriod(payPeriod: string): Promise<StaffPayroll[]>;
  createPayrollEntry(payroll: InsertStaffPayroll): Promise<StaffPayroll>;
  updatePayrollEntry(id: string, payroll: Partial<InsertStaffPayroll>): Promise<StaffPayroll | undefined>;
  deductPayForCallback(jobId: string, callbackId: string): Promise<boolean>;
  restorePayAfterCallback(callbackId: string): Promise<boolean>;
  createJobPayout(jobId: string, staffId: string, jobType: 'paint' | 'clean', unitCount?: number, unitType?: 'studio' | '1br' | '2br' | '3br'): Promise<StaffPayroll>;
  getPayoutRates(): Promise<{ paint: { studio: number; '1br': number; '2br': number; '3br': number }; clean: { studio: number; '1br': number; '2br': number; '3br': number } }>;

  // Job Management
  getJobsByProperty(propertyId: string): Promise<Job[]>;
  getJobsAwaitingApproval(): Promise<Job[]>;
  approveJob(jobId: string, approvedBy: string): Promise<Job | undefined>;
  rejectJob(jobId: string, rejectedBy: string, reason: string): Promise<Job | undefined>;
  getJobCompletionStats(): Promise<{ scheduled: number; completed: number; pending: number; }>;

  // Financial Analytics
  getFinancialSummary(): Promise<{ totalBilled: string; totalPaidOut: string; netProfit: string; }>;

  // Extra Dirty Requests
  createExtraDirtyRequest(request: InsertExtraDirtyRequest): Promise<ExtraDirtyRequest>;
  getExtraDirtyRequests(): Promise<ExtraDirtyRequest[]>;
  getExtraDirtyRequestsByTechnician(technicianId: string): Promise<ExtraDirtyRequest[]>;
  updateExtraDirtyRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<ExtraDirtyRequest | undefined>;

  // Repair Photo Requests  
  createRepairPhotoRequest(request: InsertRepairPhotoRequest): Promise<RepairPhotoRequest>;
  getRepairPhotoRequests(): Promise<RepairPhotoRequest[]>;
  getRepairPhotoRequestsByPainter(painterId: string): Promise<RepairPhotoRequest[]>;
  updateRepairPhotoRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<RepairPhotoRequest | undefined>;

  // Dashboard Analytics
  getDashboardStats(userRole: string, userId?: string): Promise<any>;
  getPropertyManagerStats(managerId: string): Promise<any>;
  getTechnicianStats(technicianId: string): Promise<any>;
  getOfficeStats(): Promise<any>;
  getInspectorStats(inspectorId: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client> = new Map();
  private staff: Map<string, Staff> = new Map();
  private jobs: Map<string, Job> = new Map();
  private timeEntries: Map<string, TimeEntry> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private messages: Map<string, Message> = new Map();
  private users: Map<string, User> = new Map();
  private workOrders: Map<string, WorkOrder> = new Map();
  private properties: Map<string, Property> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private maintenanceSchedule: Map<string, MaintenanceSchedule> = new Map();
  private inspections: Map<string, Inspection> = new Map();
  private callbackResolutions: Map<string, CallbackResolution> = new Map();
  private staffPayroll: Map<string, StaffPayroll> = new Map();
  private extraDirtyRequests: Map<string, ExtraDirtyRequest> = new Map();
  private repairPhotoRequests: Map<string, RepairPhotoRequest> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private userPermissions: Map<string, UserPermission> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private quoteRequests: Map<string, QuoteRequest> = new Map();
  private invoiceCounter = 1;

  constructor() {
    // Initialize system with default users for testing
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    // Create demo users for each role (for testing - in production, admin creates these)
    const defaultUsers = [
      {
        id: "admin-1",
        email: "admin@servicepro.com",
        password: "$2b$12$7F/c3cCG5CJuzKyCk0MJZ.c.fYcEudpPv0swvO20WOcXDu3y.Ugpa", // "adminpass123"
        firstName: "System",
        lastName: "Administrator",
        role: "admin",
        department: "Administration",
        status: "active" as const,
        permissions: ["all"],
        assignedRegions: null,
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "office-1",
        email: "office@servicepro.com", 
        password: "$2b$12$fCyT0vsMq5a6aixd/qtNlezaEieidN26/lH2nwpLgIXyvS7dEo//O", // "officepass123"
        firstName: "Leslie",
        lastName: "Rodriguez",
        role: "office_staff",
        department: "Operations",
        status: "active" as const,
        permissions: ["assign_jobs", "schedule", "approve_quotes"],
        assignedRegions: ["New Bern"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "pm-1",
        email: "manager@servicepro.com",
        password: "$2b$12$hMoDVIRBEypyXJjfUQBy9Ot/GUUOacjQOOeTpJzVmO./s.v64hmnS", // "managerpass123"
        firstName: "Property",
        lastName: "Manager",
        role: "property_manager",
        department: "Property Management",
        status: "active" as const,
        permissions: ["view_properties", "request_approvals"],
        assignedRegions: ["New Bern"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "tech-1",
        email: "tech@servicepro.com",
        password: "$2b$12$Mr.jmZmqdONN.3Rm066SJeJD9DtCgjMDGSmWgTxorDBbeJy71FAx.", // "techpass123"
        firstName: "Mark",
        lastName: "Kebets",
        role: "technician", 
        department: "Maintenance",
        status: "active" as const,
        permissions: ["complete_jobs", "upload_photos"],
        assignedRegions: ["New Bern"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "inspector-1",
        email: "inspector@servicepro.com",
        password: "$2b$12$GERz5GfKEcmmTcxkQulRr.w2Uvhyt2GcMUqleavDGG666GKInEAvO", // "inspectorpass123"
        firstName: "Quality",
        lastName: "Inspector",
        role: "inspector",
        department: "Quality Assurance", 
        status: "active" as const,
        permissions: ["conduct_inspections", "verify_quality"],
        assignedRegions: ["New Bern"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "tech-2",
        email: "sarah.tech@servicepro.com",
        password: "$2b$12$TechPass2Demo123", // "techpass2123"
        firstName: "Sarah",
        lastName: "Johnson",
        role: "technician",
        department: "Maintenance", 
        status: "active" as const,
        permissions: ["complete_jobs", "upload_photos"],
        assignedRegions: ["New Bern", "Jacksonville"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "tech-3",
        email: "mike.tech@servicepro.com",
        password: "$2b$12$TechPass3Demo123", // "techpass3123"
        firstName: "Mike",
        lastName: "Rodriguez",
        role: "technician",
        department: "Maintenance", 
        status: "active" as const,
        permissions: ["complete_jobs", "upload_photos"],
        assignedRegions: ["Greenville"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "office-2",
        email: "assistant.office@servicepro.com",
        password: "$2b$12$OfficePass2Demo123", // "officepass2123"
        firstName: "Lisa",
        lastName: "Chen",
        role: "office_staff",
        department: "Operations", 
        status: "active" as const,
        permissions: ["assign_jobs", "schedule", "approve_quotes"],
        assignedRegions: ["New Bern", "Jacksonville"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
      {
        id: "inspector-2",
        email: "david.inspector@servicepro.com",
        password: "$2b$12$InspectorPass2Demo123", // "inspectorpass2123"
        firstName: "David",
        lastName: "Wilson",
        role: "inspector",
        department: "Quality Assurance", 
        status: "active" as const,
        permissions: ["conduct_inspections", "verify_quality"],
        assignedRegions: ["Jacksonville", "Greenville"],
        lastLogin: null,
        preferences: null,
        createdAt: new Date(),
      },
    ];

    // Add demo users to storage
    for (const user of defaultUsers) {
      this.users.set(user.id, user);
    }

    // Add sample staff members
    const sampleStaff = [
      {
        id: "tech-1",
        firstName: "Mark",
        lastName: "Kebets", 
        email: "tech@servicepro.com",
        phone: "(252) 555-0001",
        role: "technician",
        department: "Maintenance",
        hourlyRate: "25.00",
        status: "active" as const,
        hoursThisWeek: "32.50",
        activeJobs: 3,
        permissions: ["complete_jobs", "upload_photos"],
        assignedRegions: ["New Bern"],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tech-2",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@servicepro.com", 
        phone: "(252) 555-0002",
        role: "technician",
        department: "Maintenance",
        hourlyRate: "23.00",
        status: "active" as const,
        hoursThisWeek: "38.75",
        activeJobs: 2,
        permissions: ["complete_jobs", "upload_photos"],
        assignedRegions: ["New Bern"],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const staff of sampleStaff) {
      this.staff.set(staff.id, staff);
    }

    // Add sample properties
    const sampleProperties = [
      {
        id: "prop-1",
        name: "Sunset Gardens Apartments",
        address: "1234 Sunset Blvd",
        city: "New Bern",
        state: "NC",
        zipCode: "28560",
        propertyType: "multi_family",
        units: 24,
        yearBuilt: 1985,
        squareFootage: 28800,
        managerId: "pm-1",
        status: "active" as const,
        monthlyRent: "850.00",
        createdAt: new Date(),
      },
      {
        id: "prop-2", 
        name: "Oak Ridge Complex",
        address: "5678 Oak Ridge Dr",
        city: "New Bern",
        state: "NC", 
        zipCode: "28562",
        propertyType: "multi_family",
        units: 18,
        yearBuilt: 1992,
        squareFootage: 21600,
        managerId: "pm-1",
        status: "active" as const,
        monthlyRent: "950.00",
        createdAt: new Date(),
      }
    ];

    for (const property of sampleProperties) {
      this.properties.set(property.id, property);
    }

    // Add sample work orders for testing job management
    const sampleWorkOrders = [
      {
        id: "wo-1",
        title: "Unit 12A Turn - Full Clean and Paint",
        description: "Complete apartment turn including deep clean, paint all rooms, fix minor repairs",
        propertyId: "prop-1",
        unitNumber: "12A",
        tenantId: null,
        requestedById: "pm-1",
        assignedTechnicianId: null,
        status: "scheduled" as const,
        priority: "high" as const,
        type: "turn",
        estimatedCost: "850.00",
        actualCost: null,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        startedAt: null,
        completedAt: null,
        notes: "Tenant moving out Friday, need completed by Monday",
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wo-2", 
        title: "Unit 5B Maintenance - Plumbing Issues",
        description: "Fix leaky faucet in kitchen, repair toilet running issue, check all water connections",
        propertyId: "prop-2",
        unitNumber: "5B",
        tenantId: null,
        requestedById: "pm-1",
        assignedTechnicianId: "tech-1",
        status: "in_progress" as const,
        priority: "medium" as const,
        type: "maintenance",
        estimatedCost: "320.00",
        actualCost: null,
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        startedAt: new Date(),
        completedAt: null,
        notes: "Tenant reported issues yesterday, urgent fix needed",
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wo-3",
        title: "Unit 8C Deep Clean Only",
        description: "Professional deep cleaning service - carpets, appliances, bathrooms, windows",
        propertyId: "prop-1", 
        unitNumber: "8C",
        tenantId: null,
        requestedById: "pm-1",
        assignedTechnicianId: null,
        status: "scheduled" as const,
        priority: "low" as const,
        type: "cleaning",
        estimatedCost: "280.00",
        actualCost: null,
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        startedAt: null,
        completedAt: null,
        notes: "New tenant moving in next week",
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wo-4",
        title: "Unit 3A Emergency Repair",
        description: "Water damage repair from burst pipe - drywall replacement, paint, flooring assessment",
        propertyId: "prop-2",
        unitNumber: "3A",
        tenantId: null,
        requestedById: "pm-1",
        assignedTechnicianId: "tech-2",
        status: "scheduled" as const,
        priority: "emergency" as const,
        type: "repair",
        estimatedCost: "1200.00",
        actualCost: null,
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        startedAt: null,
        completedAt: null,
        notes: "Insurance claim filed, urgent completion required",
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const workOrder of sampleWorkOrders) {
      this.workOrders.set(workOrder.id, workOrder);
    }

    // Add sample jobs awaiting approval for testing approval queue functionality
    const sampleJobsAwaitingApproval: Job[] = [
      {
        id: "job-approval-1",
        title: "Paint Job - Unit 15B",
        status: "awaiting_approval",
        createdAt: new Date(),
        clientId: "prop-1",
        description: "Complete paint job for 2-bedroom unit including primer and two coats",
        assignedStaffId: "tech-1",
        priority: "medium",
        estimatedHours: "6",
        actualHours: null,
        amount: "450.00",
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        completedDate: null,
      },
      {
        id: "job-approval-2", 
        title: "Deep Clean - Unit 7A",
        status: "awaiting_approval",
        createdAt: new Date(),
        clientId: "prop-2",
        description: "Professional deep cleaning service for 1-bedroom unit before new tenant move-in",
        assignedStaffId: "tech-2",
        priority: "high",
        estimatedHours: "4",
        actualHours: null,
        amount: "280.00",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        completedDate: null,
      },
      {
        id: "job-approval-3",
        title: "Maintenance - Unit 22C",
        status: "awaiting_approval", 
        createdAt: new Date(),
        clientId: "prop-1",
        description: "Fix kitchen sink leak and replace bathroom faucet",
        assignedStaffId: "tech-1",
        priority: "medium",
        estimatedHours: "3",
        actualHours: null,
        amount: "220.00",
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        completedDate: null,
      }
    ];

    for (const job of sampleJobsAwaitingApproval) {
      this.jobs.set(job.id, job);
    }
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      clientType: insertClient.clientType || "residential",
      status: insertClient.status || "active",
      totalValue: "0.00",
      jobCount: 0,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).sort((a, b) => 
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = {
      ...insertStaff,
      id,
      status: insertStaff.status || "active",
      department: insertStaff.department || null,
      hourlyRate: insertStaff.hourlyRate || null,
      hoursThisWeek: "0.00",
      activeJobs: 0,
      lastLogin: null,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    if (!staff) return undefined;

    const updatedStaff = { ...staff, ...updates };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.clientId === clientId);
  }

  async getJobsByStaff(staffId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.assignedStaffId === staffId);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      status: insertJob.status || "scheduled",
      description: insertJob.description || null,
      assignedStaffId: insertJob.assignedStaffId || null,
      priority: insertJob.priority || "medium",
      estimatedHours: insertJob.estimatedHours || null,
      actualHours: null,
      completedDate: null,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByManager(managerId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(property => property.managerId === managerId);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Work Orders
  async getWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    return this.workOrders.get(id);
  }

  async getWorkOrdersByProperty(propertyId: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(wo => wo.propertyId === propertyId);
  }

  async getWorkOrdersByTechnician(technicianId: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(wo => wo.assignedTo === technicianId);
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(wo => wo.status === status);
  }

  async createWorkOrder(insertWorkOrder: InsertWorkOrder): Promise<WorkOrder> {
    const id = randomUUID();
    const workOrder: WorkOrder = {
      ...insertWorkOrder,
      id,
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workOrders.set(id, workOrder);
    return workOrder;
  }

  async updateWorkOrder(id: string, updates: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const workOrder = this.workOrders.get(id);
    if (!workOrder) return undefined;

    const updatedWorkOrder = { ...workOrder, ...updates, updatedAt: new Date() };
    this.workOrders.set(id, updatedWorkOrder);
    return updatedWorkOrder;
  }

  async deleteWorkOrder(id: string): Promise<boolean> {
    return this.workOrders.delete(id);
  }

  // Quote Requests
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getQuoteRequest(id: string): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }

  async getQuoteRequestsByRequester(requesterId: string): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values()).filter(qr => qr.requesterId === requesterId);
  }

  async getPendingQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values()).filter(qr => qr.status === 'pending_office_approval');
  }

  async createQuoteRequest(insertQuoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = randomUUID();
    const quoteRequest: QuoteRequest = {
      ...insertQuoteRequest,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quoteRequests.set(id, quoteRequest);
    return quoteRequest;
  }

  async updateQuoteRequest(id: string, updates: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined> {
    const quoteRequest = this.quoteRequests.get(id);
    if (!quoteRequest) return undefined;

    const updatedQuoteRequest = { ...quoteRequest, ...updates, updatedAt: new Date() };
    this.quoteRequests.set(id, updatedQuoteRequest);
    return updatedQuoteRequest;
  }

  async approveQuoteRequestAndSchedule(id: string, scheduleData: {
    scheduledDate: Date;
    assignedTechnicianId: string;
    estimatedCost: string;
    scheduledBy: string;
    notes?: string;
  }): Promise<{ quoteRequest: QuoteRequest; workOrder: WorkOrder }> {
    const quoteRequest = this.quoteRequests.get(id);
    if (!quoteRequest) {
      throw new Error("Quote request not found");
    }

    // Update quote request status
    const updatedQuoteRequest = {
      ...quoteRequest,
      status: 'approved_and_scheduled' as const,
      scheduledDate: scheduleData.scheduledDate,
      assignedTechnicianId: scheduleData.assignedTechnicianId,
      estimatedCost: scheduleData.estimatedCost,
      scheduledBy: scheduleData.scheduledBy,
      notes: scheduleData.notes,
      updatedAt: new Date()
    };
    this.quoteRequests.set(id, updatedQuoteRequest);

    // Create work order
    const workOrder = await this.createWorkOrder({
      title: quoteRequest.title,
      description: quoteRequest.description,
      type: quoteRequest.serviceType,
      status: 'scheduled',
      priority: quoteRequest.priority,
      propertyId: quoteRequest.propertyId,
      unitNumber: quoteRequest.unitNumber,
      assignedTo: scheduleData.assignedTechnicianId,
      estimatedHours: 0,
      estimatedCost: scheduleData.estimatedCost,
      scheduledDate: scheduleData.scheduledDate,
      createdBy: scheduleData.scheduledBy,
      notes: scheduleData.notes
    });

    return { quoteRequest: updatedQuoteRequest, workOrder };
  }

  async rejectQuoteRequest(id: string, rejectionData: {
    rejectionReason: string;
    rejectedBy: string;
  }): Promise<QuoteRequest> {
    const quoteRequest = this.quoteRequests.get(id);
    if (!quoteRequest) {
      throw new Error("Quote request not found");
    }

    const updatedQuoteRequest = {
      ...quoteRequest,
      status: 'rejected' as const,
      rejectionReason: rejectionData.rejectionReason,
      rejectedBy: rejectionData.rejectedBy,
      updatedAt: new Date()
    };
    this.quoteRequests.set(id, updatedQuoteRequest);
    return updatedQuoteRequest;
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Minimal implementations for remaining methods to satisfy interface
  async getTimeEntries(): Promise<TimeEntry[]> { return []; }
  async getTimeEntry(id: string): Promise<TimeEntry | undefined> { return undefined; }
  async getTimeEntriesByStaff(staffId: string): Promise<TimeEntry[]> { return []; }
  async getTimeEntriesByJob(jobId: string): Promise<TimeEntry[]> { return []; }
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> { 
    throw new Error("Not implemented");
  }
  async updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> { 
    return undefined; 
  }
  async deleteTimeEntry(id: string): Promise<boolean> { return false; }

  async getInvoices(): Promise<Invoice[]> { return []; }
  async getInvoice(id: string): Promise<Invoice | undefined> { return undefined; }
  async getInvoicesByClient(clientId: string): Promise<Invoice[]> { return []; }
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> { 
    throw new Error("Not implemented");
  }
  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> { 
    return undefined; 
  }
  async deleteInvoice(id: string): Promise<boolean> { return false; }

  async getMessages(): Promise<Message[]> { return []; }
  async getMessage(id: string): Promise<Message | undefined> { return undefined; }
  async getMessagesByConversation(conversationId: string): Promise<Message[]> { return []; }
  async getConversations(userId: string, userType: string): Promise<any[]> { return []; }
  async createMessage(message: InsertMessage): Promise<Message> { 
    throw new Error("Not implemented");
  }
  async markMessageAsRead(id: string): Promise<boolean> { return false; }


  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> { 
    return this.users.get(id); 
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getTenants(): Promise<Tenant[]> { return []; }
  async getTenant(id: string): Promise<Tenant | undefined> { return undefined; }
  async getTenantsByProperty(propertyId: string): Promise<Tenant[]> { return []; }
  async createTenant(tenant: InsertTenant): Promise<Tenant> { 
    throw new Error("Not implemented");
  }
  async updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> { 
    return undefined; 
  }
  async deleteTenant(id: string): Promise<boolean> { return false; }

  async getMaintenanceSchedule(): Promise<MaintenanceSchedule[]> { return []; }
  async getMaintenanceItem(id: string): Promise<MaintenanceSchedule | undefined> { return undefined; }
  async getMaintenanceByProperty(propertyId: string): Promise<MaintenanceSchedule[]> { return []; }
  async getUpcomingMaintenance(days: number): Promise<MaintenanceSchedule[]> { return []; }
  async createMaintenanceItem(item: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> { 
    throw new Error("Not implemented");
  }
  async updateMaintenanceItem(id: string, item: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined> { 
    return undefined; 
  }
  async deleteMaintenanceItem(id: string): Promise<boolean> { return false; }

  async getInspections(): Promise<Inspection[]> { return []; }
  async getInspection(id: string): Promise<Inspection | undefined> { return undefined; }
  async getInspectionsByInspector(inspectorId: string): Promise<Inspection[]> { return []; }
  async getInspectionsByProperty(propertyId: string): Promise<Inspection[]> { return []; }
  async getInspectionsByStatus(status: string): Promise<Inspection[]> { return []; }
  async getTodaysInspections(inspectorId: string): Promise<Inspection[]> { return []; }
  async getPendingReports(inspectorId: string): Promise<Inspection[]> { return []; }
  async createInspection(inspection: InsertInspection): Promise<Inspection> { 
    throw new Error("Not implemented");
  }
  async updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection | undefined> { 
    return undefined; 
  }
  async deleteInspection(id: string): Promise<boolean> { return false; }

  async getUserPermissions(userId: string): Promise<UserPermission[]> { return []; }
  async checkPermission(userId: string, resourceType: string, resourceId: string, permission: string): Promise<boolean> { 
    return true; // Default allow for fresh system
  }
  async grantPermission(permission: InsertUserPermission): Promise<UserPermission> { 
    throw new Error("Not implemented");
  }
  async revokePermission(id: string): Promise<boolean> { return false; }

  async logAction(action: InsertAuditLog): Promise<AuditLog> { 
    throw new Error("Not implemented");
  }
  async getAuditLog(userId?: string, resourceType?: string): Promise<AuditLog[]> { return []; }

  async getCallbackResolutions(): Promise<CallbackResolution[]> { return []; }
  async getCallbackResolution(id: string): Promise<CallbackResolution | undefined> { return undefined; }
  async getCallbacksByTechnician(technicianId: string): Promise<CallbackResolution[]> { return []; }
  async getCallbacksByJob(jobId: string): Promise<CallbackResolution[]> { return []; }
  async createCallbackResolution(resolution: InsertCallbackResolution): Promise<CallbackResolution> { 
    throw new Error("Not implemented");
  }
  async updateCallbackResolution(id: string, resolution: Partial<InsertCallbackResolution>): Promise<CallbackResolution | undefined> { 
    return undefined; 
  }
  async deleteCallbackResolution(id: string): Promise<boolean> { return false; }

  async getStaffPayroll(staffId: string): Promise<StaffPayroll[]> { return []; }
  async getPayrollByPeriod(payPeriod: string): Promise<StaffPayroll[]> { return []; }
  async createPayrollEntry(payroll: InsertStaffPayroll): Promise<StaffPayroll> { 
    throw new Error("Not implemented");
  }
  async updatePayrollEntry(id: string, payroll: Partial<InsertStaffPayroll>): Promise<StaffPayroll | undefined> { 
    return undefined; 
  }
  async deductPayForCallback(jobId: string, callbackId: string): Promise<boolean> { return false; }
  async restorePayAfterCallback(callbackId: string): Promise<boolean> { return false; }
  async createJobPayout(jobId: string, staffId: string, jobType: 'paint' | 'clean', unitCount?: number, unitType?: 'studio' | '1br' | '2br' | '3br'): Promise<StaffPayroll> { 
    throw new Error("Not implemented");
  }
  async getPayoutRates(): Promise<{ paint: { studio: number; '1br': number; '2br': number; '3br': number }; clean: { studio: number; '1br': number; '2br': number; '3br': number } }> {
    return {
      paint: { studio: 60, '1br': 75, '2br': 90, '3br': 110 },
      clean: { studio: 45, '1br': 60, '2br': 75, '3br': 95 }
    };
  }

  async getJobsByProperty(propertyId: string): Promise<Job[]> { return []; }
  async getJobsAwaitingApproval(): Promise<Job[]> { 
    // Return jobs with "awaiting approval" status
    return Array.from(this.jobs.values()).filter(job => job.status === "awaiting_approval");
  }
  async approveJob(jobId: string, approvedBy: string): Promise<Job | undefined> { 
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    
    const updatedJob = { 
      ...job, 
      status: "approved"
    };
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }
  async rejectJob(jobId: string, rejectedBy: string, reason: string): Promise<Job | undefined> { 
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    
    const updatedJob = { 
      ...job, 
      status: "rejected"
    };
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }
  async getJobCompletionStats(): Promise<{ scheduled: number; completed: number; pending: number; }> {
    return { scheduled: 0, completed: 0, pending: 0 };
  }

  async getFinancialSummary(): Promise<{ totalBilled: string; totalPaidOut: string; netProfit: string; }> {
    return { totalBilled: "0.00", totalPaidOut: "0.00", netProfit: "0.00" };
  }

  async createExtraDirtyRequest(request: InsertExtraDirtyRequest): Promise<ExtraDirtyRequest> { 
    throw new Error("Not implemented");
  }
  async getExtraDirtyRequests(): Promise<ExtraDirtyRequest[]> { return []; }
  async getExtraDirtyRequestsByTechnician(technicianId: string): Promise<ExtraDirtyRequest[]> { return []; }
  async updateExtraDirtyRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<ExtraDirtyRequest | undefined> { 
    return undefined; 
  }

  async createRepairPhotoRequest(request: InsertRepairPhotoRequest): Promise<RepairPhotoRequest> { 
    throw new Error("Not implemented");
  }
  async getRepairPhotoRequests(): Promise<RepairPhotoRequest[]> { return []; }
  async getRepairPhotoRequestsByPainter(painterId: string): Promise<RepairPhotoRequest[]> { return []; }
  async updateRepairPhotoRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<RepairPhotoRequest | undefined> { 
    return undefined; 
  }

  async getDashboardStats(userRole: string, userId?: string): Promise<any> {
    return { message: "Fresh system - add your first data!" };
  }
  async getPropertyManagerStats(managerId: string): Promise<any> {
    return { totalProperties: 0, totalUnits: 0, occupiedUnits: 0, occupancyRate: "0%", monthlyRent: "$0", openWorkOrders: 0, emergencyWorkOrders: 0 };
  }
  async getTechnicianStats(technicianId: string): Promise<any> {
    return { todaysJobs: 0, weeklyHours: 0, monthlyEarnings: 0, completionRate: 0 };
  }
  async getOfficeStats(): Promise<any> {
    return { pendingApprovals: 0, activeJobs: 0, todaysRevenue: 0, staffUtilization: 0 };
  }
  async getInspectorStats(inspectorId: string): Promise<any> {
    return { todaysInspections: 0, pendingReports: 0, monthlyInspections: 0, averageScore: 0 };
  }

  // Authentication methods
  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      status: insertUser.status || "active",
      department: insertUser.department || null,
      permissions: insertUser.permissions || null,
      assignedRegions: insertUser.assignedRegions || null,
      lastLogin: null,
      preferences: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    const updatedUser = { ...user, lastLogin: new Date() };
    this.users.set(id, updatedUser);
    return true;
  }
}

export const storage = new MemStorage();