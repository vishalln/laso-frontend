import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, badge, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div>
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
