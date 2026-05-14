import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SidebarNavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  title?: string;
}

export function SidebarNav({ items, title }: SidebarNavProps) {
  return (
    <aside className="w-60 border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-4">
      {title && <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">{title}</h2>}
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
