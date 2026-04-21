/**
 * LASO — Unified In-Memory Data Store  (v3)
 * Single source of truth for every entity across all pages.
 *
 * Canonical IDs:
 *   patient_001 → Arjun Sharma   (demo patient login)
 *   patient_002 → Kavita Rao
 *   patient_003 → Suresh Iyer
 *   patient_004 → Deepa Krishnan
 *   patient_005 → Rajan Pillai
 *   patient_006 → Nisha Gupta
 *
 *   doctor_001  → Dr. Rahul Sharma   (demo doctor login)
 *   doctor_002  → Dr. Priya Nair
 *   doctor_003  → Dr. Aryan Kapoor
 *   doctor_004  → Dr. Sneha Kapoor
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENUMS / UNION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PatientStatus   = "active" | "review_needed" | "plateau" | "adherence_risk" | "completed" | "inactive";
export type UrgencyLevel    = "critical" | "high" | "medium" | "low";
export type ConsultType     = "Initial" | "Follow-up" | "Dose Review";
export type ConsultStatus   = "Upcoming" | "In Progress" | "Completed" | "No-show";
export type OrderStatus     = "prescription_received" | "pharmacist_review" | "safety_check" | "dispensed" | "packed" | "cold_chain_verified" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "processing" | "cancelled";
export type MessageSender   = "patient" | "coordinator";
export type SideEffectSymptom = "nausea" | "vomiting" | "constipation" | "fatigue";
export type EventType       = "medication_change" | "consultation" | "symptom" | "milestone" | "alert" | "log";
export type PendingAction   = "write-note" | "approve-dose" | "review-labs";
export type NoteType        = "progress" | "clinical_review" | "prescription" | "alert";
export type ProductCategory = "protein" | "vitamins" | "fibre_gut" | "devices" | "lab_test" | "rx_medication";

// ─────────────────────────────────────────────────────────────────────────────
// 2. INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  city: string;
  heightCm: number;
  assignedDoctorId: string;
  programmeId: string;
  programWeek: number;
  currentWeightKg: number;
  startWeightKg: number;
  weightLostKg: number;
  weightLostPct: number;
  currentHbA1c: number | null;
  baselineHbA1c: number | null;
  adherenceScore: number;
  metabolicScore: number;
  status: PatientStatus;
  flags: string[];
  lastCheckIn: string;
  nextConsult: string;
  urgency: UrgencyLevel;
  medication: string;
  currentDose: string;
  colorClass: string;
}

export interface DoctorSlot { date: string; times: string[] }

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialisation: string[];
  hospital: string;
  city: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultFeeINR: number;
  languages: string[];
  imageInitials: string;
  colorClass: string;
  bio: string;
  glp1Certified: boolean;
  status: "active" | "inactive";
  availableSlots: DoctorSlot[];
}

export interface SideEffectEntry  { symptom: SideEffectSymptom; severity: 1 | 2 | 3 }
export interface AppetiteEntry    { hungerLevel: number; cravings: number; mealSize: number }
export interface TimelineEvent    { date: string; type: EventType; title: string; detail: string }

export interface WeeklyLog {
  id: string;
  patientId: string;
  programmeId: string;
  week: number;
  weightKg: number;
  weightChangKg: number;
  fastingGlucose: number;
  hba1c: number | null;
  doseMg: number;
  dosesTaken: number;
  dosesScheduled: number;
  sideEffects: SideEffectEntry[];
  appetite: AppetiteEntry;
  events: TimelineEvent[];
}

export interface TitrationStep  { week: number; dose: string }
export interface LabRequired    { test: string; dueDate: string }
export interface TreatmentTarget{ label: string; value: string; achieved: boolean }

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  version: number;
  createdDate: string;
  diagnosis: string[];
  medication: string;
  dose: string;
  frequency: string;
  titrationSchedule: TitrationStep[];
  dietGuidelines: string[];
  activityTarget: string;
  followUpDate: string;
  labsRequired: LabRequired[];
  targets: TreatmentTarget[];
  notes: string;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: NoteType;
  subject: string;
  body: string;
  attachments: string[];
}

export interface PrescriptionMed { drug: string; dose: string; frequency: string; duration: string; notes: string }

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  doctorReg: string;
  medications: PrescriptionMed[];
  validUntil: string;
  refillsAllowed: number;
  digitalSignature: string;
}

export interface Programme {
  id: string;
  patientId: string;
  doctorId: string;
  name: string;
  startDate: string;
  currentWeek: number;
  totalWeeks: number;
  targetWeightLossKg: number;
  targetWeightLossPct: number;
  status: "active" | "completed" | "paused";
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  patientColorClass: string;
  doctorId: string;
  /** If set, this consult belongs to a specific programme.
   *  If null / undefined, it is a standalone (one-off) consultation. */
  programmeId?: string | null;
  type: ConsultType;
  date: string;
  time: string;
  durationMin: number;
  status: ConsultStatus;
  zoomUrl: string;
  noteWritten: boolean;
  noteSummary?: string;
  pendingAction?: PendingAction;
}

export interface OrderItem     { name: string; quantity: string; price: number }
export interface TrackingStep  { label: string; timestamp: string | null; completed: boolean; active: boolean }

export interface Order {
  id: string;
  patientId: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  trackingSteps: TrackingStep[];
  delivery: { estimatedTime: string; address: string; carrier: string; trackingId: string; coldChainIntact: boolean };
  pharmacy: { name: string; license: string; note: string };
}

export interface RefillStatus {
  patientId: string;
  medicationName: string;
  currentSupply: number;
  totalSupply: number;
  estimatedRunOut: string;
  autoRefillScheduled: string;
  status: "ok" | "low" | "critical";
}

export interface ChatMessage {
  id: string;
  patientId: string;
  sender: MessageSender;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  priceInr: number;
  unit: string;
  emoji: string;
  tagline: string;
  inStock: boolean;
  requiresPrescription: boolean;
  rating: number;
  reviewCount: number;
  /** Clinical rationale shown in the product detail dialog */
  clinicalRationale: string;
  /** [startWeek, endWeek] range when product is most relevant in GLP-1 journey */
  recommendedWeeks: [number, number];
}

// Expected weight curve (STEP trial data normalised to patient_001)
export interface ExpectedPoint { week: number; expected: number }

// ─────────────────────────────────────────────────────────────────────────────
// 3. DOCTORS
// ─────────────────────────────────────────────────────────────────────────────

export const DOCTORS: DoctorProfile[] = [
  {
    id: "doctor_001",
    name: "Dr. Rahul Sharma",
    title: "MBBS, MD (Internal Medicine), DM (Endocrinology)",
    specialisation: ["Endocrinology", "Diabetes", "Obesity Medicine"],
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 847,
    consultFeeINR: 1500,
    languages: ["Hindi", "English", "Marathi"],
    imageInitials: "RS",
    colorClass: "bg-primary",
    bio: "Dr. Sharma specialises in GLP-1 based metabolic therapies with over 500 patients on structured obesity programmes. Lead investigator in the STEP-India trial.",
    glp1Certified: true,
    status: "active",
    availableSlots: [
      { date: "2026-04-22", times: ["09:00", "10:30", "14:00", "15:30"] },
      { date: "2026-04-23", times: ["11:00", "12:30", "16:00"] },
      { date: "2026-04-25", times: ["09:30", "10:00", "14:30"] },
      { date: "2026-04-28", times: ["09:00", "11:00", "15:00", "16:30"] },
    ],
  },
  {
    id: "doctor_002",
    name: "Dr. Priya Nair",
    title: "MBBS, DNB (Endocrinology & Metabolism)",
    specialisation: ["Endocrinology", "Metabolic Syndrome", "PCOS & Obesity"],
    hospital: "Fortis Memorial Research Institute",
    city: "Bengaluru",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 612,
    consultFeeINR: 1200,
    languages: ["English", "Kannada", "Tamil", "Malayalam"],
    imageInitials: "PN",
    colorClass: "bg-accent",
    bio: "Dr. Nair is an expert in GLP-1 agonist therapies, particularly for women with PCOS-related obesity.",
    glp1Certified: true,
    status: "active",
    availableSlots: [
      { date: "2026-04-22", times: ["10:00", "11:30", "15:00"] },
      { date: "2026-04-24", times: ["09:00", "13:00", "16:00"] },
      { date: "2026-04-26", times: ["10:30", "14:00"] },
    ],
  },
  {
    id: "doctor_003",
    name: "Dr. Aryan Kapoor",
    title: "MBBS, MD (General Medicine), Fellowship in Bariatric Medicine",
    specialisation: ["Obesity Medicine", "Bariatric Medicine", "Lifestyle Diseases"],
    hospital: "Max Super Speciality Hospital",
    city: "Delhi",
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 438,
    consultFeeINR: 1000,
    languages: ["Hindi", "English", "Punjabi"],
    imageInitials: "AK",
    colorClass: "bg-success",
    bio: "Dr. Kapoor focuses on non-surgical weight management using GLP-1 agonists with a particular interest in metabolic reset protocols.",
    glp1Certified: true,
    status: "active",
    availableSlots: [
      { date: "2026-04-23", times: ["09:00", "10:00", "14:30", "17:00"] },
      { date: "2026-04-25", times: ["11:00", "15:00"] },
      { date: "2026-04-29", times: ["09:30", "12:00", "16:00"] },
    ],
  },
  {
    id: "doctor_004",
    name: "Dr. Sneha Kapoor",
    title: "MBBS, MD (Endocrinology)",
    specialisation: ["Endocrinology", "Diabetes"],
    hospital: "Narayana Health",
    city: "Bengaluru",
    experienceYears: 7,
    rating: 4.6,
    reviewCount: 291,
    consultFeeINR: 900,
    languages: ["Kannada", "Hindi", "English"],
    imageInitials: "SK",
    colorClass: "bg-violet-600",
    bio: "Dr. Sneha Kapoor specialises in type-2 diabetes management with GLP-1 therapies.",
    glp1Certified: true,
    status: "inactive",
    availableSlots: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATIENTS
// ─────────────────────────────────────────────────────────────────────────────

export const PATIENTS: Patient[] = [
  {
    id: "patient_001",
    name: "Arjun Sharma",
    age: 34,
    gender: "Male",
    city: "Mumbai",
    heightCm: 172,
    assignedDoctorId: "doctor_001",
    programmeId: "prog_001",
    programWeek: 12,
    currentWeightKg: 85.8,
    startWeightKg: 92,
    weightLostKg: 6.2,
    weightLostPct: 6.7,
    currentHbA1c: 7.1,
    baselineHbA1c: 8.4,
    adherenceScore: 84,
    metabolicScore: 76,
    status: "active",
    flags: [],
    lastCheckIn: "2026-04-16",
    nextConsult: "2026-04-28",
    urgency: "low",
    medication: "Rybelsus",
    currentDose: "14mg",
    colorClass: "bg-primary",
  },
  {
    id: "patient_002",
    name: "Kavita Rao",
    age: 47,
    gender: "Female",
    city: "Bengaluru",
    heightCm: 158,
    assignedDoctorId: "doctor_001",
    programmeId: "prog_002",
    programWeek: 8,
    currentWeightKg: 77.4,
    startWeightKg: 83,
    weightLostKg: 5.6,
    weightLostPct: 6.7,
    currentHbA1c: 7.4,
    baselineHbA1c: 9.1,
    adherenceScore: 61,
    metabolicScore: 58,
    status: "adherence_risk",
    flags: ["Adherence < 70% — 4 doses missed this week", "Plateau risk starting"],
    lastCheckIn: "2026-04-14",
    nextConsult: "2026-04-22",
    urgency: "high",
    medication: "Rybelsus",
    currentDose: "7mg",
    colorClass: "bg-accent",
  },
  {
    id: "patient_003",
    name: "Suresh Iyer",
    age: 52,
    gender: "Male",
    city: "Chennai",
    heightCm: 168,
    assignedDoctorId: "doctor_001",
    programmeId: "prog_003",
    programWeek: 6,
    currentWeightKg: 91.2,
    startWeightKg: 96,
    weightLostKg: 4.8,
    weightLostPct: 5.0,
    currentHbA1c: 8.1,
    baselineHbA1c: 9.8,
    adherenceScore: 78,
    metabolicScore: 62,
    status: "plateau",
    flags: ["Weight plateau — 3 consecutive weeks < 0.3 kg loss"],
    lastCheckIn: "2026-04-15",
    nextConsult: "2026-04-23",
    urgency: "medium",
    medication: "Ozempic",
    currentDose: "0.5mg",
    colorClass: "bg-success",
  },
  {
    id: "patient_004",
    name: "Deepa Krishnan",
    age: 38,
    gender: "Female",
    city: "Mumbai",
    heightCm: 162,
    assignedDoctorId: "doctor_002",
    programmeId: "prog_004",
    programWeek: 4,
    currentWeightKg: 71.8,
    startWeightKg: 75,
    weightLostKg: 3.2,
    weightLostPct: 4.3,
    currentHbA1c: null,
    baselineHbA1c: 6.4,
    adherenceScore: 95,
    metabolicScore: 70,
    status: "active",
    flags: [],
    lastCheckIn: "2026-04-17",
    nextConsult: "2026-05-01",
    urgency: "low",
    medication: "Rybelsus",
    currentDose: "7mg",
    colorClass: "bg-violet-500",
  },
  {
    id: "patient_005",
    name: "Rajan Pillai",
    age: 61,
    gender: "Male",
    city: "Kochi",
    heightCm: 170,
    assignedDoctorId: "doctor_003",
    programmeId: "prog_005",
    programWeek: 14,
    currentWeightKg: 88.5,
    startWeightKg: 98,
    weightLostKg: 9.5,
    weightLostPct: 9.7,
    currentHbA1c: 6.8,
    baselineHbA1c: 10.2,
    adherenceScore: 92,
    metabolicScore: 89,
    status: "active",
    flags: [],
    lastCheckIn: "2026-04-16",
    nextConsult: "2026-05-05",
    urgency: "low",
    medication: "Ozempic",
    currentDose: "1mg",
    colorClass: "bg-amber-500",
  },
  {
    id: "patient_006",
    name: "Nisha Gupta",
    age: 29,
    gender: "Female",
    city: "Delhi",
    heightCm: 155,
    assignedDoctorId: "doctor_002",
    programmeId: "prog_006",
    programWeek: 2,
    currentWeightKg: 68.5,
    startWeightKg: 70.1,
    weightLostKg: 1.6,
    weightLostPct: 2.3,
    currentHbA1c: null,
    baselineHbA1c: 6.1,
    adherenceScore: 86,
    metabolicScore: 55,
    status: "review_needed",
    flags: ["Severe nausea reported — dose adjustment may be needed", "Missing week 2 check-in"],
    lastCheckIn: "2026-04-11",
    nextConsult: "2026-04-22",
    urgency: "critical",
    medication: "Rybelsus",
    currentDose: "3mg",
    colorClass: "bg-rose-500",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROGRAMMES
// ─────────────────────────────────────────────────────────────────────────────

export const PROGRAMMES: Programme[] = [
  { id: "prog_007", patientId: "patient_001", doctorId: "doctor_002", name: "Laso Lifestyle Reset — 12-Week Pre-GLP-1 Program", startDate: "2025-10-01", currentWeek: 12, totalWeeks: 12, targetWeightLossKg: 4, targetWeightLossPct: 4.2, status: "completed" },
  { id: "prog_001", patientId: "patient_001", doctorId: "doctor_001", name: "Laso MetaboReset — 24-Week GLP-1 Program", startDate: "2026-01-26", currentWeek: 12, totalWeeks: 24, targetWeightLossKg: 7,  targetWeightLossPct: 7.6,  status: "active" },
  { id: "prog_002", patientId: "patient_002", doctorId: "doctor_001", name: "Laso MetaboReset — 12-Week GLP-1 Program", startDate: "2026-02-23", currentWeek: 8,  totalWeeks: 12, targetWeightLossKg: 5,  targetWeightLossPct: 6.0,  status: "active" },
  { id: "prog_003", patientId: "patient_003", doctorId: "doctor_001", name: "Laso MetaboReset — 12-Week GLP-1 Program", startDate: "2026-03-09", currentWeek: 6,  totalWeeks: 12, targetWeightLossKg: 6,  targetWeightLossPct: 6.25, status: "active" },
  { id: "prog_004", patientId: "patient_004", doctorId: "doctor_002", name: "Laso MetaboReset — 12-Week GLP-1 Program", startDate: "2026-03-23", currentWeek: 4,  totalWeeks: 12, targetWeightLossKg: 4,  targetWeightLossPct: 5.3,  status: "active" },
  { id: "prog_005", patientId: "patient_005", doctorId: "doctor_003", name: "Laso MetaboReset — 16-Week GLP-1 Program", startDate: "2026-01-12", currentWeek: 14, totalWeeks: 16, targetWeightLossKg: 10, targetWeightLossPct: 10.2, status: "active" },
  { id: "prog_006", patientId: "patient_006", doctorId: "doctor_002", name: "Laso MetaboReset — 12-Week GLP-1 Program", startDate: "2026-04-06", currentWeek: 2,  totalWeeks: 12, targetWeightLossKg: 4,  targetWeightLossPct: 5.7,  status: "active" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. WEEKLY LOGS
// ─────────────────────────────────────────────────────────────────────────────

export const WEEKLY_LOGS: WeeklyLog[] = [
  // ── patient_001 (12 weeks) ──
  { id: "wl_001", patientId: "patient_001", programmeId: "prog_001", week: 1,  weightKg: 92.0, weightChangKg: 0,    fastingGlucose: 178, hba1c: 8.4,  doseMg: 3,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 2 }, { symptom: "fatigue", severity: 1 }], appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 }, events: [{ date: "2026-01-26", type: "medication_change", title: "Treatment started",    detail: "Semaglutide 3mg initiated." }, { date: "2026-01-28", type: "symptom", title: "Nausea reported", detail: "Moderate nausea after morning dose." }] },
  { id: "wl_002", patientId: "patient_001", programmeId: "prog_001", week: 2,  weightKg: 91.2, weightChangKg: -0.8, fastingGlucose: 170, hba1c: null, doseMg: 3,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 2 }],                                                                     appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 }, events: [{ date: "2026-02-02", type: "log",              title: "Weight logged",      detail: "91.2 kg — 0.8 kg lost." }] },
  { id: "wl_003", patientId: "patient_001", programmeId: "prog_001", week: 3,  weightKg: 90.5, weightChangKg: -0.7, fastingGlucose: 162, hba1c: null, doseMg: 7,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 1 }],                                                                     appetite: { hungerLevel: 2, cravings: 3, mealSize: 2 }, events: [{ date: "2026-02-09", type: "medication_change", title: "Dose escalated 3→7mg", detail: "Per titration schedule." }, { date: "2026-02-12", type: "consultation", title: "Follow-up consult",  detail: "Dr. Sharma — good early response." }] },
  { id: "wl_004", patientId: "patient_001", programmeId: "prog_001", week: 4,  weightKg: 89.8, weightChangKg: -0.7, fastingGlucose: 155, hba1c: null, doseMg: 7,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 1 }, { symptom: "constipation", severity: 1 }],                         appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-02-19", type: "log",              title: "Weekly check-in",    detail: "Nausea improving, mild constipation." }] },
  { id: "wl_005", patientId: "patient_001", programmeId: "prog_001", week: 5,  weightKg: 89.1, weightChangKg: -0.7, fastingGlucose: 148, hba1c: null, doseMg: 7,  dosesTaken: 5, dosesScheduled: 7, sideEffects: [{ symptom: "constipation", severity: 1 }],                                                              appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-02-28", type: "alert",             title: "Adherence dip",      detail: "2 doses missed this week." }] },
  { id: "wl_006", patientId: "patient_001", programmeId: "prog_001", week: 6,  weightKg: 88.8, weightChangKg: -0.3, fastingGlucose: 145, hba1c: null, doseMg: 7,  dosesTaken: 5, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 4, mealSize: 3 }, events: [{ date: "2026-03-07", type: "log",              title: "Weight logged",      detail: "88.8 kg — slowdown noted." }] },
  { id: "wl_007", patientId: "patient_001", programmeId: "prog_001", week: 7,  weightKg: 88.6, weightChangKg: -0.2, fastingGlucose: 142, hba1c: null, doseMg: 7,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 4, cravings: 4, mealSize: 3 }, events: [{ date: "2026-03-14", type: "alert",             title: "Plateau detected",   detail: "< 0.3 kg/week for 2 consecutive weeks." }] },
  { id: "wl_008", patientId: "patient_001", programmeId: "prog_001", week: 8,  weightKg: 88.5, weightChangKg: -0.1, fastingGlucose: 140, hba1c: 7.6,  doseMg: 7,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [{ symptom: "fatigue", severity: 1 }],                                                                  appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2026-03-21", type: "consultation",      title: "Month 2 review",     detail: "Plateau discussed. Dose escalation planned." }, { date: "2026-03-21", type: "milestone", title: "HbA1c 7.6%", detail: "Significant improvement from 8.4%." }] },
  { id: "wl_009", patientId: "patient_001", programmeId: "prog_001", week: 9,  weightKg: 88.0, weightChangKg: -0.5, fastingGlucose: 135, hba1c: null, doseMg: 14, dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 1 }],                                                                   appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 }, events: [{ date: "2026-03-28", type: "medication_change", title: "Dose escalated 7→14mg", detail: "Per Dr. Sharma." }] },
  { id: "wl_010", patientId: "patient_001", programmeId: "prog_001", week: 10, weightKg: 87.2, weightChangKg: -0.8, fastingGlucose: 130, hba1c: null, doseMg: 14, dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 1 }],                                                                   appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 }, events: [{ date: "2026-04-04", type: "milestone",         title: "Progress resumed",   detail: "Weight loss back on track post escalation." }] },
  { id: "wl_011", patientId: "patient_001", programmeId: "prog_001", week: 11, weightKg: 86.5, weightChangKg: -0.7, fastingGlucose: 125, hba1c: null, doseMg: 14, dosesTaken: 6, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-11", type: "log",              title: "Weight logged",      detail: "86.5 kg — 5.5 kg total lost." }] },
  { id: "wl_012", patientId: "patient_001", programmeId: "prog_001", week: 12, weightKg: 85.8, weightChangKg: -0.7, fastingGlucose: 122, hba1c: 7.1,  doseMg: 14, dosesTaken: 7, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-16", type: "consultation",      title: "Month 3 review",     detail: "Continue 14mg. 12-week extension recommended." }, { date: "2026-04-16", type: "milestone", title: "HbA1c 7.1%", detail: "1.3% absolute reduction from baseline." }] },
  // ── patient_001 / prog_007 — 12-Week Pre-GLP-1 Lifestyle Reset (Oct–Dec 2025) ──
  { id: "wl_035", patientId: "patient_001", programmeId: "prog_007", week: 1,  weightKg: 96.0, weightChangKg: 0,    fastingGlucose: 192, hba1c: 8.8,  doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 4, cravings: 5, mealSize: 4 }, events: [{ date: "2025-10-01", type: "consultation", title: "Programme kickoff — Dr. Nair", detail: "Baseline assessment. Weight 96 kg, BMI 32.4, HbA1c 8.8%. 12-week lifestyle reset initiated before GLP-1 enrolment." }, { date: "2025-10-02", type: "log", title: "Baseline logged", detail: "Starting weight 96.0 kg. Fasting glucose 192 mg/dL." }] },
  { id: "wl_036", patientId: "patient_001", programmeId: "prog_007", week: 2,  weightKg: 95.2, weightChangKg: -0.8, fastingGlucose: 184, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2025-10-08", type: "log", title: "Week 2 check-in", detail: "0.8 kg lost. Calorie deficit achieved. Hunger high but manageable." }] },
  { id: "wl_037", patientId: "patient_001", programmeId: "prog_007", week: 3,  weightKg: 94.5, weightChangKg: -0.7, fastingGlucose: 178, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 4, mealSize: 3 }, events: [{ date: "2025-10-15", type: "log", title: "Week 3 check-in", detail: "0.7 kg lost. Fasting glucose trending down. Diet compliance improving." }] },
  { id: "wl_038", patientId: "patient_001", programmeId: "prog_007", week: 4,  weightKg: 93.9, weightChangKg: -0.6, fastingGlucose: 171, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-10-22", type: "consultation", title: "Month 1 review — Dr. Nair", detail: "2.1 kg lost in 4 weeks. Good progress. Exercise compliance 80%. Continue current plan." }, { date: "2025-10-22", type: "milestone", title: "2 kg milestone", detail: "2.1 kg total weight loss. On track for 4 kg by programme end." }] },
  { id: "wl_039", patientId: "patient_001", programmeId: "prog_007", week: 5,  weightKg: 93.4, weightChangKg: -0.5, fastingGlucose: 166, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-10-29", type: "log", title: "Week 5 check-in", detail: "0.5 kg lost. Resistance training added 2×/week." }] },
  { id: "wl_040", patientId: "patient_001", programmeId: "prog_007", week: 6,  weightKg: 93.1, weightChangKg: -0.3, fastingGlucose: 163, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2025-11-05", type: "alert", title: "Slowdown week 6", detail: "Weight loss slowing — only 0.3 kg. Appetite returning. Dr. Nair notified." }] },
  { id: "wl_041", patientId: "patient_001", programmeId: "prog_007", week: 7,  weightKg: 93.0, weightChangKg: -0.1, fastingGlucose: 162, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 4, cravings: 5, mealSize: 4 }, events: [{ date: "2025-11-12", type: "alert", title: "Plateau — week 7", detail: "0.1 kg lost this week. Lifestyle-only plateau emerging. GLP-1 candidacy discussed." }] },
  { id: "wl_042", patientId: "patient_001", programmeId: "prog_007", week: 8,  weightKg: 92.8, weightChangKg: -0.2, fastingGlucose: 160, hba1c: 8.5,  doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2025-11-19", type: "consultation", title: "Mid-programme review + GLP-1 planning — Dr. Nair", detail: "HbA1c still 8.5% despite lifestyle changes. Weight plateau confirmed weeks 6–8. GLP-1 programme formally recommended. Target: complete 12 weeks then enrol." }, { date: "2025-11-19", type: "milestone", title: "HbA1c re-tested", detail: "HbA1c 8.5% — modest improvement from 8.8% baseline. Lifestyle alone insufficient; GLP-1 therapy indicated." }] },
  { id: "wl_043", patientId: "patient_001", programmeId: "prog_007", week: 9,  weightKg: 92.5, weightChangKg: -0.3, fastingGlucose: 156, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-11-26", type: "log", title: "Week 9 check-in", detail: "Motivated by upcoming GLP-1 enrolment. Calorie deficit tightened." }] },
  { id: "wl_044", patientId: "patient_001", programmeId: "prog_007", week: 10, weightKg: 92.3, weightChangKg: -0.2, fastingGlucose: 152, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-12-03", type: "log", title: "Week 10 check-in", detail: "Fasting glucose down to 152 mg/dL. Good dietary compliance this week." }] },
  { id: "wl_045", patientId: "patient_001", programmeId: "prog_007", week: 11, weightKg: 92.1, weightChangKg: -0.2, fastingGlucose: 148, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-12-10", type: "log", title: "Week 11 check-in", detail: "3.9 kg total lost. Programme close-out next week." }] },
  { id: "wl_046", patientId: "patient_001", programmeId: "prog_007", week: 12, weightKg: 92.0, weightChangKg: -0.1, fastingGlucose: 144, hba1c: null, doseMg: 0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [], appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2025-12-17", type: "consultation", title: "Programme completion & GLP-1 enrolment decision — Dr. Nair", detail: "Programme completed. 4.0 kg lost. Fasting glucose 144 mg/dL. HbA1c remains elevated. GLP-1 (Rybelsus 3mg) recommended. Referred to Dr. Rahul Sharma for GLP-1 programme." }, { date: "2025-12-17", type: "milestone", title: "Lifestyle Reset Complete — 4.0 kg lost", detail: "12-week programme completed. Body ready for GLP-1 therapy. Transitioning to Laso MetaboReset programme in Jan 2026." }] },

  // ── patient_002 (8 weeks) ──
  { id: "wl_013", patientId: "patient_002", programmeId: "prog_002", week: 1,  weightKg: 83.0, weightChangKg: 0,    fastingGlucose: 195, hba1c: 9.1,  doseMg: 3,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 3 }],                                                                   appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 }, events: [{ date: "2026-02-23", type: "medication_change", title: "Treatment started",    detail: "Rybelsus 3mg initiated." }] },
  { id: "wl_014", patientId: "patient_002", programmeId: "prog_002", week: 2,  weightKg: 82.1, weightChangKg: -0.9, fastingGlucose: 188, hba1c: null, doseMg: 3,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 2 }],                                                                   appetite: { hungerLevel: 2, cravings: 3, mealSize: 2 }, events: [{ date: "2026-03-02", type: "log",              title: "Week 2 check-in",    detail: "0.9 kg lost. Nausea persisting." }] },
  { id: "wl_015", patientId: "patient_002", programmeId: "prog_002", week: 3,  weightKg: 81.0, weightChangKg: -1.1, fastingGlucose: 179, hba1c: null, doseMg: 7,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 1 }],                                                                   appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-03-09", type: "medication_change", title: "Dose escalated 3→7mg", detail: "Good early tolerance." }] },
  { id: "wl_016", patientId: "patient_002", programmeId: "prog_002", week: 4,  weightKg: 80.2, weightChangKg: -0.8, fastingGlucose: 171, hba1c: null, doseMg: 7,  dosesTaken: 5, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 4, mealSize: 3 }, events: [{ date: "2026-03-16", type: "alert",             title: "Adherence dip",      detail: "2 doses missed." }] },
  { id: "wl_017", patientId: "patient_002", programmeId: "prog_002", week: 5,  weightKg: 79.5, weightChangKg: -0.7, fastingGlucose: 163, hba1c: null, doseMg: 7,  dosesTaken: 4, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2026-03-23", type: "alert",             title: "Adherence critical", detail: "3 doses missed this week." }] },
  { id: "wl_018", patientId: "patient_002", programmeId: "prog_002", week: 6,  weightKg: 79.0, weightChangKg: -0.5, fastingGlucose: 158, hba1c: null, doseMg: 7,  dosesTaken: 4, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 4, cravings: 5, mealSize: 4 }, events: [{ date: "2026-03-30", type: "alert",             title: "Plateau emerging",   detail: "Weight loss slowing due to adherence issues." }] },
  { id: "wl_019", patientId: "patient_002", programmeId: "prog_002", week: 7,  weightKg: 78.0, weightChangKg: -1.0, fastingGlucose: 151, hba1c: null, doseMg: 7,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-06", type: "consultation",      title: "Adherence review",   detail: "Dr. Sharma — adherence plan revised." }] },
  { id: "wl_020", patientId: "patient_002", programmeId: "prog_002", week: 8,  weightKg: 77.4, weightChangKg: -0.6, fastingGlucose: 145, hba1c: 7.4,  doseMg: 7,  dosesTaken: 3, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 4, cravings: 5, mealSize: 4 }, events: [{ date: "2026-04-13", type: "alert",             title: "Adherence < 50%",    detail: "Only 3 of 7 doses this week." }] },
  // ── patient_003 (6 weeks) ──
  { id: "wl_021", patientId: "patient_003", programmeId: "prog_003", week: 1,  weightKg: 96.0, weightChangKg: 0,    fastingGlucose: 210, hba1c: 9.8,  doseMg: 0.25, dosesTaken: 1, dosesScheduled: 1, sideEffects: [{ symptom: "nausea", severity: 1 }], appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 }, events: [{ date: "2026-03-09", type: "medication_change", title: "Treatment started",    detail: "Ozempic 0.25mg/week initiated." }] },
  { id: "wl_022", patientId: "patient_003", programmeId: "prog_003", week: 2,  weightKg: 94.8, weightChangKg: -1.2, fastingGlucose: 200, hba1c: null, doseMg: 0.25, dosesTaken: 1, dosesScheduled: 1, sideEffects: [],                                                                                                    appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 }, events: [{ date: "2026-03-16", type: "log",              title: "Week 2 check-in",    detail: "1.2 kg lost. Good initial response." }] },
  { id: "wl_023", patientId: "patient_003", programmeId: "prog_003", week: 3,  weightKg: 93.9, weightChangKg: -0.9, fastingGlucose: 191, hba1c: null, doseMg: 0.25, dosesTaken: 1, dosesScheduled: 1, sideEffects: [],                                                                                                    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-03-23", type: "log",              title: "Week 3 check-in",    detail: "0.9 kg lost." }] },
  { id: "wl_024", patientId: "patient_003", programmeId: "prog_003", week: 4,  weightKg: 93.2, weightChangKg: -0.7, fastingGlucose: 185, hba1c: null, doseMg: 0.5, dosesTaken: 1, dosesScheduled: 1,  sideEffects: [],                                                                                                    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-03-30", type: "medication_change", title: "Dose escalated 0.25→0.5mg", detail: "Per titration protocol." }] },
  { id: "wl_025", patientId: "patient_003", programmeId: "prog_003", week: 5,  weightKg: 92.9, weightChangKg: -0.3, fastingGlucose: 182, hba1c: null, doseMg: 0.5, dosesTaken: 1, dosesScheduled: 1,  sideEffects: [],                                                                                                    appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 }, events: [{ date: "2026-04-06", type: "alert",             title: "Plateau emerging",   detail: "< 0.3 kg loss, 2nd consecutive week." }] },
  { id: "wl_026", patientId: "patient_003", programmeId: "prog_003", week: 6,  weightKg: 91.2, weightChangKg: -1.7, fastingGlucose: 176, hba1c: null, doseMg: 0.5, dosesTaken: 1, dosesScheduled: 1,  sideEffects: [],                                                                                                    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-13", type: "alert",             title: "Plateau — 3 weeks",  detail: "Dr. review required." }] },
  // ── patient_004 (4 weeks) ──
  { id: "wl_027", patientId: "patient_004", programmeId: "prog_004", week: 1,  weightKg: 75.0, weightChangKg: 0,    fastingGlucose: 130, hba1c: 6.4,  doseMg: 3,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 }, events: [{ date: "2026-03-23", type: "medication_change", title: "Treatment started",    detail: "Rybelsus 3mg initiated." }] },
  { id: "wl_028", patientId: "patient_004", programmeId: "prog_004", week: 2,  weightKg: 74.0, weightChangKg: -1.0, fastingGlucose: 124, hba1c: null, doseMg: 3,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 }, events: [{ date: "2026-03-30", type: "log",              title: "Week 2 check-in",    detail: "1.0 kg lost. Excellent adherence." }] },
  { id: "wl_029", patientId: "patient_004", programmeId: "prog_004", week: 3,  weightKg: 72.8, weightChangKg: -1.2, fastingGlucose: 119, hba1c: null, doseMg: 7,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 2, mealSize: 2 }, events: [{ date: "2026-04-06", type: "medication_change", title: "Dose escalated 3→7mg", detail: "Strong response." }] },
  { id: "wl_030", patientId: "patient_004", programmeId: "prog_004", week: 4,  weightKg: 71.8, weightChangKg: -1.0, fastingGlucose: 115, hba1c: null, doseMg: 7,  dosesTaken: 7, dosesScheduled: 7, sideEffects: [],                                                                                                      appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-13", type: "milestone",         title: "4-week milestone",   detail: "3.2 kg lost — ahead of target." }] },
  // ── patient_005 (14 weeks) ──
  { id: "wl_031", patientId: "patient_005", programmeId: "prog_005", week: 1,  weightKg: 98.0, weightChangKg: 0,    fastingGlucose: 230, hba1c: 10.2, doseMg: 0.25, dosesTaken: 1, dosesScheduled: 1, sideEffects: [{ symptom: "nausea", severity: 2 }], appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 }, events: [{ date: "2026-01-12", type: "medication_change", title: "Treatment started",    detail: "Ozempic 0.25mg initiated." }] },
  { id: "wl_032", patientId: "patient_005", programmeId: "prog_005", week: 14, weightKg: 88.5, weightChangKg: -9.5, fastingGlucose: 118, hba1c: 6.8,  doseMg: 1.0, dosesTaken: 1, dosesScheduled: 1, sideEffects: [],                                                                                                     appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 }, events: [{ date: "2026-04-13", type: "milestone",         title: "14-week milestone",  detail: "9.5 kg total lost. HbA1c 6.8% — near target." }] },
  // ── patient_006 (2 weeks) ──
  { id: "wl_033", patientId: "patient_006", programmeId: "prog_006", week: 1,  weightKg: 70.1, weightChangKg: 0,    fastingGlucose: 118, hba1c: 6.1,  doseMg: 3,  dosesTaken: 6, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 3 }, { symptom: "vomiting", severity: 2 }],                           appetite: { hungerLevel: 1, cravings: 1, mealSize: 1 }, events: [{ date: "2026-04-06", type: "medication_change", title: "Treatment started",    detail: "Rybelsus 3mg initiated." }, { date: "2026-04-07", type: "symptom", title: "Severe nausea", detail: "Patient reports vomiting after dose." }] },
  { id: "wl_034", patientId: "patient_006", programmeId: "prog_006", week: 2,  weightKg: 68.5, weightChangKg: -1.6, fastingGlucose: 112, hba1c: null, doseMg: 3,  dosesTaken: 5, dosesScheduled: 7, sideEffects: [{ symptom: "nausea", severity: 3 }],                                                                   appetite: { hungerLevel: 1, cravings: 1, mealSize: 2 }, events: [{ date: "2026-04-13", type: "alert",             title: "Dose review needed", detail: "Severe nausea — possible dose adjustment." }] },
];

// Expected curve (STEP trial data, normalised to patient_001)
export const EXPECTED_WEIGHT_CURVE: ExpectedPoint[] = [
  { week: 1,  expected: 92.0 }, { week: 2,  expected: 91.4 }, { week: 3,  expected: 90.8 },
  { week: 4,  expected: 90.1 }, { week: 5,  expected: 89.5 }, { week: 6,  expected: 88.8 },
  { week: 7,  expected: 88.2 }, { week: 8,  expected: 87.6 }, { week: 9,  expected: 87.0 },
  { week: 10, expected: 86.4 }, { week: 11, expected: 85.9 }, { week: 12, expected: 85.3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. TREATMENT PLANS
// ─────────────────────────────────────────────────────────────────────────────

export const TREATMENT_PLANS: TreatmentPlan[] = [
  {
    id: "plan_007", patientId: "patient_001", doctorId: "doctor_002", version: 1, createdDate: "2025-10-01",
    diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class I — BMI 32.4 (E66.01)"],
    medication: "Lifestyle only (no medication)", dose: "Diet + exercise protocol — 12-week pre-GLP-1 reset",
    frequency: "Daily activity logging + weekly weigh-in",
    titrationSchedule: [],
    dietGuidelines: ["Calorie deficit 500 kcal/day from baseline intake", "Protein ≥ 1.0g/kg body weight daily", "Avoid sugar-sweetened beverages and refined carbohydrates", "3 structured meals — no skipping; limit snacking to 1 permitted snack/day", "Minimum 5 servings of vegetables daily"],
    activityTarget: "150 min moderate aerobic activity per week (brisk walking, cycling); add resistance training 2×/week from week 4",
    followUpDate: "2025-10-22",
    labsRequired: [{ test: "HbA1c + fasting glucose (baseline)", dueDate: "2025-10-01" }, { test: "HbA1c (mid-point re-test)", dueDate: "2025-11-19" }, { test: "Fasting glucose (week 12)", dueDate: "2025-12-17" }],
    targets: [{ label: "Weight loss at 12 weeks", value: "≥4 kg (4.2% body weight)", achieved: true }, { label: "Fasting glucose improvement", value: "< 160 mg/dL by week 12", achieved: true }, { label: "HbA1c at 8 weeks", value: "< 8.8% (any improvement)", achieved: true }, { label: "Readiness for GLP-1 enrolment", value: "Complete 12 weeks + medical clearance", achieved: true }],
    notes: "12-week lifestyle-only programme to build metabolic and behavioural foundations before initiating GLP-1 therapy. Patient counselled that GLP-1 may be required regardless of lifestyle outcomes given T2DM severity. Referral to Dr. Rahul Sharma placed for GLP-1 programme from Jan 2026.",
  },
  {
    id: "plan_001", patientId: "patient_001", doctorId: "doctor_001", version: 1, createdDate: "2026-01-26",
    diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class I — BMI 31.2 (E66.01)"],
    medication: "Semaglutide (Rybelsus)", dose: "Start 3mg, escalate to 7mg at week 3, 14mg at week 9",
    frequency: "Once daily, 30 minutes before first meal",
    titrationSchedule: [{ week: 1, dose: "3mg" }, { week: 3, dose: "7mg" }, { week: 9, dose: "14mg" }],
    dietGuidelines: ["Calorie deficit 500–700 kcal/day", "Protein ≥ 1.2g/kg body weight", "Avoid refined carbs and sugar-sweetened beverages", "Eat slowly; stop at 80% satiety", "Minimum 3 structured meals per day — no skipping"],
    activityTarget: "150 min moderate aerobic activity/week + 2× resistance training",
    followUpDate: "2026-02-12",
    labsRequired: [{ test: "HbA1c", dueDate: "2026-03-21" }, { test: "Fasting Lipids", dueDate: "2026-03-21" }, { test: "Liver Function", dueDate: "2026-03-21" }, { test: "HbA1c (3-month)", dueDate: "2026-04-16" }],
    targets: [{ label: "Weight loss at 12 weeks", value: "≥5% body weight", achieved: true }, { label: "HbA1c at 3 months", value: "<7.5%", achieved: true }, { label: "Fasting glucose", value: "<130 mg/dL", achieved: true }, { label: "Adherence", value: ">80%", achieved: false }],
    notes: "Patient counselled on GI side effects (transient). Follow SUSTAIN-ORAL-India titration protocol.",
  },
  {
    id: "plan_002", patientId: "patient_002", doctorId: "doctor_001", version: 1, createdDate: "2026-02-23",
    diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class I — BMI 33.1 (E66.01)", "Adherence risk"],
    medication: "Semaglutide (Rybelsus)", dose: "7mg — dose escalation paused pending adherence improvement",
    frequency: "Once daily, 30 minutes before first meal",
    titrationSchedule: [{ week: 1, dose: "3mg" }, { week: 3, dose: "7mg" }],
    dietGuidelines: ["Calorie deficit 400–600 kcal/day", "Protein ≥ 1.0g/kg body weight", "Mediterranean diet encouraged", "Avoid evening snacking"],
    activityTarget: "120 min walking/week — low impact given joint pain",
    followUpDate: "2026-04-22",
    labsRequired: [{ test: "HbA1c", dueDate: "2026-04-23" }, { test: "Fasting Lipids", dueDate: "2026-04-23" }],
    targets: [{ label: "Weight loss at 12 weeks", value: "≥5% body weight", achieved: false }, { label: "HbA1c at 3 months", value: "<8.0%", achieved: true }, { label: "Adherence", value: ">70%", achieved: false }],
    notes: "Adherence support: weekly coordinator check-in mandated. Pill organiser provided.",
  },
  {
    id: "plan_003", patientId: "patient_003", doctorId: "doctor_001", version: 1, createdDate: "2026-03-09",
    diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class II — BMI 34.0 (E66.01)", "Weight plateau"],
    medication: "Semaglutide (Ozempic)", dose: "0.5mg/week — may escalate to 1mg if plateau persists",
    frequency: "Once weekly, same day each week",
    titrationSchedule: [{ week: 1, dose: "0.25mg" }, { week: 4, dose: "0.5mg" }, { week: 8, dose: "1mg (if needed)" }],
    dietGuidelines: ["Intermittent fasting 16:8 considered", "Increase dietary fibre to ≥30g/day", "Reduce ultra-processed foods"],
    activityTarget: "150 min walking + 2× strength training per week",
    followUpDate: "2026-04-23",
    labsRequired: [{ test: "HbA1c", dueDate: "2026-04-14" }, { test: "Fasting Lipids", dueDate: "2026-04-14" }],
    targets: [{ label: "Break plateau in 2 weeks", value: ">0.5 kg/week", achieved: false }, { label: "HbA1c target", value: "<8.5%", achieved: true }],
    notes: "Patient counselled on plateau biology. Nutritionist referral placed.",
  },
  {
    id: "plan_004", patientId: "patient_004", doctorId: "doctor_002", version: 1, createdDate: "2026-03-23",
    diagnosis: ["Pre-diabetes (R73.09)", "Overweight — BMI 28.6 (E66.09)"],
    medication: "Semaglutide (Rybelsus)", dose: "7mg — escalate to 14mg at week 7",
    frequency: "Once daily, 30 minutes before first meal",
    titrationSchedule: [{ week: 1, dose: "3mg" }, { week: 3, dose: "7mg" }, { week: 7, dose: "14mg" }],
    dietGuidelines: ["Low-carb diet (<100g net carbs/day)", "Intermittent fasting 14:10 encouraged", "Increase omega-3 rich foods"],
    activityTarget: "180 min aerobic activity/week — currently running 5k 3× weekly",
    followUpDate: "2026-05-01",
    labsRequired: [{ test: "HbA1c", dueDate: "2026-05-01" }, { test: "Fasting Lipids", dueDate: "2026-05-01" }],
    targets: [{ label: "Weight loss at 12 weeks", value: "≥5% body weight", achieved: false }, { label: "HbA1c normalisation", value: "<5.7%", achieved: false }],
    notes: "Excellent adherence patient. Focused on preventing T2DM progression.",
  },
  {
    id: "plan_005", patientId: "patient_005", doctorId: "doctor_003", version: 1, createdDate: "2026-01-12",
    diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class II — BMI 33.9 (E66.01)"],
    medication: "Semaglutide (Ozempic)", dose: "1mg/week maintenance",
    frequency: "Once weekly, Monday morning",
    titrationSchedule: [{ week: 1, dose: "0.25mg" }, { week: 5, dose: "0.5mg" }, { week: 9, dose: "1mg" }],
    dietGuidelines: ["High-protein diet", "Structured meal timings", "Mediterranean-style eating"],
    activityTarget: "200 min aerobic + 3× resistance training per week — excellent compliance",
    followUpDate: "2026-05-05",
    labsRequired: [{ test: "HbA1c", dueDate: "2026-04-14" }, { test: "Comprehensive metabolic panel", dueDate: "2026-04-14" }],
    targets: [{ label: "Weight loss at 16 weeks", value: "≥10% body weight", achieved: true }, { label: "HbA1c", value: "<7.0%", achieved: true }, { label: "Fasting glucose", value: "<120 mg/dL", achieved: true }],
    notes: "Outstanding outcome. Continue 1mg maintenance for 16-week programme completion.",
  },
  {
    id: "plan_006", patientId: "patient_006", doctorId: "doctor_002", version: 1, createdDate: "2026-04-06",
    diagnosis: ["Pre-diabetes (R73.09)", "Overweight — BMI 29.2 (E66.09)", "GI intolerance to GLP-1"],
    medication: "Semaglutide (Rybelsus)", dose: "3mg — dose hold pending GI tolerability review",
    frequency: "Once daily, 30 minutes before first meal",
    titrationSchedule: [{ week: 1, dose: "3mg" }, { week: 5, dose: "7mg (pending tolerance)" }],
    dietGuidelines: ["Anti-nausea diet: small frequent meals", "Avoid fatty/spicy foods", "BRAT diet initially if vomiting persists"],
    activityTarget: "Light walking 30 min/day only until nausea resolves",
    followUpDate: "2026-04-22",
    labsRequired: [{ test: "Fasting glucose", dueDate: "2026-04-22" }],
    targets: [{ label: "Nausea resolution by week 4", value: "Severity ≤ 1", achieved: false }, { label: "Weight loss at 12 weeks", value: "≥5% body weight", achieved: false }],
    notes: "URGENT: Dose adjustment may be required. Patient at risk of discontinuation due to intolerance.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. DOCTOR NOTES
// ─────────────────────────────────────────────────────────────────────────────

export const DOCTOR_NOTES: DoctorNote[] = [
  { id: "note_009", patientId: "patient_001", doctorId: "doctor_002", date: "2025-12-17", type: "clinical_review", subject: "Lifestyle Reset completed — GLP-1 transition authorised", body: "Arjun has completed the 12-week Laso Lifestyle Reset programme (Oct 1 to Dec 17, 2025).\n\nOutcomes:\n- Weight: 96 kg to 92 kg (-4.0 kg, 4.2% body weight)\n- Fasting glucose: 192 to 144 mg/dL\n- HbA1c: 8.8% to 8.5% (modest; still elevated)\n\nAssessment: Lifestyle-only intervention insufficient for adequate glycaemic control. Plateau emerged weeks 6-8. HbA1c remains above 8.0% threshold.\n\nPlan: Initiating GLP-1 therapy. Referring to Dr. Rahul Sharma (Apollo Mumbai) for Laso MetaboReset 24-Week GLP-1 Programme from Jan 2026. Prescription: Semaglutide (Rybelsus) 3mg titration protocol.", attachments: ["lifestyle-reset-completion-171225.pdf", "glp1-referral-dr-sharma.pdf"] },
  { id: "note_001", patientId: "patient_001", doctorId: "doctor_001", date: "2026-02-12", type: "progress",        subject: "4-week follow-up — Good early response",                       body: "Arjun presents well. Weight down 2.2 kg in 3 weeks. Nausea was moderate in week 1–2, now largely resolved. Glucose trending down (178 → 162 mg/dL). Escalated dose to 7mg per protocol.",            attachments: ["lab-fasting-glucose-020226.pdf"] },
  { id: "note_002", patientId: "patient_001", doctorId: "doctor_001", date: "2026-03-21", type: "clinical_review", subject: "Month 2 review — Plateau noted, HbA1c improved",               body: "Weight plateau detected weeks 6–8 (<0.3 kg/week). HbA1c 7.6% from baseline 8.4%. Adherence dip in weeks 5–6. Plan: escalate to 14mg at week 9. Referred to Laso nutritionist.",               attachments: ["hba1c-lab-210326.pdf", "nutritionist-referral.pdf"] },
  { id: "note_003", patientId: "patient_001", doctorId: "doctor_001", date: "2026-04-16", type: "clinical_review", subject: "Month 3 (12-week) review — Strong overall outcome",            body: "Total weight loss 6.2 kg (6.7%). HbA1c 7.1% — 1.3% absolute reduction. Fasting glucose 122 mg/dL. Patient very motivated. Continue 14mg for next 12 weeks.",                                    attachments: ["12week-summary-lab-160426.pdf"] },
  { id: "note_004", patientId: "patient_002", doctorId: "doctor_001", date: "2026-04-07", type: "alert",           subject: "Adherence alert — action required",                           body: "Kavita has missed 4 doses this week. Adherence score dropped to 61%. Coordinator tasked with outreach call today. Dose escalation to 14mg on hold until adherence >70% for 2 consecutive weeks.", attachments: [] },
  { id: "note_005", patientId: "patient_002", doctorId: "doctor_001", date: "2026-03-21", type: "clinical_review", subject: "Month 2 review — Adherence concern flagged",                  body: "HbA1c improved to 7.4% from 9.1% baseline (strong metabolic response despite adherence issues). Plateau risk noted. Referred to Laso adherence programme.",                                     attachments: ["hba1c-lab-210326-kavita.pdf"] },
  { id: "note_006", patientId: "patient_003", doctorId: "doctor_001", date: "2026-04-14", type: "alert",           subject: "Weight plateau — dose escalation considered",                 body: "Suresh shows weight plateau for 3 consecutive weeks (<0.3 kg/week). HbA1c 8.1%. Considering escalation to Ozempic 1mg. Nutritionist referral placed. No-show at last appointment.",             attachments: [] },
  { id: "note_007", patientId: "patient_005", doctorId: "doctor_003", date: "2026-04-13", type: "clinical_review", subject: "14-week review — Outstanding outcome",                        body: "Rajan has lost 9.5 kg (9.7% body weight) in 14 weeks. HbA1c 6.8% from baseline 10.2%. Fasting glucose 118 mg/dL. Adherence 92%. Continue current protocol for 2 remaining weeks.",             attachments: ["14week-summary-lab-130426-rajan.pdf"] },
  { id: "note_008", patientId: "patient_006", doctorId: "doctor_002", date: "2026-04-13", type: "alert",           subject: "URGENT — Severe nausea, dose adjustment review",              body: "Nisha reports severe nausea and vomiting. GI intolerance to Rybelsus 3mg. Options: (1) reduce dosing frequency, (2) switch to Ozempic injection (better GI profile), (3) temporary dose hold.", attachments: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. PRESCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx_001", patientId: "patient_001", doctorId: "doctor_001", date: "2026-04-16", doctorReg: "MH-MCI-2012-0039817",
    medications: [{ drug: "Semaglutide (Rybelsus) 14mg", dose: "14mg", frequency: "Once daily, 30 minutes before first meal", duration: "90 days (3 months)", notes: "Swallow whole with up to 120ml plain water only. Do not crush." }],
    validUntil: "2026-07-16", refillsAllowed: 2, digitalSignature: "Verified · MCI Registration MH-MCI-2012-0039817",
  },
  {
    id: "rx_002", patientId: "patient_002", doctorId: "doctor_001", date: "2026-03-09", doctorReg: "MH-MCI-2012-0039817",
    medications: [{ drug: "Semaglutide (Rybelsus) 7mg", dose: "7mg", frequency: "Once daily, 30 minutes before first meal", duration: "90 days", notes: "Take with only 120ml plain water. Dose escalation on hold pending adherence review." }],
    validUntil: "2026-06-09", refillsAllowed: 1, digitalSignature: "Verified · MCI Registration MH-MCI-2012-0039817",
  },
  {
    id: "rx_003", patientId: "patient_003", doctorId: "doctor_001", date: "2026-03-30", doctorReg: "MH-MCI-2012-0039817",
    medications: [{ drug: "Semaglutide (Ozempic) 0.5mg", dose: "0.5mg/week", frequency: "Once weekly, same day each week", duration: "8 weeks", notes: "Subcutaneous injection. Rotate injection sites." }],
    validUntil: "2026-05-30", refillsAllowed: 1, digitalSignature: "Verified · MCI Registration MH-MCI-2012-0039817",
  },
  {
    id: "rx_004", patientId: "patient_004", doctorId: "doctor_002", date: "2026-04-06", doctorReg: "KA-KMC-2015-0072340",
    medications: [{ drug: "Semaglutide (Rybelsus) 7mg", dose: "7mg", frequency: "Once daily, 30 minutes before first meal", duration: "60 days", notes: "Excellent tolerability expected. Escalate to 14mg at week 7 if tolerated." }],
    validUntil: "2026-06-06", refillsAllowed: 2, digitalSignature: "Verified · KMC Registration KA-KMC-2015-0072340",
  },
  {
    id: "rx_005", patientId: "patient_005", doctorId: "doctor_003", date: "2026-03-31", doctorReg: "DL-DMC-2017-0018923",
    medications: [{ drug: "Semaglutide (Ozempic) 1mg", dose: "1mg/week", frequency: "Once weekly, Monday morning", duration: "8 weeks", notes: "Maintenance dose. Exceptional tolerability." }],
    validUntil: "2026-05-31", refillsAllowed: 1, digitalSignature: "Verified · DMC Registration DL-DMC-2017-0018923",
  },
  {
    id: "rx_006", patientId: "patient_006", doctorId: "doctor_002", date: "2026-04-06", doctorReg: "KA-KMC-2015-0072340",
    medications: [{ drug: "Semaglutide (Rybelsus) 3mg", dose: "3mg", frequency: "Once daily, 30 minutes before first meal", duration: "30 days (review)", notes: "HOLD dose escalation. Review GI tolerability at week 4 appointment." }],
    validUntil: "2026-05-06", refillsAllowed: 0, digitalSignature: "Verified · KMC Registration KA-KMC-2015-0072340",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. CONSULTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const CONSULTATIONS: Consultation[] = [
  // ── Today (2026-04-20) ──
  { id: "c_001", patientId: "patient_001", patientName: "Arjun Sharma",   patientInitials: "AS", patientColorClass: "bg-primary",   doctorId: "doctor_001", type: "Follow-up",   date: "2026-04-20", time: "10:00 AM", durationMin: 20, status: "In Progress", zoomUrl: "https://zoom.us/j/95512340001", noteWritten: false, pendingAction: "write-note" },
  { id: "c_002", patientId: "patient_002", patientName: "Kavita Rao",     patientInitials: "KR", patientColorClass: "bg-accent",     doctorId: "doctor_001", type: "Dose Review", date: "2026-04-20", time: "11:30 AM", durationMin: 15, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340002", noteWritten: false, pendingAction: "approve-dose" },
  { id: "c_003", patientId: "patient_003", patientName: "Suresh Iyer",    patientInitials: "SI", patientColorClass: "bg-success",    doctorId: "doctor_001", type: "Initial",     date: "2026-04-20", time: "2:00 PM",  durationMin: 30, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340003", noteWritten: false },
  // ── Upcoming ──
  { id: "c_004", patientId: "patient_004", patientName: "Deepa Krishnan", patientInitials: "DK", patientColorClass: "bg-violet-500", doctorId: "doctor_001", type: "Follow-up",   date: "2026-04-21", time: "9:00 AM",  durationMin: 20, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340004", noteWritten: false },
  { id: "c_005", patientId: "patient_005", patientName: "Rajan Pillai",   patientInitials: "RP", patientColorClass: "bg-amber-500",  doctorId: "doctor_001", type: "Dose Review", date: "2026-04-22", time: "3:30 PM",  durationMin: 15, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340005", noteWritten: false, pendingAction: "review-labs" },
  { id: "c_006", patientId: "patient_006", patientName: "Nisha Gupta",    patientInitials: "NG", patientColorClass: "bg-rose-500",   doctorId: "doctor_001", type: "Initial",     date: "2026-04-24", time: "10:00 AM", durationMin: 30, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340006", noteWritten: false },
  // ── Completed / No-show ──
  { id: "c_007", patientId: "patient_001", patientName: "Arjun Sharma",   patientInitials: "AS", patientColorClass: "bg-primary",   doctorId: "doctor_001", type: "Follow-up",   date: "2026-04-17", time: "11:00 AM", durationMin: 20, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340007", noteWritten: true,  noteSummary: "Tolerating 14mg well. Weight 85.8 kg. HbA1c 7.1%. Continue programme." },
  { id: "c_008", patientId: "patient_002", patientName: "Kavita Rao",     patientInitials: "KR", patientColorClass: "bg-accent",     doctorId: "doctor_001", type: "Initial",     date: "2026-04-15", time: "9:30 AM",  durationMin: 30, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340008", noteWritten: false, pendingAction: "write-note" },
  { id: "c_009", patientId: "patient_003", patientName: "Suresh Iyer",    patientInitials: "SI", patientColorClass: "bg-success",    doctorId: "doctor_001", type: "Dose Review", date: "2026-04-14", time: "4:00 PM",  durationMin: 15, status: "No-show",     zoomUrl: "https://zoom.us/j/95512340009", noteWritten: false },
  { id: "c_010", patientId: "patient_004", patientName: "Deepa Krishnan", patientInitials: "DK", patientColorClass: "bg-violet-500", doctorId: "doctor_002", type: "Follow-up",   date: "2026-04-17", time: "10:30 AM", durationMin: 20, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340010", noteWritten: true,  noteSummary: "Exceptional adherence. 3.2 kg lost in 4 weeks. On track for target." },
  { id: "c_011", patientId: "patient_005", patientName: "Rajan Pillai",   patientInitials: "RP", patientColorClass: "bg-amber-500",  doctorId: "doctor_003", type: "Follow-up",   date: "2026-04-14", time: "9:00 AM",  durationMin: 20, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340011", noteWritten: true,  noteSummary: "Outstanding progress. 9.5 kg total. HbA1c 6.8%. 2 weeks to programme completion." },
  { id: "c_012", patientId: "patient_006", patientName: "Nisha Gupta",    patientInitials: "NG", patientColorClass: "bg-rose-500",   doctorId: "doctor_002", type: "Initial",     date: "2026-04-06", time: "11:00 AM", durationMin: 30, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340012", noteWritten: true,  noteSummary: "Initial consult. Rybelsus 3mg started. Severe GI side effects flagged at week 1." },
  // ── prog_007 consultations — Arjun Sharma (Lifestyle Reset, Oct–Dec 2025) ──
  { id: "c_015", patientId: "patient_001", patientName: "Arjun Sharma", patientInitials: "AS", patientColorClass: "bg-primary", doctorId: "doctor_002", programmeId: "prog_007", type: "Initial",     date: "2025-10-01", time: "10:00 AM", durationMin: 45, status: "Completed", zoomUrl: "https://zoom.us/j/95512340015", noteWritten: true,  noteSummary: "Baseline assessment. Weight 96 kg, BMI 32.4, HbA1c 8.8%, fasting glucose 192 mg/dL. T2DM with obesity class I. 12-week lifestyle reset initiated before GLP-1 enrolment. Diet plan + 150 min/week activity target set." },
  { id: "c_016", patientId: "patient_001", patientName: "Arjun Sharma", patientInitials: "AS", patientColorClass: "bg-primary", doctorId: "doctor_002", programmeId: "prog_007", type: "Follow-up",   date: "2025-10-22", time: "11:00 AM", durationMin: 30, status: "Completed", zoomUrl: "https://zoom.us/j/95512340016", noteWritten: true,  noteSummary: "Month 1 review. 2.1 kg lost in 4 weeks — on track. Fasting glucose improving (192→171 mg/dL). Exercise compliance 80%. Continue plan; add resistance training 2× per week." },
  { id: "c_017", patientId: "patient_001", patientName: "Arjun Sharma", patientInitials: "AS", patientColorClass: "bg-primary", doctorId: "doctor_002", programmeId: "prog_007", type: "Follow-up",   date: "2025-11-19", time: "11:00 AM", durationMin: 30, status: "Completed", zoomUrl: "https://zoom.us/j/95512340017", noteWritten: true,  noteSummary: "Mid-programme review. Weight plateau weeks 6–8 (only 0.6 kg in 3 weeks). HbA1c re-tested at 8.5% — insufficient improvement with lifestyle alone. GLP-1 programme formally recommended after 12-week programme close-out. Referral to Dr. Rahul Sharma placed." },
  { id: "c_018", patientId: "patient_001", patientName: "Arjun Sharma", patientInitials: "AS", patientColorClass: "bg-primary", doctorId: "doctor_002", programmeId: "prog_007", type: "Follow-up",   date: "2025-12-17", time: "10:00 AM", durationMin: 30, status: "Completed", zoomUrl: "https://zoom.us/j/95512340018", noteWritten: true,  noteSummary: "Programme completion. 4.0 kg lost over 12 weeks (96→92 kg). Fasting glucose 144 mg/dL. Metabolic markers improved but HbA1c still 8.5%. GLP-1 therapy (Rybelsus 3mg) recommended. Transitioning to Dr. Rahul Sharma's Laso MetaboReset 24-week GLP-1 programme from Jan 2026." },
  // ── One-off consultations — Arjun Sharma (standalone, outside any programme) ──
  { id: "c_013", patientId: "patient_001", patientName: "Arjun Sharma",   patientInitials: "AS", patientColorClass: "bg-primary",   doctorId: "doctor_003", programmeId: null, type: "Follow-up",   date: "2026-03-05", time: "4:00 PM",  durationMin: 30, status: "Completed",   zoomUrl: "https://zoom.us/j/95512340013", noteWritten: true,  noteSummary: "One-off second opinion — Dr. Kapoor reviewed Arjun's plateau at week 6. Recommended staying on 7mg with dietary intervention before dose escalation. No programme enrolment; standalone consultation." },
  { id: "c_014", patientId: "patient_001", patientName: "Arjun Sharma",   patientInitials: "AS", patientColorClass: "bg-primary",   doctorId: "doctor_002", programmeId: null, type: "Follow-up",   date: "2026-04-29", time: "2:00 PM",  durationMin: 30, status: "Upcoming",    zoomUrl: "https://zoom.us/j/95512340014", noteWritten: false, noteSummary: "One-off metabolic & lifestyle review with Dr. Nair — standalone consultation to assess PCOS-adjacent metabolic markers ahead of potential programme extension. Not linked to prog_001." },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. ORDERS  (per patient)
// ─────────────────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  // ── patient_001 (active + 3 history) ──
  {
    id: "ORD-2026-00142", patientId: "patient_001", date: "2026-04-17", status: "in_transit",
    items: [{ name: "Rybelsus 14mg (30 tabs)", quantity: "1 strip", price: 8499 }, { name: "Laso Care Pack (glucose strips × 25)", quantity: "1 pack", price: 350 }, { name: "Laso Consultation — Dr. R. Sharma", quantity: "1 session", price: 0 }],
    total: 8849,
    trackingSteps: [
      { label: "Prescription received",          timestamp: "Apr 17, 9:02 AM",  completed: true,  active: false },
      { label: "Pharmacist review",              timestamp: "Apr 17, 9:45 AM",  completed: true,  active: false },
      { label: "Safety & cold-chain check",      timestamp: "Apr 17, 11:30 AM", completed: true,  active: false },
      { label: "Dispatched — Blue Dart Express", timestamp: "Apr 17, 3:10 PM",  completed: true,  active: false },
      { label: "In transit",                     timestamp: "Apr 18, 7:22 AM",  completed: false, active: true  },
      { label: "Out for delivery",               timestamp: null,                completed: false, active: false },
      { label: "Delivered",                      timestamp: null,                completed: false, active: false },
    ],
    delivery: { estimatedTime: "Today, 2:00–5:00 PM", address: "B-404, Shreeji Heights, Andheri West, Mumbai – 400053", carrier: "Blue Dart Express", trackingId: "BD-7748291-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy (Apollo Network)", license: "MH-PH-BOM-002241", note: "All dispensations verified by a licensed pharmacist. Cold chain maintained at 2–8 °C." },
  },
  {
    id: "ORD-2026-00108", patientId: "patient_001", date: "2026-03-18", status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", quantity: "1 strip", price: 6200 }, { name: "Consultation — Dr. Sharma", quantity: "1 session", price: 0 }],
    total: 6200, trackingSteps: [],
    delivery: { estimatedTime: "Mar 20, 2026", address: "B-404, Shreeji Heights, Andheri West, Mumbai – 400053", carrier: "Blue Dart Express", trackingId: "BD-7614823-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy", license: "MH-PH-BOM-002241", note: "" },
  },
  {
    id: "ORD-2026-00079", patientId: "patient_001", date: "2026-02-18", status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", quantity: "1 strip", price: 6200 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }],
    total: 6699, trackingSteps: [],
    delivery: { estimatedTime: "Feb 21, 2026", address: "B-404, Shreeji Heights, Andheri West, Mumbai – 400053", carrier: "Blue Dart Express", trackingId: "BD-7481092-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy", license: "MH-PH-BOM-002241", note: "" },
  },
  {
    id: "ORD-2026-00041", patientId: "patient_001", date: "2026-01-26", status: "delivered",
    items: [{ name: "Rybelsus 3mg (30 tabs)", quantity: "1 strip", price: 3500 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "First consultation — Dr. Sharma", quantity: "1 session", price: 1500 }],
    total: 5499, trackingSteps: [],
    delivery: { estimatedTime: "Jan 28, 2026", address: "B-404, Shreeji Heights, Andheri West, Mumbai – 400053", carrier: "Blue Dart Express", trackingId: "BD-7312048-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy", license: "MH-PH-BOM-002241", note: "" },
  },
  // ── patient_002 ──
  {
    id: "ORD-2026-00131", patientId: "patient_002", date: "2026-04-10", status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", quantity: "1 strip", price: 6200 }, { name: "Pill Organiser + Reminder App", quantity: "1 kit", price: 199 }],
    total: 6399, trackingSteps: [],
    delivery: { estimatedTime: "Apr 13, 2026", address: "12, MG Road, Bengaluru – 560001", carrier: "Delhivery", trackingId: "DV-4812930-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — Apollo Pharmacy, Bengaluru", license: "KA-PH-BLR-007823", note: "" },
  },
  {
    id: "ORD-2026-00088", patientId: "patient_002", date: "2026-03-09", status: "delivered",
    items: [{ name: "Rybelsus 3mg (30 tabs)", quantity: "1 strip", price: 3500 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "First consultation — Dr. Sharma", quantity: "1 session", price: 1500 }],
    total: 5499, trackingSteps: [],
    delivery: { estimatedTime: "Mar 12, 2026", address: "12, MG Road, Bengaluru – 560001", carrier: "Delhivery", trackingId: "DV-4609128-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — Apollo Pharmacy, Bengaluru", license: "KA-PH-BLR-007823", note: "" },
  },
  // ── patient_003 ──
  {
    id: "ORD-2026-00119", patientId: "patient_003", date: "2026-04-05", status: "out_for_delivery",
    items: [{ name: "Ozempic 0.5mg Pen", quantity: "1 pen (4 weeks)", price: 9800 }, { name: "Syringes & sharps container", quantity: "1 pack", price: 149 }],
    total: 9949,
    trackingSteps: [
      { label: "Prescription received", timestamp: "Apr 5, 10:00 AM", completed: true,  active: false },
      { label: "Pharmacist review",     timestamp: "Apr 5, 11:00 AM", completed: true,  active: false },
      { label: "Safety check",          timestamp: "Apr 5, 12:30 PM", completed: true,  active: false },
      { label: "Dispatched",            timestamp: "Apr 5, 4:00 PM",  completed: true,  active: false },
      { label: "In transit",            timestamp: "Apr 6, 8:00 AM",  completed: true,  active: false },
      { label: "Out for delivery",      timestamp: "Apr 7, 9:00 AM",  completed: false, active: true  },
      { label: "Delivered",             timestamp: null,               completed: false, active: false },
    ],
    delivery: { estimatedTime: "Today, 11:00 AM–2:00 PM", address: "45, Anna Nagar, Chennai – 600040", carrier: "Blue Dart Express", trackingId: "BD-7690231-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy, Chennai", license: "TN-PH-CHN-004512", note: "Ozempic pen stored at 2–8 °C; use within 56 days of first use." },
  },
  {
    id: "ORD-2026-00063", patientId: "patient_003", date: "2026-03-09", status: "delivered",
    items: [{ name: "Ozempic 0.25mg Pen", quantity: "1 pen (4 weeks)", price: 7200 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "Initial consultation — Dr. Sharma", quantity: "1 session", price: 1500 }],
    total: 9199, trackingSteps: [],
    delivery: { estimatedTime: "Mar 12, 2026", address: "45, Anna Nagar, Chennai – 600040", carrier: "Blue Dart Express", trackingId: "BD-7490112-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy, Chennai", license: "TN-PH-CHN-004512", note: "" },
  },
  // ── patient_004 ──
  {
    id: "ORD-2026-00136", patientId: "patient_004", date: "2026-04-13", status: "delivered",
    items: [{ name: "Rybelsus 7mg (30 tabs)", quantity: "1 strip", price: 6200 }, { name: "HbA1c + Lipid Panel", quantity: "1 test", price: 850 }],
    total: 7050, trackingSteps: [],
    delivery: { estimatedTime: "Apr 16, 2026", address: "303, Worli Sea Face, Mumbai – 400025", carrier: "Delhivery", trackingId: "DV-5012844-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — Apollo Pharmacy, Mumbai", license: "MH-PH-BOM-003312", note: "" },
  },
  {
    id: "ORD-2026-00095", patientId: "patient_004", date: "2026-03-23", status: "delivered",
    items: [{ name: "Rybelsus 3mg (30 tabs)", quantity: "1 strip", price: 3500 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "Initial consultation — Dr. Nair", quantity: "1 session", price: 1200 }],
    total: 5199, trackingSteps: [],
    delivery: { estimatedTime: "Mar 26, 2026", address: "303, Worli Sea Face, Mumbai – 400025", carrier: "Delhivery", trackingId: "DV-4722190-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — Apollo Pharmacy, Mumbai", license: "MH-PH-BOM-003312", note: "" },
  },
  // ── patient_005 ──
  {
    id: "ORD-2026-00127", patientId: "patient_005", date: "2026-04-01", status: "delivered",
    items: [{ name: "Ozempic 1mg Pen", quantity: "1 pen (4 weeks)", price: 12500 }, { name: "Continuous Glucose Monitor", quantity: "2-week sensor", price: 3500 }],
    total: 16000, trackingSteps: [],
    delivery: { estimatedTime: "Apr 4, 2026", address: "22, Marine Drive, Kochi – 682031", carrier: "Blue Dart Express", trackingId: "BD-7701244-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy, Kochi", license: "KL-PH-KOC-002881", note: "" },
  },
  {
    id: "ORD-2026-00012", patientId: "patient_005", date: "2026-01-12", status: "delivered",
    items: [{ name: "Ozempic 0.25mg Pen", quantity: "1 pen (4 weeks)", price: 7200 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "Initial consultation — Dr. Kapoor", quantity: "1 session", price: 1000 }],
    total: 8699, trackingSteps: [],
    delivery: { estimatedTime: "Jan 15, 2026", address: "22, Marine Drive, Kochi – 682031", carrier: "Blue Dart Express", trackingId: "BD-7220189-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — MedPlus Pharmacy, Kochi", license: "KL-PH-KOC-002881", note: "" },
  },
  // ── patient_006 ──
  {
    id: "ORD-2026-00144", patientId: "patient_006", date: "2026-04-06", status: "delivered",
    items: [{ name: "Rybelsus 3mg (30 tabs)", quantity: "1 strip", price: 3500 }, { name: "Laso Starter Kit", quantity: "1 box", price: 499 }, { name: "Initial consultation — Dr. Nair", quantity: "1 session", price: 1200 }],
    total: 5199, trackingSteps: [],
    delivery: { estimatedTime: "Apr 9, 2026", address: "7, Lajpat Nagar, New Delhi – 110024", carrier: "Delhivery", trackingId: "DV-5090123-IN", coldChainIntact: true },
    pharmacy: { name: "Laso Rx Partner — Apollo Pharmacy, Delhi", license: "DL-PH-DEL-009104", note: "" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12. REFILL STATUS  (per patient)
// ─────────────────────────────────────────────────────────────────────────────

export const REFILL_STATUSES: RefillStatus[] = [
  { patientId: "patient_001", medicationName: "Rybelsus 14mg",   currentSupply: 8,  totalSupply: 30, estimatedRunOut: "Apr 26, 2026", autoRefillScheduled: "Apr 22, 2026", status: "low"      },
  { patientId: "patient_002", medicationName: "Rybelsus 7mg",    currentSupply: 4,  totalSupply: 30, estimatedRunOut: "Apr 24, 2026", autoRefillScheduled: "Apr 20, 2026", status: "critical"  },
  { patientId: "patient_003", medicationName: "Ozempic 0.5mg",   currentSupply: 14, totalSupply: 28, estimatedRunOut: "May 5, 2026",  autoRefillScheduled: "Apr 28, 2026", status: "ok"        },
  { patientId: "patient_004", medicationName: "Rybelsus 7mg",    currentSupply: 22, totalSupply: 30, estimatedRunOut: "May 14, 2026", autoRefillScheduled: "May 10, 2026", status: "ok"        },
  { patientId: "patient_005", medicationName: "Ozempic 1mg",     currentSupply: 10, totalSupply: 28, estimatedRunOut: "Apr 29, 2026", autoRefillScheduled: "Apr 25, 2026", status: "low"       },
  { patientId: "patient_006", medicationName: "Rybelsus 3mg",    currentSupply: 20, totalSupply: 30, estimatedRunOut: "May 6, 2026",  autoRefillScheduled: "May 3, 2026",  status: "ok"        },
];

/** Convenience: look up refill by patientId (falls back to empty status) */
export function getRefillStatus(patientId: string): RefillStatus {
  return (
    REFILL_STATUSES.find((r) => r.patientId === patientId) ?? {
      patientId,
      medicationName: "Unknown",
      currentSupply: 0,
      totalSupply: 30,
      estimatedRunOut: "—",
      autoRefillScheduled: "—",
      status: "ok",
    }
  );
}

// Legacy alias kept for any file that hasn't been migrated yet
export const REFILL_STATUS = REFILL_STATUSES[0];

// ─────────────────────────────────────────────────────────────────────────────
// 13. CHAT MESSAGES  (per patient ↔ coordinator)
// ─────────────────────────────────────────────────────────────────────────────

export const CHAT_MESSAGES: ChatMessage[] = [
  // ── patient_001 (Arjun) ──
  { id: "msg_001", patientId: "patient_001", sender: "coordinator", senderName: "Priya (Care Team)", text: "Hi Arjun! How are you feeling today? Any side effects to report?", timestamp: "10:05 AM" },
  { id: "msg_002", patientId: "patient_001", sender: "patient",     senderName: "Arjun Sharma",      text: "Feeling much better! The nausea from last week is mostly gone. Weight is down again this week 🎉", timestamp: "10:12 AM" },
  { id: "msg_003", patientId: "patient_001", sender: "coordinator", senderName: "Priya (Care Team)", text: "That's fantastic news! Keep it up. Your doctor has also noted great progress in your HbA1c levels.", timestamp: "10:15 AM" },
  { id: "msg_004", patientId: "patient_001", sender: "patient",     senderName: "Arjun Sharma",      text: "Yes, Dr. Sharma explained that yesterday. I'm really motivated. When will my next order be dispatched?", timestamp: "10:18 AM" },
  { id: "msg_005", patientId: "patient_001", sender: "coordinator", senderName: "Priya (Care Team)", text: "Your refill is scheduled for Apr 22. We'll send you a confirmation once it ships. Anything else?", timestamp: "10:20 AM" },
  // ── patient_002 (Kavita) ──
  { id: "msg_006", patientId: "patient_002", sender: "coordinator", senderName: "Priya (Care Team)", text: "Hi Kavita, I noticed you missed a few doses this week. Is everything okay? Can we help?", timestamp: "2:30 PM" },
  { id: "msg_007", patientId: "patient_002", sender: "patient",     senderName: "Kavita Rao",        text: "Sorry, been very busy with work. I forgot on a few days. Will try to be more regular.", timestamp: "3:10 PM" },
  { id: "msg_008", patientId: "patient_002", sender: "coordinator", senderName: "Priya (Care Team)", text: "Understood! We've set up a daily reminder on your phone at 7 AM. Also, Dr. Sharma wants to speak to you about dose escalation — can you confirm for Apr 22 at 11:30 AM?", timestamp: "3:15 PM" },
  { id: "msg_009", patientId: "patient_002", sender: "patient",     senderName: "Kavita Rao",        text: "Yes, that works. Thank you for the reminder setup, very helpful.", timestamp: "3:22 PM" },
  // ── patient_003 (Suresh) ──
  { id: "msg_010", patientId: "patient_003", sender: "coordinator", senderName: "Amit (Care Team)",  text: "Hi Suresh, your weight has plateaued for 3 weeks. Dr. Sharma has reviewed your case and wants to discuss a dose adjustment tomorrow at 2 PM. Can you attend?", timestamp: "11:00 AM" },
  { id: "msg_011", patientId: "patient_003", sender: "patient",     senderName: "Suresh Iyer",       text: "Yes I'll be there. Is this about increasing the Ozempic dose?", timestamp: "11:45 AM" },
  { id: "msg_012", patientId: "patient_003", sender: "coordinator", senderName: "Amit (Care Team)",  text: "Yes, Dr. Sharma will explain the options. Also a nutritionist referral has been placed — they'll contact you within 48 hours.", timestamp: "11:50 AM" },
  // ── patient_004 (Deepa) ──
  { id: "msg_013", patientId: "patient_004", sender: "coordinator", senderName: "Priya (Care Team)", text: "Hi Deepa! Your week 4 results are outstanding — 3.2 kg lost and 95% adherence! Dr. Nair is very pleased.", timestamp: "9:00 AM" },
  { id: "msg_014", patientId: "patient_004", sender: "patient",     senderName: "Deepa Krishnan",    text: "Thank you! The programme has been really well structured. Looking forward to reaching my goal.", timestamp: "9:30 AM" },
  { id: "msg_015", patientId: "patient_004", sender: "coordinator", senderName: "Priya (Care Team)", text: "You're on track! Your next appointment is May 1. We'll review HbA1c results and discuss dose escalation to 14mg.", timestamp: "9:32 AM" },
  // ── patient_005 (Rajan) ──
  { id: "msg_016", patientId: "patient_005", sender: "coordinator", senderName: "Sanjay (Care Team)", text: "Hi Rajan! 14 weeks down — incredible progress. 9.5 kg lost and HbA1c 6.8%. You're a star patient! 🌟", timestamp: "10:00 AM" },
  { id: "msg_017", patientId: "patient_005", sender: "patient",     senderName: "Rajan Pillai",      text: "Ha ha, thank you! It's been a journey but totally worth it. The diet changes especially have helped a lot.", timestamp: "10:30 AM" },
  { id: "msg_018", patientId: "patient_005", sender: "coordinator", senderName: "Sanjay (Care Team)", text: "2 more weeks to programme completion! Dr. Kapoor will discuss the maintenance plan at your May 5 appointment.", timestamp: "10:32 AM" },
  // ── patient_006 (Nisha) ──
  { id: "msg_019", patientId: "patient_006", sender: "coordinator", senderName: "Priya (Care Team)", text: "Hi Nisha, we've flagged your severe nausea symptoms to Dr. Nair. She will call you today by 5 PM. Please don't take today's dose until speaking with her.", timestamp: "11:00 AM" },
  { id: "msg_020", patientId: "patient_006", sender: "patient",     senderName: "Nisha Gupta",       text: "Okay, noted. The nausea has been really bad — I vomited twice yesterday after taking the tablet.", timestamp: "11:15 AM" },
  { id: "msg_021", patientId: "patient_006", sender: "coordinator", senderName: "Priya (Care Team)", text: "I'm so sorry to hear that. Dr. Nair may suggest switching to the injectable form (Ozempic) which tends to have fewer GI side effects. Your consultation is Apr 22 at 10 AM.", timestamp: "11:20 AM" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 14. COORDINATOR TASKS
// ─────────────────────────────────────────────────────────────────────────────

export type CoordTaskType = "check_in" | "refill" | "consult_follow_up" | "escalation" | "onboarding";
export type CoordTaskPriority = "urgent" | "normal" | "low";

export interface CoordTask {
  id: string;
  patientId: string;      // links to PATIENTS
  patientName: string;    // denormalised for display speed
  type: CoordTaskType;
  priority: CoordTaskPriority;
  dueDate: string;
  done: boolean;
  note: string;
}

export const COORD_TASKS: CoordTask[] = [
  { id: "ct_001", patientId: "patient_006", patientName: "Nisha Gupta",    type: "escalation",       priority: "urgent", dueDate: "Today",    done: false, note: "Severe nausea & vomiting — escalate to Dr. Nair immediately" },
  { id: "ct_002", patientId: "patient_002", patientName: "Kavita Rao",     type: "refill",           priority: "urgent", dueDate: "Today",    done: false, note: "Supply at critical level (4 days) — trigger auto-refill now" },
  { id: "ct_003", patientId: "patient_003", patientName: "Suresh Iyer",    type: "consult_follow_up",priority: "normal", dueDate: "Tomorrow", done: false, note: "No-show at Apr 14 dose review — reschedule with patient" },
  { id: "ct_004", patientId: "patient_002", patientName: "Kavita Rao",     type: "check_in",         priority: "normal", dueDate: "2026-04-22", done: false, note: "Post-consultation follow-up after 11:30 AM dose review call" },
  { id: "ct_005", patientId: "patient_001", patientName: "Arjun Sharma",   type: "check_in",         priority: "low",    dueDate: "2026-04-28", done: false, note: "Week 13 check-in call ahead of Month 4 programme extension" },
  { id: "ct_006", patientId: "patient_004", patientName: "Deepa Krishnan", type: "onboarding",       priority: "low",    dueDate: "2026-05-01", done: false, note: "Confirm May 1 consult — first HbA1c review at week 6" },
  { id: "ct_007", patientId: "patient_005", patientName: "Rajan Pillai",   type: "check_in",         priority: "low",    dueDate: "2026-04-28", done: true,  note: "Week 14 check-in completed — outstanding progress noted" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 15. ADMIN — USER PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminUserRole   = "patient" | "doctor" | "coordinator" | "admin";
export type AdminUserStatus = "active" | "inactive" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  lastLogin: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: "au_001", name: "Dr. Rahul Sharma",   email: "rahul@laso.care",   role: "doctor",      status: "active",   lastLogin: "Today" },
  { id: "au_002", name: "Dr. Priya Nair",      email: "priya.nair@laso.care", role: "doctor",  status: "active",   lastLogin: "Today" },
  { id: "au_003", name: "Dr. Aryan Kapoor",    email: "aryan@laso.care",   role: "doctor",      status: "active",   lastLogin: "Yesterday" },
  { id: "au_004", name: "Dr. Sneha Kapoor",    email: "sneha@laso.care",   role: "doctor",      status: "inactive", lastLogin: "1 week ago" },
  { id: "au_005", name: "Priya (Coordinator)", email: "coord.priya@laso.care", role: "coordinator", status: "active", lastLogin: "Today" },
  { id: "au_006", name: "Amit (Coordinator)",  email: "coord.amit@laso.care",  role: "coordinator", status: "active", lastLogin: "Today" },
  { id: "au_007", name: "Sanjay (Coordinator)",email: "coord.sanjay@laso.care",role: "coordinator", status: "active", lastLogin: "Yesterday" },
  { id: "au_008", name: "Admin User",           email: "admin@laso.care",   role: "admin",       status: "active",   lastLogin: "Today" },
  { id: "au_009", name: "Arjun Sharma",         email: "arjun@patient.laso", role: "patient",    status: "active",   lastLogin: "Today" },
  { id: "au_010", name: "Kavita Rao",           email: "kavita@patient.laso",role: "patient",    status: "active",   lastLogin: "2 days ago" },
  { id: "au_011", name: "Suresh Iyer",          email: "suresh@patient.laso",role: "patient",    status: "active",   lastLogin: "3 days ago" },
  { id: "au_012", name: "Deepa Krishnan",       email: "deepa@patient.laso", role: "patient",    status: "active",   lastLogin: "Today" },
  { id: "au_013", name: "Rajan Pillai",         email: "rajan@patient.laso", role: "patient",    status: "active",   lastLogin: "Today" },
  { id: "au_014", name: "Nisha Gupta",          email: "nisha@patient.laso", role: "patient",    status: "active",   lastLogin: "5 days ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 16. ADMIN — DOCTOR WORKING-HOURS SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export interface DaySchedule  { open: boolean; start: string; end: string }
export type WeekSchedule = Record<DayOfWeek, DaySchedule>;

export interface AdminDoctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  status: "active" | "inactive";
  hours: WeekSchedule;
}

const STANDARD_HOURS: WeekSchedule = {
  Mon: { open: true,  start: "09:00", end: "17:00" },
  Tue: { open: true,  start: "09:00", end: "17:00" },
  Wed: { open: true,  start: "09:00", end: "17:00" },
  Thu: { open: true,  start: "09:00", end: "17:00" },
  Fri: { open: true,  start: "09:00", end: "17:00" },
  Sat: { open: false, start: "10:00", end: "14:00" },
  Sun: { open: false, start: "10:00", end: "14:00" },
};

export const ADMIN_DOCTORS: AdminDoctor[] = [
  {
    id: "doctor_001", name: "Dr. Rahul Sharma", email: "rahul@laso.care",
    specialty: "Internal Medicine / Endocrinology", phone: "+91-98765-43210",
    status: "active",
    hours: { ...STANDARD_HOURS },
  },
  {
    id: "doctor_002", name: "Dr. Priya Nair", email: "priya.nair@laso.care",
    specialty: "Endocrinology & Metabolism / PCOS", phone: "+91-91234-56789",
    status: "active",
    hours: { ...STANDARD_HOURS, Sat: { open: true, start: "10:00", end: "13:00" } },
  },
  {
    id: "doctor_003", name: "Dr. Aryan Kapoor", email: "aryan@laso.care",
    specialty: "Obesity Medicine / Bariatric Medicine", phone: "+91-90000-11111",
    status: "active",
    hours: { ...STANDARD_HOURS },
  },
  {
    id: "doctor_004", name: "Dr. Sneha Kapoor", email: "sneha@laso.care",
    specialty: "Endocrinology / Diabetes", phone: "+91-88888-22222",
    status: "inactive",
    hours: { ...STANDARD_HOURS },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 17. ADMIN — PROTOCOL TEMPLATE STEPS
// ─────────────────────────────────────────────────────────────────────────────

export type ProtocolStepType =
  | "medication" | "device" | "check_in" | "test"
  | "consultation" | "supplement" | "lifestyle";

export interface ProtocolStep {
  id: string;
  order: number;
  title: string;
  type: ProtocolStepType;
  optional: boolean;
  weekOffset: number;
}

export const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: "ps_001", order: 1, title: "Onboarding Call",             type: "consultation", optional: false, weekOffset: 0  },
  { id: "ps_002", order: 2, title: "Receive Medication Kit",      type: "medication",   optional: false, weekOffset: 0  },
  { id: "ps_003", order: 3, title: "Set Up Glucose Monitor",      type: "device",       optional: false, weekOffset: 0  },
  { id: "ps_004", order: 4, title: "Log Baseline Weight",         type: "check_in",     optional: false, weekOffset: 0  },
  { id: "ps_005", order: 5, title: "Week 1 Check-In",             type: "check_in",     optional: false, weekOffset: 1  },
  { id: "ps_006", order: 6, title: "Baseline Blood Work (HbA1c)", type: "test",         optional: false, weekOffset: 1  },
  { id: "ps_007", order: 7, title: "Week 4 Review Consult",       type: "consultation", optional: false, weekOffset: 4  },
  { id: "ps_008", order: 8, title: "DEXA Scan (optional)",        type: "test",         optional: true,  weekOffset: 8  },
  { id: "ps_009", order: 9, title: "Month 3 Doctor Consult",      type: "consultation", optional: false, weekOffset: 12 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 18. ADMIN — FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const FEATURE_FLAGS: FeatureFlag[] = [
  { key: "glp1_quiz",         label: "GLP-1 Eligibility Quiz",       description: "Show quiz on landing page",                        enabled: true  },
  { key: "auto_refill",       label: "Auto Refill Engine",            description: "Trigger refill when supply < 7 days",              enabled: true  },
  { key: "escalation_alerts", label: "Escalation Alerts",            description: "Push alerts to coordinator on critical events",     enabled: true  },
  { key: "plateau_detection", label: "Plateau Detector",             description: "Detect weight stall after 2+ consecutive weeks",   enabled: true  },
  { key: "simulation_mode",   label: "Simulation Mode",               description: "Allow doctors to simulate future patient states",  enabled: false },
  { key: "multi_doctor",      label: "Multi-Doctor Assignments",      description: "Allow patients to have multiple treating doctors", enabled: false },
  { key: "insurance_flow",    label: "Insurance Integration (Beta)",  description: "Sync with insurance verification API",             enabled: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// 19. CATALOG ITEMS  (shop — OTC + Rx, with clinical rationale)
// ─────────────────────────────────────────────────────────────────────────────

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "cat_001", name: "Rybelsus 14mg (30 tabs)",    brand: "Novo Nordisk",     category: "rx_medication", priceInr: 8499,  unit: "1 strip (30-day supply)", emoji: "💊",
    tagline: "Oral semaglutide — maintenance dose",          inStock: true,  requiresPrescription: true,  rating: 4.9, reviewCount: 312,
    clinicalRationale: "Semaglutide 14mg is the maintenance dose for long-term GLP-1 therapy. Proven to reduce HbA1c by 1.5–2% and achieve ≥10% weight loss in SUSTAIN-ORAL trials. Reserved for patients who have completed 3mg and 7mg titration phases.",
    recommendedWeeks: [9, 52],
  },
  {
    id: "cat_002", name: "Rybelsus 7mg (30 tabs)",     brand: "Novo Nordisk",     category: "rx_medication", priceInr: 6200,  unit: "1 strip (30-day supply)", emoji: "💊",
    tagline: "Oral semaglutide — titration dose",            inStock: true,  requiresPrescription: true,  rating: 4.8, reviewCount: 287,
    clinicalRationale: "Semaglutide 7mg is the standard titration dose used weeks 3–8. Studies show comparable GI tolerability to 3mg with meaningfully improved glycaemic and weight outcomes before escalation to 14mg.",
    recommendedWeeks: [3, 8],
  },
  {
    id: "cat_003", name: "Rybelsus 3mg (30 tabs)",     brand: "Novo Nordisk",     category: "rx_medication", priceInr: 3500,  unit: "1 strip (30-day supply)", emoji: "💊",
    tagline: "Oral semaglutide — starter dose",              inStock: true,  requiresPrescription: true,  rating: 4.7, reviewCount: 198,
    clinicalRationale: "Semaglutide 3mg is used exclusively as a 4-week induction dose to minimise GI side effects. Not pharmacologically active for weight/glucose reduction — purely an exposure step for tolerability.",
    recommendedWeeks: [1, 2],
  },
  {
    id: "cat_004", name: "Ozempic 0.5mg Pen",          brand: "Novo Nordisk",     category: "rx_medication", priceInr: 9800,  unit: "1 pen (4-week supply)",   emoji: "💉",
    tagline: "Injectable semaglutide 0.5mg/week",            inStock: true,  requiresPrescription: true,  rating: 4.9, reviewCount: 421,
    clinicalRationale: "Once-weekly injectable semaglutide 0.5mg. Preferred over oral forms when GI tolerability is a concern, or for patients with swallowing difficulties. SUSTAIN trials show 4.6 kg mean weight loss at 30 weeks.",
    recommendedWeeks: [1, 12],
  },
  {
    id: "cat_005", name: "Ozempic 1mg Pen",            brand: "Novo Nordisk",     category: "rx_medication", priceInr: 12500, unit: "1 pen (4-week supply)",   emoji: "💉",
    tagline: "Injectable semaglutide 1mg/week",              inStock: true,  requiresPrescription: true,  rating: 4.9, reviewCount: 389,
    clinicalRationale: "Semaglutide 1mg/week — maintenance dose for injectable therapy. Demonstrated 6.0% body weight reduction and HbA1c reduction of 1.8% in SUSTAIN-6 trial. First-line for patients failing oral titration.",
    recommendedWeeks: [9, 52],
  },
  {
    id: "cat_006", name: "Laso Starter Kit",           brand: "Laso Health",      category: "devices",       priceInr: 499,   unit: "1 kit",                   emoji: "📦",
    tagline: "Glucose monitor + strips + logbook",           inStock: true,  requiresPrescription: false, rating: 4.7, reviewCount: 156,
    clinicalRationale: "Daily fasting glucose monitoring is recommended for all patients on GLP-1 therapy. The Laso Starter Kit enables daily self-monitoring which is correlated with improved adherence and early detection of hypoglycaemia.",
    recommendedWeeks: [1, 4],
  },
  {
    id: "cat_007", name: "Continuous Glucose Monitor", brand: "FreeStyle",        category: "devices",       priceInr: 3500,  unit: "2-week sensor",           emoji: "🩺",
    tagline: "14-day CGM — no finger pricks",                inStock: true,  requiresPrescription: false, rating: 4.8, reviewCount: 203,
    clinicalRationale: "CGM provides real-time glucose insights, enabling personalised dietary adjustments. For GLP-1 patients, CGM data correlates with improved metabolic outcomes and helps identify post-prandial spikes during dose titration phases.",
    recommendedWeeks: [4, 24],
  },
  {
    id: "cat_008", name: "Laso Whey Protein",          brand: "Laso Health",      category: "protein",       priceInr: 1299,  unit: "500g (25 servings)",      emoji: "🥛",
    tagline: "High-protein support for GLP-1 users",         inStock: true,  requiresPrescription: false, rating: 4.6, reviewCount: 89,
    clinicalRationale: "Adequate protein intake (≥1.2g/kg/day) is critical during GLP-1 therapy to prevent muscle mass loss while losing fat. Whey protein supplementation is recommended especially in weeks 1–12 when appetite suppression is strongest.",
    recommendedWeeks: [1, 52],
  },
  {
    id: "cat_009", name: "HbA1c + Lipid Panel",        brand: "Laso Diagnostics", category: "lab_test",      priceInr: 850,   unit: "1 test (home collection)", emoji: "🧪",
    tagline: "Essential metabolic panel at-home",            inStock: true,  requiresPrescription: false, rating: 4.9, reviewCount: 67,
    clinicalRationale: "HbA1c and fasting lipid panel are mandated at weeks 8–12 of GLP-1 therapy to assess glycaemic response and cardiovascular risk modification. Home collection removes the inconvenience of clinic visits.",
    recommendedWeeks: [8, 12],
  },
  {
    id: "cat_010", name: "Psyllium Husk Fibre",        brand: "Organic India",    category: "fibre_gut",     priceInr: 349,   unit: "200g",                    emoji: "🌾",
    tagline: "Supports GI comfort during GLP-1 therapy",     inStock: true,  requiresPrescription: false, rating: 4.5, reviewCount: 44,
    clinicalRationale: "Soluble fibre (5–10g/day) significantly reduces GLP-1 associated constipation (affecting ~24% of patients). Psyllium husk also improves post-prandial glucose and supports the gut microbiome changes induced by semaglutide.",
    recommendedWeeks: [1, 16],
  },
  {
    id: "cat_011", name: "Vitamin D3 + K2 (60 caps)",  brand: "Healthkart",       category: "vitamins",      priceInr: 599,   unit: "60 capsules",             emoji: "☀️",
    tagline: "Critical for metabolic health",                inStock: false, requiresPrescription: false, rating: 4.6, reviewCount: 112,
    clinicalRationale: "Vitamin D deficiency (prevalent in 80%+ of Indian patients) impairs insulin sensitivity and adipokine signalling. D3+K2 co-supplementation is recommended to optimise metabolic response to GLP-1 therapy.",
    recommendedWeeks: [1, 52],
  },
  {
    id: "cat_012", name: "Magnesium Glycinate (120)",  brand: "NutriGold",        category: "vitamins",      priceInr: 799,   unit: "120 capsules",            emoji: "✨",
    tagline: "Reduces GLP-1 related fatigue & cramps",       inStock: true,  requiresPrescription: false, rating: 4.5, reviewCount: 78,
    clinicalRationale: "Magnesium glycinate addresses the fatigue and muscle cramping reported by ~18% of GLP-1 patients. Glycinate form has superior bioavailability and does not worsen GI symptoms, unlike magnesium oxide.",
    recommendedWeeks: [1, 52],
  },
];
