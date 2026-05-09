import type { Role } from "@/lib/roles";

export const ROLE_BADGE_CLASSES = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  doctor: "bg-primary/10 text-primary border-primary/20",
  coordinator: "bg-violet-100 text-violet-700 border-violet-200",
  patient: "bg-muted text-muted-foreground",
} as const satisfies Record<Role, string>;

export const USER_STATUS_CLASSES = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
} as const;

export const PATIENT_STATUS_CLASSES = {
  active: "bg-success/10 text-success border-success/20",
  review_needed: "bg-warning/10 text-warning border-warning/20",
  plateau: "bg-orange-100 text-orange-700 border-orange-200",
  adherence_risk: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
} as const;

export const PATIENT_STATUS_LABELS = {
  active: "Active",
  review_needed: "Review Needed",
  plateau: "Plateau",
  adherence_risk: "Adherence Risk",
  completed: "Completed",
  inactive: "Inactive",
} as const;
