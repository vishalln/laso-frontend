import { Outlet } from "react-router-dom";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { LayoutDashboard, BarChart3, UserCog, Users, FileText, ShoppingBag } from "lucide-react";

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Doctors", icon: UserCog, path: "/admin/doctors" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Protocol", icon: FileText, path: "/admin/protocol" },
  { label: "Catalog", icon: ShoppingBag, path: "/admin/catalog" },
];

export function AdminLayout() {
  return (
    <div className="flex">
      <SidebarNav items={navItems} title="Admin Portal" />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
