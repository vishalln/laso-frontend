import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { AlertTriangle, Flag } from "lucide-react";

export default function Alerts() {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["doctor-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  const { data: allFlags } = useQuery({
    queryKey: ["doctor-patient-flags", patients?.map((p) => p.id)],
    queryFn: async () => {
      if (!patients) return [];
      const results = await Promise.all(
        patients.map(async (p) => {
          const flags = await patientService.getFlags(p.id);
          return flags.map((f) => ({ ...f, patientName: p.name }));
        })
      );
      return results.flat();
    },
    enabled: !!patients?.length,
  });

  if (isLoading) return <LoadingSkeleton />;

  const urgentFlags = allFlags?.filter((f) => f.flag_type === "urgent" || f.flag_type === "review_needed") ?? [];
  const sorted = [...urgentFlags].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
        <h1 className="text-2xl font-bold">Alerts</h1>
        {sorted.length > 0 && <Badge variant="destructive">{sorted.length}</Badge>}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No active alerts" description="All patients are on track. No urgent reviews needed." />
      ) : (
        <div className="space-y-3">
          {sorted.map((flag) => (
            <Card
              key={flag.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/doctor/patients/${flag.patient_id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${flag.flag_type === "urgent" ? "bg-red-100" : "bg-amber-100"}`}>
                  <Flag className={`h-5 w-5 ${flag.flag_type === "urgent" ? "text-red-600" : "text-amber-600"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{flag.patientName}</p>
                  <p className="text-sm text-muted-foreground">{flag.reason}</p>
                </div>
                <div className="text-right">
                  <Badge variant={flag.flag_type === "urgent" ? "destructive" : "default"}>
                    {flag.flag_type.replace("_", " ")}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(flag.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
  );
}
