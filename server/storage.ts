import { type Client, type InsertClient, type Staff, type InsertStaff, type Job, type InsertJob, type TimeEntry, type InsertTimeEntry, type Invoice, type InsertInvoice, type Message, type InsertMessage, type User, type InsertUser, type WorkOrder, type InsertWorkOrder, type Property, type InsertProperty, type Tenant, type InsertTenant, type MaintenanceSchedule, type InsertMaintenanceSchedule, type Inspection, type InsertInspection, type UserPermission, type InsertUserPermission, type AuditLog, type InsertAuditLog, type QuoteRequest, type InsertQuoteRequest, type CallbackResolution, type InsertCallbackResolution, type StaffPayroll, type InsertStaffPayroll } from "@shared/schema";
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
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: string, quoteRequest: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined>;

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
  private userPermissions: Map<string, UserPermission> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
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

    // Create sample properties
    const sampleProperties: InsertProperty[] = [
      {
        name: "Sunset Gardens Apartments",
        address: "1234 Sunset Blvd",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90028",
        propertyType: "multi_family",
        units: 24,
        yearBuilt: 1985,
        squareFootage: 18000,
        managerId: Array.from(this.users.values())[0]?.id,
        status: "active",
        monthlyRent: "2400.00"
      },
      {
        name: "Oak Street Townhomes",
        address: "567 Oak Street",
        city: "San Diego",
        state: "CA", 
        zipCode: "92101",
        propertyType: "single_family",
        units: 8,
        yearBuilt: 2010,
        squareFootage: 12000,
        managerId: Array.from(this.users.values())[0]?.id,
        status: "active",
        monthlyRent: "3200.00"
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
    return Array.from(this.workOrders.values()).filter(order => order.assignedTechnicianId === technicianId);
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
}

export const storage = new MemStorage();
