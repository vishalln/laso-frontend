import { Outlet } from "react-router-dom";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { Filter, CheckSquare, Users, Package, Video } from "lucide-react";

const navItems: SidebarNavItem[] = [
  { label: "Triage", icon: Filter, path: "/coordinator/triage" },
  { label: "Tasks", icon: CheckSquare, path: "/coordinator/tasks" },
  { label: "Patients", icon: Users, path: "/coordinator/patients" },
  { label: "Orders", icon: Package, path: "/coordinator/orders" },
  { label: "Consultations", icon: Video, path: "/coordinator/consultations" },
];

export function CoordinatorLayout() {
  return (
    <div className="flex">
      <SidebarNav items={navItems} title="Coordinator Portal" />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
