 /* Admin Portal — LASO_SPEC_V2 Part 17 + Part 30
 *
 * Data source: useMockData().forAdmin()
 * Zero local mock data — all entities from the unified mockDB via MockDataContext.
 *
 * Tabs:
 *   Overview        — KPI tiles + status/staff breakdown
 *   Analytics       — 6 Recharts charts
 *   Doctors         — Full CRUD: add · edit · delete · toggle status · working-hours grid
 *   Users           — User table with role-chip and status toggle
 *   Protocol Builder— Step-sequence editor
 *   Catalog Manager — CatalogItem CRUD sourced from mockDB CATALOG_ITEMS
 *   System          — Feature-flag toggles
 */

import { useState } from "react";
import {
  Users, Settings, ChevronUp, ChevronDown, Trash2, Plus,
  BarChart3, Package, Layers, ToggleLeft, ToggleRight,
  AlertTriangle, CheckCircle2, Edit3, Save, X, TrendingUp,
  Stethoscope, Phone, Mail, Clock,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useMockData, type AdminView } from "@/contexts/MockDataContext";
import type { Patient, CatalogItem } from "@/data/mockDB";
import { cn } from "@/lib/utils";

// ─── Shared static types ──────────────────────────────────────────────────────

type UserRole   = "patient" | "doctor" | "coordinator" | "admin";
type UserStatus = "active" | "inactive" | "suspended";

interface AdminUser {
  id: string; name: string; email: string;
  role: UserRole; status: UserStatus; lastLogin: string;
}

type StepType = "medication" | "device" | "check_in" | "test" | "consultation" | "supplement" | "lifestyle";

interface ProtocolStep {
  id: string; order: number; title: string; type: StepType;
  optional: boolean; weekOffset: number;
}

interface FeatureFlag {
  key: string; label: string; description: string; enabled: boolean;
}

// ─── Doctor types (Part 30) ───────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = typeof DAYS[number];
type DaySchedule = { open: boolean; start: string; end: string };
type WeekSchedule = Record<Day, DaySchedule>;

interface AdminDoctor {
  id: string; name: string; email: string;
  specialty: string; phone: string;
  status: "active" | "inactive";
  hours: WeekSchedule;
}

const DEFAULT_HOURS: WeekSchedule = {
  Mon: { open: true,  start: "09:00", end: "17:00" },
  Tue: { open: true,  start: "09:00", end: "17:00" },
  Wed: { open: true,  start: "09:00", end: "17:00" },
  Thu: { open: true,  start: "09:00", end: "17:00" },
  Fri: { open: true,  start: "09:00", end: "17:00" },
  Sat: { open: false, start: "10:00", end: "14:00" },
  Sun: { open: false, start: "10:00", end: "14:00" },
};

const BLANK_DOCTOR: Omit<AdminDoctor, "id"> = {
  name: "", email: "", specialty: "", phone: "",
  status: "active", hours: JSON.parse(JSON.stringify(DEFAULT_HOURS)),
};

// ─── Static seed data (UI-only; no patient data) ──────────────────────────────

const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Dr. Rahul Sharma",  email: "rahul@laso.care",  role: "doctor",      status: "active",   lastLogin: "Today" },
  { id: "u2", name: "Priya Coordinator", email: "priya@laso.care",  role: "coordinator", status: "active",   lastLogin: "Today" },
  { id: "u3", name: "Admin User",        email: "admin@laso.care",  role: "admin",       status: "active",   lastLogin: "Yesterday" },
  { id: "u4", name: "Ananya Singh",      email: "ananya@test.com",  role: "patient",     status: "active",   lastLogin: "2 days ago" },
  { id: "u5", name: "Mohan Patel",       email: "mohan@test.com",   role: "patient",     status: "inactive", lastLogin: "3 weeks ago" },
  { id: "u6", name: "Dr. Sneha Kapoor",  email: "sneha@laso.care",  role: "doctor",      status: "active",   lastLogin: "Today" },
];

const INITIAL_DOCTORS: AdminDoctor[] = [
  { id: "dr-001", name: "Dr. Rahul Sharma",   email: "rahul@laso.care",  specialty: "Internal Medicine / Metabolic", phone: "+91-98765-43210", status: "active",   hours: { ...DEFAULT_HOURS } },
  { id: "dr-002", name: "Dr. Sneha Kapoor",   email: "sneha@laso.care",  specialty: "Endocrinology",                  phone: "+91-91234-56789", status: "active",   hours: { ...DEFAULT_HOURS, Sat: { open: true, start: "10:00", end: "13:00" }, Sun: { open: false, start: "10:00", end: "14:00" } } },
  { id: "dr-003", name: "Dr. Anjali Deshmukh",email: "anjali@laso.care", specialty: "Diabetology",                    phone: "+91-90000-11111", status: "active",   hours: { ...DEFAULT_HOURS } },
  { id: "dr-004", name: "Dr. Vikram Nair",    email: "vikram@laso.care", specialty: "Obesity Medicine",               phone: "+91-88888-22222", status: "inactive", hours: { ...DEFAULT_HOURS } },
];

const DEFAULT_STEPS: ProtocolStep[] = [
  { id: "ps1", order: 1, title: "Onboarding Call",        type: "consultation", optional: false, weekOffset: 0 },
  { id: "ps2", order: 2, title: "Receive Medication Kit", type: "medication",   optional: false, weekOffset: 0 },
  { id: "ps3", order: 3, title: "Set Up Glucose Monitor", type: "device",       optional: false, weekOffset: 0 },
  { id: "ps4", order: 4, title: "Log Baseline Weight",    type: "check_in",     optional: false, weekOffset: 0 },
  { id: "ps5", order: 5, title: "Week 1 Check-In",        type: "check_in",     optional: false, weekOffset: 1 },
  { id: "ps6", order: 6, title: "Baseline Blood Work",    type: "test",         optional: false, weekOffset: 1 },
  { id: "ps7", order: 7, title: "Week 4 Review Consult",  type: "consultation", optional: false, weekOffset: 4 },
  { id: "ps8", order: 8, title: "DEXA Scan",              type: "test",         optional: true,  weekOffset: 8 },
  { id: "ps9", order: 9, title: "Month 3 Doctor Consult", type: "consultation", optional: false, weekOffset: 12 },
];

const DEFAULT_FLAGS: FeatureFlag[] = [
  { key: "glp1_quiz",         label: "GLP-1 Eligibility Quiz",      description: "Show quiz on landing page",                       enabled: true  },
  { key: "auto_refill",       label: "Auto Refill Engine",           description: "Trigger refill when supply < 7 days",             enabled: true  },
  { key: "escalation_alerts", label: "Escalation Alerts",           description: "Push alerts to coordinator on critical events",    enabled: true  },
  { key: "plateau_detection", label: "Plateau Detector",            description: "Detect weight stall after 2+ weeks",              enabled: true  },
  { key: "simulation_mode",   label: "Simulation Mode",              description: "Allow doctors to simulate future patient states", enabled: false },
  { key: "multi_doctor",      label: "Multi-Doctor Assignments",     description: "Allow patients to have multiple treating doctors", enabled: false },
  { key: "insurance_flow",    label: "Insurance Integration (Beta)", description: "Sync with insurance verification API",            enabled: false },
];

const STEP_TYPES: StepType[] = ["medication", "device", "check_in", "test", "consultation", "supplement", "lifestyle"];

const ROLE_CLS: Record<UserRole, string> = {
  admin:       "bg-destructive/10 text-destructive border-destructive/20",
  doctor:      "bg-primary/10 text-primary border-primary/20",
  coordinator: "bg-violet-100 text-violet-700 border-violet-200",
  patient:     "bg-muted text-muted-foreground",
};

const STATUS_CLS: Record<UserStatus, string> = {
  active:    "bg-success/10 text-success border-success/20",
  inactive:  "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const PIE_COLORS = ["#0D9488", "#F59E0B", "#E11D48", "#8B5CF6", "#059669", "#94A3B8"];
const CHART_MARGIN = { top: 4, right: 12, left: -16, bottom: 0 };

type PatientStatus = Patient["status"];
const ALL_STATUSES: PatientStatus[] = ["active", "review_needed", "plateau", "adherence_risk", "completed", "inactive"];

// ─── Analytics static series (programme-wide aggregates) ─────────────────────

const enrolmentData = [
  { month: "Nov", patients: 3 }, { month: "Dec", patients: 5 },
  { month: "Jan", patients: 8 }, { month: "Feb", patients: 11 },
  { month: "Mar", patients: 9 }, { month: "Apr", patients: 14 },
];
const weightLossByWeek = [
  { week: "W2", avg: 0.8 }, { week: "W4", avg: 1.7 },
  { week: "W6", avg: 2.6 }, { week: "W8", avg: 3.5 },
  { week: "W10",avg: 4.4 }, { week: "W12",avg: 5.2 },
  { week: "W14",avg: 6.0 }, { week: "W16",avg: 6.9 },
];
const adherenceTrend = [
  { week: "W1", adherence: 94 }, { week: "W2", adherence: 91 },
  { week: "W3", adherence: 89 }, { week: "W4", adherence: 87 },
  { week: "W5", adherence: 82 }, { week: "W6", adherence: 85 },
  { week: "W7", adherence: 88 }, { week: "W8", adherence: 84 },
];
const glucoseData = [
  { week: "W1", glucose: 174 }, { week: "W2", glucose: 162 },
  { week: "W3", glucose: 155 }, { week: "W4", glucose: 148 },
  { week: "W5", glucose: 143 }, { week: "W6", glucose: 146 },
  { week: "W7", glucose: 134 }, { week: "W8", glucose: 128 },
];
const sideEffectData = [
  { effect: "Nausea",      count: 18 }, { effect: "Fatigue",      count: 11 },
  { effect: "Headache",    count: 7  }, { effect: "Vomiting",     count: 4  },
  { effect: "Diarrhoea",   count: 3  }, { effect: "Constipation", count: 2  },
];

// ─── Shared chart wrapper ─────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="h-44 pr-2">{children}</CardContent>
    </Card>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ analytics, patients }: { analytics: AdminView["analytics"]; patients: Patient[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Patients"  value={analytics.totalPatients}           icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active"          value={analytics.activePatients}           icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Avg Adherence"   value={`${analytics.avgAdherence}%`}       icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Avg Weight Lost" value={`${analytics.avgWeightLost} kg`}   icon={<TrendingUp className="h-5 w-5" />} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Patient Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {ALL_STATUSES.map(s => {
              const count = patients.filter(p => p.status === s).length;
              const pct   = analytics.totalPatients > 0
                ? Math.round((count / analytics.totalPatients) * 100)
                : 0;
              return (
                <div key={s} className="flex items-center gap-2 py-1">
                  <span className="text-xs text-muted-foreground w-32 capitalize">{s.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Staff Summary</CardTitle></CardHeader>
          <CardContent>
            {(["admin", "doctor", "coordinator", "patient"] as UserRole[]).map(role => {
              const count = ADMIN_USERS.filter(u => u.role === role).length;
              return (
                <div key={role} className="flex items-center justify-between py-1.5">
                  <span className="text-sm capitalize">{role}s</span>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", ROLE_CLS[role])}>{role}</Badge>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────

function AnalyticsTab({ patients }: { patients: Patient[] }) {
  const statusPieData = ALL_STATUSES.map(s => ({
    name:  s.replace(/_/g, " "),
    value: patients.filter(p => p.status === s).length,
  }));

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <ChartCard title="Monthly Enrolment">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enrolmentData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="patients" stroke="#0D9488" strokeWidth={2} dot={false} name="New patients" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Avg Weight Lost by Programme Week (kg)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weightLossByWeek} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="avg" fill="#0D9488" radius={[4, 4, 0, 0]} name="Avg kg lost" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Programme-wide Adherence Trend (%)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={adherenceTrend} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="adh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="adherence" stroke="#0D9488" fill="url(#adh)" strokeWidth={2} name="Adherence %" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Patient Status Breakdown">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
              label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={9}>
              {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Avg Fasting Glucose (mg/dL)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={glucoseData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis domain={[110, 190]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="glucose" stroke="#F59E0B" strokeWidth={2} dot={false} name="Glucose mg/dL" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Side Effects Reported">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sideEffectData} layout="vertical" margin={{ top: 4, right: 12, left: 64, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="effect" type="category" tick={{ fontSize: 11 }} width={60} />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Reports" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Tab: Doctors — working-hours grid ───────────────────────────────────────

function HoursGrid({ hours, onChange }: { hours: WeekSchedule; onChange: (h: WeekSchedule) => void }) {
  const setDay = (d: Day, patch: Partial<DaySchedule>) =>
    onChange({ ...hours, [d]: { ...hours[d], ...patch } });

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-1.5 text-left font-medium w-10">Day</th>
            <th className="p-1.5 text-left font-medium w-14">Open</th>
            <th className="p-1.5 text-left font-medium">Start</th>
            <th className="p-1.5 text-left font-medium">End</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map(d => (
            <tr key={d} className="border-t">
              <td className="p-1.5 font-medium text-muted-foreground">{d}</td>
              <td className="p-1.5">
                <Switch checked={hours[d].open} onCheckedChange={v => setDay(d, { open: v })} className="scale-75" />
              </td>
              <td className="p-1">
                <Input type="time" value={hours[d].start} disabled={!hours[d].open}
                  onChange={e => setDay(d, { start: e.target.value })}
                  className="h-6 text-[11px] px-1 py-0 disabled:opacity-40 w-20" />
              </td>
              <td className="p-1">
                <Input type="time" value={hours[d].end} disabled={!hours[d].open}
                  onChange={e => setDay(d, { end: e.target.value })}
                  className="h-6 text-[11px] px-1 py-0 disabled:opacity-40 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DoctorsTab() {
  const [doctors, setDoctors]           = useState<AdminDoctor[]>(INITIAL_DOCTORS);
  const [editId, setEditId]             = useState<string | null>(null);
  const [editDoc, setEditDoc]           = useState<AdminDoctor | null>(null);
  const [adding, setAdding]             = useState(false);
  const [newDoc, setNewDoc]             = useState<Omit<AdminDoctor, "id">>(JSON.parse(JSON.stringify(BLANK_DOCTOR)));
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandHours, setExpandHours]   = useState<string | null>(null);

  const startEdit    = (d: AdminDoctor) => { setEditId(d.id); setEditDoc(JSON.parse(JSON.stringify(d))); setAdding(false); };
  const saveEdit     = () => {
    if (!editId || !editDoc) return;
    setDoctors(prev => prev.map(d => d.id === editId ? editDoc : d));
    setEditId(null); setEditDoc(null);
  };
  const cancelEdit   = () => { setEditId(null); setEditDoc(null); };
  const toggleStatus = (id: string) =>
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d));
  const confirmAndDelete = (id: string) => { setDoctors(prev => prev.filter(d => d.id !== id)); setConfirmDelete(null); };
  const addDoctor = () => {
    if (!newDoc.name.trim()) return;
    setDoctors(prev => [...prev, { ...newDoc, id: `dr-${Date.now()}`, name: newDoc.name.trim() }]);
    setNewDoc(JSON.parse(JSON.stringify(BLANK_DOCTOR)));
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{doctors.length} doctors registered</p>
        <Button size="sm" className="gap-1.5" onClick={() => { setAdding(v => !v); setEditId(null); }}>
          <Plus className="h-3.5 w-3.5" />Add Doctor
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {([
                { label: "Full Name",  field: "name",      ph: "Dr. First Last",     icon: <Stethoscope className="h-3.5 w-3.5" /> },
                { label: "Email",      field: "email",     ph: "doctor@laso.care",   icon: <Mail        className="h-3.5 w-3.5" /> },
                { label: "Specialty",  field: "specialty", ph: "e.g. Endocrinology", icon: null },
                { label: "Phone",      field: "phone",     ph: "+91-XXXXX-XXXXX",    icon: <Phone       className="h-3.5 w-3.5" /> },
              ] as { label: string; field: keyof typeof newDoc; ph: string; icon: React.ReactNode }[]).map(f => (
                <div key={String(f.field)} className="space-y-1">
                  <p className="text-xs font-medium">{f.label}</p>
                  <div className="relative">
                    {f.icon && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">{f.icon}</span>}
                    <Input
                      value={String(newDoc[f.field])}
                      onChange={e => setNewDoc(p => ({ ...p, [f.field]: e.target.value }))}
                      placeholder={f.ph}
                      className={cn("text-sm", f.icon && "pl-7")}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Working Hours</p>
              <HoursGrid hours={newDoc.hours as WeekSchedule} onChange={h => setNewDoc(p => ({ ...p, hours: h }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addDoctor}>Save Doctor</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Contact</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Hours</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doc, _i) => {
                const isEditing  = editId === doc.id;
                const isExpanded = expandHours === doc.id;
                const ef         = isEditing ? editDoc! : doc;

                return (
                  <>
                    <TableRow key={doc.id} className={isEditing ? "bg-primary/5 align-top" : "align-top"}>
                      <TableCell className="text-sm">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input value={ef.name}  onChange={e => setEditDoc(p => p && ({ ...p, name: e.target.value }))}  className="text-sm h-7 py-0" placeholder="Full name" />
                            <Input value={ef.email} onChange={e => setEditDoc(p => p && ({ ...p, email: e.target.value }))} className="text-xs h-6 py-0" placeholder="Email" />
                            <Input value={ef.phone} onChange={e => setEditDoc(p => p && ({ ...p, phone: e.target.value }))} className="text-xs h-6 py-0" placeholder="Phone" />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{doc.email}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{doc.phone}</p>
                          </>
                        )}
                      </TableCell>

                      <TableCell className="text-sm">
                        {isEditing
                          ? <Input value={ef.specialty} onChange={e => setEditDoc(p => p && ({ ...p, specialty: e.target.value }))} className="text-sm h-7 py-0" />
                          : doc.specialty}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Select value={ef.status} onValueChange={v => setEditDoc(p => p && ({ ...p, status: v as AdminDoctor["status"] }))}>
                            <SelectTrigger className="text-xs h-7"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={cn("text-[10px]", doc.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                            {doc.status}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                          onClick={() => setExpandHours(isExpanded ? null : doc.id)}>
                          <Clock className="h-3.5 w-3.5" />{isExpanded ? "Hide" : "View"}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEdit}><Save className="h-3.5 w-3.5 text-success" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEdit}><X className="h-3.5 w-3.5" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleStatus(doc.id)}>
                                {doc.status === "active" ? "Deactivate" : "Activate"}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(doc)}><Edit3 className="h-3.5 w-3.5" /></Button>
                              {confirmDelete === doc.id ? (
                                <>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => confirmAndDelete(doc.id)}>Yes</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmDelete(null)}>No</Button>
                                </>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(doc.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {(isExpanded || isEditing) && (
                      <TableRow key={`${doc.id}-hours`} className="bg-muted/10">
                        <TableCell colSpan={5} className="py-3 px-4">
                          <div className="max-w-sm space-y-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />Working Hours — {isEditing ? "editing" : doc.name}
                            </p>
                            <HoursGrid
                              hours={isEditing ? editDoc!.hours : doc.hours}
                              onChange={h => isEditing && setEditDoc(p => p && ({ ...p, hours: h }))}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const toggle = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell><Badge className={cn("text-xs capitalize", ROLE_CLS[u.role])}>{u.role}</Badge></TableCell>
                <TableCell><Badge className={cn("text-xs capitalize", STATUS_CLS[u.status])}>{u.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggle(u.id)}>
                    {u.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Tab: Protocol Builder ────────────────────────────────────────────────────

function ProtocolBuilderTab() {
  const [steps, setSteps]     = useState<ProtocolStep[]>(DEFAULT_STEPS);
  const [adding, setAdding]   = useState(false);
  const [newStep, setNewStep] = useState<Omit<ProtocolStep, "id" | "order">>({ title: "", type: "check_in", optional: false, weekOffset: 0 });
  const [editId, setEditId]   = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const reorder = (idx: number, dir: -1 | 1) => {
    const next = [...steps];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setSteps(next.map((s, i) => ({ ...s, order: i + 1 })));
  };
  const remove  = (id: string) => setSteps(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  const addStep = () => {
    if (!newStep.title.trim()) return;
    setSteps(prev => [...prev, { ...newStep, id: `ps_${Date.now()}`, order: prev.length + 1, title: newStep.title.trim() }]);
    setNewStep({ title: "", type: "check_in", optional: false, weekOffset: 0 }); setAdding(false);
  };
  const saveEdit = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, title: editTitle.trim() || s.title } : s));
    setEditId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{steps.length} steps · reorder with ↑↓</p>
        <Button size="sm" className="gap-1.5" onClick={() => setAdding(v => !v)}>
          <Plus className="h-3.5 w-3.5" />Add Step
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48 space-y-1">
              <p className="text-xs font-medium">Step Title</p>
              <Input value={newStep.title} onChange={e => setNewStep(s => ({ ...s, title: e.target.value }))} placeholder="e.g. Week 8 Review" className="text-sm" />
            </div>
            <div className="w-36 space-y-1">
              <p className="text-xs font-medium">Type</p>
              <Select value={newStep.type} onValueChange={v => setNewStep(s => ({ ...s, type: v as StepType }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{STEP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-1">
              <p className="text-xs font-medium">Week Offset</p>
              <Input type="number" min={0} value={newStep.weekOffset} onChange={e => setNewStep(s => ({ ...s, weekOffset: +e.target.value }))} className="text-sm" />
            </div>
            <div className="flex items-center gap-2 self-end pb-0.5">
              <Switch checked={newStep.optional} onCheckedChange={v => setNewStep(s => ({ ...s, optional: v }))} id="opt-new" />
              <label htmlFor="opt-new" className="text-xs cursor-pointer">Optional</label>
            </div>
            <div className="flex gap-2 self-end">
              <Button size="sm" onClick={addStep}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-16">Week</TableHead>
                <TableHead className="w-20">Optional</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs text-muted-foreground font-mono">{s.order}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {editId === s.id ? (
                      <div className="flex items-center gap-2">
                        <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-sm h-7 py-0" autoFocus
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(s.id); if (e.key === "Escape") setEditId(null); }} />
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveEdit(s.id)}><Save className="h-3.5 w-3.5 text-success" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    ) : s.title}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">W{s.weekOffset}</TableCell>
                  <TableCell>
                    <Switch checked={s.optional}
                      onCheckedChange={() => setSteps(prev => prev.map(p => p.id === s.id ? { ...p, optional: !p.optional } : p))}
                      className="scale-75" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reorder(idx, -1)} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reorder(idx, 1)}  disabled={idx === steps.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditId(s.id); setEditTitle(s.title); }}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button className="gap-2"><Save className="h-4 w-4" />Publish Protocol Template</Button>
    </div>
  );
}

// ─── Tab: Catalog Manager — sourced from mockDB CATALOG_ITEMS ─────────────────

type CatalogItemMutable = CatalogItem;   // all fields are primitives — safe to use directly

const BLANK_CATALOG: Omit<CatalogItemMutable, "id"> = {
  name: "", brand: "", category: "rx_medication", priceInr: 0, unit: "",
  emoji: "💊", tagline: "", inStock: true, requiresPrescription: true,
  rating: 4.5, reviewCount: 0,
  clinicalRationale: "",
  recommendedWeeks: [1, 52],
};

const CATALOG_CATEGORIES: CatalogItem["category"][] = [
  "protein", "vitamins", "fibre_gut", "devices", "lab_test", "rx_medication",
];

function CatalogManagerTab({ catalog }: { catalog: CatalogItem[] }) {
  const [items, setItems]       = useState<CatalogItemMutable[]>(catalog);
  const [editId, setEditId]     = useState<string | null>(null);
  const [editField, setEditField] = useState<CatalogItemMutable | null>(null);
  const [adding, setAdding]     = useState(false);
  const [newItem, setNewItem]   = useState<Omit<CatalogItemMutable, "id">>({ ...BLANK_CATALOG });

  const startEdit = (item: CatalogItemMutable) => { setEditId(item.id); setEditField({ ...item }); };
  const saveEdit  = () => {
    if (!editId || !editField) return;
    setItems(prev => prev.map(i => i.id === editId ? { ...editField } : i));
    setEditId(null); setEditField(null);
  };
  const remove  = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: `cat_${Date.now()}`, name: newItem.name.trim() }]);
    setNewItem({ ...BLANK_CATALOG }); setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} items in catalogue</p>
        <Button size="sm" className="gap-1.5" onClick={() => setAdding(v => !v)}>
          <Plus className="h-3.5 w-3.5" />Add Item
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 grid sm:grid-cols-3 gap-3">
            {([
              { label: "Name",    field: "name",    ph: "e.g. Ozempic 0.5mg Pen" },
              { label: "Brand",   field: "brand",   ph: "e.g. Novo Nordisk" },
              { label: "Unit",    field: "unit",    ph: "e.g. 1 pen (4-week supply)" },
              { label: "Tagline", field: "tagline", ph: "Short description" },
              { label: "Emoji",   field: "emoji",   ph: "💉" },
            ] as { label: string; field: keyof typeof newItem; ph: string }[]).map(f => (
              <div key={String(f.field)} className="space-y-1">
                <p className="text-xs font-medium">{f.label}</p>
                <Input placeholder={f.ph} value={String(newItem[f.field])}
                  onChange={e => setNewItem(p => ({ ...p, [f.field]: e.target.value }))} className="text-sm" />
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-xs font-medium">Price (₹)</p>
              <Input type="number" value={newItem.priceInr}
                onChange={e => setNewItem(p => ({ ...p, priceInr: +e.target.value }))} className="text-sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium">Category</p>
              <Select value={newItem.category} onValueChange={v => setNewItem(p => ({ ...p, category: v as CatalogItem["category"] }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{CATALOG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs font-medium">Recommended Weeks (start – end)</p>
              <div className="flex gap-2">
                <Input type="number" min={1} max={104} placeholder="Start week"
                  value={Array.isArray(newItem.recommendedWeeks) ? newItem.recommendedWeeks[0] : 1}
                  onChange={e => setNewItem(p => ({ ...p, recommendedWeeks: [+e.target.value, Array.isArray(p.recommendedWeeks) ? p.recommendedWeeks[1] : 52] }))}
                  className="text-sm w-28" />
                <Input type="number" min={1} max={104} placeholder="End week"
                  value={Array.isArray(newItem.recommendedWeeks) ? newItem.recommendedWeeks[1] : 52}
                  onChange={e => setNewItem(p => ({ ...p, recommendedWeeks: [Array.isArray(p.recommendedWeeks) ? p.recommendedWeeks[0] : 1, +e.target.value] }))}
                  className="text-sm w-28" />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-3">
              <p className="text-xs font-medium">Clinical Rationale</p>
              <Textarea placeholder="Evidence-based rationale for prescribing this item…" rows={2}
                value={String(newItem.clinicalRationale ?? "")}
                onChange={e => setNewItem(p => ({ ...p, clinicalRationale: e.target.value }))}
                className="text-sm resize-none" />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2 self-end pb-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Switch checked={newItem.inStock} onCheckedChange={v => setNewItem(p => ({ ...p, inStock: v }))} />In Stock
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Switch checked={newItem.requiresPrescription} onCheckedChange={v => setNewItem(p => ({ ...p, requiresPrescription: v }))} />Rx Required
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <Button size="sm" onClick={addItem}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rx</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const isEditing = editId === item.id;
                const ef = editField ?? item;
                return (
                  <TableRow key={item.id} className={isEditing ? "bg-primary/5" : ""}>
                    <TableCell className="text-sm">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input value={ef.name}  onChange={e => setEditField(p => p && ({ ...p, name: e.target.value }))}  className="text-xs h-7 py-0" placeholder="Name" />
                          <Input value={ef.brand} onChange={e => setEditField(p => p && ({ ...p, brand: e.target.value }))} className="text-[10px] h-6 py-0" placeholder="Brand" />
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-sm">{item.emoji} {item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing
                        ? <Select value={ef.category} onValueChange={v => setEditField(p => p && ({ ...p, category: v as CatalogItem["category"] }))}>
                            <SelectTrigger className="text-xs h-7"><SelectValue /></SelectTrigger>
                            <SelectContent>{CATALOG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        : <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {isEditing
                        ? <Input type="number" value={ef.priceInr} onChange={e => setEditField(p => p && ({ ...p, priceInr: +e.target.value }))} className="text-xs h-7 py-0 w-20" />
                        : `₹${item.priceInr.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {isEditing
                        ? <Switch checked={ef.inStock} onCheckedChange={v => setEditField(p => p && ({ ...p, inStock: v }))} className="scale-75" />
                        : <Badge className={cn("text-[10px]", item.inStock ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{item.inStock ? "In Stock" : "OOS"}</Badge>}
                    </TableCell>
                    <TableCell>
                      {isEditing
                        ? <Switch checked={ef.requiresPrescription} onCheckedChange={v => setEditField(p => p && ({ ...p, requiresPrescription: v }))} className="scale-75" />
                        : <Badge variant="outline" className="text-[10px]">{item.requiresPrescription ? "Rx" : "OTC"}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEdit}><Save className="h-3.5 w-3.5 text-success" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(item)}><Edit3 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: System / Feature Flags ──────────────────────────────────────────────

function SystemTab() {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS);
  const toggle = (key: string) => setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Toggle system-wide features. Changes take effect immediately for all users.</p>
      <Card>
        <CardContent className="p-0 divide-y">
          {flags.map(f => (
            <div key={f.key} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="flex-1 mr-4">
                <p className="font-medium text-sm flex items-center gap-2">
                  {f.label}
                  {f.enabled ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
              </div>
              <Switch checked={f.enabled} onCheckedChange={() => toggle(f.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Button variant="outline" size="sm" className="gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-warning" />Export System Config
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPortal() {
  const { forAdmin } = useMockData();
  const { allPatients, analytics, catalog } = forAdmin();

  const flagCount = DEFAULT_FLAGS.filter(f => f.enabled).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader title="Admin Portal" subtitle="Programme configuration, user management, analytics, and clinical operations" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients"  value={analytics.totalPatients}         icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active"          value={analytics.activePatients}         icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Alerts"          value={analytics.criticalAlerts}
          trend={analytics.criticalAlerts > 0 ? "up" : "neutral"} trendPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Features ON"     value={flagCount}                        icon={<Settings className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3   className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-1.5" />Analytics</TabsTrigger>
          <TabsTrigger value="doctors"><Stethoscope  className="h-4 w-4 mr-1.5" />Doctors</TabsTrigger>
          <TabsTrigger value="users"><Users          className="h-4 w-4 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="protocol"><Layers      className="h-4 w-4 mr-1.5" />Protocol Builder</TabsTrigger>
          <TabsTrigger value="catalog"><Package      className="h-4 w-4 mr-1.5" />Catalog Manager</TabsTrigger>
          <TabsTrigger value="system"><Settings      className="h-4 w-4 mr-1.5" />System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">  <OverviewTab analytics={analytics} patients={allPatients} /></TabsContent>
        <TabsContent value="analytics"> <AnalyticsTab patients={allPatients} /></TabsContent>
        <TabsContent value="doctors">   <DoctorsTab /></TabsContent>
        <TabsContent value="users">     <UsersTab /></TabsContent>
        <TabsContent value="protocol">  <ProtocolBuilderTab /></TabsContent>
        <TabsContent value="catalog">   <CatalogManagerTab catalog={catalog} /></TabsContent>
        <TabsContent value="system">    <SystemTab /></TabsContent>
      </Tabs>
    </div>
  );
}
