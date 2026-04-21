// ─────────────────────────────────────────────────────────────────────────────
// Laso Health — 12-week patient journey mock data
// Narrative: Arjun, 34, T2DM + obesity, on oral semaglutide
// Week 1-2: Strong initial response, nausea present
// Week 3-5: Good weight loss, adherence dips
// Week 6-8: Plateau begins
// Week 9-10: Recovery after dose adjustment
// Week 11-12: Resumed progress
// ─────────────────────────────────────────────────────────────────────────────

export interface SideEffectEntry {
  symptom: "nausea" | "vomiting" | "constipation" | "fatigue";
  severity: 1 | 2 | 3; // 1=mild, 2=moderate, 3=severe
}

export interface AppetiteEntry {
  hungerLevel: number; // 1-5 (1=very low, 5=very high)
  cravings: number;    // 1-5
  mealSize: number;    // 1-5
}

export interface TimelineEvent {
  date: string;
  type: "medication_change" | "consultation" | "symptom" | "milestone" | "alert" | "log";
  title: string;
  detail: string;
}

export interface WeeklySnapshot {
  week: number;
  weight: number;
  weightChange: number;
  fastingGlucose: number;
  hba1c: number | null;
  doseMg: number;
  dosesTaken: number;
  dosesScheduled: number;
  sideEffects: SideEffectEntry[];
  appetite: AppetiteEntry;
  events: TimelineEvent[];
}

export const patientProfile = {
  name: "Arjun",
  fullName: "Arjun Mehta",
  age: 34,
  gender: "Male" as const,
  startWeight: 92,
  startBMI: 31.2,
  startHbA1c: 8.4,
  heightCm: 172,
  currentDoseMg: 14,
  medicationName: "Semaglutide (Rybelsus)",
  startDate: "2026-01-26",
  doctorName: "Dr. Rahul Sharma",
  doctorId: "dr-001",
  programName: "Laso MetaboReset — 12-Week GLP-1 Program",
  targetWeightLossKg: 7,
  targetWeightLossPct: 7.6,
};

export const weeklyData: WeeklySnapshot[] = [
  {
    week: 1, weight: 92, weightChange: 0, fastingGlucose: 178, hba1c: 8.4, doseMg: 3,
    dosesTaken: 7, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 2 }, { symptom: "fatigue", severity: 1 }],
    appetite: { hungerLevel: 2, cravings: 2, mealSize: 3 },
    events: [
      { date: "2026-01-26", type: "medication_change", title: "Treatment started", detail: "Semaglutide 3mg initiated. Day 1." },
      { date: "2026-01-28", type: "symptom", title: "Nausea reported", detail: "Moderate nausea after morning dose — advised to take with food." },
    ],
  },
  {
    week: 2, weight: 91.2, weightChange: -0.8, fastingGlucose: 170, hba1c: null, doseMg: 3,
    dosesTaken: 7, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 2 }],
    appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 },
    events: [
      { date: "2026-02-02", type: "log", title: "Weight logged", detail: "91.2 kg — 0.8 kg lost in first week." },
    ],
  },
  {
    week: 3, weight: 90.5, weightChange: -0.7, fastingGlucose: 162, hba1c: null, doseMg: 7,
    dosesTaken: 6, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 1 }],
    appetite: { hungerLevel: 2, cravings: 3, mealSize: 2 },
    events: [
      { date: "2026-02-09", type: "medication_change", title: "Dose escalated", detail: "3mg → 7mg per titration schedule." },
      { date: "2026-02-12", type: "consultation", title: "Follow-up consultation", detail: "Dr. Sharma reviewed progress. Good early response noted." },
    ],
  },
  {
    week: 4, weight: 89.8, weightChange: -0.7, fastingGlucose: 155, hba1c: null, doseMg: 7,
    dosesTaken: 6, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 1 }, { symptom: "constipation", severity: 1 }],
    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 },
    events: [
      { date: "2026-02-19", type: "log", title: "Weekly check-in", detail: "Weight 89.8 kg. Nausea improving, mild constipation noted." },
    ],
  },
  {
    week: 5, weight: 89.1, weightChange: -0.7, fastingGlucose: 148, hba1c: null, doseMg: 7,
    dosesTaken: 5, dosesScheduled: 7,
    sideEffects: [{ symptom: "constipation", severity: 1 }],
    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 },
    events: [
      { date: "2026-02-28", type: "alert", title: "Adherence dip", detail: "2 doses missed this week. Reminder sent via app." },
    ],
  },
  {
    week: 6, weight: 88.8, weightChange: -0.3, fastingGlucose: 145, hba1c: null, doseMg: 7,
    dosesTaken: 5, dosesScheduled: 7,
    sideEffects: [],
    appetite: { hungerLevel: 3, cravings: 4, mealSize: 3 },
    events: [
      { date: "2026-03-07", type: "log", title: "Weight logged", detail: "88.8 kg — slowdown in weight loss noted." },
    ],
  },
  {
    week: 7, weight: 88.6, weightChange: -0.2, fastingGlucose: 142, hba1c: null, doseMg: 7,
    dosesTaken: 6, dosesScheduled: 7,
    sideEffects: [],
    appetite: { hungerLevel: 4, cravings: 4, mealSize: 3 },
    events: [
      { date: "2026-03-14", type: "alert", title: "Plateau detected", detail: "Weight loss <0.3 kg/week for 2 consecutive weeks — auto-flagged." },
    ],
  },
  {
    week: 8, weight: 88.5, weightChange: -0.1, fastingGlucose: 140, hba1c: 7.6, doseMg: 7,
    dosesTaken: 6, dosesScheduled: 7,
    sideEffects: [{ symptom: "fatigue", severity: 1 }],
    appetite: { hungerLevel: 4, cravings: 4, mealSize: 4 },
    events: [
      { date: "2026-03-21", type: "consultation", title: "Month 2 review", detail: "Plateau discussed. Dr. Sharma recommending dose escalation at next check-in." },
      { date: "2026-03-21", type: "milestone", title: "HbA1c check", detail: "HbA1c improved from 8.4% to 7.6% — significant improvement." },
    ],
  },
  {
    week: 9, weight: 88.0, weightChange: -0.5, fastingGlucose: 135, hba1c: null, doseMg: 14,
    dosesTaken: 7, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 1 }],
    appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 },
    events: [
      { date: "2026-03-28", type: "medication_change", title: "Dose escalated", detail: "7mg → 14mg per Dr. Sharma's recommendation." },
    ],
  },
  {
    week: 10, weight: 87.2, weightChange: -0.8, fastingGlucose: 130, hba1c: null, doseMg: 14,
    dosesTaken: 7, dosesScheduled: 7,
    sideEffects: [{ symptom: "nausea", severity: 1 }],
    appetite: { hungerLevel: 2, cravings: 2, mealSize: 2 },
    events: [
      { date: "2026-04-04", type: "milestone", title: "Progress resumed", detail: "Weight loss back on track post dose escalation." },
    ],
  },
  {
    week: 11, weight: 86.5, weightChange: -0.7, fastingGlucose: 125, hba1c: null, doseMg: 14,
    dosesTaken: 6, dosesScheduled: 7,
    sideEffects: [],
    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 },
    events: [
      { date: "2026-04-11", type: "log", title: "Weight logged", detail: "86.5 kg — 5.5 kg total lost (6.0%)." },
    ],
  },
  {
    week: 12, weight: 85.8, weightChange: -0.7, fastingGlucose: 122, hba1c: 7.1, doseMg: 14,
    dosesTaken: 7, dosesScheduled: 7,
    sideEffects: [],
    appetite: { hungerLevel: 3, cravings: 3, mealSize: 3 },
    events: [
      { date: "2026-04-16", type: "consultation", title: "Month 3 review", detail: "Good progress. Continue 14mg. Consider 12-week extension." },
      { date: "2026-04-16", type: "milestone", title: "HbA1c check", detail: "HbA1c improved to 7.1% — 1.3% absolute reduction from baseline." },
    ],
  },
];

// Expected weight loss curve from STEP trials (semaglutide) — normalised to this patient
export const expectedWeightCurve: { week: number; expected: number }[] = [
  { week: 1, expected: 92 },
  { week: 2, expected: 91.4 },
  { week: 3, expected: 90.8 },
  { week: 4, expected: 90.1 },
  { week: 5, expected: 89.5 },
  { week: 6, expected: 88.8 },
  { week: 7, expected: 88.2 },
  { week: 8, expected: 87.6 },
  { week: 9, expected: 87.0 },
  { week: 10, expected: 86.4 },
  { week: 11, expected: 85.9 },
  { week: 12, expected: 85.3 },
];
