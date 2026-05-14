import { useQuery } from "@tanstack/react-query";
import { consultationService } from "@/services/consultationService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Video, Calendar } from "lucide-react";
import type { Consultation } from "@/types/consultation";

interface Props {
  patientId: string;
}

export default function ConsultationsTab({ patientId }: Props) {
  const { data: consultations, isLoading } = useQuery({
    queryKey: ["patient-consultations", patientId],
    queryFn: () => consultationService.listForPatient(patientId),
  });

  if (isLoading) return <Skeleton className="h-64 mt-4" />;
  if (!consultations?.length) return <EmptyState title="No consultations" description="No consultations have been scheduled for this patient." />;

  const sorted = [...consultations].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  return (
    <div className="space-y-3 pt-4">
      {sorted.map((c) => (
        <ConsultationCard key={c.id} consultation={c} />
      ))}
    </div>
  );
}

function ConsultationCard({ consultation }: { consultation: Consultation }) {
  const statusColor: Record<string, string> = {
    scheduled: "default",
    in_progress: "default",
    completed: "secondary",
    cancelled: "destructive",
    no_show: "destructive",
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{new Date(consultation.scheduled_at).toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {consultation.duration_minutes && ` (${consultation.duration_minutes} min)`}
            </p>
          </div>
        </div>
        <Badge variant={statusColor[consultation.status] as any}>{consultation.status.replace("_", " ")}</Badge>
      </CardContent>
    </Card>
  );
}
