import { apiClient } from "@/lib/apiClient";
import type { CatalogProduct } from "@/types/catalog";

export const catalogService = {
  listAll: () => apiClient.get<CatalogProduct[]>("/admin/catalog"),
  listMedications: () => apiClient.get<CatalogProduct[]>("/catalog/medications"),
  create: (data: Omit<CatalogProduct, "id" | "in_stock" | "created_at">) =>
    apiClient.post<CatalogProduct>("/admin/catalog", data),
  update: (id: string, data: Partial<CatalogProduct>) => apiClient.put<CatalogProduct>(`/admin/catalog/${id}`, data),
  deleteProduct: (id: string) => apiClient.del<void>(`/admin/catalog/${id}`),
  toggleStock: (id: string) => apiClient.put<CatalogProduct>(`/admin/catalog/${id}/stock`, {}),
};
