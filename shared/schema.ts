import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Auth & Chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === PROJECTS MODULE ===
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  jobNumber: text("job_number").notNull().unique(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  location: text("location").notNull(),
  status: text("status", { enum: ["active", "completed", "paused"] }).default("active").notNull(),
  budgetHours: integer("budget_hours").default(0).notNull(),
  startDate: date("start_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === PHASES / WORK CODES ===
export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., "005"
  name: text("name").notNull(), // e.g., "Foundation"
  category: text("category", { enum: ["labor", "material", "equipment"] }).notNull(),
});

// Project Phases (Budget per phase per project)
export const projectPhases = pgTable("project_phases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  phaseId: integer("phase_id").notNull().references(() => phases.id),
  budgetHours: integer("budget_hours").default(0).notNull(),
});

// === LABOR / TIMESHEETS ===
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  phaseId: integer("phase_id").notNull().references(() => phases.id),
  foremanId: varchar("foreman_id").notNull().references(() => users.id),
  workerName: text("worker_name").notNull(), // Free text for Phase 1
  date: date("date").notNull(),
  hours: numeric("hours").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === INVENTORY: TOOLS ===
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  barcode: text("barcode").unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  status: text("status", { enum: ["available", "assigned", "repair", "lost", "inactive"] }).default("available").notNull(),
  location: text("location").default("Warehouse"), // or Project Name
  assignedToId: varchar("assigned_to_id").references(() => users.id), // Foreman or Employee
  photoUrl: text("photo_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === INVENTORY: MATERIALS ===
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull(), // e.g., "pcs", "kg", "m"
  supplier: text("supplier"),
  quantity: integer("quantity").default(0).notNull(),
  reorderLevel: integer("reorder_level").default(10),
});

export const materialTransactions = pgTable("material_transactions", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").notNull().references(() => materials.id),
  projectId: integer("project_id").references(() => projects.id), // Null if just restocking warehouse
  quantity: integer("quantity").notNull(), // Positive for IN, Negative for OUT
  type: text("type", { enum: ["in", "out", "transfer"] }).notNull(),
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
});

// === INVENTORY: EQUIPMENT ===
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Excavator, Generator, etc.
  serialNumber: text("serial_number"),
  status: text("status", { enum: ["active", "repair", "loaned", "yard"] }).default("yard").notNull(),
  projectId: integer("project_id").references(() => projects.id), // Current location
  hoursUsed: integer("hours_used").default(0),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  date: date("date").notNull(),
  type: text("type").notNull(), // Repair, Maintenance, Inspection
  cost: numeric("cost"),
  description: text("description"),
  performedBy: text("performed_by"),
});

// === RELATIONS ===
export const projectsRelations = relations(projects, ({ many }) => ({
  phases: many(projectPhases),
  timeEntries: many(timeEntries),
  equipment: many(equipment),
}));

export const phasesRelations = relations(phases, ({ many }) => ({
  projectPhases: many(projectPhases),
}));

export const projectPhasesRelations = relations(projectPhases, ({ one }) => ({
  project: one(projects, {
    fields: [projectPhases.projectId],
    references: [projects.id],
  }),
  phase: one(phases, {
    fields: [projectPhases.phaseId],
    references: [phases.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  phase: one(phases, {
    fields: [timeEntries.phaseId],
    references: [phases.id],
  }),
  foreman: one(users, {
    fields: [timeEntries.foremanId],
    references: [users.id],
  }),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  project: one(projects, {
    fields: [equipment.projectId],
    references: [projects.id],
  }),
  maintenanceLogs: many(maintenanceLogs),
}));

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceLogs.equipmentId],
    references: [equipment.id],
  }),
}));

// === SCHEMAS ===
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, startDate: true });
export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export const insertProjectPhaseSchema = createInsertSchema(projectPhases).omit({ id: true });
export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({ id: true, createdAt: true });
export const insertToolSchema = createInsertSchema(tools).omit({ id: true, updatedAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true });
export const insertMaterialTransactionSchema = createInsertSchema(materialTransactions).omit({ id: true, date: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).omit({ id: true });

// === TYPES ===
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Phase = typeof phases.$inferSelect;
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
