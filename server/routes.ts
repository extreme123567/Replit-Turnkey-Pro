import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { QuickBooksService, type QuickBooksTokens, type CreateInvoiceRequest } from "./quickbooksService";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertClientSchema, insertStaffSchema, insertJobSchema, insertTimeEntrySchema, insertInvoiceSchema, insertMessageSchema, insertQuoteRequestSchema } from "@shared/schema";

// Initialize QuickBooks service
const qbConfig = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
  environment: (process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback',
};

const quickBooksService = new QuickBooksService(qbConfig);

// Store QB tokens in memory (in production, use database)
let qbTokens: QuickBooksTokens | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, updates);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staff = await storage.getStaffMember(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(validatedData);
      res.status(201).json(staff);
    } catch (error) {
      res.status(400).json({ message: "Invalid staff data" });
    }
  });

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const updates = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(req.params.id, updates);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      res.status(400).json({ message: "Invalid staff data" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const success = await storage.deleteStaff(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.get("/api/clients/:clientId/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobsByClient(req.params.clientId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client jobs" });
    }
  });

  app.get("/api/staff/:staffId/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobsByStaff(req.params.staffId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });



  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const updates = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, updates);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const success = await storage.deleteJob(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Time entry routes
  app.get("/api/time-entries", async (req, res) => {
    try {
      const timeEntries = await storage.getTimeEntries();
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get("/api/staff/:staffId/time-entries", async (req, res) => {
    try {
      const timeEntries = await storage.getTimeEntriesByStaff(req.params.staffId);
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff time entries" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      const validatedData = insertTimeEntrySchema.parse(req.body);
      const timeEntry = await storage.createTimeEntry(validatedData);
      res.status(201).json(timeEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid time entry data" });
    }
  });

  app.patch("/api/time-entries/:id", async (req, res) => {
    try {
      const updates = insertTimeEntrySchema.partial().parse(req.body);
      const timeEntry = await storage.updateTimeEntry(req.params.id, updates);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(timeEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid time entry data" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/clients/:clientId/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByClient(req.params.clientId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const updates = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, updates);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation messages" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const { userId, userType } = req.query;
      if (!userId || !userType) {
        return res.status(400).json({ message: "userId and userType are required" });
      }
      const conversations = await storage.getConversations(userId as string, userType as string);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      const clients = await storage.getClients();
      const staff = await storage.getStaff();
      const invoices = await storage.getInvoices();

      const activeJobs = jobs.filter(job => job.status === "in_progress" || job.status === "scheduled").length;
      const totalRevenue = invoices
        .filter(invoice => invoice.status === "paid")
        .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
      const totalHours = staff.reduce((sum, member) => sum + parseFloat(member.hoursThisWeek || "0"), 0);

      const stats = {
        activeJobs,
        revenue: totalRevenue.toFixed(2),
        clients: clients.length,
        staffHours: totalHours.toFixed(1),
        recentJobs: jobs.slice(0, 5)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // General Dashboard with bi-weekly reset
  app.get("/api/dashboard/general-stats", async (req, res) => {
    try {
      const stats = await storage.getGeneralDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching general dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch general dashboard stats" });
    }
  });

  // Get payout rates for paint and clean jobs
  app.get("/api/payroll/rates", async (req, res) => {
    try {
      const rates = await storage.getPayoutRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching payout rates:", error);
      res.status(500).json({ error: "Failed to fetch payout rates" });
    }
  });

  // Create payout for completed paint/clean job
  app.post("/api/payroll/create-payout", async (req, res) => {
    try {
      const { jobId, staffId, jobType, unitCount = 1, unitType = 'studio' } = req.body;
      
      if (!jobId || !staffId || !jobType) {
        return res.status(400).json({ error: "Missing required fields: jobId, staffId, jobType" });
      }
      
      if (!['paint', 'clean'].includes(jobType)) {
        return res.status(400).json({ error: "jobType must be 'paint' or 'clean'" });
      }

      if (!['studio', '1br', '2br', '3br'].includes(unitType)) {
        return res.status(400).json({ error: "unitType must be 'studio', '1br', '2br', or '3br'" });
      }
      
      const payout = await storage.createJobPayout(jobId, staffId, jobType, unitCount, unitType);
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error creating job payout:", error);
      res.status(500).json({ error: "Failed to create job payout" });
    }
  });

  // Property Manager Dashboard
  app.get("/api/dashboard/property-manager/:managerId", async (req, res) => {
    try {
      const stats = await storage.getPropertyManagerStats(req.params.managerId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property manager stats" });
    }
  });

  // Office Staff Dashboard
  app.get("/api/dashboard/office", async (req, res) => {
    try {
      const stats = await storage.getOfficeStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch office stats" });
    }
  });

  // Technician Dashboard
  app.get("/api/dashboard/technician/:technicianId", async (req, res) => {
    try {
      const stats = await storage.getTechnicianStats(req.params.technicianId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch technician stats" });
    }
  });

  // Work Orders routes
  app.get("/api/work-orders", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrders();
      res.json(workOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work orders" });
    }
  });

  app.get("/api/work-orders/:id", async (req, res) => {
    try {
      const workOrder = await storage.getWorkOrder(req.params.id);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work order" });
    }
  });

  app.get("/api/work-orders/technician/:technicianId", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrdersByTechnician(req.params.technicianId);
      res.json(workOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch technician work orders" });
    }
  });

  app.get("/api/work-orders/manager/:managerId", async (req, res) => {
    try {
      // Get properties managed by this manager first
      const properties = await storage.getPropertiesByManager(req.params.managerId);
      const propertyIds = properties.map(p => p.id);
      
      // Get work orders for these properties
      const allWorkOrders = await storage.getWorkOrders();
      const workOrders = allWorkOrders.filter(wo => propertyIds.includes(wo.propertyId));
      
      res.json(workOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manager work orders" });
    }
  });

  app.get("/api/work-orders/today/:technicianId", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrdersByTechnician(req.params.technicianId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysOrders = workOrders.filter(wo => {
        if (!wo.scheduledDate) return false;
        const scheduledDate = new Date(wo.scheduledDate);
        return scheduledDate >= today && scheduledDate < tomorrow;
      });

      res.json(todaysOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's schedule" });
    }
  });

  app.get("/api/work-orders/pending-approval", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrders();
      const pendingApproval = workOrders.filter(wo => 
        wo.status === 'open' && wo.estimatedCost && parseFloat(wo.estimatedCost) > 500
      );
      res.json(pendingApproval);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.post("/api/work-orders", async (req, res) => {
    try {
      const workOrder = await storage.createWorkOrder(req.body);
      res.status(201).json(workOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create work order" });
    }
  });

  app.put("/api/work-orders/:id", async (req, res) => {
    try {
      const workOrder = await storage.updateWorkOrder(req.params.id, req.body);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update work order" });
    }
  });

  app.delete("/api/work-orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Work order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete work order" });
    }
  });

  // Start a work order (technician starts working on assigned job)
  app.post("/api/work-orders/:id/start", async (req, res) => {
    try {
      const { status, startedAt, technicianId } = req.body;
      const workOrder = await storage.getWorkOrder(req.params.id);
      
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      // Update work order status to in_progress
      const updatedWorkOrder = await storage.updateWorkOrder(req.params.id, {
        status: 'in_progress',
        startedAt: startedAt,
        assignedTo: technicianId
      });

      console.log(`Work order ${req.params.id} started by technician ${technicianId}`);
      console.log("Office and property management teams notified of job start");

      res.json({
        message: "Work order started successfully",
        workOrder: updatedWorkOrder
      });
    } catch (error) {
      console.error("Error starting work order:", error);
      res.status(500).json({ error: "Failed to start work order" });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/manager/:managerId", async (req, res) => {
    try {
      const properties = await storage.getPropertiesByManager(req.params.managerId);
      
      // Add work-based revenue calculations to each property
      const propertiesWithRevenue = properties.map(property => ({
        ...property,
        // Convert monthlyRent field to YTD work revenue
        yearToDateWorkRevenue: parseFloat(property.monthlyRent || "0"),
        // Calculate estimated jobs completed (assuming avg $480/job)
        completedJobs: Math.floor(parseFloat(property.monthlyRent || "0") / 480),
        averageJobValue: parseFloat(property.monthlyRent || "0") > 0 ? Math.round(parseFloat(property.monthlyRent || "0") / Math.floor(parseFloat(property.monthlyRent || "0") / 480)) : 0,
        // Revenue progress (comparing to annual target)
        revenueProgress: Math.min((parseFloat(property.monthlyRent || "0") / 150000) * 100, 100) // Assuming $150k annual target
      }));
      
      res.json(propertiesWithRevenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manager properties" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const property = await storage.createProperty(req.body);
      res.status(201).json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  // Tenants routes
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/expiring-leases", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const tenants = await storage.getTenants();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);
      
      const expiringLeases = tenants.filter(tenant => {
        const leaseEnd = new Date(tenant.leaseEnd);
        return tenant.status === 'active' && leaseEnd <= cutoffDate;
      });
      
      res.json(expiringLeases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expiring leases" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Inspector Dashboard
  app.get("/api/dashboard/inspector/:inspectorId", async (req, res) => {
    try {
      const stats = await storage.getInspectorStats(req.params.inspectorId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspector stats" });
    }
  });

  // Inspections routes
  app.get("/api/inspections", async (req, res) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspections" });
    }
  });

  app.get("/api/inspections/inspector/:inspectorId", async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByInspector(req.params.inspectorId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspector inspections" });
    }
  });

  app.get("/api/inspections/today/:inspectorId", async (req, res) => {
    try {
      const inspections = await storage.getTodaysInspections(req.params.inspectorId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's inspections" });
    }
  });

  app.get("/api/inspections/pending-reports/:inspectorId", async (req, res) => {
    try {
      const reports = await storage.getPendingReports(req.params.inspectorId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending reports" });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const inspection = await storage.createInspection(req.body);
      res.status(201).json(inspection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inspection" });
    }
  });

  app.put("/api/inspections/:id", async (req, res) => {
    try {
      const inspection = await storage.updateInspection(req.params.id, req.body);
      if (!inspection) {
        return res.status(404).json({ error: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inspection" });
    }
  });

  // Quote Request routes
  app.get("/api/quote-requests", async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequests();
      res.json(quoteRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote requests" });
    }
  });

  app.get("/api/quote-requests/:id", async (req, res) => {
    try {
      const quoteRequest = await storage.getQuoteRequest(req.params.id);
      if (!quoteRequest) {
        return res.status(404).json({ error: "Quote request not found" });
      }
      res.json(quoteRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote request" });
    }
  });

  app.get("/api/quote-requests/requester/:requesterId", async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequestsByRequester(req.params.requesterId);
      res.json(quoteRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requester quote requests" });
    }
  });

  app.post("/api/quote-requests", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(201).json(quoteRequest);
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(400).json({ error: "Invalid quote request data" });
    }
  });

  app.put("/api/quote-requests/:id", async (req, res) => {
    try {
      const quoteRequest = await storage.updateQuoteRequest(req.params.id, req.body);
      if (!quoteRequest) {
        return res.status(404).json({ error: "Quote request not found" });
      }
      res.json(quoteRequest);
    } catch (error) {
      console.error("Error updating quote request:", error);
      res.status(500).json({ error: "Failed to update quote request" });
    }
  });

  // User Permissions routes
  app.get("/api/users/:userId/permissions", async (req, res) => {
    try {
      const permissions = await storage.getUserPermissions(req.params.userId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user permissions" });
    }
  });

  app.post("/api/permissions/check", async (req, res) => {
    try {
      const { userId, resourceType, resourceId, permission } = req.body;
      const hasPermission = await storage.checkPermission(userId, resourceType, resourceId, permission);
      res.json({ hasPermission });
    } catch (error) {
      res.status(500).json({ error: "Failed to check permission" });
    }
  });

  app.post("/api/permissions", async (req, res) => {
    try {
      const permission = await storage.grantPermission(req.body);
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({ error: "Failed to grant permission" });
    }
  });

  // Object Storage Routes
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Enhanced Work Order Approval Routes
  app.get("/api/work-orders/pending-approval", async (req, res) => {
    try {
      const pendingOrders = await storage.getWorkOrdersByStatus("pending_approval");
      res.json(pendingOrders);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.put("/api/work-orders/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      await storage.updateWorkOrder(id, {
        status: "approved",
        approvedById: approvedBy,
        approvedAt: new Date(),
      });
      
      res.json({ message: "Work order approved successfully" });
    } catch (error) {
      console.error("Error approving work order:", error);
      res.status(500).json({ error: "Failed to approve work order" });
    }
  });

  app.put("/api/work-orders/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectedBy, reason } = req.body;
      
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      await storage.updateWorkOrder(id, {
        status: "rejected",
        rejectionReason: reason,
      });
      
      res.json({ message: "Work order rejected successfully" });
    } catch (error) {
      console.error("Error rejecting work order:", error);
      res.status(500).json({ error: "Failed to reject work order" });
    }
  });

  // Work Order Image Upload
  app.post("/api/work-orders/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrls, imageType } = req.body; // imageType: 'before' | 'after'
      
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      const updateData: any = {};
      if (imageType === 'before') {
        updateData.beforeImages = imageUrls;
      } else if (imageType === 'after') {
        updateData.afterImages = imageUrls;
        // If this work order requires approval and has both before/after images, mark as pending approval
        if (workOrder.requiresApproval && workOrder.beforeImages && imageUrls.length >= 2) {
          updateData.status = "pending_approval";
        }
      }

      await storage.updateWorkOrder(id, updateData);
      res.json({ message: "Images uploaded successfully" });
    } catch (error) {
      console.error("Error uploading work order images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });

  // Quote Request routes
  app.get("/api/quote-requests", async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequests();
      res.json(quoteRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote requests" });
    }
  });

  app.get("/api/quote-requests/:id", async (req, res) => {
    try {
      const quoteRequest = await storage.getQuoteRequest(req.params.id);
      if (!quoteRequest) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      res.json(quoteRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote request" });
    }
  });

  app.post("/api/quote-requests", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(201).json(quoteRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote request data" });
    }
  });

  app.patch("/api/quote-requests/:id", async (req, res) => {
    try {
      const updates = insertQuoteRequestSchema.partial().parse(req.body);
      const quoteRequest = await storage.updateQuoteRequest(req.params.id, updates);
      if (!quoteRequest) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      res.json(quoteRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote request data" });
    }
  });

  app.get("/api/quote-requests/requester/:requesterId", async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequestsByRequester(req.params.requesterId);
      res.json(quoteRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote requests for requester" });
    }
  });

  // Enhanced messaging for property managers
  app.post("/api/messages/property-manager", async (req, res) => {
    try {
      const { recipient, subject, message, senderId } = req.body;
      
      // Create a structured message for property manager communication
      const messageData = {
        senderId: senderId,
        recipientId: recipient === 'all-office-staff' ? null : recipient,
        conversationId: `pm-office-${Date.now()}`,
        message: message,
        metadata: JSON.stringify({
          subject: subject,
          senderType: 'property_manager',
          recipientType: recipient === 'all-office-staff' ? 'all_office_staff' : 'office_staff',
          priority: 'normal'
        })
      };

      const createdMessage = await storage.createMessage(messageData);
      res.status(201).json(createdMessage);
    } catch (error) {
      console.error("Error creating property manager message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Helper function to get job type display name
  function getJobTypeName(jobType: string): string {
    const jobTypeNames: Record<string, string> = {
      punch: "Punch List",
      repairs: "Repairs", 
      paint: "Paint",
      clean: "Clean",
      carpet: "Carpet",
      "bulk-trash": "Bulk Trash",
      unit_trash_out: "Unit Trash Out",
      onsite_bulk_trash: "Onsite Bulk Trash",
      inspected: "Final Inspection"
    };
    return jobTypeNames[jobType] || jobType;
  }

  // Job Scheduling API
  app.post("/api/jobs/schedule", async (req, res) => {
    try {
      // Handle multiple scheduling formats:
      // 1. Office Staff multi-job checkbox scheduling (new)
      // 2. Single job scheduling (Office Staff)
      // 3. Multi-job scheduling (Property Manager)
      const { 
        // Office Staff multi-job checkbox fields (new)
        property, unitNumber, bedroomSize, jobTypes, location, scheduledDate, notes, assignedTechnician, priority, scheduledBy,
        // Single job fields (Office Staff)
        type, propertyAddress,
        // Multi-job fields (Property Manager)
        propertyId, moveInDate, completionDate, selectedJobs
      } = req.body;

      console.log("Received schedule request:", req.body);

      // Office Staff multi-job checkbox scheduling (new format)
      if (property && unitNumber && bedroomSize && jobTypes && Array.isArray(jobTypes) && jobTypes.length > 0 && location && scheduledDate) {
        const scheduledJobs = [];
        for (const jobType of jobTypes) {
          // Determine photo requirements for trash jobs
          const photosRequired = (jobType === 'bulk-trash' || jobType === 'unit_trash_out') ? 2 : 0;
          const photosToOffice = photosRequired > 0;
          
          const workOrder = await storage.createWorkOrder({
            propertyId: property,
            unitNumber,
            category: "maintenance",
            jobType,
            priority: priority || "medium",
            title: `${getJobTypeName(jobType)} - ${property} Unit ${unitNumber}`,
            description: `${getJobTypeName(jobType)} work for ${bedroomSize} unit ${unitNumber} at ${property}. Location: ${location}${notes ? `. Notes: ${notes}` : ''}`,
            scheduledDate: new Date(scheduledDate),
            assignedTo: assignedTechnician || null,
            requestedBy: scheduledBy || "office-staff",
            photosRequired,
            photosToOffice,
            photosSubmitted: [],
          });
          
          scheduledJobs.push(workOrder);
        }
        
        res.json({ 
          success: true, 
          jobsScheduled: scheduledJobs.length,
          jobs: scheduledJobs 
        });
        return;
      }

      // Office Staff single job scheduling (legacy format)
      if (type && unitNumber && propertyAddress && scheduledDate) {
        const workOrder = await storage.createWorkOrder({
          propertyId: propertyId || "default-property",
          unitNumber,
          category: "maintenance",
          jobType: type,
          priority: priority || "medium",
          title: `${getJobTypeName(type)} - Unit ${unitNumber}`,
          description: `${getJobTypeName(type)} for unit ${unitNumber} at ${propertyAddress}. ${notes || ''}`,
          scheduledDate: new Date(scheduledDate),
          assignedTo: assignedTechnician || null,
          requestedBy: scheduledBy || "office-staff",
          photosRequired: (type === 'bulk-trash' || type === 'unit_trash_out') ? 2 : 0,
          photosToOffice: (type === 'bulk-trash' || type === 'unit_trash_out'),
          photosSubmitted: [],
        });
        
        res.json({ 
          success: true, 
          jobsScheduled: 1,
          jobs: [workOrder] 
        });
        return;
      }

      // Property Manager multi-job scheduling (legacy format)
      if (selectedJobs && moveInDate && unitNumber) {
        const scheduledJobs = [];
        for (let i = 0; i < selectedJobs.length; i++) {
          const jobType = selectedJobs[i];
          const scheduledJobDate = new Date(moveInDate);
          scheduledJobDate.setDate(scheduledJobDate.getDate() + i); // Stagger jobs by day
          
          // Determine photo requirements for trash jobs
          const photosRequired = (jobType === 'unit_trash_out' || jobType === 'onsite_bulk_trash') ? 2 : 0;
          const photosToOffice = photosRequired > 0;
          
          const workOrder = await storage.createWorkOrder({
            propertyId: propertyId || "default-property",
            unitNumber,
            category: "maintenance",
            jobType,
            priority: priority || "medium",
            title: `${getJobTypeName(jobType)} - Unit ${unitNumber}`,
            description: `${getJobTypeName(jobType)} for unit ${unitNumber}. ${notes || ''}`,
            scheduledDate: scheduledJobDate,
            photosRequired,
            photosToOffice,
            photosSubmitted: [],
          });
          
          scheduledJobs.push(workOrder);
        }
        
        res.json({ 
          success: true, 
          jobsScheduled: scheduledJobs.length,
          jobs: scheduledJobs 
        });
        return;
      }

      // Invalid request
      res.status(400).json({ error: "Invalid job scheduling request. Missing required fields." });
    } catch (error) {
      console.error("Error scheduling jobs:", error);
      res.status(500).json({ error: "Failed to schedule jobs" });
    }
  });

  // Get scheduled jobs for a property
  app.get("/api/jobs/scheduled/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const allWorkOrders = await storage.getWorkOrders();
      const scheduledJobs = allWorkOrders.filter(wo => wo.propertyId === propertyId);
      res.json(scheduledJobs);
    } catch (error) {
      console.error("Error fetching scheduled jobs:", error);
      res.status(500).json({ error: "Failed to fetch scheduled jobs" });
    }
  });

  // QuickBooks OAuth Routes
  app.get("/api/quickbooks/auth", (req, res) => {
    try {
      const authUrl = quickBooksService.getAuthorizationUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ error: "Failed to generate authorization URL" });
    }
  });

  app.get("/api/quickbooks/callback", async (req, res) => {
    try {
      const { code, realmId } = req.query;
      
      if (!code || !realmId) {
        return res.status(400).json({ error: "Missing authorization code or realm ID" });
      }

      const tokens = await quickBooksService.exchangeCodeForTokens(code as string, realmId as string);
      qbTokens = tokens;
      quickBooksService.initializeClient(tokens);

      res.redirect("/invoices?qb_connected=true");
    } catch (error) {
      console.error("Error handling QuickBooks callback:", error);
      res.status(500).json({ error: "Failed to complete QuickBooks authorization" });
    }
  });

  // QuickBooks connection status
  app.get("/api/quickbooks/status", async (req, res) => {
    try {
      if (!qbTokens) {
        return res.json({ connected: false });
      }

      // Check if token is expired
      const isExpired = new Date() > qbTokens.expiresAt;
      if (isExpired && qbTokens.refreshToken) {
        try {
          const newTokens = await quickBooksService.refreshAccessToken(qbTokens.refreshToken);
          newTokens.companyId = qbTokens.companyId;
          qbTokens = newTokens;
          quickBooksService.initializeClient(qbTokens);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          return res.json({ connected: false, error: "Token expired and refresh failed" });
        }
      }

      const isConnected = await quickBooksService.testConnection();
      res.json({ 
        connected: isConnected,
        companyId: qbTokens.companyId,
        expiresAt: qbTokens.expiresAt
      });
    } catch (error) {
      console.error("Error checking QuickBooks status:", error);
      res.json({ connected: false, error: "Connection test failed" });
    }
  });

  // Sync invoice to QuickBooks
  app.post("/api/invoices/:id/sync-to-quickbooks", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!qbTokens) {
        return res.status(400).json({ error: "QuickBooks not connected" });
      }

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const client = await storage.getClient(invoice.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Create or find customer in QuickBooks
      let customers = await quickBooksService.getCustomers();
      let qbCustomer = customers.find((c: any) => 
        c.Name === client.name || c.PrimaryEmailAddr?.Address === client.email
      );

      if (!qbCustomer) {
        qbCustomer = await quickBooksService.createCustomer(
          client.name,
          client.email,
          {
            Line1: client.address,
            City: client.city,
            CountrySubDivisionCode: client.state,
            PostalCode: client.zipCode,
          }
        );
      }

      // Prepare invoice data
      const invoiceRequest: CreateInvoiceRequest = {
        customerId: qbCustomer.Id,
        customerName: client.name,
        customerEmail: client.email,
        lineItems: [
          {
            amount: parseFloat(invoice.amount),
            description: invoice.description || `Invoice ${invoice.invoiceNumber}`,
            itemName: "Property Management Services",
            quantity: 1,
            unitPrice: parseFloat(invoice.amount),
          }
        ],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : undefined,
        invoiceNumber: invoice.invoiceNumber,
        memo: invoice.description,
      };

      const qbInvoice = await quickBooksService.createInvoice(invoiceRequest);
      
      // Update local invoice with QuickBooks ID
      await storage.updateInvoice(id, {
        quickbooksId: qbInvoice.Id,
        quickbooksDocNumber: qbInvoice.DocNumber,
      });

      res.json({
        success: true,
        quickbooksInvoice: qbInvoice,
        quickbooksId: qbInvoice.Id,
        docNumber: qbInvoice.DocNumber,
      });
    } catch (error) {
      console.error("Error syncing invoice to QuickBooks:", error);
      res.status(500).json({ 
        error: "Failed to sync invoice to QuickBooks",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get QuickBooks customers
  app.get("/api/quickbooks/customers", async (req, res) => {
    try {
      if (!qbTokens) {
        return res.status(400).json({ error: "QuickBooks not connected" });
      }

      const customers = await quickBooksService.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching QuickBooks customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Development endpoint to seed test data
  app.post("/api/dev/seed-data", async (req, res) => {
    try {
      // Create sample properties for testing
      const property1 = await storage.createProperty({
        name: "Sunset Apartments",
        address: "123 Main Street",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        propertyType: "apartment",
        units: 50,
        managerId: "pm-1"
      });

      const property2 = await storage.createProperty({
        name: "Oak Ridge Condos",
        address: "456 Oak Avenue", 
        city: "Springfield",
        state: "IL",
        zipCode: "62702",
        propertyType: "condo",
        units: 30,
        managerId: "pm-1"
      });

      res.json({ 
        message: "Sample data created successfully",
        properties: [property1, property2]
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  // Inspector and Job Inspection Routes
  
  // Get jobs ready for inspection
  app.get("/api/jobs/for-inspection/:inspectorId", async (req, res) => {
    try {
      // Mock data for jobs ready for inspection
      const jobsForInspection = [
        {
          id: "job-1",
          jobType: "Clean",
          unit: "Unit 205",
          property: "Sunset Apartments",
          technicianName: "David Lee",
          completedAt: new Date().toISOString(),
          status: "completed"
        },
        {
          id: "job-2", 
          jobType: "Paint",
          unit: "Unit 301",
          property: "Oak Ridge Condos",
          technicianName: "Mike Johnson",
          completedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          status: "completed"
        },
        {
          id: "job-3",
          jobType: "Carpet",
          unit: "Unit 150",
          property: "Sunset Apartments", 
          technicianName: "Alex Chen",
          completedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: "completed"
        }
      ];
      
      res.json(jobsForInspection);
    } catch (error) {
      console.error("Error fetching jobs for inspection:", error);
      res.status(500).json({ error: "Failed to fetch jobs for inspection" });
    }
  });

  // Complete job inspection with photos and callback handling
  app.put("/api/jobs/:jobId/inspect", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { status, notes, photos, callbackNotes } = req.body;
      
      console.log(`Job ${jobId} inspection completed with status: ${status}`);
      
      // Process uploaded photos
      if (photos && photos.length > 0) {
        const objectStorageService = new ObjectStorageService();
        const processedPhotos = [];
        
        for (const photoUrl of photos) {
          try {
            const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
              photoUrl,
              {
                owner: "inspector-1", // In real app, get from authenticated user
                visibility: "private", // Photos are private by default
              }
            );
            processedPhotos.push(objectPath);
          } catch (error) {
            console.error("Error processing photo:", error);
          }
        }
        
        console.log(`Processed ${processedPhotos.length} photos for job ${jobId}`);
      }
      
      if (status === "callback") {
        // Create callback notification for office staff and technician
        const callbackData = {
          senderId: "inspector-1",
          recipientId: null, // Send to all office staff
          conversationId: `callback-${jobId}-${Date.now()}`,
          message: `Job inspection failed for Job ${jobId}. Callback required.\n\nNotes: ${notes}\n\nCallback Reason: ${callbackNotes}`,
          metadata: JSON.stringify({
            subject: `Callback Required - Job ${jobId}`,
            type: "callback_notification",
            jobId: jobId,
            inspectionPhotos: photos || [],
            callbackReason: callbackNotes,
            priority: "high"
          })
        };
        
        await storage.createMessage(callbackData);
        
        // Also send to the technician who completed the job
        const technicianMessage = {
          senderId: "inspector-1",
          recipientId: "technician-id", // Would get from job data in real app
          conversationId: `callback-tech-${jobId}-${Date.now()}`,
          message: `Your completed job ${jobId} requires a callback.\n\nInspector Notes: ${notes}\n\nCallback Reason: ${callbackNotes}`,
          metadata: JSON.stringify({
            subject: `Callback Required - Your Job ${jobId}`,
            type: "technician_callback",
            jobId: jobId,
            inspectionPhotos: photos || [],
            callbackReason: callbackNotes,
            priority: "high"
          })
        };
        
        await storage.createMessage(technicianMessage);
        
        console.log(`Callback notifications sent for job ${jobId}`);
      } else if (status === "pass") {
        console.log(`Job ${jobId} approved by inspector`);
      }
      
      res.json({ 
        message: `Job inspection completed with status: ${status}`,
        jobId: jobId,
        status: status,
        photosUploaded: photos?.length || 0
      });
    } catch (error) {
      console.error("Error completing job inspection:", error);
      res.status(500).json({ error: "Failed to complete job inspection" });
    }
  });

  // Inspector dashboard stats
  app.get("/api/dashboard/inspector/:inspectorId", async (req, res) => {
    try {
      const stats = {
        scheduledInspections: 5,
        completedThisWeek: 12,
        pendingReports: 3,
        complianceIssues: 1,
        todaysInspections: []
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching inspector stats:", error);
      res.status(500).json({ error: "Failed to fetch inspector dashboard stats" });
    }
  });

  // Object Storage Routes
  
  // Get upload URL for object storage
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // For demo purposes, allow access. In production, implement proper ACL checks
      // const canAccess = await objectStorageService.canAccessObjectEntity({
      //   objectFile,
      //   userId: userId, // Get from authentication
      //   requestedPermission: ObjectPermission.READ,
      // });
      // if (!canAccess) {
      //   return res.sendStatus(401);
      // }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Callback Resolution API Routes

  // Get callbacks assigned to a technician
  app.get("/api/callbacks/technician/:technicianId", async (req, res) => {
    try {
      const { technicianId } = req.params;
      const callbacks = await storage.getCallbacksByTechnician(technicianId);
      res.json(callbacks);
    } catch (error) {
      console.error("Error fetching technician callbacks:", error);
      res.status(500).json({ error: "Failed to fetch callbacks" });
    }
  });

  // Create a new callback resolution (when technician starts working on callback)
  app.post("/api/callbacks/resolve", async (req, res) => {
    try {
      const {
        jobId,
        originalInspectorId,
        technicianId,
        callbackReason,
        resolutionNotes
      } = req.body;

      const callbackResolution = await storage.createCallbackResolution({
        jobId,
        originalInspectorId,
        technicianId,
        callbackReason,
        resolutionNotes,
        status: "in_progress",
        beforePhotos: [],
        afterPhotos: []
      });

      // Deduct pay for the failed job
      await storage.deductPayForCallback(jobId, callbackResolution.id);

      console.log(`Pay deducted for callback on job ${jobId} - technician ${technicianId}`);

      res.status(201).json(callbackResolution);
    } catch (error) {
      console.error("Error creating callback resolution:", error);
      res.status(500).json({ error: "Failed to create callback resolution" });
    }
  });

  // Complete callback resolution with photos
  app.put("/api/callbacks/:callbackId/complete", async (req, res) => {
    try {
      const { callbackId } = req.params;
      const { resolutionNotes, afterPhotos, timeSpent } = req.body;

      // Process uploaded photos
      const objectStorageService = new ObjectStorageService();
      const processedPhotos = [];
      
      if (afterPhotos && afterPhotos.length > 0) {
        for (const photoUrl of afterPhotos) {
          try {
            const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
              photoUrl,
              {
                owner: "technician-1", // In real app, get from authenticated user
                visibility: "private",
              }
            );
            processedPhotos.push(objectPath);
          } catch (error) {
            console.error("Error processing callback photo:", error);
          }
        }
      }

      // Update callback resolution to completed
      const updatedCallback = await storage.updateCallbackResolution(callbackId, {
        resolutionNotes,
        afterPhotos: processedPhotos,
        timeSpent,
        status: "completed",
        completedAt: new Date()
      });

      if (!updatedCallback) {
        return res.status(404).json({ error: "Callback resolution not found" });
      }

      // Send notifications to inspector and office staff
      const inspectorNotification = {
        senderId: updatedCallback.technicianId,
        recipientId: updatedCallback.originalInspectorId,
        conversationId: `callback-completed-${updatedCallback.jobId}-${Date.now()}`,
        message: `Callback work completed for Job ${updatedCallback.jobId}.\n\nResolution: ${resolutionNotes}\n\nTime spent: ${timeSpent} minutes\n\nPhotos uploaded: ${processedPhotos.length}\n\nPlease review photos to verify completion - no site visit required.`,
        metadata: JSON.stringify({
          subject: `Photo Verification Required - Job ${updatedCallback.jobId}`,
          type: "callback_photo_verification",
          jobId: updatedCallback.jobId,
          callbackId: callbackId,
          resolutionPhotos: processedPhotos,
          timeSpent: timeSpent,
          priority: "normal"
        })
      };

      await storage.createMessage(inspectorNotification);

      // Notify office staff
      const officeNotification = {
        senderId: updatedCallback.technicianId,
        recipientId: null, // Send to all office staff
        conversationId: `callback-completed-office-${updatedCallback.jobId}-${Date.now()}`,
        message: `Callback work completed by technician for Job ${updatedCallback.jobId}.\n\nOriginal Issue: ${updatedCallback.callbackReason}\n\nResolution: ${resolutionNotes}\n\nTime spent: ${timeSpent} minutes\n\nPhotos uploaded for verification - inspector will review remotely.`,
        metadata: JSON.stringify({
          subject: `Callback Photos Ready for Review - Job ${updatedCallback.jobId}`,
          type: "callback_photo_review",
          jobId: updatedCallback.jobId,
          callbackId: callbackId,
          resolutionPhotos: processedPhotos,
          technicianId: updatedCallback.technicianId,
          priority: "normal"
        })
      };

      await storage.createMessage(officeNotification);

      console.log(`Callback completion notifications sent for job ${updatedCallback.jobId}`);

      res.json({
        message: "Callback resolution completed successfully",
        callbackId: callbackId,
        photosUploaded: processedPhotos.length,
        timeSpent: timeSpent
      });
    } catch (error) {
      console.error("Error completing callback resolution:", error);
      res.status(500).json({ error: "Failed to complete callback resolution" });
    }
  });

  // Get callbacks for a specific job
  app.get("/api/callbacks/job/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const callbacks = await storage.getCallbacksByJob(jobId);
      res.json(callbacks);
    } catch (error) {
      console.error("Error fetching job callbacks:", error);
      res.status(500).json({ error: "Failed to fetch job callbacks" });
    }
  });

  // Get all callback resolutions
  app.get("/api/callbacks", async (req, res) => {
    try {
      const callbacks = await storage.getCallbackResolutions();
      res.json(callbacks);
    } catch (error) {
      console.error("Error fetching all callbacks:", error);
      res.status(500).json({ error: "Failed to fetch callbacks" });
    }
  });

  // Inspector photo verification - approve callback work based on photos
  app.put("/api/callbacks/:callbackId/verify", async (req, res) => {
    try {
      const { callbackId } = req.params;
      const { inspectorId, verified, verificationNotes } = req.body;

      // Update callback resolution as verified
      const updatedCallback = await storage.updateCallbackResolution(callbackId, {
        status: verified ? "verified" : "needs_revision", 
        verifiedBy: inspectorId,
        verifiedAt: new Date()
      });

      if (!updatedCallback) {
        return res.status(404).json({ error: "Callback resolution not found" });
      }

      if (verified) {
        // Notify office staff that callback is fully resolved
        const completionNotification = {
          senderId: inspectorId,
          recipientId: null, // Send to all office staff
          conversationId: `callback-verified-${updatedCallback.jobId}-${Date.now()}`,
          message: `Callback work verified and approved for Job ${updatedCallback.jobId}.\n\nOriginal Issue: ${updatedCallback.callbackReason}\n\nResolution: ${updatedCallback.resolutionNotes}\n\nInspector Notes: ${verificationNotes}\n\nJob is now fully complete.`,
          metadata: JSON.stringify({
            subject: `Callback Verified - Job ${updatedCallback.jobId} Complete`,
            type: "callback_verified",
            jobId: updatedCallback.jobId,
            callbackId: callbackId,
            priority: "low"
          })
        };

        await storage.createMessage(completionNotification);

        // Notify technician of successful verification
        const technicianNotification = {
          senderId: inspectorId,
          recipientId: updatedCallback.technicianId,
          conversationId: `callback-approved-tech-${updatedCallback.jobId}-${Date.now()}`,
          message: `Great work! Your callback resolution for Job ${updatedCallback.jobId} has been verified and approved.\n\nInspector Notes: ${verificationNotes}\n\nThank you for the quality work.`,
          metadata: JSON.stringify({
            subject: `Callback Work Approved - Job ${updatedCallback.jobId}`,
            type: "callback_approved",
            jobId: updatedCallback.jobId,
            callbackId: callbackId,
            priority: "low"
          })
        };

        await storage.createMessage(technicianNotification);

        // Restore pay after successful verification
        await storage.restorePayAfterCallback(callbackId);

        console.log(`Callback verification complete and pay restored for job ${updatedCallback.jobId}`);
      } else {
        // If not verified, notify technician of needed revisions
        const revisionNotification = {
          senderId: inspectorId,
          recipientId: updatedCallback.technicianId,
          conversationId: `callback-revision-${updatedCallback.jobId}-${Date.now()}`,
          message: `Additional work needed for Job ${updatedCallback.jobId} callback.\n\nInspector Notes: ${verificationNotes}\n\nPlease address the issues and upload new photos.`,
          metadata: JSON.stringify({
            subject: `Callback Needs Revision - Job ${updatedCallback.jobId}`,
            type: "callback_revision_needed",
            jobId: updatedCallback.jobId,
            callbackId: callbackId,
            priority: "high"
          })
        };

        await storage.createMessage(revisionNotification);
      }

      res.json({
        message: verified ? "Callback work verified and approved" : "Callback needs revision",
        callbackId: callbackId,
        verified: verified
      });
    } catch (error) {
      console.error("Error verifying callback:", error);
      res.status(500).json({ error: "Failed to verify callback" });
    }
  });

  // Staff Payroll API Routes

  // Get payroll for a specific staff member
  app.get("/api/payroll/staff/:staffId", async (req, res) => {
    try {
      const { staffId } = req.params;
      const payrollEntries = await storage.getStaffPayroll(staffId);
      
      // Calculate totals
      const totalEarned = payrollEntries
        .filter(p => p.payStatus === "earned" || p.payStatus === "restored")
        .reduce((sum, p) => sum + parseFloat(p.currentPayAmount || "0"), 0);
      
      const totalDeducted = payrollEntries
        .filter(p => p.payStatus === "deducted")
        .reduce((sum, p) => sum + parseFloat(p.basePayAmount || "0"), 0);

      res.json({
        entries: payrollEntries,
        summary: {
          totalEarned: totalEarned.toFixed(2),
          totalDeducted: totalDeducted.toFixed(2),
          netPay: (totalEarned - totalDeducted).toFixed(2),
          entriesCount: payrollEntries.length
        }
      });
    } catch (error) {
      console.error("Error fetching staff payroll:", error);
      res.status(500).json({ error: "Failed to fetch payroll" });
    }
  });

  // Create payroll entry when job is completed
  app.post("/api/payroll/create", async (req, res) => {
    try {
      const { staffId, jobId, jobType, basePayAmount } = req.body;
      
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const payrollEntry = await storage.createPayrollEntry({
        staffId,
        jobId,
        jobType,
        basePayAmount,
        currentPayAmount: basePayAmount,
        payStatus: "earned",
        payPeriod: currentMonth,
        notes: `Payment for ${jobType} job completion`
      });

      res.status(201).json(payrollEntry);
    } catch (error) {
      console.error("Error creating payroll entry:", error);
      res.status(500).json({ error: "Failed to create payroll entry" });
    }
  });

  // Get payroll by pay period
  app.get("/api/payroll/period/:period", async (req, res) => {
    try {
      const { period } = req.params;
      const payrollEntries = await storage.getPayrollByPeriod(period);
      
      // Group by staff
      const staffPayroll = payrollEntries.reduce((acc, entry) => {
        if (!acc[entry.staffId]) {
          acc[entry.staffId] = {
            staffId: entry.staffId,
            entries: [],
            totalEarned: 0,
            totalDeducted: 0
          };
        }
        
        acc[entry.staffId].entries.push(entry);
        
        if (entry.payStatus === "earned" || entry.payStatus === "restored") {
          acc[entry.staffId].totalEarned += parseFloat(entry.currentPayAmount || "0");
        } else if (entry.payStatus === "deducted") {
          acc[entry.staffId].totalDeducted += parseFloat(entry.basePayAmount || "0");
        }
        
        return acc;
      }, {} as any);

      res.json(staffPayroll);
    } catch (error) {
      console.error("Error fetching payroll by period:", error);
      res.status(500).json({ error: "Failed to fetch payroll period data" });
    }
  });

  // Job Management API Routes for Office Staff

  // Get jobs awaiting approval
  app.get("/api/jobs/awaiting-approval", async (req, res) => {
    try {
      const jobs = await storage.getJobsAwaitingApproval();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs awaiting approval:", error);
      res.status(500).json({ error: "Failed to fetch jobs awaiting approval" });
    }
  });

  // Get job completion statistics
  app.get("/api/jobs/completion-stats", async (req, res) => {
    try {
      const stats = await storage.getJobCompletionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching job completion stats:", error);
      res.status(500).json({ error: "Failed to fetch job completion stats" });
    }
  });

  // Get jobs for a specific property
  app.get("/api/jobs/property/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const jobs = await storage.getJobsByProperty(propertyId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs for property:", error);
      res.status(500).json({ error: "Failed to fetch property jobs" });
    }
  });

  // Approve a job
  app.put("/api/jobs/:jobId/approve", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { approvedBy } = req.body;

      const updatedJob = await storage.approveJob(jobId, approvedBy || "office-staff-1");

      if (!updatedJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Create payroll entry when job is approved
      await storage.createPayrollEntry({
        staffId: updatedJob.assignedTo || "tech-1",
        jobId: jobId,
        jobType: updatedJob.type || "general",
        basePayAmount: updatedJob.budget || "75.00",
        currentPayAmount: updatedJob.budget || "75.00",
        payStatus: "earned",
        payPeriod: new Date().toISOString().slice(0, 7),
        notes: `Payment for approved ${updatedJob.type || "general"} job: ${updatedJob.title}`
      });

      console.log(`Job ${jobId} approved and payroll entry created`);

      res.json({
        message: "Job approved successfully",
        job: updatedJob
      });
    } catch (error) {
      console.error("Error approving job:", error);
      res.status(500).json({ error: "Failed to approve job" });
    }
  });

  // Reject a job
  app.put("/api/jobs/:jobId/reject", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { rejectedBy, reason } = req.body;

      const updatedJob = await storage.rejectJob(
        jobId, 
        rejectedBy || "office-staff-1", 
        reason || "No reason provided"
      );

      if (!updatedJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      console.log(`Job ${jobId} rejected: ${reason}`);

      res.json({
        message: "Job rejected successfully",
        job: updatedJob
      });
    } catch (error) {
      console.error("Error rejecting job:", error);
      res.status(500).json({ error: "Failed to reject job" });
    }
  });

  // Get financial summary (billed vs paid out)
  app.get("/api/financial/summary", async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ error: "Failed to fetch financial summary" });
    }
  });

  // Extra Dirty Request API Routes

  // Create extra dirty request
  app.post("/api/extra-dirty-requests", async (req, res) => {
    try {
      const request = await storage.createExtraDirtyRequest(req.body);
      console.log(`Extra dirty request created: ${request.id} for job ${request.jobId}`);
      res.json(request);
    } catch (error) {
      console.error("Error creating extra dirty request:", error);
      res.status(500).json({ error: "Failed to create extra dirty request" });
    }
  });

  // Get all extra dirty requests (for office staff)
  app.get("/api/extra-dirty-requests", async (req, res) => {
    try {
      const requests = await storage.getExtraDirtyRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching extra dirty requests:", error);
      res.status(500).json({ error: "Failed to fetch extra dirty requests" });
    }
  });

  // Get extra dirty requests by technician
  app.get("/api/extra-dirty-requests/technician/:technicianId", async (req, res) => {
    try {
      const { technicianId } = req.params;
      const requests = await storage.getExtraDirtyRequestsByTechnician(technicianId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching extra dirty requests:", error);
      res.status(500).json({ error: "Failed to fetch extra dirty requests" });
    }
  });

  // Update extra dirty request status (office review)
  app.put("/api/extra-dirty-requests/:id/office-review", async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewedBy, notes, status } = req.body;
      
      const updated = await storage.updateExtraDirtyRequestStatus(
        id, 
        status || "office_review", 
        reviewedBy, 
        notes
      );

      if (!updated) {
        return res.status(404).json({ error: "Extra dirty request not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating extra dirty request:", error);
      res.status(500).json({ error: "Failed to update extra dirty request" });
    }
  });

  // Repair Photo Request API Routes

  // Create repair photo request
  app.post("/api/repair-photo-requests", async (req, res) => {
    try {
      const request = await storage.createRepairPhotoRequest(req.body);
      console.log(`Repair photo request created: ${request.id} for job ${request.jobId}`);
      res.json(request);
    } catch (error) {
      console.error("Error creating repair photo request:", error);
      res.status(500).json({ error: "Failed to create repair photo request" });
    }
  });

  // Get all repair photo requests (for office staff)
  app.get("/api/repair-photo-requests", async (req, res) => {
    try {
      const requests = await storage.getRepairPhotoRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching repair photo requests:", error);
      res.status(500).json({ error: "Failed to fetch repair photo requests" });
    }
  });

  // Get repair photo requests by painter
  app.get("/api/repair-photo-requests/painter/:painterId", async (req, res) => {
    try {
      const { painterId } = req.params;
      const requests = await storage.getRepairPhotoRequestsByPainter(painterId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching repair photo requests:", error);
      res.status(500).json({ error: "Failed to fetch repair photo requests" });
    }
  });

  // Update repair photo request status (office review)
  app.put("/api/repair-photo-requests/:id/office-review", async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewedBy, notes, status } = req.body;
      
      const updated = await storage.updateRepairPhotoRequestStatus(
        id, 
        status || "office_review", 
        reviewedBy, 
        notes
      );

      if (!updated) {
        return res.status(404).json({ error: "Repair photo request not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating repair photo request:", error);
      res.status(500).json({ error: "Failed to update repair photo request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
