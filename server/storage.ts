import { db } from "./db";
import { 
  projects, phases, projectPhases, timeEntries, tools, materials, 
  materialTransactions, equipment, maintenanceLogs,
  type InsertProject, type InsertPhase, type InsertTimeEntry,
  type InsertTool, type InsertMaterial, type InsertEquipment,
  type InsertMaintenanceLog,
  type Project, type Phase, type TimeEntry, type Tool, type Material, type Equipment, type MaintenanceLog
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;

  // Phases
  getPhases(): Promise<Phase[]>;
  createPhase(phase: InsertPhase): Promise<Phase>;

  // Time Entries
  getTimeEntries(projectId?: number, foremanId?: string): Promise<TimeEntry[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;

  // Tools
  getTools(): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, updates: Partial<InsertTool>): Promise<Tool | undefined>;

  // Materials
  getMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterialStock(id: number, quantityChange: number): Promise<Material | undefined>;

  // Equipment
  getEquipment(): Promise<Equipment[]>;
  createEquipment(item: InsertEquipment): Promise<Equipment>;
  logMaintenance(log: InsertMaintenanceLog): Promise<MaintenanceLog>;

  // Stats
  getStats(): Promise<{
    activeProjects: number;
    totalEmployees: number; // Just count of users for now?
    lowStockItems: number;
    equipmentInUse: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return updated;
  }

  async getPhases(): Promise<Phase[]> {
    return db.select().from(phases);
  }

  async createPhase(insertPhase: InsertPhase): Promise<Phase> {
    const [phase] = await db.insert(phases).values(insertPhase).returning();
    return phase;
  }

  async getTimeEntries(projectId?: number, foremanId?: string): Promise<TimeEntry[]> {
    let query = db.select().from(timeEntries);
    if (projectId) {
      query = query.where(eq(timeEntries.projectId, projectId)) as any;
    }
    // Drizzle doesn't support easy dynamic 'where' chaining without helper usually, 
    // but simple checks work.
    // For simplicity in this mock:
    const entries = await db.select().from(timeEntries);
    return entries.filter(e => {
      if (projectId && e.projectId !== projectId) return false;
      if (foremanId && e.foremanId !== foremanId) return false;
      return true;
    });
  }

  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [entry] = await db.insert(timeEntries).values(insertEntry).returning();
    return entry;
  }

  async getTools(): Promise<Tool[]> {
    return db.select().from(tools);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const [tool] = await db.insert(tools).values(insertTool).returning();
    return tool;
  }

  async updateTool(id: number, updates: Partial<InsertTool>): Promise<Tool | undefined> {
    const [updated] = await db.update(tools).set(updates).where(eq(tools.id, id)).returning();
    return updated;
  }

  async getMaterials(): Promise<Material[]> {
    return db.select().from(materials);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db.insert(materials).values(insertMaterial).returning();
    return material;
  }

  async updateMaterialStock(id: number, quantityChange: number): Promise<Material | undefined> {
    // This is a naive implementation, ideally use atomic update
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    if (!material) return undefined;

    const newQuantity = material.quantity + quantityChange;
    const [updated] = await db.update(materials)
      .set({ quantity: newQuantity })
      .where(eq(materials.id, id))
      .returning();
    return updated;
  }

  async getEquipment(): Promise<Equipment[]> {
    return db.select().from(equipment);
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const [item] = await db.insert(equipment).values(insertEquipment).returning();
    return item;
  }

  async logMaintenance(insertLog: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const [log] = await db.insert(maintenanceLogs).values(insertLog).returning();
    return log;
  }

  async getStats() {
    // Mock implementation for MVP speed, or real counts
    const activeProjects = (await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, 'active')))[0].count;
    const lowStockItems = (await db.select({ count: sql<number>`count(*)` }).from(materials).where(sql`quantity <= reorder_level`))[0].count;
    const equipmentInUse = (await db.select({ count: sql<number>`count(*)` }).from(equipment).where(eq(equipment.status, 'active')))[0].count;
    
    return {
      activeProjects: Number(activeProjects),
      totalEmployees: 12, // Placeholder
      lowStockItems: Number(lowStockItems),
      equipmentInUse: Number(equipmentInUse),
    };
  }
}

export const storage = new DatabaseStorage();
