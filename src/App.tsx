import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { AppProvider } from "@/contexts/AppContext";
import { MockDataProvider } from "@/contexts/MockDataContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Quiz from "@/pages/Quiz";
import Consult from "@/pages/Consult";
import ConsultHub from "@/pages/ConsultHub";
import Orders from "@/pages/Orders";
import Dashboard from "@/pages/Dashboard";
import Journey from "@/pages/Journey";
import Support from "@/pages/Support";
import DoctorPortal from "@/pages/DoctorPortal";
import CoordinatorPortal from "@/pages/CoordinatorPortal";
import AdminPortal from "@/pages/AdminPortal";
import { ROLE_HOME } from "@/lib/roles";
import type { UserRole } from "@/contexts/UserContext";
import type { ReactNode } from "react";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function RequireRole({ roles, children }: { readonly roles: UserRole[]; readonly children: ReactNode }) {
  const { isLoggedIn, isRole } = useUser();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isRole(...roles)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, isLoggedIn } = useUser();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  const home = ROLE_HOME[user!.role as keyof typeof ROLE_HOME] ?? "/dashboard";
  return <Navigate to={home} replace />;
}

// ─── Layout Wrapper ───────────────────────────────────────────────────────────

function AppLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ─── Inner App (needs UserContext) ────────────────────────────────────────────

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<Quiz />} />

        {/* Role redirect after login */}
        <Route path="/home" element={<RoleRedirect />} />

        {/* Patient routes */}
        <Route path="/dashboard" element={<RequireRole roles={["patient"]}><Dashboard /></RequireRole>} />
        <Route path="/journey"   element={<RequireRole roles={["patient"]}><Journey /></RequireRole>} />
        <Route path="/consult"   element={<RequireRole roles={["patient"]}><Consult /></RequireRole>} />
        <Route path="/orders"    element={<RequireRole roles={["patient"]}><Orders /></RequireRole>} />
        <Route path="/support"   element={<RequireRole roles={["patient"]}><Support /></RequireRole>} />

        {/* Doctor routes */}
        <Route path="/doctor" element={<RequireRole roles={["doctor"]}><DoctorPortal /></RequireRole>} />

        {/* Shared consult hub — doctor + coordinator */}
        <Route path="/doctor-consult" element={<RequireRole roles={["doctor", "coordinator"]}><ConsultHub /></RequireRole>} />

        {/* Coordinator routes */}
        <Route path="/coordinator" element={<RequireRole roles={["coordinator"]}><CoordinatorPortal /></RequireRole>} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminPortal /></RequireRole>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <MockDataProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </MockDataProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
