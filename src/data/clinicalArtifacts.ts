export interface TreatmentPlan {
  version: number;
  createdDate: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string[];
  medication: string;
  dose: string;
  frequency: string;
  titrationSchedule: { week: number; dose: string }[];
  dietGuidelines: string[];
  activityTarget: string;
  followUpDate: string;
  labsRequired: { test: string; dueDate: string }[];
  targets: { label: string; value: string; achieved: boolean }[];
  notes: string;
}

export interface DoctorNote {
  id: string;
  date: string;
  type: "progress" | "clinical_review" | "prescription" | "alert";
  doctorName: string;
  subject: string;
  body: string;
  attachments: string[];
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  doctorReg: string;
  patientName: string;
  medications: { drug: string; dose: string; frequency: string; duration: string; notes: string }[];
  validUntil: string;
  refillsAllowed: number;
  digitalSignature: string;
}

export const treatmentPlanV1: TreatmentPlan = {
  version: 1,
  createdDate: "2026-01-26",
  doctorId: "dr-001",
  doctorName: "Dr. Rahul Sharma",
  diagnosis: ["Type 2 Diabetes Mellitus (E11.9)", "Obesity class I — BMI 31.2 (E66.01)"],
  medication: "Semaglutide (Rybelsus)",
  dose: "Start 3mg, escalate to 7mg at week 3, 14mg at week 9",
  frequency: "Once daily, 30 minutes before first meal",
  titrationSchedule: [
    { week: 1, dose: "3mg" },
    { week: 3, dose: "7mg" },
    { week: 9, dose: "14mg" },
  ],
  dietGuidelines: [
    "Calorie deficit 500–700 kcal/day",
    "Protein ≥ 1.2g/kg body weight",
    "Avoid refined carbs and sugar-sweetened beverages",
    "Eat slowly; stop at 80% satiety",
    "Minimum 3 structured meals per day — no skipping",
  ],
  activityTarget: "150 min moderate aerobic activity/week + 2× resistance training",
  followUpDate: "2026-02-12",
  labsRequired: [
    { test: "HbA1c", dueDate: "2026-03-21" },
    { test: "Fasting Lipids", dueDate: "2026-03-21" },
    { test: "Liver Function Tests", dueDate: "2026-03-21" },
    { test: "HbA1c (3-month)", dueDate: "2026-04-16" },
  ],
  targets: [
    { label: "Weight loss at 12 weeks", value: "≥5% body weight", achieved: true },
    { label: "HbA1c at 3 months", value: "<7.5%", achieved: true },
    { label: "Fasting glucose", value: "<130 mg/dL", achieved: true },
    { label: "Adherence", value: ">80%", achieved: false },
  ],
  notes: "Patient counselled on GI side effects (transient). Follow SUSTAIN-ORAL-India titration protocol.",
};

export const doctorNotes: DoctorNote[] = [
  {
    id: "note-001",
    date: "2026-02-12",
    type: "progress",
    doctorName: "Dr. Rahul Sharma",
    subject: "4-week follow-up — Good early response",
    body: "Arjun presents well. Weight down 2.2 kg in 3 weeks. Nausea was moderate in week 1–2, now largely resolved. Glucose trending down (178 → 162 mg/dL). Escalated dose to 7mg per protocol. Patient counselled on continued dietary adherence. Next review at month 2.",
    attachments: ["lab-fasting-glucose-020226.pdf"],
  },
  {
    id: "note-002",
    date: "2026-03-21",
    type: "clinical_review",
    doctorName: "Dr. Rahul Sharma",
    subject: "Month 2 review — Plateau noted, HbA1c improved",
    body: "Weight plateau detected weeks 6–8 (<0.3 kg/week). HbA1c 7.6% from baseline 8.4% — excellent glycaemic response. Adherence dip in weeks 5–6 (5/7 doses). Discussed plateau mechanism — likely dose sub-therapeutic. Plan: escalate to 14mg at week 9. Diet review completed — carb intake still elevated at dinner. Referred to Laso nutritionist for reinforcement.",
    attachments: ["hba1c-lab-210326.pdf", "nutritionist-referral.pdf"],
  },
  {
    id: "note-003",
    date: "2026-04-16",
    type: "clinical_review",
    doctorName: "Dr. Rahul Sharma",
    subject: "Month 3 (12-week) review — Strong overall outcome",
    body: "12-week outcome assessment: Total weight loss 6.2 kg (6.7% of baseline). HbA1c 7.1% — reduction of 1.3% absolute, well above minimum clinically meaningful threshold of 0.5%. Fasting glucose 122 mg/dL. Plateau broke cleanly after escalation to 14mg. Patient very motivated. Plan: continue 14mg for next 12 weeks. Repeat HbA1c + lipids at month 6. Introduce HIIT protocol via Laso fitness coach.",
    attachments: ["12week-summary-lab-160426.pdf"],
  },
];

export const prescription: Prescription = {
  id: "RX-2026-04-001142",
  date: "2026-04-16",
  doctorName: "Dr. Rahul Sharma",
  doctorReg: "MH-MCI-2012-0039817",
  patientName: "Arjun Mehta",
  medications: [
    {
      drug: "Semaglutide (Rybelsus) 14mg",
      dose: "14mg",
      frequency: "Once daily, 30 minutes before first meal",
      duration: "90 days (3 months)",
      notes: "Swallow whole with up to 120ml plain water only. Do not crush.",
    },
  ],
  validUntil: "2026-07-16",
  refillsAllowed: 2,
  digitalSignature: "Verified · MCI Registration MH-MCI-2012-0039817",
};
