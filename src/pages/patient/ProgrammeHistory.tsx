import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { History, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUser } from "@/contexts/UserContext";
import { programService } from "@/services/programService";

export default function ProgrammeHistory() {
  const { user } = useUser();

  const { data: programmes, isLoading, error, refetch } = useQuery({
    queryKey: ["programme", "history", user?.id],
    queryFn: () => programService.getHistory(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p className="text-destructive mb-4">Failed to load history.</p>
        <button onClick={() => refetch()} className="text-primary underline text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/programme"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Programme History</h1>
      </div>

      {(!programmes || programmes.length === 0) ? (
        <EmptyState
          icon={History}
          title="No past programmes"
          description="Your completed or cancelled programmes will appear here."
        />
      ) : (
        <div className="space-y-4">
          {programmes.map((prog) => {
            const duration = prog.completed_at
              ? Math.ceil((new Date(prog.completed_at).getTime() - new Date(prog.started_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
              : null;

            return (
              <Card key={prog.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Programme #{prog.id.slice(-6)}
                    </CardTitle>
                    <StatusBadge status={prog.status} type="programme" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Started</p>
                      <p>{new Date(prog.started_at).toLocaleDateString()}</p>
                    </div>
                    {prog.completed_at && (
                      <div>
                        <p className="font-medium text-foreground">Ended</p>
                        <p>{new Date(prog.completed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                    {duration && (
                      <div>
                        <p className="font-medium text-foreground">Duration</p>
                        <p>{duration} weeks</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">Final Week</p>
                      <p>Week {prog.current_week}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
