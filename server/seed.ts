import { storage } from "./storage";
import {
  projects, phases, tools, materials, equipment, users,
  insertProjectSchema, insertPhaseSchema, insertToolSchema,
  insertMaterialSchema, insertEquipmentSchema
} from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";

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

  const existingProjects = await storage.getProjects();
  if (existingProjects.length > 0) return;

  console.log("Seeding database...");

  // 1. Phases
  const phaseData = [
    { code: "001", name: "Site Prep / Demolition", category: "labor" },
    { code: "002", name: "Foundation / Concrete", category: "labor" },
    { code: "003", name: "Framing", category: "labor" },
    { code: "004", name: "Plumbing Rough-in", category: "labor" },
    { code: "005", name: "Electrical Rough-in", category: "labor" },
    { code: "101", name: "Lumber Package", category: "material" },
    { code: "102", name: "Concrete Mix", category: "material" },
    { code: "201", name: "Excavator Rental", category: "equipment" },
  ];

  for (const p of phaseData) {
    await storage.createPhase(p);
  }

  // 2. Projects
  const projectData = [
    { jobNumber: "24-101", name: "Riverside Commercial Complex", client: "Apex Developers", location: "123 River Rd", status: "active", budgetHours: 5000 },
    { jobNumber: "24-102", name: "Oakwood Residential Estate", client: "Private Owner", location: "45 Oak Ln", status: "active", budgetHours: 1200 },
    { jobNumber: "24-099", name: "Downtown Renovation", client: "City Council", location: "88 Main St", status: "completed", budgetHours: 800 },
  ];

  for (const p of projectData) {
    await storage.createProject(p);
  }

  // 3. Inventory - Materials
  const materialData = [
    { name: "2x4 Lumber", unit: "pcs", quantity: 500, reorderLevel: 100, supplier: "Home Depot" },
    { name: "Concrete Bags (80lb)", unit: "bags", quantity: 40, reorderLevel: 20, supplier: "BuildSupply Co" },
    { name: "Drywall Sheets", unit: "sheets", quantity: 200, reorderLevel: 50, supplier: "Drywall Pros" },
    { name: "Screws (5lb box)", unit: "box", quantity: 15, reorderLevel: 5, supplier: "Fasteners Inc" },
  ];

  for (const m of materialData) {
    await storage.createMaterial(m);
  }

  // 4. Inventory - Tools
  const toolData = [
    { name: "DeWalt Cordless Drill", barcode: "T-1001", category: "Power Tools", status: "available", location: "Warehouse" },
    { name: "Makita Circular Saw", barcode: "T-1002", category: "Power Tools", status: "assigned", location: "24-101" },
    { name: "Bosch Hammer Drill", barcode: "T-1003", category: "Power Tools", status: "repair", location: "Shop" },
    { name: "Ladder (24ft)", barcode: "T-2001", category: "General", status: "available", location: "Warehouse" },
  ];

  for (const t of toolData) {
    await storage.createTool(t);
  }

  // 5. Inventory - Equipment
  const equipmentData = [
    { name: "CAT 305 Excavator", type: "Excavator", serialNumber: "CAT-305-X99", status: "active", projectId: 1 },
    { name: "Genie Lift", type: "Lift", serialNumber: "GL-5542", status: "yard", projectId: null },
    { name: "Bobcat Skid Steer", type: "Skid Steer", serialNumber: "BC-7721", status: "active", projectId: 2 },
  ];

  for (const e of equipmentData) {
    await storage.createEquipment(e); // Note: projectId needs to handle number vs null if strict types
  }

  console.log("Seeding complete!");
}
