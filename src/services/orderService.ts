import { apiClient } from "@/lib/apiClient";
import type { Order } from "@/types/order";

export const orderService = {
  create: (data: { patient_id: string; prescription_id?: string; quantity: number; delivery_address?: string }) =>
    apiClient.post<Order>("/orders", data),
  listForPatient: (patientId: string) => apiClient.get<Order[]>(`/orders/patient/${patientId}`),
  listRecent: () => apiClient.get<Order[]>("/orders/recent"),
  advance: (id: string, status?: string) => apiClient.put<Order>(`/orders/${id}/advance`, { status: status ?? "next" }),
};
