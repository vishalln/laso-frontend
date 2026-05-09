import { apiClient } from "@/lib/apiClient";
import type { Role } from "@/lib/roles";

export const adminService = {
  updateUserRole: async (userEmail: string, role: Role) => {
    return apiClient.put(`/admin/users/${userEmail}/role`, { role });
  },

  listUsers: async () => {
    return apiClient.get("/admin/users");
  },

  toggleUserStatus: async (userEmail: string, active: boolean) => {
    return apiClient.put(`/admin/users/${userEmail}/status`, { active });
  },
};
