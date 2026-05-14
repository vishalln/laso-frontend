import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import type { Task } from "@/types/task";

export default function Tasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["coordinator-tasks"],
    queryFn: taskService.list,
    refetchInterval: 30000,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => taskService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-tasks"] });
      toast({ title: "Task updated" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!tasks?.length) return <EmptyState title="No tasks" description="All tasks are completed. Check back later." />;

  const urgent = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status === "pending");
  const pending = tasks.filter((t) => t.status === "pending" && !urgent.includes(t));
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task Queue</h1>

      {urgent.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" /> Overdue ({urgent.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgent.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleMutation.mutate(task.id)} />
            ))}
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleMutation.mutate(task.id)} />
            ))}
          </CardContent>
        </Card>
      )}

      {done.length > 0 && (
        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Completed ({done.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleMutation.mutate(task.id)} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <Checkbox checked={task.status === "done"} onCheckedChange={onToggle} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
        {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
      </div>
      {task.due_date && (
        <span className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</span>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}
