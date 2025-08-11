import { type Client, type InsertClient, type Staff, type InsertStaff, type Job, type InsertJob, type TimeEntry, type InsertTimeEntry, type Invoice, type InsertInvoice, type Message, type InsertMessage } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client> = new Map();
  private staff: Map<string, Staff> = new Map();
  private jobs: Map<string, Job> = new Map();
  private timeEntries: Map<string, TimeEntry> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private messages: Map<string, Message> = new Map();
  private invoiceCounter = 1;

  constructor() {
    // Initialize with some staff for the demo
    this.seedData();
  }

  private seedData() {
    // Create some initial staff members
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
}

export const storage = new MemStorage();
