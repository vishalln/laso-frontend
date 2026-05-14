import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { Package, ArrowRight } from "lucide-react";
import type { Order } from "@/types/order";

export default function Orders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["coordinator-orders"],
    queryFn: orderService.listRecent,
  });

  const advanceMutation = useMutation({
    mutationFn: (id: string) => orderService.advance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-orders"] });
      toast({ title: "Order advanced to next stage" });
    },
    onError: () => toast({ title: "Failed to advance order", variant: "destructive" }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!orders?.length) return <EmptyState title="No orders" description="No recent orders to display." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onAdvance={() => advanceMutation.mutate(order.id)} advancing={advanceMutation.isPending} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onAdvance, advancing }: { order: Order; onAdvance: () => void; advancing: boolean }) {
  const statusColor: Record<string, string> = {
    placed: "default",
    confirmed: "default",
    shipped: "secondary",
    delivered: "secondary",
    cancelled: "destructive",
  };

  const canAdvance = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">Qty: {order.quantity} | Placed: {new Date(order.placed_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColor[order.status] as any}>{order.status}</Badge>
          {canAdvance && (
            <Button size="sm" variant="outline" onClick={onAdvance} disabled={advancing}>
              <ArrowRight className="h-3.5 w-3.5 mr-1" /> Advance
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
  );
}
