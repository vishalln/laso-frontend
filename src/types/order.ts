export interface Order {
  order_id: string;
  patient_id: string;
  prescription_id: string | null;
  programme_id: string | null;
  quantity: number;
  delivery_address: string;
  status: string;
  carrier_name: string | null;
  tracking_id: string | null;
  estimated_delivery: string | null;
  cold_chain_status: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  dispensed_at: string | null;
  packed_at: string | null;
  cold_chain_at: string | null;
  dispatched_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
}
