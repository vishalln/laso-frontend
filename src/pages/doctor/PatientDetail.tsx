import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { consultationService } from "@/services/consultationService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { MoreVertical, Calendar, TrendingUp, FlaskConical, StickyNote, AlertTriangle, CheckCircle } from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import ProgrammeTab from "./tabs/ProgrammeTab";
import ProgressTab from "./tabs/ProgressTab";
import TreatmentPlanTab from "./tabs/TreatmentPlanTab";
import PrescriptionsTab from "./tabs/PrescriptionsTab";
import MessagesTab from "./tabs/MessagesTab";
import ClinicalNotesTab from "./tabs/ClinicalNotesTab";
import ConsultationsTab from "./tabs/ConsultationsTab";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["patient-summary", id],
    queryFn: () => patientService.getSummary(id!),
    enabled: !!id,
  });

  const flagMutation = useMutation({
    mutationFn: (flag: { flag_type: string; reason: string }) => patientService.setFlag(id!, flag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-summary", id] });
      toast({ title: "Flag set successfully" });
    },
    onError: () => toast({ title: "Failed to set flag", variant: "destructive" }),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => consultationService.schedule({ patient_id: id!, doctor_id: summary!.patient.user_id, scheduled_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({ title: "Follow-up scheduled" });
    },
    onError: () => toast({ title: "Failed to schedule", variant: "destructive" }),
  });

  if (isLoading || !summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{summary.patient.name}</h1>
          <p className="text-muted-foreground">Week {summary.current_week} | Adherence {summary.adherence_pct}%</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm"><MoreVertical className="h-4 w-4 mr-1" /> Quick Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => scheduleMutation.mutate()}>
              <Calendar className="h-4 w-4 mr-2" /> Schedule Follow-up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => flagMutation.mutate({ flag_type: "dose_escalation", reason: "Doctor escalation" })}>
              <TrendingUp className="h-4 w-4 mr-2" /> Escalate Dose
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FlaskConical className="h-4 w-4 mr-2" /> Order Lab Test
            </DropdownMenuItem>
            <DropdownMenuItem>
              <StickyNote className="h-4 w-4 mr-2" /> Write Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => flagMutation.mutate({ flag_type: "urgent", reason: "Doctor flagged urgent" })}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Flag Urgent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => patientService.updateProfile(id!, { status: "inactive" })}>
              <CheckCircle className="h-4 w-4 mr-2" /> Complete Programme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programme">Programme</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab patientId={id!} summary={summary} /></TabsContent>
        <TabsContent value="programme"><ProgrammeTab patientId={id!} programmeId={summary.patient.programme_id} /></TabsContent>
        <TabsContent value="progress"><ProgressTab patientId={id!} programmeId={summary.patient.programme_id} /></TabsContent>
        <TabsContent value="treatment"><TreatmentPlanTab programmeId={summary.patient.programme_id} /></TabsContent>
        <TabsContent value="prescriptions"><PrescriptionsTab patientId={id!} /></TabsContent>
        <TabsContent value="messages"><MessagesTab patientId={id!} /></TabsContent>
        <TabsContent value="notes"><ClinicalNotesTab patientId={id!} /></TabsContent>
        <TabsContent value="consultations"><ConsultationsTab patientId={id!} /></TabsContent>
      </Tabs>
    </div>
  );
}
