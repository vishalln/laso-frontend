import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Activity, TrendingDown, Pill, Calendar, Package, ArrowRight, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WeightChart } from "@/components/shared/WeightChart";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUser } from "@/contexts/UserContext";
import { programService } from "@/services/programService";
import { checkInService } from "@/services/checkInService";
import { dashboardService } from "@/services/dashboardService";
import { consultationService } from "@/services/consultationService";
import { orderService } from "@/services/orderService";
import { getCurrentWeek, formatDate } from "@/utils/dateHelpers";

export default function Dashboard() {
  const { user } = useUser();
  const patientId = user?.id ?? "";

  const { data: programme, isLoading: progLoading } = useQuery({
    queryKey: ["programme", "active"],
    queryFn: () => programService.getActive(),
  });

  const { data: adherence, isLoading: adherenceLoading } = useQuery({
    queryKey: ["adherence", programme?.programme_id],
    queryFn: () => checkInService.getAdherence(programme!.programme_id),
    enabled: !!programme?.programme_id,
  });

  const { data: checkIns } = useQuery({
    queryKey: ["checkIns", programme?.programme_id],
    queryFn: () => checkInService.listForProgramme(programme!.programme_id),
    enabled: !!programme?.programme_id,
  });

  const { data: nextAction, isLoading: actionLoading } = useQuery({
    queryKey: ["nextAction"],
    queryFn: () => dashboardService.getNextAction(),
  });

  const { data: consultations } = useQuery({
    queryKey: ["consultations", "upcoming"],
    queryFn: () => consultationService.getUpcoming(),
  });

  const { data: orders } = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => orderService.listRecent(),
  });

  // Derive weight chart data from check-ins
  const weightData = checkIns?.map((ci) => ({ week: ci.week_number, weight: ci.weight_kg })) ?? [];
  const startWeight = weightData.length > 0 ? weightData[0].weight : null;
  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
  const weightLost = startWeight && currentWeight ? startWeight - currentWeight : 0;

  const upcomingConsult = consultations?.[0];
  const activeOrder = orders?.find((o) => o.status !== "delivered" && o.status !== "cancelled");

  // No active programme state
  if (!progLoading && !programme) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={PlayCircle}
          title="No active programme"
          description="Start your weight-loss journey today with a personalised GLP-1 programme."
          action={{ label: "Start Programme", onClick: () => window.location.href = "/programme/start" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name?.split(" ")[0]}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Programme Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pill className="h-4 w-4" /> Programme Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : programme ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">Week {getCurrentWeek(programme.start_date)}</span>
                  <StatusBadge status={programme.status} type="programme" />
                </div>
                <Link to="/programme" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View timeline <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Weight Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightData.length > 0 ? (
              <div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-lg font-bold">{currentWeight} kg</span>
                  {weightLost > 0 && (
                    <span className="text-xs text-green-600 font-medium">-{weightLost.toFixed(1)} kg</span>
                  )}
                </div>
                <WeightChart data={weightData} variant="sparkline" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete your first check-in to track progress</p>
            )}
          </CardContent>
        </Card>

        {/* Adherence */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adherenceLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : adherence ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{adherence.adherence_pct}%</span>
                  <span className="text-xs text-muted-foreground">
                    {adherence.submitted_weeks}/{adherence.total_weeks} weeks
                  </span>
                </div>
                <Progress value={adherence.adherence_pct} className="h-2" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Action</CardTitle>
          </CardHeader>
          <CardContent>
            {actionLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : nextAction ? (
              <div>
                <p className="text-sm font-semibold">{nextAction.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{nextAction.description}</p>
                {nextAction.action_url && (
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <Link to={nextAction.action_url}>Go <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Consultation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Next Consultation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingConsult && upcomingConsult.scheduled_at ? (
              <div>
                <p className="text-sm font-semibold">
                  {new Date(upcomingConsult.scheduled_at).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(upcomingConsult.scheduled_at).toLocaleTimeString("en-US", {
                    hour: "numeric", minute: "2-digit",
                  })}
                </p>
                <StatusBadge status={upcomingConsult.status} type="consultation" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming consultations</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" /> Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrder ? (
              <div>
                <StatusBadge status={activeOrder.status} type="order" />
                <p className="text-xs text-muted-foreground mt-2">
                  Placed {formatDate(activeOrder.created_at)}
                </p>
                <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                  Track order <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
