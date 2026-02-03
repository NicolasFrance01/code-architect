import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTool, InsertMaterial, InsertEquipment, InsertMaintenanceLog } from "@shared/schema";

// === TOOLS ===
export function useTools() {
  return useQuery({
    queryKey: [api.tools.list.path],
    queryFn: async () => {
      const res = await fetch(api.tools.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tools");
      return api.tools.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTool) => {
      const validated = api.tools.create.input.parse(data);
      const res = await apiRequest("POST", api.tools.create.path, validated);
      return api.tools.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tools.list.path] }),
  });
}

// === MATERIALS ===
export function useMaterials() {
  return useQuery({
    queryKey: [api.materials.list.path],
    queryFn: async () => {
      const res = await fetch(api.materials.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch materials");
      return api.materials.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMaterial) => {
      const validated = api.materials.create.input.parse(data);
      const res = await apiRequest("POST", api.materials.create.path, validated);
      return api.materials.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.materials.list.path] }),
  });
}

// === EQUIPMENT ===
export function useEquipment() {
  return useQuery({
    queryKey: [api.equipment.list.path],
    queryFn: async () => {
      const res = await fetch(api.equipment.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch equipment");
      return api.equipment.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEquipment) => {
      const validated = api.equipment.create.input.parse(data);
      const res = await apiRequest("POST", api.equipment.create.path, validated);
      return api.equipment.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.equipment.list.path] }),
  });
}

export function useLogMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertMaintenanceLog }) => {
      const url = buildUrl(api.equipment.logMaintenance.path, { id });
      const validated = api.equipment.logMaintenance.input.parse(data);
      const res = await apiRequest("POST", url, validated);
      return api.equipment.logMaintenance.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.equipment.list.path] }),
  });
}
