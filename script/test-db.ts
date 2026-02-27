import { storage } from "../server/storage.js";

async function run() {
    try {
        const projects = await storage.getProjects();
        console.log("Projects:", projects);
    } catch (e) {
        console.log("DB Error Message:", e.message);
    } finally {
        process.exit(0);
    }
}
run();
