import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import path from "path";

import { seed } from "./seed";

import { externalRouter } from "./routes/external";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register Integrations
  await setupAuth(app);
  registerAuthRoutes(app);

  // External Integrations
  app.use("/api/external", externalRouter);

  // Seed Data
  await seed();

  // UNIFIED ARCHITECTURE: Serve Mobile App
  // Now located INSIDE the Code-Architect folder for cloud deployment
  const mobileAppPath = path.resolve(process.cwd(), "control-ingreso");
  app.use("/ingreso", express.static(mobileAppPath));

  // Domain Routes

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.projects.update.path, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Phases
  app.get(api.phases.list.path, async (req, res) => {
    const phases = await storage.getPhases();
    res.json(phases);
  });

  app.post(api.phases.create.path, async (req, res) => {
    try {
      const input = api.phases.create.input.parse(req.body);
      const phase = await storage.createPhase(input);
      res.status(201).json(phase);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  // Time Entries
  app.get(api.timeEntries.list.path, async (req, res) => {
    const entries = await storage.getTimeEntries();
    res.json(entries);
  });

  app.post(api.timeEntries.create.path, async (req, res) => {
    const input = api.timeEntries.create.input.parse(req.body);
    const entry = await storage.createTimeEntry(input);
    res.status(201).json(entry);
  });

  // Tools
  app.get(api.tools.list.path, async (req, res) => {
    const tools = await storage.getTools();
    res.json(tools);
  });

  app.post(api.tools.create.path, async (req, res) => {
    const input = api.tools.create.input.parse(req.body);
    const tool = await storage.createTool(input);
    res.status(201).json(tool);
  });

  app.put(api.tools.update.path, async (req, res) => {
    const input = api.tools.update.input.parse(req.body);
    const tool = await storage.updateTool(Number(req.params.id), input);
    if (!tool) return res.status(404).send();
    res.json(tool);
  });

  // Materials
  app.get(api.materials.list.path, async (req, res) => {
    const materials = await storage.getMaterials();
    res.json(materials);
  });

  app.post(api.materials.create.path, async (req, res) => {
    const input = api.materials.create.input.parse(req.body);
    const material = await storage.createMaterial(input);
    res.status(201).json(material);
  });

  // Equipment
  app.get(api.equipment.list.path, async (req, res) => {
    const equipment = await storage.getEquipment();
    res.json(equipment);
  });

  app.post(api.equipment.create.path, async (req, res) => {
    const input = api.equipment.create.input.parse(req.body);
    const item = await storage.createEquipment(input);
    res.status(201).json(item);
  });

  app.post(api.equipment.logMaintenance.path, async (req, res) => {
    const input = api.equipment.logMaintenance.input.parse(req.body);
    const log = await storage.logMaintenance(input);
    res.status(201).json(log);
  });

  // Stats
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  return httpServer;
}
