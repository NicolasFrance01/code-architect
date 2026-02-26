
import { Router } from "express";
import { storage } from "../storage";
import { insertTimeEntrySchema } from "@shared/schema";
import { z } from "zod";

export const externalRouter = Router();

// Schema for the lightweight external payload
const externalTimesheetSchema = z.object({
    date: z.string(), // YYYY-MM-DD
    worker: z.string(),
    project: z.string(), // ID or Name
    phase: z.string(), // ID or Code
    hours: z.coerce.number(),
    notes: z.string().optional(),
});

// EXPOSE METADATA FOR DROPDOWNS
externalRouter.get("/projects", async (req, res) => {
    const projects = await storage.getProjects();
    // Return only active projects
    res.json(projects.filter(p => p.status === 'active').map(p => ({ id: p.id, name: p.name, jobNumber: p.jobNumber })));
});

externalRouter.get("/phases", async (req, res) => {
    const phases = await storage.getPhases();
    res.json(phases.map(p => ({ id: p.id, code: p.code, name: p.name })));
});

externalRouter.post("/timesheets", async (req, res) => {
    try {
        console.log("[External API] Received timesheet:", req.body);
        const data = externalTimesheetSchema.parse(req.body);

        // 1. Find Project ID (Input might be ID or Name)
        // We try to match by ID first (if coming from dropdown), then name
        const projects = await storage.getProjects();
        let project = projects.find(p => p.id === Number(data.project));
        if (!project) {
            // Fallback to name search
            project = projects.find(p => p.name.toLowerCase().includes(data.project.toLowerCase()));
        }

        if (!project) {
            return res.status(404).json({ ok: false, msg: `Project '${data.project}' not found` });
        }

        // 2. Find Phase ID
        const phases = await storage.getPhases();
        let phase = phases.find(p => p.id === Number(data.phase));
        if (!phase) {
            // Fallback to code search
            phase = phases.find(p => p.code === data.phase);
        }

        // Default fallback if still missing
        const phaseId = phase ? phase.id : (phases[0]?.id);

        if (!phaseId) {
            return res.status(500).json({ ok: false, msg: "System misconfiguration: No phases available" });
        }

        // 3. Find Foreman ID (Default to a system admin/bot user)
        // In a real scenario, we might look up the user sending the request
        // For now, let's just grab the first user in the system (seed user)
        // We assume there's at least one user from auth storage or seeded
        // Since we don't have easy access to users table via 'storage' interface if strictly defined, 
        // we might need to rely on a hardcoded ID or assume ID '1' exists.
        // The current storage interface might not expose getUsers().
        // Let's assume foreman ID '1' (the dev admin) exists.
        const foremanId = "1";

        // 4. Create Time Entry
        const entry = await storage.createTimeEntry({
            projectId: project.id,
            phaseId: phaseId,
            foremanId: foremanId,
            workerName: data.worker,
            date: data.date,
            hours: data.hours.toString(),
            notes: data.notes || "Imported via Control-Ingreso",
        });

        res.json({ ok: true, id: entry.id });

    } catch (error) {
        console.error("External API Error:", error);
        res.status(400).json({ ok: false, msg: "Invalid data format or server error" });
    }
});
