import { Outlet } from "react-router-dom";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { Users, Video, AlertTriangle } from "lucide-react";

const navItems: SidebarNavItem[] = [
  { label: "Patients", icon: Users, path: "/doctor/patients" },
  { label: "Consultations", icon: Video, path: "/doctor/consultations" },
  { label: "Alerts", icon: AlertTriangle, path: "/doctor/alerts" },
];

export function DoctorLayout() {
  return (
    <div className="flex">
      <SidebarNav items={navItems} title="Doctor Portal" />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
