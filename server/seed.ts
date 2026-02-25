import { storage } from "./storage";
import {
  projects, phases, tools, materials, equipment, users,
  insertProjectSchema, insertPhaseSchema, insertToolSchema,
  insertMaterialSchema, insertEquipmentSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export async function seed() {
  // 0. Users (Ensure at least one exists for Foreign Keys)
  // This must run even if other data exists
  try {
    const [existingUser] = await db.select().from(users).limit(1);
    if (!existingUser) {
      await db.insert(users).values({
        id: "1", // Force ID 1 to match external.ts hardcoded foremanId
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "Admin",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Seeded default user");
    }
  } catch (e) {
    console.error("Error seeding user:", e);
  }

  // 1. Phases
  const phaseData = [
    { code: "001", name: "Site Prep / Demolition", category: "labor" as const },
    { code: "002", name: "Foundation / Concrete", category: "labor" as const },
    { code: "003", name: "Framing", category: "labor" as const },
    { code: "004", name: "Plumbing Rough-in", category: "labor" as const },
    { code: "005", name: "Electrical Rough-in", category: "labor" as const },
    { code: "101", name: "Lumber Package", category: "material" as const },
    { code: "102", name: "Concrete Mix", category: "material" as const },
    { code: "201", name: "Excavator Rental", category: "equipment" as const },
  ];

  for (const p of phaseData) {
    try {
      await storage.createPhase(p);
    } catch (e) {
      // Ignore if duplicates exist during seed re-run
    }
  }

  // 2. Projects
  const projectData = [
    { jobNumber: "24-101", name: "Riverside Commercial Complex", client: "Apex Developers", location: "123 River Rd", status: "active" as const, budgetHours: 5000 },
    { jobNumber: "24-102", name: "Oakwood Residential Estate", client: "Private Owner", location: "45 Oak Ln", status: "active" as const, budgetHours: 1200 },
    { jobNumber: "24-099", name: "Downtown Renovation", client: "City Council", location: "88 Main St", status: "completed" as const, budgetHours: 800 },
    { jobNumber: "25-001", name: "Sunset Plaza Mall", client: "Plaza Group", location: "777 Sunset Blvd", status: "active" as const, budgetHours: 10000 },
  ];

  for (const p of projectData) {
    try {
      const existing = await db.select().from(projects).where(eq(projects.jobNumber, p.jobNumber)).limit(1);
      if (existing.length === 0) {
        await storage.createProject({
          ...p,
          status: p.status as "active" | "completed" | "paused"
        });
      }
    } catch (e) {
      console.error("Error seeding project:", e);
    }
  }

  // 3. Inventory - Materials
  const materialData = [
    { name: "Lumber 2x4 (8ft)", unit: "pcs", quantity: 500, reorderLevel: 100, supplier: "Home Depot" },
    { name: "Concrete Bags (80lb)", unit: "bags", quantity: 40, reorderLevel: 20, supplier: "BuildSupply Co" },
    { name: "Drywall Sheets 4x8", unit: "sheets", quantity: 200, reorderLevel: 50, supplier: "Drywall Pros" },
    { name: "Deck Screws (5lb)", unit: "box", quantity: 15, reorderLevel: 5, supplier: "Fasteners Inc" },
    { name: "PVC Pipe 2 inch", unit: "ft", quantity: 300, reorderLevel: 50, supplier: "Pipe Depot" },
    { name: "Copper Wire 12/2 (250ft)", unit: "roll", quantity: 10, reorderLevel: 2, supplier: "Electric Supply" },
  ];

  for (const m of materialData) {
    try {
      const existing = await db.select().from(materials).where(eq(materials.name, m.name)).limit(1);
      if (existing.length === 0) await storage.createMaterial(m);
    } catch (e) { }
  }

  // 4. Inventory - Tools
  const toolData = [
    { name: "DeWalt Cordless Drill", barcode: "T-1001", category: "Power Tools", status: "available" as const, location: "Warehouse" },
    { name: "Makita Circular Saw", barcode: "T-1002", category: "Power Tools", status: "assigned" as const, location: "24-101" },
    { name: "Bosch Hammer Drill", barcode: "T-1003", category: "Power Tools", status: "repair" as const, location: "Shop" },
    { name: "Grade Laser GL722", barcode: "T-3001", category: "Surveying", status: "available" as const, location: "Warehouse" },
    { name: "Topcon Total Station", barcode: "T-3002", category: "Surveying", status: "available" as const, location: "Warehouse" },
  ];

  for (const t of toolData) {
    try {
      const existing = await db.select().from(tools).where(eq(tools.barcode, t.barcode)).limit(1);
      if (existing.length === 0) await storage.createTool(t);
    } catch (e) { }
  }

  // 5. Inventory - Equipment
  const equipmentData = [
    { name: "CAT 305 Excavator", type: "Excavator", serialNumber: "CAT-305-X99", status: "active" as const, projectId: null },
    { name: "Genie S-60 Lift", type: "Boom Lift", serialNumber: "GL-5542", status: "yard" as const, projectId: null },
    { name: "Bobcat T770", type: "Skid Steer", serialNumber: "BC-7721", status: "active" as const, projectId: null },
    { name: "JCB 3CX Backhoe", type: "Backhoe", serialNumber: "JCB-001", status: "yard" as const, projectId: null },
    { name: "Case 580 Super N", type: "Loader Backhoe", serialNumber: "CASE-580", status: "active" as const, projectId: null },
  ];

  for (const e of equipmentData) {
    try {
      const existing = await db.select().from(equipment).where(eq(equipment.serialNumber, e.serialNumber)).limit(1);
      if (existing.length === 0) await storage.createEquipment(e);
    } catch (e) { }
  }

  console.log("Seeding complete!");
}
