import { apiClient } from "@/lib/apiClient";
import type { Order } from "@/types/order";

export const refillService = {
  request: (prescriptionId: string) =>
    apiClient.post<Order>("/refill-requests", { prescription_id: prescriptionId }),
};
