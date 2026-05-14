import { CheckCircle2, Clock, SkipForward, Circle, Syringe, TestTube, ClipboardCheck, Stethoscope, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { ProgrammeStep } from "@/types/programme";

interface ProgramTimelineProps {
  steps: ProgrammeStep[];
  mode: "compact" | "full";
  showControls?: boolean;
  onCompleteStep?: (stepId: string) => void;
  onSkipStep?: (stepId: string) => void;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  consultation: Stethoscope,
  blood_test: TestTube,
  check_in: ClipboardCheck,
  medication_start: Syringe,
  dose_change: TrendingUp,
};

function getStatusIcon(status: ProgrammeStep["status"]) {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "active": return <Circle className="h-5 w-5 text-blue-600 animate-pulse" />;
    case "skipped": return <SkipForward className="h-5 w-5 text-gray-400" />;
    default: return <Clock className="h-5 w-5 text-gray-400" />;
  }
}

export function ProgramTimeline({ steps, mode, showControls, onCompleteStep, onSkipStep }: ProgramTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {steps.map((step) => {
          const StepIcon = STEP_ICONS[step.step_type] ?? Circle;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 h-10 w-10 rounded-full bg-background border-2 border-border flex items-center justify-center">
                {getStatusIcon(step.status)}
              </div>

              {/* Content */}
              <Card className={cn(
                "flex-1",
                step.status === "skipped" && "opacity-60",
                step.status === "active" && "ring-2 ring-blue-200",
              )}>
                <CardContent className={cn("p-3", mode === "compact" && "p-2")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <StepIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className={cn(
                        "text-sm font-medium truncate",
                        step.status === "skipped" && "line-through text-muted-foreground",
                      )}>
                        {step.title}
                      </span>
                    </div>
                    <StatusBadge status={step.status} type="step" />
                  </div>

                  {mode === "full" && (
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Week {step.week_offset}</span>
                      {step.completed_at && (
                        <span>Completed {new Date(step.completed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}

                  {showControls && step.status === "active" && (
                    <div className="mt-3 flex gap-2">
                      {onCompleteStep && (
                        <Button size="sm" variant="default" onClick={() => onCompleteStep(step.id)}>
                          Mark Complete
                        </Button>
                      )}
                      {onSkipStep && (
                        <Button size="sm" variant="outline" onClick={() => onSkipStep(step.id)}>
                          Skip
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
