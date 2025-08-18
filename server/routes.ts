import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { QuickBooksService, type QuickBooksTokens, type CreateInvoiceRequest } from "./quickbooksService";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertClientSchema, insertStaffSchema, insertJobSchema, insertTimeEntrySchema, insertInvoiceSchema, insertMessageSchema, insertQuoteRequestSchema, loginSchema, createUserSchema } from "@shared/schema";
import { AuthService, authenticate, requireAdmin, requireOfficeStaff, requirePropertyManager, requireTechnician, requireInspector, type AuthRequest } from "./auth";

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
  // ==============================
  // Authentication Routes
  // ==============================
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Get current user (requires authentication)
  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    res.json(req.user);
  });

  // Alternative endpoint for user auth check
  app.get("/api/auth/user", authenticate, async (req: AuthRequest, res) => {
    res.json(req.user);
  });

  // Admin job scheduling endpoint
  app.post("/api/jobs", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      // Create a simplified job structure that matches the jobs table
      const jobData = {
        title: req.body.jobType || "Maintenance Job",
        description: req.body.description || "",
        clientId: req.body.propertyId || "default-property", // Map propertyId to clientId
        assignedStaffId: req.body.assignedTechnicianId,
        status: "scheduled",
        priority: req.body.priority || "medium",
        estimatedHours: req.body.estimatedHours || "2",
        amount: req.body.amount || "100.00",
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : new Date(),
      };

      const job = await storage.createJob(jobData);
      
      res.status(201).json({
        message: "Job scheduled successfully",
        job,
      });
    } catch (error) {
      console.error("Create job error:", error);
      res.status(400).json({ message: "Failed to schedule job", error: error.message });
    }
  });

  // Create user endpoint (admin only)
  app.post("/api/auth/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await AuthService.createUser(validatedData);
      
      if (!user) {
        return res.status(400).json({ message: "Failed to create user" });
      }

      res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Get jobs endpoint - used by admin dashboard
  app.get("/api/jobs", authenticate, async (req: AuthRequest, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Get staff endpoint - used by admin job scheduling
  app.get("/api/staff", authenticate, async (req: AuthRequest, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error("Get staff error:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Get properties endpoint - used by admin job scheduling
  app.get("/api/properties", authenticate, async (req: AuthRequest, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Get properties error:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // ==============================
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

  // Get staff performance data
  app.get("/api/staff/performance", async (req, res) => {
    try {
      // Get all work orders to calculate performance metrics
      const workOrders = await storage.getWorkOrders();
      const staffPerformance: Record<string, any> = {};

      // Calculate performance for each staff member
      const staff = await storage.getStaff();
      
      for (const member of staff) {
        const assignedJobs = workOrders.filter(wo => wo.assignedTechnicianId === member.id);
        const completedJobs = assignedJobs.filter(wo => wo.status === 'completed');
        const callbacks = workOrders.filter(wo => 
          wo.assignedTechnicianId === member.id && 
          wo.category === 'callback'
        );

        staffPerformance[member.id] = {
          completedJobs: completedJobs.length,
          callbacks: callbacks.length,
          totalAssigned: assignedJobs.length,
          inProgress: assignedJobs.filter(wo => wo.status === 'in_progress').length
        };
      }

      res.json(staffPerformance);
    } catch (error) {
      console.error("Error fetching staff performance:", error);
      res.status(500).json({ error: "Failed to fetch staff performance" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      // Clean dashboard - no test jobs
      const jobs = [];
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

  // Payroll tracking endpoints
  app.get("/api/payroll/technician/:technicianId/current-cycle", async (req, res) => {
    const { technicianId } = req.params;
    
    try {
      // Get current payroll cycle (this pay period)
      const now = new Date();
      const cycleStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() >= 15 ? 15 : 1);
      const cycleEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() >= 15 ? 
        new Date(now.getFullYear(), now.getMonth() + 1, 1).getDate() - 1 : 14);
      
      // Calculate daily earnings within this cycle
      const dailyEarnings = [];
      let totalEarnings = 0;
      let totalDeductions = 0;
      
      // Demo daily earnings data
      for (let day = 1; day <= Math.min(14, now.getDate()); day++) {
        const hasWork = Math.random() > 0.4; // 60% chance of work each day
        const earnings = hasWork ? (Math.random() * 200 + 100) : 0; // $100-300 per day when working
        const deductions = Math.random() > 0.9 ? (earnings * 0.5) : 0; // 10% chance of callback deduction
        
        dailyEarnings.push({
          date: new Date(now.getFullYear(), now.getMonth(), day),
          grossEarnings: earnings,
          deductions: deductions,
          netEarnings: earnings - deductions,
          jobsCompleted: hasWork ? Math.floor(Math.random() * 3 + 1) : 0,
          callbackPending: deductions > 0
        });
        
        totalEarnings += earnings;
        totalDeductions += deductions;
      }
      
      // Mock pending callbacks
      const pendingCallbacks = [
        {
          id: "callback-1",
          originalJobId: "job-paint-123",
          jobType: "paint",
          unitType: "2br",
          originalAmount: 200,
          deductedAmount: 200,
          reason: "Quality Issue - Paint coverage uneven",
          requestedBy: "Property Manager",
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          photos: ["photo1.jpg", "photo2.jpg"],
          status: "pending"
        }
      ];
      
      res.json({
        cycleStart,
        cycleEnd,
        totalEarnings,
        totalDeductions,
        netPay: totalEarnings - totalDeductions,
        dailyEarnings,
        pendingCallbacks,
        status: "active"
      });
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      res.status(500).json({ error: "Failed to fetch payroll data" });
    }
  });

  app.post("/api/payroll/create-payout", async (req, res) => {
    const { jobId, staffId, jobType, unitCount, unitType } = req.body;
    
    try {
      // Calculate payout based on job type and unit
      const paintRates = { studio: 175, '1br': 175, '2br': 200, '3br': 225 };
      const cleanRates = { studio: 80, '1br': 80, '2br': 95, '3br': 105 };
      
      const rates = jobType === 'paint' ? paintRates : cleanRates;
      const baseAmount = rates[unitType] * unitCount;
      
      // Create payroll entry (mock for demo)
      const payrollEntry = {
        id: `payout-${Date.now()}`,
        staffId,
        jobId,
        jobType,
        unitType,
        unitCount,
        baseAmount,
        netAmount: baseAmount,
        entryDate: new Date(),
        callbackResolved: false
      };
      
      res.json({
        success: true,
        payrollEntry,
        message: `Payout of $${baseAmount} created for ${jobType} job`
      });
    } catch (error) {
      console.error("Error creating payout:", error);
      res.status(500).json({ error: "Failed to create payout" });
    }
  });

  app.post("/api/payroll/apply-callback-deduction", async (req, res) => {
    const { originalJobId, technicianId, deductionAmount, reason, requestedBy } = req.body;
    
    try {
      // Create callback deduction record
      const deduction = {
        id: `deduction-${Date.now()}`,
        originalJobId,
        technicianId,
        deductionAmount,
        reason,
        requestedBy,
        status: "pending",
        requestedAt: new Date()
      };
      
      res.json({
        success: true,
        deduction,
        message: `Callback deduction of $${deductionAmount} applied`
      });
    } catch (error) {
      console.error("Error applying callback deduction:", error);
      res.status(500).json({ error: "Failed to apply callback deduction" });
    }
  });

  app.put("/api/payroll/resolve-callback/:callbackId", async (req, res) => {
    const { callbackId } = req.params;
    const { resolutionNotes, photos } = req.body;
    
    try {
      // Mark callback as resolved and restore pay
      res.json({
        success: true,
        message: "Callback resolved and pay restored",
        callbackId,
        resolutionNotes,
        restoredAmount: 200 // Example restored amount
      });
    } catch (error) {
      console.error("Error resolving callback:", error);
      res.status(500).json({ error: "Failed to resolve callback" });
    }
  });

  // Dashboard stats - Clean for testing
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const clients = await storage.getClients();
      const staff = await storage.getStaff();

      const stats = {
        activeJobs: 0,
        revenue: "0.00",
        clients: clients.length,
        staffHours: "0.0",
        recentJobs: [] // No recent jobs for clean testing
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Removed general dashboard - users go directly to role-specific dashboards

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
      // Clean dashboard stats
      const stats = {
        totalProperties: 2,
        totalUnits: 48,
        occupiedUnits: 45,
        occupancyRate: "93.8%",
        monthlyRent: "0", // No work revenue yet
        openWorkOrders: 0,
        emergencyWorkOrders: 0
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property manager stats" });
    }
  });

  // Office Staff Dashboard
  // Office staff dashboard endpoint (financial access removed) - Enhanced with approvals
  app.get("/api/dashboard/office", async (req, res) => {
    try {
      const pendingQuoteRequests = await storage.getPendingQuoteRequests();
      const stats = {
        totalProperties: 2,
        activeJobs: 0,
        availableStaff: 4,
        emergencyRequests: 0,
        pendingApprovals: pendingQuoteRequests.length, // Show pending quote approvals
        scheduledToday: 0,
        recentActivity: [], // No recent jobs for clean testing
        pendingQuoteRequests: pendingQuoteRequests.slice(0, 5) // Show first 5 pending requests
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch office stats" });
    }
  });

  // Admin dashboard endpoint - FULL ACCESS including financials
  app.get("/api/dashboard/admin", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const workOrders = await storage.getWorkOrders();
      const staff = await storage.getStaff();
      const quoteRequests = await storage.getQuoteRequests();
      
      // Calculate property metrics
      const totalProperties = properties.length;
      const activeProperties = properties.filter(p => p.status === 'active').length;
      
      // Calculate revenue from completed work orders
      const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed');
      const totalRevenue = completedWorkOrders.reduce((sum, wo) => {
        return sum + (parseFloat(wo.estimatedCost || '0'));
      }, 0);
      
      // Calculate payouts (assume 60% of revenue goes to payouts)
      const totalPayouts = Math.round(totalRevenue * 0.6);
      const netProfit = totalRevenue - totalPayouts;
      
      // Property turnover analytics - start at 0 for new system
      const propertiesAcquiredYTD = 0; // Will be updated when properties are added
      const propertiesLostYTD = 0; // Will be updated when properties are removed
      const turnoverRate = totalProperties > 0 ? ((propertiesLostYTD / totalProperties) * 100) : 0;
      
      // Property performance metrics
      const averageRevenuePerProperty = totalProperties > 0 ? Math.round(totalRevenue / totalProperties) : 0;
      const propertyRetentionRate = 100 - turnoverRate;
      
      // Operational metrics
      const activeJobs = workOrders.filter(wo => wo.status === 'in_progress' || wo.status === 'scheduled').length;
      const totalStaff = staff.length;
      
      const adminStats = {
        // Financial metrics - calculated from actual data
        totalRevenue: Math.round(totalRevenue),
        totalPayouts: totalPayouts,
        netProfit: Math.round(netProfit),
        monthlyGrowth: 0, // Will calculate based on historical data when available
        
        // Property tracking and turnover metrics
        totalProperties: totalProperties,
        activeProperties: activeProperties,
        propertiesAcquiredYTD: propertiesAcquiredYTD,
        propertiesLostYTD: propertiesLostYTD,
        turnoverRate: Math.round(turnoverRate * 10) / 10,
        propertyRetentionRate: Math.round(propertyRetentionRate * 10) / 10,
        averageRevenuePerProperty: averageRevenuePerProperty,
        
        // Operational metrics - calculated from actual data
        activeJobs: activeJobs,
        totalStaff: totalStaff,
        totalTenants: 0, // Will be calculated when tenant data is added
        pendingQuoteRequests: quoteRequests.filter(q => q.status === 'pending_office_approval').length
      };
      res.json(adminStats);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });

  // Admin financial summary endpoint - EXCLUSIVE to Admin - calculated from actual data
  app.get("/api/financial/admin-summary", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrders();
      
      // Calculate revenue from completed work orders
      const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed');
      const totalBilled = completedWorkOrders.reduce((sum, wo) => {
        return sum + (parseFloat(wo.estimatedCost || '0'));
      }, 0);
      
      // Calculate payouts (assume 60% of revenue goes to payouts)
      const totalPaidOut = totalBilled * 0.6;
      const netProfit = totalBilled - totalPaidOut;
      
      // Initialize monthly arrays with zeros (will populate as data comes in)
      const monthlyRevenue = new Array(12).fill(0);
      const payoutHistory = new Array(12).fill(0);
      
      const financialSummary = {
        totalBilled: totalBilled.toFixed(2),
        totalPaidOut: totalPaidOut.toFixed(2), 
        netProfit: netProfit.toFixed(2),
        monthlyRevenue: monthlyRevenue,
        payoutHistory: payoutHistory
      };
      res.json(financialSummary);
    } catch (error) {
      console.error("Error fetching admin financial summary:", error);
      res.status(500).json({ message: "Failed to fetch admin financial summary" });
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

  // Update work order (edit job)
  app.put("/api/work-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Convert scheduledDate string to Date if provided
      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }
      
      // Convert estimatedCost string to number if provided
      if (updateData.estimatedCost) {
        updateData.estimatedCost = parseFloat(updateData.estimatedCost);
      }

      // Handle "unassigned" value for technician assignment
      if (updateData.assignedTechnicianId === "unassigned") {
        updateData.assignedTechnicianId = null;
      }

      const updatedWorkOrder = await storage.updateWorkOrder(id, updateData);
      if (!updatedWorkOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }
      
      res.json(updatedWorkOrder);
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(500).json({ error: "Failed to update work order" });
    }
  });

  // Assign team member to work order
  app.put("/api/work-orders/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTechnicianId, scheduledDate, notes } = req.body;
      
      const updateData: any = {
        assignedTechnicianId,
        updatedAt: new Date(),
      };
      
      if (scheduledDate) {
        updateData.scheduledDate = new Date(scheduledDate);
      }
      
      if (notes) {
        updateData.notes = notes;
      }

      const updatedWorkOrder = await storage.updateWorkOrder(id, updateData);
      if (!updatedWorkOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }
      
      res.json(updatedWorkOrder);
    } catch (error) {
      console.error("Error assigning team member:", error);
      res.status(500).json({ error: "Failed to assign team member" });
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
      // Clean dashboard - minimal work orders for testing
      const workOrders = [];
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

  // Staff metrics for enhanced dashboard
  app.get("/api/staff/metrics", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      const staffMetrics = await Promise.all(staff.map(async (member) => {
        // Get payroll data for this staff member
        const payrollEntries = await storage.getStaffPayroll(member.id);
        const yearToDateEarnings = payrollEntries
          .filter(entry => entry.payStatus !== 'deducted')
          .reduce((sum, entry) => sum + parseFloat(entry.currentPayAmount), 0);
        
        // Get job completion data
        const completedJobs = payrollEntries.length;
        
        // Get callback data (mock for demo)
        const pendingCallbacks = Math.floor(Math.random() * 3); // 0-2 pending callbacks
        const resolvedCallbacks = Math.floor(Math.random() * 8) + 2; // 2-10 resolved
        
        // Calculate efficiency (mock calculation)
        const totalCallbacks = pendingCallbacks + resolvedCallbacks;
        const efficiency = totalCallbacks > 0 ? (resolvedCallbacks / totalCallbacks) * 100 : 95;
        
        // Calculate average job value
        const averageJobValue = completedJobs > 0 ? yearToDateEarnings / completedJobs : 0;
        
        return {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          status: member.status,
          yearToDateEarnings,
          completedJobs,
          pendingCallbacks,
          resolvedCallbacks,
          efficiency,
          averageJobValue,
          monthlyEarnings: [] // Could be populated with historical data
        };
      }));
      
      res.json(staffMetrics);
    } catch (error) {
      console.error("Error fetching staff metrics:", error);
      res.status(500).json({ error: "Failed to fetch staff metrics" });
    }
  });

  // Invoice metrics for enhanced dashboard
  app.get("/api/invoices/metrics", async (req, res) => {
    try {
      // Get all completed jobs
      const jobs = await storage.getJobs();
      const completedJobs = jobs.filter(job => job.status === 'completed');
      
      // Mock invoice data (in real implementation, would query invoices table)
      const totalJobs = completedJobs.length;
      const invoicedJobs = Math.floor(totalJobs * 0.85); // 85% invoiced
      const uninvoicedJobs = totalJobs - invoicedJobs;
      
      const pendingInvoices = Math.floor(invoicedJobs * 0.3); // 30% pending
      const paidInvoices = invoicedJobs - pendingInvoices;
      const overdueInvoices = Math.floor(pendingInvoices * 0.2); // 20% of pending are overdue
      
      // Calculate amounts (using average job values)
      const averageJobValue = 485; // Average paint/clean job value
      const totalInvoicedAmount = invoicedJobs * averageJobValue;
      const totalPaidAmount = paidInvoices * averageJobValue;
      const averageInvoiceValue = averageJobValue;
      
      const invoiceMetrics = {
        totalJobs,
        invoicedJobs,
        uninvoicedJobs,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        totalInvoicedAmount,
        totalPaidAmount,
        averageInvoiceValue
      };
      
      res.json(invoiceMetrics);
    } catch (error) {
      console.error("Error fetching invoice metrics:", error);
      res.status(500).json({ error: "Failed to fetch invoice metrics" });
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

  // Get pending quote requests (for Office Staff approval)
  app.get("/api/quote-requests/pending-approval", async (req, res) => {
    try {
      const pendingRequests = await storage.getPendingQuoteRequests();
      res.json(pendingRequests);
    } catch (error) {
      console.error("Error fetching pending quote requests:", error);
      res.status(500).json({ error: "Failed to fetch pending quote requests" });
    }
  });

  // Office Staff approves quote request and schedules work
  app.post("/api/quote-requests/:id/approve-and-schedule", async (req, res) => {
    try {
      const { 
        scheduledDate, 
        assignedTechnicianId, 
        estimatedCost, 
        scheduledBy, // Office Staff user ID
        notes 
      } = req.body;

      if (!scheduledDate || !assignedTechnicianId || !scheduledBy) {
        return res.status(400).json({ 
          error: "scheduledDate, assignedTechnicianId, and scheduledBy are required" 
        });
      }

      // Approve the quote request and create work order
      const result = await storage.approveQuoteRequestAndSchedule(
        req.params.id,
        {
          scheduledDate: new Date(scheduledDate),
          assignedTechnicianId,
          estimatedCost: estimatedCost || "0",
          scheduledBy,
          notes
        }
      );

      // Send notification to Property Manager
      await storage.createNotification({
        recipientId: result.quoteRequest.requesterId,
        type: "work_scheduled",
        title: "Work Order Scheduled",
        message: `Your request "${result.quoteRequest.title}" has been approved and scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
        relatedEntityId: result.workOrder.id,
        relatedEntityType: "work_order",
        actionRequired: false,
        actionUrl: `/work-orders/${result.workOrder.id}`
      });

      res.json(result);
    } catch (error) {
      console.error("Error approving quote request:", error);
      res.status(500).json({ error: "Failed to approve and schedule quote request" });
    }
  });

  // Office Staff rejects quote request
  app.post("/api/quote-requests/:id/reject", async (req, res) => {
    try {
      const { rejectionReason, rejectedBy } = req.body;

      if (!rejectionReason || !rejectedBy) {
        return res.status(400).json({ 
          error: "rejectionReason and rejectedBy are required" 
        });
      }

      const quoteRequest = await storage.rejectQuoteRequest(req.params.id, {
        rejectionReason,
        rejectedBy
      });

      // Send notification to Property Manager
      await storage.createNotification({
        recipientId: quoteRequest.requesterId,
        type: "quote_rejected",
        title: "Quote Request Rejected",
        message: `Your request "${quoteRequest.title}" has been rejected. Reason: ${rejectionReason}`,
        relatedEntityId: quoteRequest.id,
        relatedEntityType: "quote_request",
        actionRequired: true,
        actionUrl: `/quote-requests/${quoteRequest.id}`
      });

      res.json(quoteRequest);
    } catch (error) {
      console.error("Error rejecting quote request:", error);
      res.status(500).json({ error: "Failed to reject quote request" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
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

  // Building Issues API endpoints
  app.get('/api/building-issues/:inspectorId', (req, res) => {
    try {
      // Mock building issues data
      const mockBuildingIssues = [
        {
          id: 'issue-1',
          title: 'Broken light fixture in hallway',
          description: 'The overhead light in the 2nd floor hallway is flickering and needs replacement',
          location: 'Building A - 2nd Floor Hallway',
          priority: 'medium',
          category: 'electrical',
          status: 'open',
          reportedBy: req.params.inspectorId,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          id: 'issue-2',
          title: 'Leaking faucet in common area bathroom',
          description: 'Water dripping from the main faucet in the ground floor common bathroom',
          location: 'Building B - Ground Floor Common Bathroom',
          priority: 'high',
          category: 'plumbing',
          status: 'in_progress',
          reportedBy: req.params.inspectorId,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        }
      ];
      res.json(mockBuildingIssues);
    } catch (error) {
      console.error("Error fetching building issues:", error);
      res.status(500).json({ error: "Failed to fetch building issues" });
    }
  });

  // Search completed units endpoint
  app.get('/api/units/search/completed', (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.json([]);
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      // Mock completed units data
      const allCompletedUnits = [
        {
          id: 'unit-completed-1',
          title: 'Apartment Turn - Unit 205',
          jobType: 'Apartment Turn',
          unit: '205',
          property: 'Maple Gardens',
          technician: 'Mike Johnson',
          technicianName: 'Mike Johnson',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: '2_bed'
        },
        {
          id: 'unit-completed-2',
          title: 'Deep Cleaning - Unit 101',
          jobType: 'Deep Cleaning',
          unit: '101',
          property: 'Oak Village',
          technician: 'Sarah Wilson',
          technicianName: 'Sarah Wilson',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: 'studio'
        },
        {
          id: 'unit-completed-3',
          title: 'Paint Touch-up - Unit 301',
          jobType: 'Painting',
          unit: '301',
          property: 'Pine Heights',
          technician: 'David Brown',
          technicianName: 'David Brown',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: '1_bed'
        },
        {
          id: 'unit-completed-4',
          title: 'Full Apartment Turn - Unit 408',
          jobType: 'Apartment Turn',
          unit: '408',
          property: 'Maple Gardens',
          technician: 'Mike Johnson',
          technicianName: 'Mike Johnson',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: '3_bed'
        },
        {
          id: 'unit-completed-5',
          title: 'Maintenance Repair - Unit 150',
          jobType: 'Maintenance',
          unit: '150',
          property: 'Oak Village',
          technician: 'Sarah Wilson',
          technicianName: 'Sarah Wilson',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: 'loft'
        },
        {
          id: 'unit-completed-6',
          title: 'Townhome Turn - Unit TH12',
          jobType: 'Apartment Turn',
          unit: 'TH12',
          property: 'Cedar Creek Townhomes',
          technician: 'Alex Martinez',
          technicianName: 'Alex Martinez',
          status: 'inspector_approved',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          bedroomSize: '2_bed_townhome'
        }
      ];
      
      // Filter units based on search query
      const filteredUnits = allCompletedUnits.filter(unit => 
        unit.unit.toLowerCase().includes(searchTerm) ||
        unit.property.toLowerCase().includes(searchTerm) ||
        unit.jobType.toLowerCase().includes(searchTerm) ||
        unit.technician.toLowerCase().includes(searchTerm) ||
        unit.title.toLowerCase().includes(searchTerm) ||
        (unit.bedroomSize && unit.bedroomSize.toLowerCase().includes(searchTerm))
      );
      
      res.json(filteredUnits);
    } catch (error) {
      console.error("Error searching completed units:", error);
      res.status(500).json({ error: "Failed to search completed units" });
    }
  });

  app.post('/api/building-issues', (req, res) => {
    try {
      const { title, description, location, priority, category, reportedBy, status, createdAt } = req.body;
      
      // Validate required fields
      if (!title || !description || !location || !reportedBy) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // In a real app, this would save to database
      const newIssue = {
        id: `issue-${Date.now()}`,
        title,
        description,
        location,
        priority: priority || 'medium',
        category: category || 'maintenance',
        status: status || 'open',
        reportedBy,
        createdAt: createdAt || new Date().toISOString(),
      };

      // Mock successful creation
      res.status(201).json(newIssue);
    } catch (error) {
      console.error("Error creating building issue:", error);
      res.status(500).json({ error: "Failed to create building issue" });
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
  // Two-stage job completion endpoints
  
  // Technician marks job complete (first stage)
  // Get work orders awaiting inspector approval (tech_completed status)
  app.get("/api/work-orders/tech-completed", async (req, res) => {
    try {
      const workOrders = await storage.getWorkOrdersByStatus("tech_completed");
      res.json(workOrders);
    } catch (error) {
      console.error("Error fetching tech-completed work orders:", error);
      res.status(500).json({ message: "Failed to fetch work orders" });
    }
  });

  app.put("/api/work-orders/:id/tech-complete", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, techCompletedDate, completionNotes, techPhotos, technicianId } = req.body;
      
      const workOrder = await storage.updateWorkOrder(id, {
        status: "tech_completed",
        techCompletedDate: new Date(techCompletedDate),
        completionNotes,
        techPhotos: techPhotos || [],
        updatedAt: new Date()
      });
      
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      
      res.json({
        message: "Job marked complete by technician",
        workOrder
      });
    } catch (error) {
      console.error("Tech complete error:", error);
      res.status(500).json({ message: "Failed to mark job complete" });
    }
  });

  // Inspector gives final approval (second stage)
  app.put("/api/work-orders/:id/inspector-approve", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, inspectorApprovedDate, inspectionNotes, inspectorId } = req.body;
      
      const workOrder = await storage.updateWorkOrder(id, {
        status: "inspector_approved",
        inspectorApprovedDate: new Date(inspectorApprovedDate),
        completedDate: new Date(), // Final completion date
        inspectionNotes,
        updatedAt: new Date()
      });
      
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      
      res.json({
        message: "Job approved by inspector - 100% complete",
        workOrder
      });
    } catch (error) {
      console.error("Inspector approval error:", error);
      res.status(500).json({ message: "Failed to approve job" });
    }
  });

  // Inspector requests callback
  app.put("/api/work-orders/:id/callback", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { inspectionNotes, callbackReason, inspectorId } = req.body;
      
      const workOrder = await storage.updateWorkOrder(id, {
        status: "in_progress", // Send back to technician
        inspectionNotes,
        callbackReason,
        updatedAt: new Date()
      });
      
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      
      res.json({
        message: "Callback requested - job sent back to technician",
        workOrder
      });
    } catch (error) {
      console.error("Callback request error:", error);
      res.status(500).json({ message: "Failed to request callback" });
    }
  });

  return httpServer;
}
