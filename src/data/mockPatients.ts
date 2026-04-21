export type PatientStatus = "active" | "review_needed" | "plateau" | "adherence_risk" | "completed" | "inactive";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  city: string;
  assignedDoctorId: string;
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
}

export const mockPatients: PatientSummary[] = [
  {
    id: "pat-001",
    name: "Arjun Mehta",
    age: 34,
    gender: "Male",
    city: "Mumbai",
    assignedDoctorId: "dr-001",
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
  },
  {
    id: "pat-002",
    name: "Kavita Rao",
    age: 47,
    gender: "Female",
    city: "Bengaluru",
    assignedDoctorId: "dr-001",
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
  },
  {
    id: "pat-003",
    name: "Suresh Iyer",
    age: 52,
    gender: "Male",
    city: "Chennai",
    assignedDoctorId: "dr-001",
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
  },
  {
    id: "pat-004",
    name: "Deepa Krishnan",
    age: 38,
    gender: "Female",
    city: "Mumbai",
    assignedDoctorId: "dr-002",
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
  },
  {
    id: "pat-005",
    name: "Rajan Pillai",
    age: 61,
    gender: "Male",
    city: "Kochi",
    assignedDoctorId: "dr-003",
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
  },
  {
    id: "pat-006",
    name: "Nisha Gupta",
    age: 29,
    gender: "Female",
    city: "Delhi",
    assignedDoctorId: "dr-002",
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
  },
];
