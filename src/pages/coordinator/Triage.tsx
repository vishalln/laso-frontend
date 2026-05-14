import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import { messageService } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Eye, CheckCircle, MessageSquare, ArrowUpRight } from "lucide-react";
import type { PatientSummary } from "@/types/patient";

type Tier = "immediate" | "monitor" | "on_track";

export default function Triage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["coordinator-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  const { data: summaries } = useQuery({
    queryKey: ["coordinator-summaries", patients?.map((p) => p.id)],
    queryFn: async () => {
      if (!patients) return [];
      return Promise.all(patients.map((p) => patientService.getSummary(p.id)));
    },
    enabled: !!patients?.length,
  });

  const tiers = useMemo(() => {
    if (!summaries) return { immediate: [], monitor: [], on_track: [] };
    const result: Record<Tier, PatientSummary[]> = { immediate: [], monitor: [], on_track: [] };

    for (const s of summaries) {
      const hasUrgent = s.active_flags.some((f) => f.flag_type === "urgent");
      const hasPlateau = s.active_flags.some((f) => f.flag_type === "plateau");
      const hasReview = s.active_flags.some((f) => f.flag_type === "review_needed");

      if (hasUrgent || s.adherence_pct < 40) result.immediate.push(s);
      else if (s.adherence_pct < 70 || hasPlateau || hasReview) result.monitor.push(s);
      else result.on_track.push(s);
    }
    return result;
  }, [summaries]);

  const escalateMutation = useMutation({
    mutationFn: (patientId: string) => patientService.setFlag(patientId, { flag_type: "urgent", reason: "Escalated by coordinator" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-summaries"] });
      toast({ title: "Escalated to doctor" });
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Triage Dashboard</h1>

      <TierSection
        title="Immediate"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        color="border-red-200 bg-red-50/30"
        patients={tiers.immediate}
        onNavigate={(id) => navigate(`/coordinator/patients/${id}`)}
        onEscalate={(id) => escalateMutation.mutate(id)}
      />

      <TierSection
        title="Monitor"
        icon={<Eye className="h-5 w-5 text-amber-600" />}
        color="border-amber-200 bg-amber-50/30"
        patients={tiers.monitor}
        onNavigate={(id) => navigate(`/coordinator/patients/${id}`)}
        onEscalate={(id) => escalateMutation.mutate(id)}
      />

      <TierSection
        title="On Track"
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        color="border-green-200 bg-green-50/30"
        patients={tiers.on_track}
        onNavigate={(id) => navigate(`/coordinator/patients/${id}`)}
        onEscalate={(id) => escalateMutation.mutate(id)}
      />
    </div>
  );
}

interface TierSectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  patients: PatientSummary[];
  onNavigate: (id: string) => void;
  onEscalate: (id: string) => void;
}

function TierSection({ title, icon, color, patients, onNavigate, onEscalate }: TierSectionProps) {
  if (!patients.length) return null;

  return (
    <Card className={color}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon} {title} ({patients.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {patients.map((s) => (
          <div key={s.patient.id} className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div className="cursor-pointer flex-1" onClick={() => onNavigate(s.patient.id)}>
              <p className="font-medium text-sm">{s.patient.name}</p>
              <p className="text-xs text-muted-foreground">
                Week {s.current_week} | Adherence {s.adherence_pct}% | Lost {s.weight_change_kg ?? 0} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => onNavigate(s.patient.id)}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEscalate(s.patient.id)}>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
    </div>
  );
}
