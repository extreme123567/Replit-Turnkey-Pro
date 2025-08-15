import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertClientSchema, insertStaffSchema, insertJobSchema, insertTimeEntrySchema, insertInvoiceSchema, insertMessageSchema } from "@shared/schema";

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
      res.json(properties);
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
        updatedAt: new Date(),
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

  const httpServer = createServer(app);
  return httpServer;
}
