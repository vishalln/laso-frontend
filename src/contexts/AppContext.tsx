// ─────────────────────────────────────────────────────────────────────────────
// AppContext.tsx — Global app state: notifications + shopping cart
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { CatalogItem } from "@/data/mockDB";

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  item: CatalogItem;
  qty: number;
  /** Set only for Rx items — carries the prescriptionId that unlocked them */
  prescriptionId?: string;
}

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export interface PlacedOrder {
  id: string;
  placedAt: string;
  items: CartItem[];
  totalInr: number;
  paymentMethod: PaymentMethod;
  status: "confirmed" | "processing" | "dispatched" | "delivered";
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  // — notifications —
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissNotification: (id: string) => void;

  // — cart —
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CatalogItem, prescriptionId?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (itemId: string) => boolean;
  /** Adds every Rx item that has an active prescription to cart (idempotent). */
  addPrescriptionToCart: () => void;

  // — placed orders —
  placedOrders: PlacedOrder[];
  placeOrder: (paymentMethod: PaymentMethod) => PlacedOrder;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const initialNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "warning",
    title: "Medication supply low",
    message: "Rybelsus 14mg — 8 days remaining. Auto-refill scheduled Apr 22.",
    read: false,
    timestamp: "2026-04-18T09:00:00",
  },
  {
    id: "notif-002",
    type: "success",
    title: "12-week milestone reached",
    message: "You've completed 12 weeks of treatment. 6.2 kg lost, HbA1c 7.1%.",
    read: false,
    timestamp: "2026-04-16T10:30:00",
  },
  {
    id: "notif-003",
    type: "info",
    title: "Next consultation: Apr 28",
    message: "Month 4 review with Dr. Rahul Sharma at 9:00 AM (online).",
    read: true,
    timestamp: "2026-04-15T08:00:00",
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { readonly children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  // ── Notification helpers ──────────────────────────────────────────────────

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "read" | "timestamp">) => {
      setNotifications((prev) => [
        { ...n, id: `notif-${Date.now()}`, read: false, timestamp: new Date().toISOString() },
        ...prev,
      ]);
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Cart helpers ──────────────────────────────────────────────────────────

  const cartCount = useMemo(
    () => cart.reduce((acc, ci) => acc + ci.qty, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, ci) => acc + ci.item.priceInr * ci.qty, 0),
    [cart],
  );

  const addToCart = useCallback((item: CatalogItem, prescriptionId?: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci,
        );
      }
      return [...prev, { item, qty: 1, prescriptionId }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const updateQty = useCallback((itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((ci) => (ci.item.id === itemId ? { ...ci, qty } : ci)),
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (itemId: string) => cart.some((ci) => ci.item.id === itemId),
    [cart],
  );

  /** No-op placeholder — Rx items are added via the Orders/Prescriptions tab. */
  const addPrescriptionToCart = useCallback(() => {}, []);

  // ── Order placement ───────────────────────────────────────────────────────

  const placeOrder = useCallback(
    (paymentMethod: PaymentMethod): PlacedOrder => {
      const order: PlacedOrder = {
        id: `ORD-${Date.now()}`,
        placedAt: new Date().toISOString(),
        items: [...cart],
        totalInr: cartTotal,
        paymentMethod,
        status: "confirmed",
      };
      setPlacedOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [cart, cartTotal],
  );

  // ── Value ─────────────────────────────────────────────────────────────────

  const value = useMemo<AppContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      markRead,
      dismissNotification,
      cart,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      isInCart,
      addPrescriptionToCart,
      placedOrders,
      placeOrder,
    }),
    [
      notifications, unreadCount, addNotification, markAllRead, markRead, dismissNotification,
      cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart, isInCart,
      addPrescriptionToCart, placedOrders, placeOrder,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
