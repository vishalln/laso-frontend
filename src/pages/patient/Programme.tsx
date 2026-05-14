import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ClipboardList, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramTimeline } from "@/components/shared/ProgramTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { programService } from "@/services/programService";
import { toast } from "@/hooks/use-toast";

export default function Programme() {
  const queryClient = useQueryClient();

  const { data: programme, isLoading, error } = useQuery({
    queryKey: ["programme", "active"],
    queryFn: () => programService.getActive(),
  });

  const { data: steps, isLoading: stepsLoading } = useQuery({
    queryKey: ["programme", "steps", programme?.id],
    queryFn: () => programService.getSteps(programme!.id),
    enabled: !!programme?.id,
  });

  const completeMutation = useMutation({
    mutationFn: (stepId: string) => programService.completeStep(programme!.id, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programme"] });
      toast.success("Step marked as complete");
    },
    onError: () => toast.error("Failed to complete step"),
  });

  const skipMutation = useMutation({
    mutationFn: (stepId: string) => programService.skipStep(programme!.id, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programme"] });
      toast.success("Step skipped");
    },
    onError: () => toast.error("Failed to skip step"),
  });

  if (isLoading || stepsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !programme) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <EmptyState
          icon={ClipboardList}
          title="No active programme"
          description="Start a new programme to begin your health journey."
          action={{ label: "Start Programme", onClick: () => window.location.href = "/programme/start" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Programme</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Week {programme.current_week} &middot; Started {new Date(programme.started_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={programme.status} type="programme" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/programme/history"><History className="h-4 w-4 mr-1" /> History</Link>
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Programme Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramTimeline
            steps={steps ?? programme.steps ?? []}
            mode="full"
            showControls
            onCompleteStep={(stepId) => completeMutation.mutate(stepId)}
            onSkipStep={(stepId) => skipMutation.mutate(stepId)}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/programme/check-in">Submit Weekly Check-in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
