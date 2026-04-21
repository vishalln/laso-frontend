/**
 * MockDataContext — LASO unified data layer  (v4)
 *
 * Single source of truth for all in-memory state across every role.
 * All entities are seeded from mockDB constants and held in React state
 * so mutations (add note, send message, toggle task, update doctor, etc.)
 * are reflected live across the entire app within a session.
 *
 * Role-scoped query helpers:
 *   useMockData().forPatient(patientId)
 *   useMockData().forDoctor(doctorId)
 *   useMockData().forCoordinator()
 *   useMockData().forAdmin()
 *
 * Write mutations (all roles):
 *   addNote(note)
 *   sendMessage(msg)
 *   addProtocolStep(step)
 *   updateTask(id, patch)
 *   updateAdminDoctor(id, patch)
 *   addAdminDoctor(doctor)
 *   removeAdminDoctor(id)
 *   updateAdminUser(id, patch)
 *   updateFeatureFlag(key, enabled)
 *   updateCatalogItem(id, patch)
 *   addCatalogItem(item)
 *   removeCatalogItem(id)
 *   updateProtocolStep(id, patch)
 *   removeProtocolStep(id)
 *   reorderProtocolSteps(ids)
 */

import {
  createContext, useContext, useState, useCallback, useMemo,
  type ReactNode,
} from "react";
import {
  PATIENTS, DOCTORS, PROGRAMMES, WEEKLY_LOGS, EXPECTED_WEIGHT_CURVE,
  TREATMENT_PLANS, DOCTOR_NOTES, PRESCRIPTIONS,
  CONSULTATIONS, ORDERS, REFILL_STATUS, REFILL_STATUSES, CHAT_MESSAGES,
  CATALOG_ITEMS, COORD_TASKS, ADMIN_USERS, ADMIN_DOCTORS,
  PROTOCOL_STEPS, FEATURE_FLAGS,
  type Patient, type DoctorProfile, type Programme, type WeeklyLog,
  type TreatmentPlan, type DoctorNote, type Prescription,
  type Consultation, type Order, type ChatMessage, type CatalogItem,
  type ExpectedPoint, type CoordTask, type AdminUser, type AdminDoctor,
  type ProtocolStep, type FeatureFlag,
} from "@/data/mockDB";

// ─── Projected view types ──────────────────────────────────────────────────────

export interface PatientView {
  patient:       Patient;
  doctor:        DoctorProfile;
  /** Primary (active) programme — kept for backwards compat */
  programme:     Programme;
  /** All programmes for this patient, ordered active first then by startDate desc */
  programmes:    Programme[];
  logs:          WeeklyLog[];
  expectedCurve: ExpectedPoint[];
  plan:          TreatmentPlan | undefined;
  notes:         DoctorNote[];
  prescription:  Prescription | undefined;
  orders:        Order[];
  refill:        typeof REFILL_STATUS;
  messages:      ChatMessage[];
  consults:      Consultation[];
}

export interface DoctorView {
  doctor:            DoctorProfile;
  patients:          Patient[];
  consults:          Consultation[];
  todayConsults:     Consultation[];
  upcomingConsults:  Consultation[];
  completedConsults: Consultation[];
  pendingConsults:   Consultation[];
}

export interface CoordinatorView {
  allPatients:     Patient[];
  allDoctors:      DoctorProfile[];
  careQueue:       Patient[];
  escalations:     Patient[];
  allConsults:     Consultation[];
  pendingConsults: Consultation[];
  allOrders:       Order[];
  tasks:           CoordTask[];
}

export interface AdminView {
  allPatients:    Patient[];
  allDoctors:     DoctorProfile[];
  adminDoctors:   AdminDoctor[];
  adminUsers:     AdminUser[];
  allConsults:    Consultation[];
  allOrders:      Order[];
  catalog:        CatalogItem[];
  protocolSteps:  ProtocolStep[];
  featureFlags:   FeatureFlag[];
  analytics: {
    totalPatients:  number;
    activePatients: number;
    avgAdherence:   number;
    avgWeightLost:  number;
    criticalAlerts: number;
  };
  /** Derived analytics series computed from real WEEKLY_LOGS */
  chartData: {
    weightLossByWeek: { week: string; avg: number }[];
    adherenceTrend:   { week: string; adherence: number }[];
    glucoseTrend:     { week: string; glucose: number }[];
    sideEffectCounts: { effect: string; count: number }[];
  };
}

// ─── Mutation param types ──────────────────────────────────────────────────────

export type NewNote    = Omit<DoctorNote,  "id">;
export type NewMessage = Omit<ChatMessage, "id">;
export type NewStep    = Omit<ProtocolStep, "id" | "order">;

// ─── Context value ─────────────────────────────────────────────────────────────

interface MockDataContextValue {
  // Queries
  forPatient:     (patientId: string) => PatientView    | null;
  forDoctor:      (doctorId:  string) => DoctorView     | null;
  forCoordinator: () => CoordinatorView;
  forAdmin:       () => AdminView;

  // Write mutations
  addNote:              (note: NewNote) => void;
  sendMessage:          (msg:  NewMessage) => void;
  updateTask:           (id: string, patch: Partial<CoordTask>) => void;
  addAdminDoctor:       (doc: Omit<AdminDoctor, "id">) => void;
  updateAdminDoctor:    (id: string, patch: Partial<AdminDoctor>) => void;
  removeAdminDoctor:    (id: string) => void;
  updateAdminUser:      (id: string, patch: Partial<AdminUser>) => void;
  updateFeatureFlag:    (key: string, enabled: boolean) => void;
  addCatalogItem:       (item: Omit<CatalogItem, "id">) => void;
  updateCatalogItem:    (id: string, patch: Partial<CatalogItem>) => void;
  removeCatalogItem:    (id: string) => void;
  addProtocolStep:      (step: NewStep) => void;
  updateProtocolStep:   (id: string, patch: Partial<ProtocolStep>) => void;
  removeProtocolStep:   (id: string) => void;
  reorderProtocolSteps: (reordered: ProtocolStep[]) => void;
}

// ─── Derived analytics helpers ─────────────────────────────────────────────────

/**
 * Compute per-programme-week averages from WEEKLY_LOGS across all patients.
 * We use weeks 1–12 (the common window across all active programmes).
 */
function deriveChartData(logs: WeeklyLog[]) {
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const weightLossByWeek = weeks.map(w => {
    const weekLogs = logs.filter(l => l.week === w);
    if (weekLogs.length === 0) return { week: `W${w}`, avg: 0 };
    // avg weight lost = avg(startWeight - currentWeightKg) for patients that have this week
    const totalLost = weekLogs.reduce((sum, l) => {
      const patient = PATIENTS.find(p => p.id === l.patientId);
      return patient ? sum + (patient.startWeightKg - l.weightKg) : sum;
    }, 0);
    return { week: `W${w}`, avg: parseFloat((totalLost / weekLogs.length).toFixed(1)) };
  });

  const adherenceTrend = weeks.map(w => {
    const weekLogs = logs.filter(l => l.week === w && l.dosesScheduled > 0);
    if (weekLogs.length === 0) return { week: `W${w}`, adherence: 0 };
    const avg = weekLogs.reduce((sum, l) => sum + (l.dosesTaken / l.dosesScheduled) * 100, 0) / weekLogs.length;
    return { week: `W${w}`, adherence: Math.round(avg) };
  });

  const glucoseTrend = weeks.map(w => {
    const weekLogs = logs.filter(l => l.week === w);
    if (weekLogs.length === 0) return { week: `W${w}`, glucose: 0 };
    const avg = weekLogs.reduce((sum, l) => sum + l.fastingGlucose, 0) / weekLogs.length;
    return { week: `W${w}`, glucose: Math.round(avg) };
  });

  // Aggregate side effect counts across all logs
  const effectMap: Record<string, number> = {};
  logs.forEach(l => {
    l.sideEffects.forEach(se => {
      effectMap[se.symptom] = (effectMap[se.symptom] ?? 0) + 1;
    });
  });
  const sideEffectCounts = Object.entries(effectMap)
    .map(([effect, count]) => ({
      effect: effect.charAt(0).toUpperCase() + effect.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return { weightLossByWeek, adherenceTrend, glucoseTrend, sideEffectCounts };
}

// ─── Context ───────────────────────────────────────────────────────────────────

const MockDataContext = createContext<MockDataContextValue | null>(null);

export function MockDataProvider({ children }: { readonly children: ReactNode }) {
  // ── Mutable state seeded from mockDB ──
  const [notes,          setNotes]          = useState<DoctorNote[]>([...DOCTOR_NOTES]);
  const [messages,       setMessages]       = useState<ChatMessage[]>([...CHAT_MESSAGES]);
  const [tasks,          setTasks]          = useState<CoordTask[]>([...COORD_TASKS]);
  const [adminDoctors,   setAdminDoctors]   = useState<AdminDoctor[]>(
    ADMIN_DOCTORS.map(d => ({ ...d, hours: { ...d.hours } }))
  );
  const [adminUsers,     setAdminUsers]     = useState<AdminUser[]>([...ADMIN_USERS]);
  const [catalog,        setCatalog]        = useState<CatalogItem[]>([...CATALOG_ITEMS]);
  const [protocolSteps,  setProtocolSteps]  = useState<ProtocolStep[]>([...PROTOCOL_STEPS]);
  const [featureFlags,   setFeatureFlags]   = useState<FeatureFlag[]>([...FEATURE_FLAGS]);

  // ── Write mutations ────────────────────────────────────────────────────────

  const addNote = useCallback((note: NewNote) => {
    setNotes(prev => [{ ...note, id: `note_${Date.now()}` }, ...prev]);
  }, []);

  const sendMessage = useCallback((msg: NewMessage) => {
    setMessages(prev => [...prev, { ...msg, id: `msg_${Date.now()}` }]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<CoordTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const addAdminDoctor = useCallback((doc: Omit<AdminDoctor, "id">) => {
    setAdminDoctors(prev => [...prev, { ...doc, id: `dr_${Date.now()}` }]);
  }, []);

  const updateAdminDoctor = useCallback((id: string, patch: Partial<AdminDoctor>) => {
    setAdminDoctors(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }, []);

  const removeAdminDoctor = useCallback((id: string) => {
    setAdminDoctors(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateAdminUser = useCallback((id: string, patch: Partial<AdminUser>) => {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }, []);

  const updateFeatureFlag = useCallback((key: string, enabled: boolean) => {
    setFeatureFlags(prev => prev.map(f => f.key === key ? { ...f, enabled } : f));
  }, []);

  const addCatalogItem = useCallback((item: Omit<CatalogItem, "id">) => {
    setCatalog(prev => [...prev, { ...item, id: `cat_${Date.now()}` }]);
  }, []);

  const updateCatalogItem = useCallback((id: string, patch: Partial<CatalogItem>) => {
    setCatalog(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const removeCatalogItem = useCallback((id: string) => {
    setCatalog(prev => prev.filter(i => i.id !== id));
  }, []);

  const addProtocolStep = useCallback((step: NewStep) => {
    setProtocolSteps(prev => {
      const order = prev.length + 1;
      return [...prev, { ...step, id: `ps_${Date.now()}`, order }];
    });
  }, []);

  const updateProtocolStep = useCallback((id: string, patch: Partial<ProtocolStep>) => {
    setProtocolSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const removeProtocolStep = useCallback((id: string) => {
    setProtocolSteps(prev =>
      prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }))
    );
  }, []);

  const reorderProtocolSteps = useCallback((reordered: ProtocolStep[]) => {
    setProtocolSteps(reordered.map((s, i) => ({ ...s, order: i + 1 })));
  }, []);

  // ── Stable derived chart data (memoised; recomputes only when logs change) ──
  const chartData = useMemo(() => deriveChartData(WEEKLY_LOGS), []);

  // ── Query helpers ──────────────────────────────────────────────────────────

  const forPatient = useCallback((patientId: string): PatientView | null => {
    const patient = PATIENTS.find(p => p.id === patientId);
    if (!patient) return null;
    const doctor       = DOCTORS.find(d => d.id === patient.assignedDoctorId)!;
    // All programmes for this patient — active first, then by startDate descending
    const programmes   = PROGRAMMES
                           .filter(p => p.patientId === patientId)
                           .sort((a, b) => {
                             if (a.status === "active" && b.status !== "active") return -1;
                             if (b.status === "active" && a.status !== "active") return 1;
                             return b.startDate.localeCompare(a.startDate);
                           });
    const programme    = programmes[0] ?? PROGRAMMES.find(p => p.patientId === patientId)!;
    const logs         = WEEKLY_LOGS.filter(l => l.patientId === patientId)
                           .sort((a, b) => a.week - b.week);
    const plan         = TREATMENT_PLANS.find(t => t.patientId === patientId);
    const patientNotes = notes.filter(n => n.patientId === patientId)
                           .sort((a, b) => b.date.localeCompare(a.date));
    const prescription = PRESCRIPTIONS.find(r => r.patientId === patientId);
    const orders       = ORDERS.filter(o => o.patientId === patientId)
                           .sort((a, b) => b.date.localeCompare(a.date));
    const patientMsgs  = messages.filter(m => m.patientId === patientId);
    const consults     = CONSULTATIONS.filter(c => c.patientId === patientId)
                           .sort((a, b) => b.date.localeCompare(a.date));
    return {
      patient, doctor, programme, programmes, logs,
      expectedCurve: EXPECTED_WEIGHT_CURVE,
      plan,
      notes:        patientNotes,
      prescription,
      orders,
      refill:       REFILL_STATUSES.find(r => r.patientId === patientId) ?? REFILL_STATUS,
      messages:     patientMsgs,
      consults,
    };
  }, [notes, messages]);

  const forDoctor = useCallback((doctorId: string): DoctorView | null => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return null;
    const patients          = PATIENTS.filter(p => p.assignedDoctorId === doctorId);
    const consults          = CONSULTATIONS.filter(c => c.doctorId === doctorId);
    const TODAY             = "2026-04-20";
    const todayConsults     = consults.filter(c => c.date === TODAY)
                               .sort((a, b) => a.time.localeCompare(b.time));
    const upcomingConsults  = consults.filter(c => c.date > TODAY && c.date <= "2026-04-27")
                               .sort((a, b) => a.date.localeCompare(b.date));
    const completedConsults = consults.filter(c => c.status === "Completed" || c.status === "No-show")
                               .sort((a, b) => b.date.localeCompare(a.date));
    const pendingConsults   = consults.filter(c => c.pendingAction);
    return { doctor, patients, consults, todayConsults, upcomingConsults, completedConsults, pendingConsults };
  }, []);

  const forCoordinator = useCallback((): CoordinatorView => {
    const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const allPatients  = [...PATIENTS].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
    const careQueue    = allPatients.filter(p => p.status !== "active" && p.status !== "completed");
    const escalations  = allPatients.filter(p => p.urgency === "critical" || p.urgency === "high");
    const pendingConsults = CONSULTATIONS.filter(c => c.pendingAction);
    return {
      allPatients,
      allDoctors:     DOCTORS,
      careQueue,
      escalations,
      allConsults:    CONSULTATIONS,
      pendingConsults,
      allOrders:      ORDERS,
      tasks,
    };
  }, [tasks]);

  const forAdmin = useCallback((): AdminView => {
    const allPatients    = PATIENTS;
    const allDoctors     = DOCTORS;
    const activePatients = allPatients.filter(p => p.status === "active").length;
    const avgAdherence   = Math.round(
      allPatients.reduce((s, p) => s + p.adherenceScore, 0) / allPatients.length
    );
    const avgWeightLost = parseFloat(
      (allPatients.reduce((s, p) => s + p.weightLostKg, 0) / allPatients.length).toFixed(1)
    );
    const criticalAlerts = allPatients.filter(p => p.urgency === "critical" || p.urgency === "high").length;
    return {
      allPatients,
      allDoctors,
      adminDoctors,
      adminUsers,
      allConsults:    CONSULTATIONS,
      allOrders:      ORDERS,
      catalog,
      protocolSteps,
      featureFlags,
      analytics: { totalPatients: allPatients.length, activePatients, avgAdherence, avgWeightLost, criticalAlerts },
      chartData,
    };
  }, [adminDoctors, adminUsers, catalog, protocolSteps, featureFlags, chartData]);

  // ── Context value (stable reference via useMemo) ───────────────────────────

  const value = useMemo<MockDataContextValue>(() => ({
    forPatient,
    forDoctor,
    forCoordinator,
    forAdmin,
    addNote,
    sendMessage,
    updateTask,
    addAdminDoctor,
    updateAdminDoctor,
    removeAdminDoctor,
    updateAdminUser,
    updateFeatureFlag,
    addCatalogItem,
    updateCatalogItem,
    removeCatalogItem,
    addProtocolStep,
    updateProtocolStep,
    removeProtocolStep,
    reorderProtocolSteps,
  }), [
    forPatient, forDoctor, forCoordinator, forAdmin,
    addNote, sendMessage, updateTask,
    addAdminDoctor, updateAdminDoctor, removeAdminDoctor,
    updateAdminUser, updateFeatureFlag,
    addCatalogItem, updateCatalogItem, removeCatalogItem,
    addProtocolStep, updateProtocolStep, removeProtocolStep, reorderProtocolSteps,
  ]);

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
}

export function useMockData(): MockDataContextValue {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used within <MockDataProvider>");
  return ctx;
}
