import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  trendPositive?: boolean; // if trend up = good (e.g. adherence) vs bad (e.g. glucose)
  icon?: ReactNode;
  colorClass?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  trendPositive = true,
  icon,
  colorClass = "bg-primary/10 text-primary",
  className,
  size = "md",
}: StatCardProps) {
  const trendIcon =
    trend === "up" ? TrendingUp :
    trend === "down" ? TrendingDown :
    Minus;
  const TrendIcon = trendIcon;

  const trendColor =
    !trend || trend === "neutral" ? "text-muted-foreground" :
    (trend === "up" && trendPositive) || (trend === "down" && !trendPositive)
      ? "text-success"
      : "text-destructive";

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className={cn("p-4", size === "lg" && "p-6", size === "sm" && "p-3")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn("text-muted-foreground mb-1", size === "sm" ? "text-xs" : "text-sm")}>{label}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("font-bold text-foreground", size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl")}>
                {value}
              </span>
              {unit && <span className="text-muted-foreground text-sm">{unit}</span>}
            </div>
            {trendLabel && (
              <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendLabel}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", colorClass, size === "lg" && "h-12 w-12")}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
