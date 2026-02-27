import app from "../server/index.js";
import { registerRoutes } from "../server/routes.js";
import { createServer } from "http";

let initialized = false;

// Vercel Serverless Entrypoint Wrapper
export default async function handler(req: any, res: any) {
    if (!initialized) {
        const httpServer = createServer(app);
        await registerRoutes(httpServer, app);
        initialized = true;
    }

    return app(req, res);
}

