import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface OrderTrackerProps {
  order: Order;
  showAdvanceButton?: boolean;
  onAdvance?: () => void;
}

const STAGES = ["placed", "confirmed", "dispensed", "shipped", "in_transit", "delivered"] as const;

const STAGE_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  dispensed: "Dispensed",
  shipped: "Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
};

function getStageIndex(status: string): number {
  // Map the order status to stage index
  const idx = STAGES.indexOf(status as typeof STAGES[number]);
  return idx >= 0 ? idx : 0;
}

export function OrderTracker({ order, showAdvanceButton, onAdvance }: OrderTrackerProps) {
  const currentIndex = getStageIndex(order.status);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center w-full">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                isCompleted
                  ? "bg-primary border-primary text-white"
                  : "bg-background border-muted-foreground/30",
                isCurrent && "ring-2 ring-primary/30",
              )}>
                {isCompleted && <Check className="h-3 w-3" />}
              </div>

              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 mx-1",
                  idx < currentIndex ? "bg-primary" : "bg-muted-foreground/20",
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels (mobile-responsive: show only first, current, and last on small screens) */}
      <div className="flex w-full">
        {STAGES.map((stage, idx) => (
          <div key={stage} className={cn(
            "flex-1 last:flex-none text-center",
            idx === 0 && "text-left",
            idx === STAGES.length - 1 && "text-right",
          )}>
            <span className={cn(
              "text-[10px] sm:text-xs",
              idx <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground",
              // Hide middle labels on very small screens
              idx > 0 && idx < STAGES.length - 1 && "hidden sm:inline",
            )}>
              {STAGE_LABELS[stage]}
            </span>
          </div>
        ))}
      </div>

      {showAdvanceButton && order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onAdvance}>
            Advance Status
          </Button>
        </div>
      )}
    </div>
  );
}
