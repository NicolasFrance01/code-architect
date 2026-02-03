import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTimeEntry } from "@shared/schema";

export function useTimeEntries(filters?: { projectId?: string; foremanId?: string }) {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append("projectId", filters.projectId);
  if (filters?.foremanId) params.append("foremanId", filters.foremanId);
  const url = `${api.timeEntries.list.path}?${params.toString()}`;

  return useQuery({
    queryKey: [api.timeEntries.list.path, filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch time entries");
      return api.timeEntries.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTimeEntry) => {
      // Coerce numeric types for form inputs
      const payload = {
        ...data,
        hours: String(data.hours), // schema expects string/numeric but form might give number
      };
      const validated = api.timeEntries.create.input.parse(payload);
      const res = await apiRequest("POST", api.timeEntries.create.path, validated);
      return api.timeEntries.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.timeEntries.list.path] });
    },
  });
}
