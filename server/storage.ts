import { type Client, type InsertClient, type Staff, type InsertStaff, type Job, type InsertJob, type TimeEntry, type InsertTimeEntry, type Invoice, type InsertInvoice, type Message, type InsertMessage, type User, type InsertUser, type WorkOrder, type InsertWorkOrder, type Property, type InsertProperty, type Tenant, type InsertTenant, type MaintenanceSchedule, type InsertMaintenanceSchedule, type Inspection, type InsertInspection, type UserPermission, type InsertUserPermission, type AuditLog, type InsertAuditLog, type QuoteRequest, type InsertQuoteRequest, type CallbackResolution, type InsertCallbackResolution, type StaffPayroll, type InsertStaffPayroll, type ExtraDirtyRequest, type InsertExtraDirtyRequest, type RepairPhotoRequest, type InsertRepairPhotoRequest, type Notification, type InsertNotification } from "@shared/schema";
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
    // Initialize with demo data for property management
    this.seedData();
  }

  private seedData() {
    // Create users (team members)
    const sampleUsers: InsertUser[] = [
      {
        name: "Sarah Chen",
        email: "sarah@propmanage.com",
        role: "property_manager",
        department: "operations",
        status: "active"
      },
      {
        name: "Mike Johnson", 
        email: "mike@propmanage.com",
        role: "office_staff",
        department: "leasing",
        status: "active"
      },
      {
        name: "Carlos Rodriguez",
        email: "carlos@propmanage.com",
        role: "technician",
        department: "maintenance",
        status: "active"
      },
      {
        name: "Jennifer Wilson",
        email: "jennifer@propmanage.com",
        role: "admin",
        department: "operations",
        status: "active"
      },
      {
        name: "Robert Kim",
        email: "robert@propmanage.com",
        role: "inspector",
        department: "inspection",
        status: "active"
      }
    ];

    sampleUsers.forEach(user => {
      const id = randomUUID();
      const fullUser: User = {
        ...user,
        id,
        lastLogin: null,
        preferences: null,
        createdAt: new Date()
      };
      this.users.set(id, fullUser);
    });

    // Create staff members (technicians and property managers)
    const staffMembers: InsertStaff[] = [
      {
        name: "John Martinez",
        email: "john@servicepro.com",
        phone: "(555) 100-0001",
        role: "lead_technician",
        hourlyRate: "28.00",
        status: "available"
      },
      {
        name: "Alex Rodriguez",
        email: "alex@servicepro.com",
        phone: "(555) 100-0002",
        role: "technician",
        hourlyRate: "24.00",
        status: "on_job"
      },
      {
        name: "Lisa Thompson",
        email: "lisa@servicepro.com",
        phone: "(555) 100-0003",
        role: "apprentice",
        hourlyRate: "18.00",
        status: "available"
      },
      {
        name: "David Wong",
        email: "david@servicepro.com",
        phone: "(555) 100-0004",
        role: "technician",
        hourlyRate: "26.00",
        status: "sick_leave"
      }
    ];

    staffMembers.forEach(member => {
      const id = randomUUID();
      const staff: Staff = {
        ...member,
        id,
        hoursThisWeek: "0.00",
        activeJobs: 0,
        createdAt: new Date()
      };
      this.staff.set(id, staff);
    });

    // Create sample properties with work-based revenue tracking
    const sampleProperties: InsertProperty[] = [
      {
        name: "Sunset Gardens Apartments",
        address: "1234 Sunset Blvd",
        city: "Charlotte",
        state: "NC",
        zipCode: "28217",
        propertyType: "multi_family",
        units: 24,
        yearBuilt: 1985,
        squareFootage: 18000,
        managerId: "pm-1",
        status: "active",
        monthlyRent: "67400.00" // YTD work revenue completed
      },
      {
        name: "Oak Ridge Complex",
        address: "456 Oak Avenue",
        city: "Charlotte",
        state: "NC", 
        zipCode: "28217",
        propertyType: "multi_family",
        units: 36,
        yearBuilt: 2010,
        squareFootage: 28000,
        managerId: "pm-1",
        status: "active",
        monthlyRent: "57350.00" // YTD work revenue completed
      }
    ];

    sampleProperties.forEach(property => {
      const id = randomUUID();
      const fullProperty: Property = {
        ...property,
        id,
        createdAt: new Date()
      };
      this.properties.set(id, fullProperty);
    });

    // Initialize demo payroll data to show financial accountability system
    const currentMonth = new Date().toISOString().slice(0, 7);
    const technicianIds = Array.from(this.users.values())
      .filter(user => user.role === "technician")
      .map(user => user.id);

    if (technicianIds.length > 0) {
      const samplePayroll: InsertStaffPayroll[] = [
        {
          staffId: technicianIds[0],
          jobId: "job-paint-201A", 
          jobType: "paint",
          basePayAmount: "85.00",
          currentPayAmount: "0.00", // Deducted due to callback
          payStatus: "deducted",
          payPeriod: currentMonth,
          notes: "Paint job Unit 201A - deducted due to failed inspection, awaiting callback resolution"
        },
        {
          staffId: technicianIds[0],
          jobId: "job-clean-105B",
          jobType: "clean", 
          basePayAmount: "65.00",
          currentPayAmount: "65.00",
          payStatus: "earned",
          payPeriod: currentMonth,
          notes: "Standard cleaning job completed successfully"
        },
        {
          staffId: technicianIds[0],
          jobId: "job-repairs-302C",
          jobType: "repairs",
          basePayAmount: "95.00",
          currentPayAmount: "95.00", 
          payStatus: "restored",
          payPeriod: currentMonth,
          notes: "Repair work - pay restored after callback verification"
        },
        {
          staffId: technicianIds[0],
          jobId: "job-carpet-104A",
          jobType: "carpet",
          basePayAmount: "120.00", 
          currentPayAmount: "120.00",
          payStatus: "earned",
          payPeriod: currentMonth,
          notes: "Carpet installation completed and approved"
        }
      ];

      samplePayroll.forEach(payroll => {
        const id = randomUUID();
        const fullPayroll: StaffPayroll = {
          ...payroll,
          id,
          callbackId: payroll.payStatus === "deducted" ? "callback-paint-201A" : null,
          deductedAt: payroll.payStatus === "deducted" ? new Date() : null,
          restoredAt: payroll.payStatus === "restored" ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.staffPayroll.set(id, fullPayroll);
      });
    }

    // Initialize demo jobs awaiting approval for office staff workflow
    const sampleJobsAwaitingApproval: InsertJob[] = [
      {
        title: "Paint Unit 102B - Living Room & Bedroom",
        type: "paint",
        description: "Paint walls in living room and bedroom, prime and two coats",
        priority: "medium",
        status: "awaiting_approval",
        estimatedHours: 6,
        budget: "120.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      },
      {
        title: "HVAC Repair Unit 205A - AC Not Cooling",
        type: "repairs", 
        description: "AC unit not cooling properly, check refrigerant and filters",
        priority: "high",
        status: "awaiting_approval",
        estimatedHours: 3,
        budget: "95.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      },
      {
        title: "Deep Clean Unit 303C - Move-in Ready",
        type: "clean",
        description: "Deep clean entire unit for new tenant move-in",
        priority: "medium",
        status: "awaiting_approval", 
        estimatedHours: 4,
        budget: "85.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      },
      {
        title: "Carpet Installation Unit 404D - Bedrooms",
        type: "carpet",
        description: "Install new carpet in all three bedrooms",
        priority: "low",
        status: "awaiting_approval",
        estimatedHours: 8,
        budget: "150.00",
        assignedTo: "tech-1", 
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      }
    ];

    sampleJobsAwaitingApproval.forEach(job => {
      const id = randomUUID();
      const fullJob: Job = {
        ...job,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.jobs.set(id, fullJob);
    });

    // Add some completed jobs to show financial data
    const sampleCompletedJobs: InsertJob[] = [
      {
        title: "Paint Unit 501A - Completed",
        type: "paint",
        description: "Painted walls in living areas - completed successfully",
        priority: "medium",
        status: "completed",
        estimatedHours: 5,
        budget: "110.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      },
      {
        title: "HVAC Repair Unit 202B - Completed",
        type: "repairs",
        description: "Fixed AC cooling issue - unit running efficiently",
        priority: "high", 
        status: "completed",
        estimatedHours: 4,
        budget: "90.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      },
      {
        title: "Deep Clean Unit 303C - Completed",
        type: "clean",
        description: "Unit cleaned and ready for new tenant",
        priority: "medium",
        status: "completed",
        estimatedHours: 3,
        budget: "75.00",
        assignedTo: "tech-1",
        clientId: this.clients.keys().next().value,
        createdBy: "prop-manager-1"
      }
    ];

    sampleCompletedJobs.forEach(job => {
      const id = randomUUID();
      const fullJob: Job = {
        ...job,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.jobs.set(id, fullJob);
    });

    // Create sample work orders with assigned status for testing "Start Job" functionality
    const sampleWorkOrders: InsertWorkOrder[] = [
      {
        title: "Paint Unit 205B - Kitchen & Bathroom",
        description: "Paint kitchen walls (primer + 2 coats) and bathroom ceiling",
        type: "paint",
        status: "assigned",
        priority: "medium",
        propertyId: Array.from(this.properties.values())[0]?.id || "property-1",
        unitNumber: "205B",
        assignedTo: "tech-1",
        estimatedHours: 4,
        scheduledDate: new Date(),
        createdBy: "prop-manager-1"
      },
      {
        title: "HVAC Service Unit 308A - Filter Replacement",
        description: "Replace HVAC filters and check system operation",
        type: "hvac",
        status: "assigned", 
        priority: "high",
        propertyId: Array.from(this.properties.values())[0]?.id || "property-1",
        unitNumber: "308A",
        assignedTo: "tech-1",
        estimatedHours: 2,
        scheduledDate: new Date(),
        createdBy: "prop-manager-1"
      },
      {
        title: "Deep Clean Unit 102C - Move-out Cleaning",
        description: "Complete deep clean including appliances, carpets, and fixtures",
        type: "cleaning",
        status: "assigned",
        priority: "medium", 
        propertyId: Array.from(this.properties.values())[1]?.id || "property-2",
        unitNumber: "102C",
        assignedTo: "tech-1",
        estimatedHours: 5,
        scheduledDate: new Date(),
        createdBy: "prop-manager-1"
      }
    ];

    sampleWorkOrders.forEach(workOrder => {
      const id = randomUUID();
      const fullWorkOrder: WorkOrder = {
        ...workOrder,
        id,
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.workOrders.set(id, fullWorkOrder);
    });
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
    return Array.from(this.staff.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = {
      ...insertStaff,
      id,
      hoursThisWeek: "0.00",
      activeJobs: 0,
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
      actualHours: null,
      completedDate: null,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);

    // Update client job count and total value
    const client = this.clients.get(job.clientId);
    if (client) {
      client.jobCount++;
      client.totalValue = (parseFloat(client.totalValue) + parseFloat(job.amount)).toFixed(2);
      this.clients.set(client.id, client);
    }

    // Update staff active jobs count
    if (job.assignedStaffId) {
      const staff = this.staff.get(job.assignedStaffId);
      if (staff) {
        staff.activeJobs++;
        this.staff.set(staff.id, staff);
      }
    }

    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    
    // If status changed to completed, set completed date
    if (updates.status === "completed" && job.status !== "completed") {
      updatedJob.completedDate = new Date();
    }

    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    // Update client job count
    const client = this.clients.get(job.clientId);
    if (client) {
      client.jobCount--;
      client.totalValue = Math.max(0, parseFloat(client.totalValue) - parseFloat(job.amount)).toFixed(2);
      this.clients.set(client.id, client);
    }

    // Update staff active jobs count
    if (job.assignedStaffId) {
      const staff = this.staff.get(job.assignedStaffId);
      if (staff) {
        staff.activeJobs = Math.max(0, staff.activeJobs - 1);
        this.staff.set(staff.id, staff);
      }
    }

    return this.jobs.delete(id);
  }

  // Time Entries
  async getTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async getTimeEntriesByStaff(staffId: string): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(entry => entry.staffId === staffId);
  }

  async getTimeEntriesByJob(jobId: string): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(entry => entry.jobId === jobId);
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = randomUUID();
    
    // Calculate hours if start and end time are provided
    let hours = "0.00";
    if (insertTimeEntry.startTime && insertTimeEntry.endTime) {
      const start = new Date(insertTimeEntry.startTime);
      const end = new Date(insertTimeEntry.endTime);
      const diffMs = end.getTime() - start.getTime();
      hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    }

    const timeEntry: TimeEntry = {
      ...insertTimeEntry,
      id,
      hours,
      isOvertime: parseFloat(hours) > 8,
      approved: false,
      createdAt: new Date(),
    };
    
    this.timeEntries.set(id, timeEntry);

    // Update staff hours this week
    const staff = this.staff.get(timeEntry.staffId);
    if (staff) {
      staff.hoursThisWeek = (parseFloat(staff.hoursThisWeek) + parseFloat(hours)).toFixed(2);
      this.staff.set(staff.id, staff);
    }

    return timeEntry;
  }

  async updateTimeEntry(id: string, updates: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const timeEntry = this.timeEntries.get(id);
    if (!timeEntry) return undefined;

    const updatedTimeEntry = { ...timeEntry, ...updates };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.clientId === clientId);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(this.invoiceCounter++).padStart(3, '0')}`;
    
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      invoiceNumber,
      paidDate: null,
      createdAt: new Date(),
    };
    
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice = { ...invoice, ...updates };
    
    // If status changed to paid, set paid date
    if (updates.status === "paid" && invoice.status !== "paid") {
      updatedInvoice.paidDate = new Date();
    }

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getConversations(userId: string, userType: string): Promise<any[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(message => 
        (message.fromId === userId && message.fromType === userType) ||
        (message.toId === userId && message.toType === userType)
      );

    // Group by conversation
    const conversations = new Map();
    
    userMessages.forEach(message => {
      const otherUserId = message.fromId === userId ? message.toId : message.fromId;
      const otherUserType = message.fromType === userType ? message.toType : message.fromType;
      const conversationKey = `${otherUserType}-${otherUserId}`;

      if (!conversations.has(conversationKey)) {
        conversations.set(conversationKey, {
          id: conversationKey,
          userId: otherUserId,
          userType: otherUserType,
          lastMessage: message,
          unreadCount: 0
        });
      } else {
        const conversation = conversations.get(conversationKey);
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message;
        }
      }
    });

    return Array.from(conversations.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      conversationId: insertMessage.conversationId || `${insertMessage.fromType}-${insertMessage.fromId}-${insertMessage.toType}-${insertMessage.toId}`,
      createdAt: new Date(),
    };
    
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;

    message.isRead = true;
    this.messages.set(id, message);
    return true;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      lastLogin: null,
      preferences: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
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
    return Array.from(this.workOrders.values()).filter(order => order.propertyId === propertyId);
  }

  async getWorkOrdersByTechnician(technicianId: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(order => order.assignedTo === technicianId);
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(order => order.status === status);
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
    
    if (updates.status === "completed" && workOrder.status !== "completed") {
      updatedWorkOrder.completedDate = new Date();
    }

    this.workOrders.set(id, updatedWorkOrder);
    return updatedWorkOrder;
  }

  async deleteWorkOrder(id: string): Promise<boolean> {
    return this.workOrders.delete(id);
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

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(tenant => tenant.propertyId === propertyId);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = {
      ...insertTenant,
      id,
      createdAt: new Date(),
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;

    const updatedTenant = { ...tenant, ...updates };
    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  async deleteTenant(id: string): Promise<boolean> {
    return this.tenants.delete(id);
  }

  // Maintenance Schedule
  async getMaintenanceSchedule(): Promise<MaintenanceSchedule[]> {
    return Array.from(this.maintenanceSchedule.values()).sort((a, b) => 
      new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );
  }

  async getMaintenanceItem(id: string): Promise<MaintenanceSchedule | undefined> {
    return this.maintenanceSchedule.get(id);
  }

  async getMaintenanceByProperty(propertyId: string): Promise<MaintenanceSchedule[]> {
    return Array.from(this.maintenanceSchedule.values()).filter(item => item.propertyId === propertyId);
  }

  async getUpcomingMaintenance(days: number): Promise<MaintenanceSchedule[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return Array.from(this.maintenanceSchedule.values())
      .filter(item => item.isActive && new Date(item.nextDueDate) <= cutoffDate)
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }

  async createMaintenanceItem(insertMaintenanceSchedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
    const id = randomUUID();
    const maintenanceItem: MaintenanceSchedule = {
      ...insertMaintenanceSchedule,
      id,
      lastCompleted: null,
      createdAt: new Date(),
    };
    this.maintenanceSchedule.set(id, maintenanceItem);
    return maintenanceItem;
  }

  async updateMaintenanceItem(id: string, updates: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined> {
    const item = this.maintenanceSchedule.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.maintenanceSchedule.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMaintenanceItem(id: string): Promise<boolean> {
    return this.maintenanceSchedule.delete(id);
  }

  // Dashboard Analytics
  async getDashboardStats(userRole: string, userId?: string): Promise<any> {
    const workOrders = Array.from(this.workOrders.values());
    const properties = Array.from(this.properties.values());
    const tenants = Array.from(this.tenants.values());
    const maintenanceItems = Array.from(this.maintenanceSchedule.values());

    // Filter based on user role
    let filteredWorkOrders = workOrders;
    let filteredProperties = properties;

    if (userRole === 'property_manager' && userId) {
      filteredProperties = properties.filter(p => p.managerId === userId);
      const propertyIds = new Set(filteredProperties.map(p => p.id));
      filteredWorkOrders = workOrders.filter(wo => propertyIds.has(wo.propertyId));
    } else if (userRole === 'technician' && userId) {
      filteredWorkOrders = workOrders.filter(wo => wo.assignedTechnicianId === userId);
    }

    const openWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'open').length;
    const emergencyWorkOrders = filteredWorkOrders.filter(wo => wo.priority === 'emergency').length;
    const completedThisMonth = filteredWorkOrders.filter(wo => {
      if (!wo.completedDate) return false;
      const completed = new Date(wo.completedDate);
      const now = new Date();
      return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
    }).length;

    const upcomingMaintenance = maintenanceItems.filter(item => {
      const dueDate = new Date(item.nextDueDate);
      const now = new Date();
      const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return item.isActive && dueDate <= inSevenDays;
    }).length;

    return {
      openWorkOrders,
      emergencyWorkOrders,
      completedThisMonth,
      upcomingMaintenance,
      totalProperties: filteredProperties.length,
      occupiedUnits: tenants.filter(t => t.status === 'active').length,
      recentWorkOrders: filteredWorkOrders.slice(0, 5)
    };
  }

  async getPropertyManagerStats(managerId: string): Promise<any> {
    const properties = Array.from(this.properties.values()).filter(p => p.managerId === managerId);
    const propertyIds = new Set(properties.map(p => p.id));
    const workOrders = Array.from(this.workOrders.values()).filter(wo => propertyIds.has(wo.propertyId));
    const tenants = Array.from(this.tenants.values()).filter(t => propertyIds.has(t.propertyId));

    const totalUnits = properties.reduce((sum, p) => sum + (p.units || 1), 0);
    const occupiedUnits = tenants.filter(t => t.status === 'active').length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(1) : '0.0';

    const monthlyRent = tenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => sum + parseFloat(t.monthlyRent), 0);

    return {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      occupancyRate,
      monthlyRent: monthlyRent.toFixed(2),
      openWorkOrders: workOrders.filter(wo => wo.status === 'open').length,
      emergencyWorkOrders: workOrders.filter(wo => wo.priority === 'emergency').length
    };
  }

  async getTechnicianStats(technicianId: string): Promise<any> {
    const workOrders = Array.from(this.workOrders.values()).filter(wo => wo.assignedTechnicianId === technicianId);
    
    const assignedOrders = workOrders.filter(wo => wo.status === 'assigned' || wo.status === 'in_progress').length;
    const completedToday = workOrders.filter(wo => {
      if (!wo.completedDate) return false;
      const completed = new Date(wo.completedDate);
      const today = new Date();
      return completed.toDateString() === today.toDateString();
    }).length;

    const completedThisWeek = workOrders.filter(wo => {
      if (!wo.completedDate) return false;
      const completed = new Date(wo.completedDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completed >= weekAgo;
    }).length;

    return {
      assignedOrders,
      completedToday,
      completedThisWeek,
      todaysSchedule: workOrders.filter(wo => {
        if (!wo.scheduledDate) return false;
        const scheduled = new Date(wo.scheduledDate);
        const today = new Date();
        return scheduled.toDateString() === today.toDateString();
      })
    };
  }

  async getOfficeStats(): Promise<any> {
    const workOrders = Array.from(this.workOrders.values());
    const properties = Array.from(this.properties.values());
    const tenants = Array.from(this.tenants.values());
    const users = Array.from(this.users.values());

    const pendingApproval = workOrders.filter(wo => wo.status === 'open' && (wo.estimatedCost || 0) > 500).length;
    const highPriorityOrders = workOrders.filter(wo => wo.priority === 'high' || wo.priority === 'emergency').length;
    
    const leaseExpirations = tenants.filter(t => {
      const leaseEnd = new Date(t.leaseEnd);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return t.status === 'active' && leaseEnd <= thirtyDaysFromNow;
    }).length;

    const activeStaff = users.filter(u => u.status === 'active').length;

    return {
      pendingApproval,
      highPriorityOrders,
      leaseExpirations,
      activeStaff,
      totalProperties: properties.length,
      totalTenants: tenants.filter(t => t.status === 'active').length
    };
  }

  // Inspections
  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }

  async getInspectionsByInspector(inspectorId: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(inspection => inspection.inspectorId === inspectorId);
  }

  async getInspectionsByProperty(propertyId: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(inspection => inspection.propertyId === propertyId);
  }

  async getInspectionsByStatus(status: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(inspection => inspection.status === status);
  }

  async getTodaysInspections(inspectorId: string): Promise<Inspection[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.inspections.values()).filter(inspection => {
      if (inspection.inspectorId !== inspectorId) return false;
      const scheduledDate = new Date(inspection.scheduledDate);
      return scheduledDate >= today && scheduledDate < tomorrow;
    });
  }

  async getPendingReports(inspectorId: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(inspection => 
      inspection.inspectorId === inspectorId && 
      inspection.status === 'completed' && 
      !inspection.findings
    );
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const id = randomUUID();
    const inspection: Inspection = {
      ...insertInspection,
      id,
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inspections.set(id, inspection);
    return inspection;
  }

  async updateInspection(id: string, updates: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const inspection = this.inspections.get(id);
    if (!inspection) return undefined;

    const updatedInspection = { ...inspection, ...updates, updatedAt: new Date() };
    
    if (updates.status === "completed" && inspection.status !== "completed") {
      updatedInspection.completedDate = new Date();
    }

    this.inspections.set(id, updatedInspection);
    return updatedInspection;
  }

  async deleteInspection(id: string): Promise<boolean> {
    return this.inspections.delete(id);
  }

  // User Permissions
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return Array.from(this.userPermissions.values()).filter(permission => permission.userId === userId);
  }

  async checkPermission(userId: string, resourceType: string, resourceId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(p => 
      p.resourceType === resourceType && 
      (p.resourceId === resourceId || p.resourceId === null) && 
      p.permission === permission &&
      (!p.expiresAt || new Date(p.expiresAt) > new Date())
    );
  }

  async grantPermission(insertPermission: InsertUserPermission): Promise<UserPermission> {
    const id = randomUUID();
    const permission: UserPermission = {
      ...insertPermission,
      id,
      grantedAt: new Date(),
    };
    this.userPermissions.set(id, permission);
    return permission;
  }

  async revokePermission(id: string): Promise<boolean> {
    return this.userPermissions.delete(id);
  }

  // Audit Log
  async logAction(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = {
      ...insertAuditLog,
      id,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }

  async getAuditLog(userId?: string, resourceType?: string): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    if (resourceType) {
      logs = logs.filter(log => log.resourceType === resourceType);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInspectorStats(inspectorId: string): Promise<any> {
    const inspections = Array.from(this.inspections.values()).filter(i => i.inspectorId === inspectorId);
    
    const scheduledInspections = inspections.filter(i => i.status === 'scheduled').length;
    
    const completedThisWeek = inspections.filter(i => {
      if (!i.completedDate) return false;
      const completed = new Date(i.completedDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completed >= weekAgo;
    }).length;

    const pendingReports = inspections.filter(i => 
      i.status === 'completed' && !i.findings
    ).length;

    const complianceIssues = inspections.filter(i => 
      i.isCompliant === false || i.overallRating === 'poor' || i.overallRating === 'critical'
    ).length;

    const todaysInspections = await this.getTodaysInspections(inspectorId);

    return {
      scheduledInspections,
      completedThisWeek,
      pendingReports,
      complianceIssues,
      todaysInspections
    };
  }

  // Callback Resolutions
  async getCallbackResolutions(): Promise<CallbackResolution[]> {
    return Array.from(this.callbackResolutions.values());
  }

  async getCallbackResolution(id: string): Promise<CallbackResolution | undefined> {
    return this.callbackResolutions.get(id);
  }

  async getCallbacksByTechnician(technicianId: string): Promise<CallbackResolution[]> {
    return Array.from(this.callbackResolutions.values()).filter(cb => cb.technicianId === technicianId);
  }

  async getCallbacksByJob(jobId: string): Promise<CallbackResolution[]> {
    return Array.from(this.callbackResolutions.values()).filter(cb => cb.jobId === jobId);
  }

  async createCallbackResolution(resolution: InsertCallbackResolution): Promise<CallbackResolution> {
    const id = Date.now().toString();
    const newResolution: CallbackResolution = {
      ...resolution,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.callbackResolutions.set(id, newResolution);
    return newResolution;
  }

  async updateCallbackResolution(id: string, resolution: Partial<InsertCallbackResolution>): Promise<CallbackResolution | undefined> {
    const existing = this.callbackResolutions.get(id);
    if (!existing) return undefined;
    
    const updated: CallbackResolution = {
      ...existing,
      ...resolution,
      updatedAt: new Date(),
    };
    this.callbackResolutions.set(id, updated);
    return updated;
  }

  async deleteCallbackResolution(id: string): Promise<boolean> {
    return this.callbackResolutions.delete(id);
  }

  // Staff Payroll Implementation
  async getStaffPayroll(staffId: string): Promise<StaffPayroll[]> {
    return Array.from(this.staffPayroll.values()).filter(p => p.staffId === staffId);
  }

  async getPayrollByPeriod(payPeriod: string): Promise<StaffPayroll[]> {
    return Array.from(this.staffPayroll.values()).filter(p => p.payPeriod === payPeriod);
  }

  async createPayrollEntry(payroll: InsertStaffPayroll): Promise<StaffPayroll> {
    const id = Date.now().toString();
    const newPayroll: StaffPayroll = {
      ...payroll,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.staffPayroll.set(id, newPayroll);
    return newPayroll;
  }

  async updatePayrollEntry(id: string, payroll: Partial<InsertStaffPayroll>): Promise<StaffPayroll | undefined> {
    const existing = this.staffPayroll.get(id);
    if (!existing) return undefined;
    
    const updated: StaffPayroll = {
      ...existing,
      ...payroll,
      updatedAt: new Date(),
    };
    this.staffPayroll.set(id, updated);
    return updated;
  }

  async deductPayForCallback(jobId: string, callbackId: string): Promise<boolean> {
    // Find the payroll entry for this job
    const payrollEntries = Array.from(this.staffPayroll.values()).filter(p => p.jobId === jobId);
    
    for (const entry of payrollEntries) {
      if (entry.payStatus === "earned") {
        const updated: StaffPayroll = {
          ...entry,
          payStatus: "deducted",
          callbackId: callbackId,
          currentPayAmount: "0.00", // Deduct full amount
          deductedAt: new Date(),
          updatedAt: new Date(),
          notes: `Pay deducted due to callback - Job ${jobId} failed inspection`
        };
        this.staffPayroll.set(entry.id, updated);
      }
    }
    
    return true;
  }

  async restorePayAfterCallback(callbackId: string): Promise<boolean> {
    // Find payroll entries that were deducted for this callback
    const payrollEntries = Array.from(this.staffPayroll.values()).filter(p => p.callbackId === callbackId);
    
    for (const entry of payrollEntries) {
      if (entry.payStatus === "deducted") {
        const updated: StaffPayroll = {
          ...entry,
          payStatus: "restored",
          currentPayAmount: entry.basePayAmount, // Restore original amount
          restoredAt: new Date(),
          updatedAt: new Date(),
          notes: `Pay restored after callback completion - Job ${entry.jobId} verified`
        };
        this.staffPayroll.set(entry.id, updated);
      }
    }
    
    return true;
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
    return Array.from(this.quoteRequests.values())
      .filter(quote => quote.requesterId === requesterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = randomUUID();
    const newQuoteRequest: QuoteRequest = {
      ...quoteRequest,
      id,
      status: 'pending_office_approval',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quoteRequests.set(id, newQuoteRequest);
    return newQuoteRequest;
  }

  async getPendingQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values())
      .filter(quote => quote.status === 'pending_office_approval')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
    const updatedQuoteRequest: QuoteRequest = {
      ...quoteRequest,
      status: 'office_approved',
      scheduledDate: scheduleData.scheduledDate,
      scheduledBy: scheduleData.scheduledBy,
      approvedBy: scheduleData.scheduledBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    this.quoteRequests.set(id, updatedQuoteRequest);

    // Create work order from approved quote request
    const workOrderId = randomUUID();
    const workOrder: WorkOrder = {
      id: workOrderId,
      propertyId: quoteRequest.propertyId || '',
      unitNumber: quoteRequest.unitNumber || '',
      category: quoteRequest.category,
      priority: quoteRequest.priority,
      status: 'scheduled',
      title: quoteRequest.title,
      description: quoteRequest.description,
      assignedTechnicianId: scheduleData.assignedTechnicianId,
      requestedBy: 'property_manager',
      scheduledDate: scheduleData.scheduledDate,
      estimatedCost: scheduleData.estimatedCost,
      notes: scheduleData.notes || '',
      quoteRequestId: id,
      propertyManagerNotified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.workOrders.set(workOrderId, workOrder);

    // Update quote request with work order reference
    updatedQuoteRequest.workOrderId = workOrderId;
    this.quoteRequests.set(id, updatedQuoteRequest);

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

    const updatedQuoteRequest: QuoteRequest = {
      ...quoteRequest,
      status: 'office_rejected',
      rejectedBy: rejectionData.rejectedBy,
      rejectedAt: new Date(),
      rejectionReason: rejectionData.rejectionReason,
      updatedAt: new Date(),
    };
    
    this.quoteRequests.set(id, updatedQuoteRequest);
    return updatedQuoteRequest;
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const updatedNotification: Notification = {
      ...notification,
      isRead: true,
      readAt: new Date(),
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async updateQuoteRequest(id: string, updates: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined> {
    const existing = this.quoteRequests.get(id);
    if (!existing) return undefined;
    
    const updated: QuoteRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.quoteRequests.set(id, updated);
    return updated;
  }

  // Payout calculation for paint and clean jobs
  async createJobPayout(jobId: string, staffId: string, jobType: 'paint' | 'clean', unitCount: number = 1, unitType: 'studio' | '1br' | '2br' | '3br' = 'studio'): Promise<StaffPayroll> {
    // Paint rates based on unit size
    const paintRates = {
      'studio': 175.00,
      '1br': 175.00,
      '2br': 200.00,
      '3br': 225.00
    };
    
    // Clean rates based on unit size
    const cleanRates = {
      'studio': 80.00,
      '1br': 80.00,
      '2br': 95.00,
      '3br': 105.00
    };
    
    const rate = jobType === 'paint' ? paintRates[unitType] : cleanRates[unitType];
    const baseAmount = rate * unitCount;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const payrollEntry: InsertStaffPayroll = {
      staffId,
      jobId,
      jobType,
      basePayAmount: baseAmount.toFixed(2),
      currentPayAmount: baseAmount.toFixed(2),
      payStatus: 'earned',
      payPeriod: currentMonth,
      notes: `${jobType} job payout - ${unitCount} ${unitType} unit(s) at $${rate} per unit`
    };

    return this.createPayrollEntry(payrollEntry);
  }

  async getPayoutRates(): Promise<{ paint: { studio: number; '1br': number; '2br': number; '3br': number }; clean: { studio: number; '1br': number; '2br': number; '3br': number } }> {
    return {
      paint: {
        studio: 175.00,
        '1br': 175.00,
        '2br': 200.00,
        '3br': 225.00
      },
      clean: {
        studio: 80.00,
        '1br': 80.00,
        '2br': 95.00,
        '3br': 105.00
      }
    };
  }

  // Job Management Implementation
  async getJobsByProperty(propertyId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => 
      // Match jobs to properties through work orders or direct property reference
      Array.from(this.workOrders.values()).some(wo => 
        wo.propertyId === propertyId && wo.title.includes(job.title)
      )
    );
  }

  async getJobsAwaitingApproval(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.status === "awaiting_approval");
  }

  async approveJob(jobId: string, approvedBy: string): Promise<Job | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const updatedJob: Job = {
      ...job,
      status: "approved",
      updatedAt: new Date()
    };

    this.jobs.set(jobId, updatedJob);

    // Log the approval action
    await this.logAction({
      userId: approvedBy,
      action: "approve_job",
      resourceType: "job",
      resourceId: jobId,
      details: `Job "${job.title}" approved by office staff`
    });

    return updatedJob;
  }

  async rejectJob(jobId: string, rejectedBy: string, reason: string): Promise<Job | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const updatedJob: Job = {
      ...job,
      status: "rejected",
      updatedAt: new Date()
    };

    this.jobs.set(jobId, updatedJob);

    // Log the rejection action
    await this.logAction({
      userId: rejectedBy,
      action: "reject_job",
      resourceType: "job",
      resourceId: jobId,
      details: `Job "${job.title}" rejected by office staff. Reason: ${reason}`
    });

    return updatedJob;
  }

  async getJobCompletionStats(): Promise<{ scheduled: number; completed: number; pending: number; }> {
    const jobs = Array.from(this.jobs.values());
    
    const scheduled = jobs.filter(job => 
      ["approved", "assigned", "in_progress"].includes(job.status || "")
    ).length;
    
    const completed = jobs.filter(job => job.status === "completed").length;
    const pending = jobs.filter(job => job.status === "awaiting_approval").length;

    return { scheduled, completed, pending };
  }

  // Financial Analytics Implementation
  async getFinancialSummary(): Promise<{ totalBilled: string; totalPaidOut: string; netProfit: string; }> {
    // Calculate total amount billed from completed jobs
    const completedJobs = Array.from(this.jobs.values()).filter(job => job.status === "completed");
    const totalBilled = completedJobs.reduce((sum, job) => {
      return sum + parseFloat(job.budget || "0");
    }, 0);

    // Calculate total amount paid out to staff (current pay amounts)
    const payrollEntries = Array.from(this.staffPayroll.values());
    const totalPaidOut = payrollEntries.reduce((sum, entry) => {
      return sum + parseFloat(entry.currentPayAmount || "0");
    }, 0);

    // Calculate net profit
    const netProfit = totalBilled - totalPaidOut;

    return {
      totalBilled: totalBilled.toFixed(2),
      totalPaidOut: totalPaidOut.toFixed(2),
      netProfit: netProfit.toFixed(2)
    };
  }

  // Extra Dirty Requests Implementation
  async createExtraDirtyRequest(request: InsertExtraDirtyRequest): Promise<ExtraDirtyRequest> {
    const id = randomUUID();
    const extraDirtyRequest: ExtraDirtyRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.extraDirtyRequests.set(id, extraDirtyRequest);
    return extraDirtyRequest;
  }

  async getExtraDirtyRequests(): Promise<ExtraDirtyRequest[]> {
    return Array.from(this.extraDirtyRequests.values());
  }

  async getExtraDirtyRequestsByTechnician(technicianId: string): Promise<ExtraDirtyRequest[]> {
    return Array.from(this.extraDirtyRequests.values()).filter(req => req.technicianId === technicianId);
  }

  async updateExtraDirtyRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<ExtraDirtyRequest | undefined> {
    const request = this.extraDirtyRequests.get(id);
    if (!request) return undefined;

    const updated: ExtraDirtyRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };

    if (status === "office_review") {
      updated.officeReviewedBy = reviewedBy;
      updated.officeReviewedAt = new Date();
      updated.officeNotes = notes;
    } else if (status === "manager_review" || status === "approved" || status === "rejected") {
      updated.managerReviewedBy = reviewedBy;
      updated.managerReviewedAt = new Date();
      updated.managerNotes = notes;
      if (status === "rejected") {
        updated.rejectionReason = notes;
      }
    }

    this.extraDirtyRequests.set(id, updated);
    return updated;
  }

  // Repair Photo Requests Implementation
  async createRepairPhotoRequest(request: InsertRepairPhotoRequest): Promise<RepairPhotoRequest> {
    const id = randomUUID();
    const repairPhotoRequest: RepairPhotoRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.repairPhotoRequests.set(id, repairPhotoRequest);
    return repairPhotoRequest;
  }

  async getRepairPhotoRequests(): Promise<RepairPhotoRequest[]> {
    return Array.from(this.repairPhotoRequests.values());
  }

  async getRepairPhotoRequestsByPainter(painterId: string): Promise<RepairPhotoRequest[]> {
    return Array.from(this.repairPhotoRequests.values()).filter(req => req.painterId === painterId);
  }

  async updateRepairPhotoRequestStatus(id: string, status: string, reviewedBy: string, notes?: string): Promise<RepairPhotoRequest | undefined> {
    const request = this.repairPhotoRequests.get(id);
    if (!request) return undefined;

    const updated: RepairPhotoRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };

    if (status === "office_review") {
      updated.officeReviewedBy = reviewedBy;
      updated.officeReviewedAt = new Date();
      updated.officeNotes = notes;
    } else if (status === "manager_review" || status === "approved" || status === "rejected") {
      updated.managerReviewedBy = reviewedBy;
      updated.managerReviewedAt = new Date();
      updated.managerNotes = notes;
      if (status === "rejected") {
        updated.rejectionReason = notes;
      }
    }

    this.repairPhotoRequests.set(id, updated);
    return updated;
  }

  // Financial Periods Implementation
  async getGeneralDashboardStats() {
    // Calculate real-time job counts
    const scheduledJobs = Array.from(this.jobs.values()).filter(job => job.status === 'scheduled').length;
    const activeJobs = Array.from(this.jobs.values()).filter(job => job.status === 'in_progress').length;
    const completedJobs = Array.from(this.jobs.values()).filter(job => job.status === 'completed').length;
    
    // Calculate real-time financials
    const completedJobsRevenue = Array.from(this.jobs.values())
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + parseFloat(job.amount), 0);
    
    const totalPayouts = Array.from(this.staffPayroll.values())
      .filter(entry => entry.payStatus === 'earned' || entry.payStatus === 'restored')
      .reduce((sum, entry) => sum + parseFloat(entry.currentPayAmount), 0);
    
    const netProfit = completedJobsRevenue - totalPayouts;
    const profitMargin = completedJobsRevenue > 0 ? (netProfit / completedJobsRevenue) * 100 : 0;
    
    // Create bi-weekly period dates
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13); // 14 days total
    endDate.setHours(23, 59, 59, 999);
    
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      scheduledJobs,
      activeJobs,
      completedAndInspected: completedJobs,
      revenueBilled: completedJobsRevenue.toFixed(2),
      totalPayout: totalPayouts.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitMargin: parseFloat(profitMargin.toFixed(1)),
      currentPeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysRemaining,
      },
    };
  }
}

export const storage = new MemStorage();
