import { apiClient } from "@/lib/apiClient";
import type { Payment } from "@/types/payment";

export const paymentService = {
  initiate: (data: { programme_id: string; amount: number }) =>
    apiClient.post<Payment>("/payments/initiate", data),
  getStatus: (id: string) => apiClient.get<Payment>(`/payments/${id}/status`),
};
