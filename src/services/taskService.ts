import { apiClient } from "@/lib/apiClient";
import type { Task, DoctorPendingAction } from "@/types/task";

export const taskService = {
  list: async () => {
    const result = await apiClient.get<{ items: Task[]; next_cursor: string | null }>("/tasks");
    return result.items;
  },
  listDoctor: () => apiClient.get<DoctorPendingAction[]>("/tasks/doctor"),
  toggle: (id: string) => apiClient.put<Task>(`/tasks/${id}/toggle`, {}),
};
