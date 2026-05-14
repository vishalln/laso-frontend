import { useQuery } from "@tanstack/react-query";
import { consultationService } from "@/services/consultationService";
import { taskService } from "@/services/taskService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Video, ExternalLink } from "lucide-react";
import type { Consultation } from "@/types/consultation";

export default function Consultations() {
  const { data: today, isLoading: loadingToday } = useQuery({
    queryKey: ["consultations-today"],
    queryFn: consultationService.getToday,
  });

  const { data: upcoming, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["consultations-upcoming"],
    queryFn: consultationService.getUpcoming,
  });

  const { data: pendingActions } = useQuery({
    queryKey: ["doctor-pending-actions"],
    queryFn: taskService.listDoctor,
  });

  const completed = [...(today ?? []), ...(upcoming ?? [])].filter((c) => c.status === "completed");

  const isLoading = loadingToday || loadingUpcoming;

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Consultations</h1>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today {today?.length ? `(${today.length})` : ""}</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions {pendingActions?.length ? `(${pendingActions.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3 pt-2">
          {!today?.length ? (
            <EmptyState title="No consultations today" description="You have no scheduled consultations for today." />
          ) : (
            today.map((c) => <ConsultationCard key={c.id} consultation={c} showJoin />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3 pt-2">
          {!upcoming?.length ? (
            <EmptyState title="No upcoming consultations" description="No consultations scheduled for the next 7 days." />
          ) : (
            upcoming.map((c) => <ConsultationCard key={c.id} consultation={c} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 pt-2">
          {!completed.length ? (
            <EmptyState title="No completed consultations" description="Completed consultations will appear here." />
          ) : (
            completed.map((c) => <ConsultationCard key={c.id} consultation={c} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3 pt-2">
          {!pendingActions?.length ? (
            <EmptyState title="No pending actions" description="All actions are up to date." />
          ) : (
            pendingActions.map((action) => (
              <Card key={action.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{action.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Badge variant={action.priority === "high" ? "destructive" : action.priority === "medium" ? "default" : "secondary"}>
                    {action.priority}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConsultationCard({ consultation, showJoin }: { consultation: Consultation; showJoin?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {new Date(consultation.scheduled_at).toLocaleDateString()} at{" "}
              {new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-xs text-muted-foreground">
              {consultation.duration_minutes ? `${consultation.duration_minutes} min` : "Duration TBD"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{consultation.status.replace("_", " ")}</Badge>
          {showJoin && consultation.meet_link && (
            <Button size="sm" asChild>
              <a href={consultation.meet_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" /> Join
              </a>
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
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
  );
}
