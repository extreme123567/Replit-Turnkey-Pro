import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  clientType: text("client_type").notNull().default("residential"), // residential, commercial
  status: text("status").notNull().default("active"), // active, inactive
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).default("0.00"),
  jobCount: integer("job_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // lead_technician, technician, apprentice
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default("available"), // available, on_job, sick_leave, vacation
  hoursThisWeek: decimal("hours_this_week", { precision: 5, scale: 2 }).default("0.00"),
  activeJobs: integer("active_jobs").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  assignedStaffId: varchar("assigned_staff_id").references(() => staff.id),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  priority: text("priority").notNull().default("medium"), // low, medium, high
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  jobId: varchar("job_id").references(() => jobs.id),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  hours: decimal("hours", { precision: 5, scale: 2 }),
  description: text("description"),
  isOvertime: boolean("is_overtime").default(false),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  jobId: varchar("job_id").references(() => jobs.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  quickbooksId: varchar("quickbooks_id"), // QuickBooks invoice ID
  quickbooksDocNumber: varchar("quickbooks_doc_number"), // QuickBooks document number
  quickbooksSyncedAt: timestamp("quickbooks_synced_at"), // Last sync timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromType: text("from_type").notNull(), // staff, client
  fromId: varchar("from_id").notNull(),
  toType: text("to_type").notNull(), // staff, client
  toId: varchar("to_id").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  conversationId: varchar("conversation_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // admin, office_staff, technician, property_manager, inspector
  department: text("department"), // operations, maintenance, leasing, accounting, inspection
  status: text("status").notNull().default("active"), // active, inactive
  permissions: text("permissions").array(), // Array of permission strings
  assignedRegions: text("assigned_regions").array(), // Geographic regions or property groups
  lastLogin: timestamp("last_login"),
  preferences: text("preferences"), // JSON string for dashboard preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const approvalRequests = pgTable("approval_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // extra_dirty_unit, extra_drywall_repair
  workOrderId: varchar("work_order_id").references(() => workOrders.id),
  propertyId: varchar("property_id").notNull(),
  unitNumber: text("unit_number"),
  requestedById: varchar("requested_by_id").references(() => users.id).notNull(), // Technician who submitted
  processedByOfficeStaffId: varchar("processed_by_office_staff_id").references(() => users.id), // Office staff who forwarded
  propertyManagerId: varchar("property_manager_id").references(() => users.id).notNull(), // Property manager who approves
  title: text("title").notNull(),
  description: text("description"),
  reason: text("reason"), // Why extra work is needed
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  photos: text("photos").array(), // Supporting photos from technician
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  approvalNotes: text("approval_notes"),
  notificationSent: boolean("notification_sent").default(false), // Track if approval notification sent to office staff and technician
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull(), // Reference to property
  unitNumber: text("unit_number"),
  category: text("category").notNull(), // maintenance, emergency, inspection, tenant_request, extra_dirty, repair
  jobType: text("job_type"), // punch, repairs, paint, clean, carpet, inspected, unit_trash_out, onsite_bulk_trash
  priority: text("priority").notNull().default("medium"), // low, medium, high, emergency
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  title: text("title").notNull(),
  description: text("description"),
  assignedTechnicianId: varchar("assigned_technician_id").references(() => staff.id),
  requestedBy: text("requested_by"), // tenant, property_manager, maintenance, office_staff
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  photosRequired: integer("photos_required").default(0), // Number of photos required for completion (2 for trash jobs)
  photosSubmitted: text("photos_submitted").array(), // Array of submitted photo URLs
  photosToOffice: boolean("photos_to_office").default(false), // Whether photos need to be sent to office
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  photos: text("photos").array(), // Array of photo URLs
  beforeImages: text("before_images").array(), // Required before work images
  afterImages: text("after_images").array(), // Required after work images
  requiresApproval: boolean("requires_approval").default(false),
  approvedById: varchar("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  imageRequirement: text("image_requirement").default("none"), // none, before_only, after_only, before_and_after
  notes: text("notes"),
  quoteRequestId: varchar("quote_request_id").references(() => quoteRequests.id), // Link back to original quote request
  propertyManagerNotified: boolean("property_manager_notified").default(false), // Track PM notification
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: text("property_type").notNull(), // single_family, multi_family, commercial
  units: integer("units").default(1),
  yearBuilt: integer("year_built"),
  squareFootage: integer("square_footage"),
  managerId: varchar("manager_id").references(() => staff.id),
  status: text("status").notNull().default("active"), // active, inactive, under_renovation
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  unitNumber: text("unit_number"),
  leaseStart: timestamp("lease_start").notNull(),
  leaseEnd: timestamp("lease_end").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"), // active, inactive, past_due
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  taskType: text("task_type").notNull(), // hvac_service, plumbing_inspection, electrical_check, etc.
  frequency: text("frequency").notNull(), // monthly, quarterly, biannually, annually
  nextDueDate: timestamp("next_due_date").notNull(),
  lastCompleted: timestamp("last_completed"),
  assignedTechnicianId: varchar("assigned_technician_id").references(() => staff.id),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  inspectorId: varchar("inspector_id").notNull(), // Reference to user with inspector role
  inspectionType: text("inspection_type").notNull(), // annual, move_in, move_out, safety, compliance
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, failed
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  findings: text("findings"), // JSON string for inspection findings
  overallRating: text("overall_rating"), // excellent, good, fair, poor, critical
  actionItems: text("action_items").array(), // Array of required actions
  photos: text("photos").array(), // Array of photo URLs
  notes: text("notes"),
  isCompliant: boolean("is_compliant"),
  nextInspectionDue: timestamp("next_inspection_due"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceType: text("resource_type").notNull(), // property, tenant, work_order, inspection, etc.
  resourceId: varchar("resource_id"), // Specific resource ID or null for general permission
  permission: text("permission").notNull(), // read, write, delete, approve, assign
  grantedBy: varchar("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // login, create, update, delete, approve, etc.
  resourceType: text("resource_type").notNull(),
  resourceId: varchar("resource_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quoteRequests = pgTable("quote_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id),
  unitNumber: varchar("unit_number"),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, emergency
  category: varchar("category").notNull(), // maintenance, repair, renovation, cleaning, etc.
  estimatedBudget: varchar("estimated_budget"),
  preferredStartDate: timestamp("preferred_start_date"),
  preferredEndDate: timestamp("preferred_end_date"),
  status: varchar("status").notNull().default("pending_office_approval"), // pending_office_approval, office_approved, office_rejected, scheduled, in_progress, completed
  quoteAmount: varchar("quote_amount"),
  quotedBy: varchar("quoted_by").references(() => users.id),
  quotedAt: timestamp("quoted_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  scheduledDate: timestamp("scheduled_date"), // When Office Staff schedules the work
  scheduledBy: varchar("scheduled_by").references(() => users.id),
  assignedTechnicianId: varchar("assigned_technician_id").references(() => staff.id),
  workOrderId: varchar("work_order_id").references(() => workOrders.id), // Created work order after approval
  notes: text("notes"),
  attachments: jsonb("attachments").default([]), // array of file URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const callbackResolutions = pgTable("callback_resolutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(), // Original job that failed inspection
  originalInspectorId: varchar("original_inspector_id").notNull(),
  technicianId: varchar("technician_id").notNull(), // Who fixed the issues
  callbackReason: text("callback_reason").notNull(), // Original inspection failure reason
  resolutionNotes: text("resolution_notes").notNull(), // What was fixed
  beforePhotos: text("before_photos").array(), // Photos of issues before fix
  afterPhotos: text("after_photos").array(), // Photos showing completed fixes
  status: varchar("status").notNull().default("in_progress"), // in_progress, completed, verified
  completedAt: timestamp("completed_at"),
  verifiedBy: varchar("verified_by"), // Inspector who re-verified
  verifiedAt: timestamp("verified_at"),
  timeSpent: integer("time_spent"), // Minutes spent on callback work
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Staff Pay Tracking
export const staffPayroll = pgTable("staff_payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").notNull(),
  jobId: varchar("job_id").notNull(),
  jobType: varchar("job_type").notNull(), // punch, repairs, paint, clean, carpet, inspected, etc.
  basePayAmount: decimal("base_pay_amount", { precision: 10, scale: 2 }).notNull(),
  currentPayAmount: decimal("current_pay_amount", { precision: 10, scale: 2 }).notNull(), // adjusted for callbacks
  payStatus: varchar("pay_status").notNull().default("earned"), // earned, deducted, restored
  callbackId: varchar("callback_id"), // links to callback if pay was deducted
  deductedAt: timestamp("deducted_at"),
  restoredAt: timestamp("restored_at"),
  payPeriod: varchar("pay_period").notNull(), // YYYY-MM format
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Extra Dirty Unit Requests
export const extraDirtyRequests = pgTable("extra_dirty_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  technicianId: varchar("technician_id").notNull(),
  unitNumber: varchar("unit_number").notNull(),
  description: text("description").notNull(),
  photoUrls: text("photo_urls").array(),
  estimatedExtraTime: integer("estimated_extra_time"), // additional minutes needed
  estimatedExtraCost: decimal("estimated_extra_cost", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("pending"), // pending, office_review, manager_review, approved, rejected
  officeReviewedBy: varchar("office_reviewed_by"),
  officeReviewedAt: timestamp("office_reviewed_at"),
  officeNotes: text("office_notes"),
  managerReviewedBy: varchar("manager_reviewed_by"),
  managerReviewedAt: timestamp("manager_reviewed_at"),
  managerNotes: text("manager_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Repair Photo Requests (for painters)
export const repairPhotoRequests = pgTable("repair_photo_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  painterId: varchar("painter_id").notNull(),
  repairType: varchar("repair_type").notNull(), // drywall, trim, ceiling, wall_damage, etc.
  unitNumber: varchar("unit_number").notNull(),
  roomLocation: varchar("room_location").notNull(),
  description: text("description").notNull(),
  beforePhotoUrls: text("before_photo_urls").array(),
  afterPhotoUrls: text("after_photo_urls").array(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedTime: integer("estimated_time"), // minutes
  status: varchar("status").notNull().default("pending"), // pending, office_review, manager_review, approved, rejected
  officeReviewedBy: varchar("office_reviewed_by"),
  officeReviewedAt: timestamp("office_reviewed_at"),
  officeNotes: text("office_notes"),
  managerReviewedBy: varchar("manager_reviewed_by"),
  managerReviewedAt: timestamp("manager_reviewed_at"),
  managerNotes: text("manager_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  totalValue: true,
  jobCount: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  hoursThisWeek: true,
  activeJobs: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  actualHours: true,
  completedDate: true,
  createdAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  hours: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  paidDate: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  completedDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedule).omit({
  id: true,
  lastCompleted: true,
  createdAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  completedDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  quotedAt: true,
  approvedAt: true,
  rejectedAt: true,
  scheduledBy: true,
  workOrderId: true,
  createdAt: true,
  updatedAt: true,
});

// Notifications table for tracking workflow communications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // quote_approved, quote_rejected, work_scheduled, work_completed
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedEntityId: varchar("related_entity_id"), // ID of quote request or work order
  relatedEntityType: varchar("related_entity_type"), // quote_request, work_order
  isRead: boolean("is_read").default(false),
  actionRequired: boolean("action_required").default(false),
  actionUrl: varchar("action_url"), // Deep link to relevant page
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).omit({
  id: true,
  approvedAt: true,
  rejectedAt: true,
  notificationSent: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallbackResolutionSchema = createInsertSchema(callbackResolutions).omit({
  id: true,
  completedAt: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffPayrollSchema = createInsertSchema(staffPayroll).omit({
  id: true,
  deductedAt: true,
  restoredAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExtraDirtyRequestSchema = createInsertSchema(extraDirtyRequests).omit({
  id: true,
  officeReviewedAt: true,
  managerReviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRepairPhotoRequestSchema = createInsertSchema(repairPhotoRequests).omit({
  id: true,
  officeReviewedAt: true,
  managerReviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

export type CallbackResolution = typeof callbackResolutions.$inferSelect;
export type InsertCallbackResolution = z.infer<typeof insertCallbackResolutionSchema>;

export type StaffPayroll = typeof staffPayroll.$inferSelect;
export type InsertStaffPayroll = z.infer<typeof insertStaffPayrollSchema>;

export type ExtraDirtyRequest = typeof extraDirtyRequests.$inferSelect;
export type InsertExtraDirtyRequest = z.infer<typeof insertExtraDirtyRequestSchema>;

export type RepairPhotoRequest = typeof repairPhotoRequests.$inferSelect;
export type InsertRepairPhotoRequest = z.infer<typeof insertRepairPhotoRequestSchema>;

// Bi-weekly financial periods table
export const financialPeriods = pgTable("financial_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").notNull().default("active"), // active, completed
  totalRevenueBilled: decimal("total_revenue_billed", { precision: 12, scale: 2 }).default("0.00"),
  totalPayout: decimal("total_payout", { precision: 12, scale: 2 }).default("0.00"),
  netProfit: decimal("net_profit", { precision: 12, scale: 2 }).default("0.00"),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).default("0.00"),
  jobsScheduled: integer("jobs_scheduled").default(0),
  jobsActive: integer("jobs_active").default(0),
  jobsCompleted: integer("jobs_completed").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertFinancialPeriodSchema = createInsertSchema(financialPeriods).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export type FinancialPeriod = typeof financialPeriods.$inferSelect;
export type InsertFinancialPeriod = z.infer<typeof insertFinancialPeriodSchema>;
