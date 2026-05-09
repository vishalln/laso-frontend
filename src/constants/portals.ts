import type { Role } from "@/lib/roles";

export const PORTAL_METADATA = {
  patient: {
    title: "User Portal",
    subtitle: "Track your health journey and manage your treatment",
  },
  coordinator: {
    title: "Care Coordinator Portal",
    subtitle: "Manage patient care, tasks, and communications",
  },
  doctor: {
    title: "Doctor Portal",
    subtitle: "Clinical dashboard for patient management",
  },
  admin: {
    title: "Admin Portal",
    subtitle: "Programme configuration, user management, analytics, and clinical operations",
  },
} as const satisfies Record<Role, { title: string; subtitle: string }>;

export function getPortalMetadata(role: Role): { title: string; subtitle: string } {
  return PORTAL_METADATA[role];
}
