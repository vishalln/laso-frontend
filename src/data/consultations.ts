// ─── Consultation Mock Data ───────────────────────────────────────────────────

export type ConsultType   = "Initial" | "Follow-up" | "Dose Review";
export type ConsultStatus = "Upcoming" | "In Progress" | "Completed" | "No-show";

export interface Consultation {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColorClass: string;
  type: ConsultType;
  date: string;        // YYYY-MM-DD
  time: string;        // "10:00 AM"
  durationMin: number;
  status: ConsultStatus;
  zoomUrl: string;
  noteWritten: boolean;
  noteSummary?: string;
  doctorId: string;
  pendingAction?: "write-note" | "approve-dose" | "review-labs";
}

// Today = 2026-04-20
export const consultations: Consultation[] = [
  // ── Today ──────────────────────────────────────────────────────────────────
  {
    id: "c-001",
    patientName: "Arjun Sharma",
    patientInitials: "AS",
    patientColorClass: "bg-primary",
    type: "Follow-up",
    date: "2026-04-20",
    time: "10:00 AM",
    durationMin: 20,
    status: "In Progress",
    zoomUrl: "https://zoom.us/j/95512340001",
    noteWritten: false,
    doctorId: "doctor_001",
    pendingAction: "write-note",
  },
  {
    id: "c-002",
    patientName: "Meera Pillai",
    patientInitials: "MP",
    patientColorClass: "bg-accent",
    type: "Dose Review",
    date: "2026-04-20",
    time: "11:30 AM",
    durationMin: 15,
    status: "Upcoming",
    zoomUrl: "https://zoom.us/j/95512340002",
    noteWritten: false,
    doctorId: "doctor_001",
    pendingAction: "approve-dose",
  },
  {
    id: "c-003",
    patientName: "Ravi Kumar",
    patientInitials: "RK",
    patientColorClass: "bg-success",
    type: "Initial",
    date: "2026-04-20",
    time: "2:00 PM",
    durationMin: 30,
    status: "Upcoming",
    zoomUrl: "https://zoom.us/j/95512340003",
    noteWritten: false,
    doctorId: "doctor_001",
  },
  // ── Upcoming (next 7 days) ─────────────────────────────────────────────────
  {
    id: "c-004",
    patientName: "Sunita Verma",
    patientInitials: "SV",
    patientColorClass: "bg-violet-500",
    type: "Follow-up",
    date: "2026-04-21",
    time: "9:00 AM",
    durationMin: 20,
    status: "Upcoming",
    zoomUrl: "https://zoom.us/j/95512340004",
    noteWritten: false,
    doctorId: "doctor_001",
  },
  {
    id: "c-005",
    patientName: "Priya Menon",
    patientInitials: "PM",
    patientColorClass: "bg-amber-500",
    type: "Dose Review",
    date: "2026-04-22",
    time: "3:30 PM",
    durationMin: 15,
    status: "Upcoming",
    zoomUrl: "https://zoom.us/j/95512340005",
    noteWritten: false,
    doctorId: "doctor_001",
    pendingAction: "review-labs",
  },
  {
    id: "c-006",
    patientName: "Anita Singh",
    patientInitials: "AN",
    patientColorClass: "bg-rose-500",
    type: "Initial",
    date: "2026-04-24",
    time: "10:00 AM",
    durationMin: 30,
    status: "Upcoming",
    zoomUrl: "https://zoom.us/j/95512340006",
    noteWritten: false,
    doctorId: "doctor_001",
  },
  // ── Completed ──────────────────────────────────────────────────────────────
  {
    id: "c-007",
    patientName: "Karan Mehta",
    patientInitials: "KM",
    patientColorClass: "bg-slate-500",
    type: "Follow-up",
    date: "2026-04-17",
    time: "11:00 AM",
    durationMin: 20,
    status: "Completed",
    zoomUrl: "https://zoom.us/j/95512340007",
    noteWritten: true,
    noteSummary: "Patient tolerating 0.5 mg Semaglutide well. Weight down 1.2 kg since last visit. No nausea. Escalate to 1 mg after 4 weeks.",
    doctorId: "doctor_001",
  },
  {
    id: "c-008",
    patientName: "Divya Nair",
    patientInitials: "DN",
    patientColorClass: "bg-emerald-500",
    type: "Initial",
    date: "2026-04-15",
    time: "9:30 AM",
    durationMin: 30,
    status: "Completed",
    zoomUrl: "https://zoom.us/j/95512340008",
    noteWritten: false,
    noteSummary: undefined,
    doctorId: "doctor_001",
    pendingAction: "write-note",
  },
  {
    id: "c-009",
    patientName: "Rajesh Iyer",
    patientInitials: "RI",
    patientColorClass: "bg-cyan-500",
    type: "Dose Review",
    date: "2026-04-14",
    time: "4:00 PM",
    durationMin: 15,
    status: "No-show",
    zoomUrl: "https://zoom.us/j/95512340009",
    noteWritten: false,
    doctorId: "doctor_001",
  },
];

// Today's consultations
export const todayConsults = consultations.filter((c) => c.date === "2026-04-20");

// Next 7 days (excl. today)
export const upcomingConsults = consultations.filter(
  (c) => c.date > "2026-04-20" && c.date <= "2026-04-27"
);

// Historical
export const completedConsults = consultations.filter(
  (c) => c.status === "Completed" || c.status === "No-show"
);

// Pending actions (any consult with a pendingAction)
export const pendingActions = consultations.filter((c) => c.pendingAction);
