import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTracker } from "@/components/shared/OrderTracker";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { orderService } from "@/services/orderService";

export default function Orders() {
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => orderService.listRecent(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p className="text-destructive mb-4">Failed to load orders.</p>
        <button onClick={() => refetch()} className="text-primary underline text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {(!orders || orders.length === 0) ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders will appear here once your doctor issues a prescription."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order #{order.id.slice(-6)}
                  </CardTitle>
                  <StatusBadge status={order.status} type="order" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <OrderTracker order={order} />
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Placed: {new Date(order.placed_at).toLocaleDateString()}</span>
                  {order.delivered_at && (
                    <span>Delivered: {new Date(order.delivered_at).toLocaleDateString()}</span>
                  )}
                  <span>Qty: {order.quantity}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
