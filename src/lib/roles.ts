// ─── Role System — Single Source of Truth ────────────────────────────────────
// All role/route/nav knowledge lives here. Import from this file everywhere.
// Never duplicate role checks or nav arrays in components.

import type { NavigateFunction } from "react-router-dom";

export type Role = "patient" | "doctor" | "coordinator" | "admin";

// Post-login redirect per role
export const ROLE_HOME: Record<Role, string> = {
  patient:     "/dashboard",
  doctor:      "/doctor",
  coordinator: "/coordinator",
  admin:       "/admin",
};

// Allowed roles per route (used by RoleGuard / RequireRole in App.tsx)
export const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard":          ["patient"],
  "/programme":          ["patient"],
  "/programme/start":    ["patient"],
  "/programme/check-in": ["patient"],
  "/programme/history":  ["patient"],
  "/orders":             ["patient"],
  "/support":            ["patient"],
  "/doctor":             ["doctor"],
  "/doctor-consult":     ["doctor", "coordinator"],  // shared consult hub
  "/coordinator":        ["coordinator"],
  "/admin":              ["admin"],
};

// Nav links rendered per role in Navbar
export const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  patient: [
    { href: "/dashboard",      label: "Dashboard" },
    { href: "/programme",      label: "Programme" },
    { href: "/orders",         label: "Orders" },
    { href: "/support",        label: "Support" },
  ],
  doctor: [
    { href: "/doctor",         label: "Patient Panel" },
    { href: "/doctor-consult", label: "My Consultations" },
  ],
  coordinator: [
    { href: "/coordinator",    label: "Care Queue" },
    { href: "/doctor-consult", label: "My Consultations" },
  ],
  admin: [
    { href: "/admin",          label: "Admin Portal" },
  ],
};

// ─── Post-Login Navigation Utility ───────────────────────────────────────────
// Generic utility for role-based redirects after authentication

export function navigateToRoleHome(
  role: Role | undefined,
  navigate: NavigateFunction,
  redirectTo?: string
): void {
  if (redirectTo) {
    navigate(redirectTo, { replace: true });
    return;
  }
  
  const homePath = role ? ROLE_HOME[role] : ROLE_HOME.patient;
  navigate(homePath, { replace: true });
}
