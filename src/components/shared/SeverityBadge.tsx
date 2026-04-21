import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Severity = "critical" | "warning" | "info" | "positive" | "ok";

interface SeverityBadgeProps {
  severity: Severity;
  label: string;
  className?: string;
  showIcon?: boolean;
}

const CONFIG: Record<Severity, { icon: typeof CheckCircle2; classes: string }> = {
  critical: { icon: XCircle, classes: "bg-destructive/10 text-destructive border border-destructive/20" },
  warning: { icon: AlertTriangle, classes: "bg-warning/10 text-warning border border-warning/20" },
  info: { icon: Info, classes: "bg-primary/10 text-primary border border-primary/20" },
  positive: { icon: CheckCircle2, classes: "bg-success/10 text-success border border-success/20" },
  ok: { icon: CheckCircle2, classes: "bg-success/10 text-success border border-success/20" },
};

export function SeverityBadge({ severity, label, className, showIcon = true }: SeverityBadgeProps) {
  const { icon: Icon, classes } = CONFIG[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", classes, className)}>
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
