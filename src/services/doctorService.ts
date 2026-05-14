import { apiClient } from "@/lib/apiClient";
import type { Doctor } from "@/types/doctor";

export const doctorService = {
  listAll: () => apiClient.get<Doctor[]>("/admin/doctors"),
  create: (data: Omit<Doctor, "id" | "user_id" | "status" | "created_at">) =>
    apiClient.post<Doctor>("/admin/doctors", data),
  update: (id: string, data: Partial<Doctor>) => apiClient.put<Doctor>(`/admin/doctors/${id}`, data),
  toggleStatus: (id: string, status?: string) => apiClient.put<Doctor>(`/admin/doctors/${id}/status`, { status: status ?? "toggle" }),
  deleteDoctor: (id: string) => apiClient.del<void>(`/admin/doctors/${id}`),
  getAvailability: (id: string) => apiClient.get<{ working_hours: unknown[]; booked_slots: unknown[] }>(`/admin/doctors/${id}/availability`),
};
