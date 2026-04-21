export type OrderStatus =
  | "prescription_received"
  | "pharmacist_review"
  | "safety_check"
  | "dispensed"
  | "packed"
  | "cold_chain_verified"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "processing"
  | "cancelled";

export interface OrderItem {
  name: string;
  quantity: string;
  price: number;
}

export interface TrackingStep {
  label: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
}

export interface ActiveOrder {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  date: string;
  steps: TrackingStep[];
  delivery: {
    estimatedTime: string;
    address: string;
    carrier: string;
    trackingId: string;
    coldChainIntact: boolean;
  };
  pharmacy: {
    name: string;
    license: string;
    note: string;
  };
}

export interface OrderRecord {
  id: string;
  date: string;
  status: Extract<OrderStatus, "delivered" | "in_transit" | "processing" | "cancelled">;
  items: { name: string; price: number }[];
  total: number;
  deliveryDate: string;
  trackingId: string;
}

export const mockActiveOrder: ActiveOrder = {
  id: "ORD-2026-00142",
  status: "in_transit",
  items: [
    { name: "Rybelsus 14mg (30 tabs)", quantity: "1 strip", price: 8499 },
    { name: "Laso Care Pack (glucose strips × 25)", quantity: "1 pack", price: 350 },
    { name: "Laso Consultation — Dr. R. Sharma", quantity: "1 session", price: 0 },
  ],
  total: 8849,
  date: "2026-04-17",
  steps: [
    { label: "Prescription received", timestamp: "Apr 17, 9:02 AM", completed: true, active: false },
    { label: "Pharmacist review", timestamp: "Apr 17, 9:45 AM", completed: true, active: false },
    { label: "Safety & cold-chain check", timestamp: "Apr 17, 11:30 AM", completed: true, active: false },
    { label: "Dispatched — Blue Dart Express", timestamp: "Apr 17, 3:10 PM", completed: true, active: false },
    { label: "In transit", timestamp: "Apr 18, 7:22 AM", completed: false, active: true },
    { label: "Out for delivery", timestamp: null, completed: false, active: false },
    { label: "Delivered", timestamp: null, completed: false, active: false },
  ],
  delivery: {
    estimatedTime: "Today, 2:00–5:00 PM",
    address: "B-404, Shreeji Heights, Andheri West, Mumbai – 400053",
    carrier: "Blue Dart Express",
    trackingId: "BD-7748291-IN",
    coldChainIntact: true,
  },
  pharmacy: {
    name: "Laso Rx Partner — MedPlus Pharmacy (Apollo Network)",
    license: "MH-PH-BOM-002241",
    note: "All dispensations verified by a licensed pharmacist. Cold chain maintained at 2–8 °C throughout transit.",
  },
};

export const orderHistory: OrderRecord[] = [
  {
    id: "ORD-2026-00108",
    date: "2026-03-18",
    status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", price: 6200 }, { name: "Consultation — Dr. Sharma", price: 0 }],
    total: 6200,
    deliveryDate: "Mar 20, 2026",
    trackingId: "BD-7614823-IN",
  },
  {
    id: "ORD-2026-00079",
    date: "2026-02-18",
    status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", price: 6200 }, { name: "Laso Starter Kit", price: 499 }],
    total: 6699,
    deliveryDate: "Feb 21, 2026",
    trackingId: "BD-7481092-IN",
  },
  {
    id: "ORD-2026-00041",
    date: "2026-01-26",
    status: "delivered",
    items: [
      { name: "Rybelsus 3mg (30 tabs)", price: 3500 },
      { name: "Laso Starter Kit", price: 499 },
      { name: "First consultation — Dr. Sharma", price: 1500 },
    ],
    total: 5499,
    deliveryDate: "Jan 28, 2026",
    trackingId: "BD-7312048-IN",
  },
];

export const refillStatus = {
  medicationName: "Rybelsus 14mg",
  currentSupply: 8,
  totalSupply: 30,
  estimatedRunOut: "Apr 26, 2026",
  autoRefillScheduled: "Apr 22, 2026",
  status: "low" as "ok" | "low" | "critical",
};
