export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: "medication" | "supplement" | "device" | "consumable";
  price_inr: number;
  stock_count: number;
  in_stock: boolean;
  description?: string;
  created_at: string;
}
