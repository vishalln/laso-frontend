// ─────────────────────────────────────────────────────────────────────────────
// PrescriptionBanner.tsx
//
// Reusable "Add prescription to cart" call-to-action.
// Shows the prescribing doctor, prescription date, each Rx item with price,
// a running total, and a single "Add all N items to cart" button.
//
// Usage:
//   <PrescriptionBanner onCartOpen={() => setCartOpen(true)} />
//
// Props:
//   onCartOpen  — optional callback to open the cart sheet after items are added
//   compact     — renders a smaller inline variant (used in Dashboard NBA card)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { ShoppingCart, CheckCircle, Shield, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RX_MEDICATIONS } from "@/data/catalogItems";
import {
  ACTIVE_PRESCRIPTIONS,
  PRESCRIPTION_BY_ITEM_ID,
} from "@/data/activePrescriptions";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface PrescriptionBannerProps {
  /** Called after addPrescriptionToCart() so the parent can slide the cart open */
  onCartOpen?: () => void;
  /** Compact single-row variant for Dashboard / NBA cards */
  compact?: boolean;
  className?: string;
}

export function PrescriptionBanner({
  onCartOpen,
  compact = false,
  className,
}: PrescriptionBannerProps) {
  // ── Derive the list of prescribed items (only those with active Rx) ───────
  const prescribedItems = useMemo(
    () => RX_MEDICATIONS.filter((item) => !!PRESCRIPTION_BY_ITEM_ID[item.id]),
    [],
  );

  const total = useMemo(
    () => prescribedItems.reduce((acc, i) => acc + i.priceInr, 0),
    [prescribedItems],
  );

  const { addPrescriptionToCart, isInCart } = useApp();

  const allInCart = prescribedItems.every((i) => isInCart(i.id));
  const newCount  = prescribedItems.filter((i) => !isInCart(i.id)).length;

  // The prescriber meta (same for all items in mock — one doctor)
  const meta = ACTIVE_PRESCRIPTIONS[0];

  function handleAdd() {
    addPrescriptionToCart();
    onCartOpen?.();
  }

  // ── Compact variant (for Dashboard NBA) ───────────────────────────────────
  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3",
        className,
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <Stethoscope className="h-5 w-5 text-teal-700 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-900 truncate">
              {meta.prescribedBy} prescribed {prescribedItems.length} item
              {prescribedItems.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-teal-700">
              ₹{total.toLocaleString()} · Prescribed {meta.prescribedOn}
            </p>
          </div>
        </div>
        {allInCart ? (
          <Badge className="bg-success/10 text-success border-success/20 flex-shrink-0 gap-1">
            <CheckCircle className="h-3 w-3" /> In cart
          </Badge>
        ) : (
          <Button size="sm" onClick={handleAdd} className="flex-shrink-0 gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Add {newCount}
          </Button>
        )}
      </div>
    );
  }

  // ── Full variant (for Orders → Prescriptions tab) ─────────────────────────
  return (
    <div className={cn(
      "rounded-xl border border-teal-200 bg-teal-50 overflow-hidden",
      className,
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-teal-200">
        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <p className="font-semibold text-teal-900">Active Prescription</p>
          <p className="text-xs text-teal-700">
            {meta.prescribedBy} · Prescribed {meta.prescribedOn} · Expires{" "}
            {meta.expiresOn}
          </p>
        </div>
        <Badge className="ml-auto bg-teal-100 text-teal-800 border-teal-300 text-xs">
          {prescribedItems.length} item{prescribedItems.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Item list */}
      <ul className="divide-y divide-teal-100">
        {prescribedItems.map((item) => {
          const rx = PRESCRIPTION_BY_ITEM_ID[item.id]!;
          const inCart = isInCart(item.id);
          return (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-teal-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-teal-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {rx.prescriptionId} · {item.unit}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-teal-900">
                  ₹{item.priceInr.toLocaleString()}
                </p>
                {inCart && (
                  <p className="text-[10px] text-success flex items-center gap-0.5 justify-end mt-0.5">
                    <CheckCircle className="h-2.5 w-2.5" /> In cart
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer — total + CTA */}
      <div className="px-5 py-4 bg-teal-100/60 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-teal-700">Total (incl. free delivery)</p>
          <p className="text-lg font-bold text-teal-900">
            ₹{total.toLocaleString()}
          </p>
        </div>
        <Separator orientation="vertical" className="h-10 bg-teal-200" />
        {allInCart ? (
          <div className="flex items-center gap-2 text-success font-medium text-sm">
            <CheckCircle className="h-5 w-5" />
            All items in cart
          </div>
        ) : (
          <Button onClick={handleAdd} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add all {newCount} item{newCount !== 1 ? "s" : ""} to cart
          </Button>
        )}
      </div>
    </div>
  );
}
