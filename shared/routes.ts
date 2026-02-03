import { z } from 'zod';
import { 
  insertProjectSchema, 
  insertPhaseSchema, 
  insertTimeEntrySchema, 
  insertToolSchema, 
  insertMaterialSchema,
  insertMaterialTransactionSchema,
  insertEquipmentSchema,
  insertMaintenanceLogSchema,
  projects,
  phases,
  timeEntries,
  tools,
  materials,
  equipment,
  maintenanceLogs
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      input: z.object({
        status: z.enum(["active", "completed", "paused"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial(),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  phases: {
    list: {
      method: 'GET' as const,
      path: '/api/phases',
      responses: {
        200: z.array(z.custom<typeof phases.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/phases',
      input: insertPhaseSchema,
      responses: {
        201: z.custom<typeof phases.$inferSelect>(),
      },
    },
  },
  timeEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/time-entries',
      input: z.object({
        projectId: z.string().optional(),
        foremanId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof timeEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/time-entries',
      input: insertTimeEntrySchema,
      responses: {
        201: z.custom<typeof timeEntries.$inferSelect>(),
      },
    },
  },
  tools: {
    list: {
      method: 'GET' as const,
      path: '/api/tools',
      responses: {
        200: z.array(z.custom<typeof tools.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tools',
      input: insertToolSchema,
      responses: {
        201: z.custom<typeof tools.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tools/:id',
      input: insertToolSchema.partial(),
      responses: {
        200: z.custom<typeof tools.$inferSelect>(),
      },
    },
  },
  materials: {
    list: {
      method: 'GET' as const,
      path: '/api/materials',
      responses: {
        200: z.array(z.custom<typeof materials.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/materials',
      input: insertMaterialSchema,
      responses: {
        201: z.custom<typeof materials.$inferSelect>(),
      },
    },
    transaction: {
      method: 'POST' as const,
      path: '/api/materials/transactions',
      input: insertMaterialTransactionSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(), // Returns updated material or transaction?
      },
    },
  },
  equipment: {
    list: {
      method: 'GET' as const,
      path: '/api/equipment',
      responses: {
        200: z.array(z.custom<typeof equipment.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/equipment',
      input: insertEquipmentSchema,
      responses: {
        201: z.custom<typeof equipment.$inferSelect>(),
      },
    },
    logMaintenance: {
      method: 'POST' as const,
      path: '/api/equipment/:id/maintenance',
      input: insertMaintenanceLogSchema,
      responses: {
        201: z.custom<typeof maintenanceLogs.$inferSelect>(),
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          activeProjects: z.number(),
          totalEmployees: z.number(),
          lowStockItems: z.number(),
          equipmentInUse: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
