import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { AppProvider } from "@/contexts/AppContext";
import { MockDataProvider } from "@/contexts/MockDataContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Quiz from "@/pages/Quiz";
import ConsultHub from "@/pages/ConsultHub";
import PatientDashboard from "@/pages/patient/Dashboard";
import PatientProgramme from "@/pages/patient/Programme";
import PatientStartProgramme from "@/pages/patient/StartProgramme";
import PatientCheckIn from "@/pages/patient/CheckIn";
import PatientProgrammeHistory from "@/pages/patient/ProgrammeHistory";
import PatientOrders from "@/pages/patient/Orders";
import PatientSupport from "@/pages/patient/Support";
import { DoctorLayout } from "@/components/layout/DoctorLayout";
import DoctorPatientList from "@/pages/doctor/PatientList";
import DoctorPatientDetail from "@/pages/doctor/PatientDetail";
import DoctorAlerts from "@/pages/doctor/Alerts";
import DoctorConsultations from "@/pages/doctor/Consultations";
import { CoordinatorLayout } from "@/components/layout/CoordinatorLayout";
import CoordinatorTriage from "@/pages/coordinator/Triage";
import CoordinatorTasks from "@/pages/coordinator/Tasks";
import CoordinatorPatientList from "@/pages/coordinator/PatientList";
import CoordinatorPatientDetail from "@/pages/coordinator/PatientDetail";
import CoordinatorOrders from "@/pages/coordinator/Orders";
import CoordinatorConsultations from "@/pages/coordinator/Consultations";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminDashboard, AdminAnalytics, AdminDoctors, AdminUsers, AdminProtocol, AdminCatalog } from "@/pages/admin";
import { ROLE_HOME } from "@/lib/roles";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/contexts/UserContext";
import type { ReactNode } from "react";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function RequireRole({ roles, children }: { readonly roles: UserRole[]; readonly children: ReactNode }) {
  const { isLoggedIn, isRole, isLoading } = useUser();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isRole(...roles)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, isLoggedIn, isLoading } = useUser();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/quiz" element={<Quiz />} />

        {/* Role redirect after login */}
        <Route path="/home" element={<RoleRedirect />} />

        {/* Patient routes */}
        <Route path="/dashboard"          element={<RequireRole roles={["patient"]}><PatientDashboard /></RequireRole>} />
        <Route path="/programme"          element={<RequireRole roles={["patient"]}><PatientProgramme /></RequireRole>} />
        <Route path="/programme/start"    element={<RequireRole roles={["patient"]}><PatientStartProgramme /></RequireRole>} />
        <Route path="/programme/check-in" element={<RequireRole roles={["patient"]}><PatientCheckIn /></RequireRole>} />
        <Route path="/programme/history"  element={<RequireRole roles={["patient"]}><PatientProgrammeHistory /></RequireRole>} />
        <Route path="/orders"             element={<RequireRole roles={["patient"]}><PatientOrders /></RequireRole>} />
        <Route path="/support"            element={<RequireRole roles={["patient"]}><PatientSupport /></RequireRole>} />

        {/* Doctor routes — nested with DoctorLayout */}
        <Route path="/doctor" element={<RequireRole roles={["doctor"]}><DoctorLayout /></RequireRole>}>
          <Route index element={<Navigate to="/doctor/patients" replace />} />
          <Route path="patients" element={<DoctorPatientList />} />
          <Route path="patients/:id" element={<DoctorPatientDetail />} />
          <Route path="alerts" element={<DoctorAlerts />} />
          <Route path="consultations" element={<DoctorConsultations />} />
        </Route>

        {/* Shared consult hub — doctor + coordinator */}
        <Route path="/doctor-consult" element={<RequireRole roles={["doctor", "coordinator"]}><ConsultHub /></RequireRole>} />

        {/* Coordinator routes — nested with CoordinatorLayout */}
        <Route path="/coordinator" element={<RequireRole roles={["coordinator"]}><CoordinatorLayout /></RequireRole>}>
          <Route index element={<Navigate to="/coordinator/triage" replace />} />
          <Route path="triage" element={<CoordinatorTriage />} />
          <Route path="tasks" element={<CoordinatorTasks />} />
          <Route path="patients" element={<CoordinatorPatientList />} />
          <Route path="patients/:id" element={<CoordinatorPatientDetail />} />
          <Route path="orders" element={<CoordinatorOrders />} />
          <Route path="consultations" element={<CoordinatorConsultations />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminLayout /></RequireRole>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="protocol" element={<AdminProtocol />} />
          <Route path="catalog" element={<AdminCatalog />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserProvider>
          <MockDataProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </MockDataProvider>
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
