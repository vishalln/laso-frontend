import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import { adminService } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, TrendingUp, Weight } from "lucide-react";

export default function Dashboard() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsService.overview,
  });

  const { data: statusDist, isLoading: loadingStatus } = useQuery({
    queryKey: ["analytics", "statusDistribution"],
    queryFn: analyticsService.statusDistribution,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminService.listUsers,
  });

  const statCards = [
    { label: "Total Patients", value: overview?.total_patients, icon: Users, color: "text-blue-600" },
    { label: "Active Programmes", value: overview?.active_programmes, icon: UserCheck, color: "text-green-600" },
    { label: "Avg Adherence", value: overview?.average_adherence_pct ? `${overview.average_adherence_pct}%` : undefined, icon: TrendingUp, color: "text-violet-600" },
    { label: "Avg Weight Lost", value: overview?.average_weight_loss_kg ? `${overview.average_weight_loss_kg} kg` : undefined, icon: Weight, color: "text-orange-600" },
  ];

  const roleCounts = (users as any[])?.reduce((acc: Record<string, number>, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const totalStatus = statusDist?.reduce((s, d) => s + d.value, 0) ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              {loadingOverview ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{s.value ?? "—"}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Patient Status Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Patient Status Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loadingStatus ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : (
              statusDist?.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  <Progress value={(item.value / totalStatus) * 100} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Staff Count by Role */}
        <Card>
          <CardHeader><CardTitle className="text-base">Staff by Role</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loadingUsers ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : (
              Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span className="capitalize">{role}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
