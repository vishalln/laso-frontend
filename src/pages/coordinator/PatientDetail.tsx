import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { prescriptionService } from "@/services/prescriptionService";
import { checkInService } from "@/services/checkInService";
import { ProgramTimeline } from "@/components/shared/ProgramTimeline";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FlaskConical, Calendar, Weight, Activity, Pill } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["patient-summary", id],
    queryFn: () => patientService.getSummary(id!),
    enabled: !!id,
  });

  const { data: activePrescriptions } = useQuery({
    queryKey: ["active-prescriptions", id],
    queryFn: () => prescriptionService.getActive(id!),
    enabled: !!id,
  });

  const { data: latestCheckIn } = useQuery({
    queryKey: ["latest-checkin", summary?.patient.programme_id],
    queryFn: () => checkInService.getLatest(summary!.patient.programme_id!),
    enabled: !!summary?.patient.programme_id,
  });

  if (isLoading || !summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const activePx = activePrescriptions?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{summary.patient.name}</h1>
          <p className="text-muted-foreground">Week {summary.current_week} | {summary.patient.email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4 mr-1" /> Send Message</Button>
          <Button size="sm" variant="outline"><FlaskConical className="h-4 w-4 mr-1" /> Enter Blood Results</Button>
          <Button size="sm" variant="outline"><Calendar className="h-4 w-4 mr-1" /> Schedule Consultation</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Current Weight" value={summary.latest_weight_kg ?? "-"} unit="kg" icon={<Weight className="h-5 w-5" />} />
        <StatCard label="Adherence" value={summary.adherence_pct} unit="%" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Active Medication" value={activePx ? `${activePx.medication} ${activePx.dose_value}${activePx.dose_unit}` : "None"} icon={<Pill className="h-5 w-5" />} />
      </div>

      {latestCheckIn && (
        <Card>
          <CardHeader><CardTitle className="text-base">Latest Check-in (Week {latestCheckIn.week_number})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Weight:</span> {latestCheckIn.weight_kg} kg</div>
              <div><span className="text-muted-foreground">Glucose:</span> {latestCheckIn.fasting_glucose ?? "-"} mmol/L</div>
              <div><span className="text-muted-foreground">Doses Taken:</span> {latestCheckIn.doses_taken}</div>
              <div><span className="text-muted-foreground">Energy:</span> {latestCheckIn.energy_level}/5</div>
            </div>
            {latestCheckIn.side_effects.length > 0 && (
              <div className="mt-2 flex gap-1">
                {latestCheckIn.side_effects.map((se) => <Badge key={se} variant="secondary">{se}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {summary.patient.programme_id ? (
        <ProgramTimeline programmeId={summary.patient.programme_id} mode="full" showControls={false} />
      ) : (
        <EmptyState title="No active programme" description="This patient has not been enrolled in a programme." />
      )}
    </div>
  );
}
