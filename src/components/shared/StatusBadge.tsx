import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "programme" | "step" | "order" | "consultation";
}

const COLOR_MAP: Record<string, string> = {
  // Programme statuses
  active: "bg-blue-100 text-blue-800 border-blue-200",
  paused: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  // Step statuses
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  skipped: "bg-gray-100 text-gray-400 border-gray-200",
  // Order statuses
  placed: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  dispensed: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-amber-100 text-amber-800 border-amber-200",
  in_transit: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  // Consultation statuses
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  no_show: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorClass = COLOR_MAP[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", colorClass)}>
      {label}
    </Badge>
  );
}
