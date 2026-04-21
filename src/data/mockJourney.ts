// ─────────────────────────────────────────────────────────────────────────────
// Laso — Unified Lifeline Data Model (Mock)
//
// Patient: Arjun Mehta, 34M
// Two weight-loss programmes (one active 2026, one completed 2024)
// No thyroid programme.
//
// Children within each programme are ordered NEWEST → OLDEST
// (most recent event at index 0, just like a real EMR/patient chart).
//
// TreatmentPlan supports versioning — each programme has an array of
// versioned plans; the latest version is always at index 0.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared primitive types ───────────────────────────────────────────────────

export type ProgrammeStatus =
  | "scheduled" | "active" | "completed" | "paused" | "cancelled";

export type ClinicalInteractionType =
  | "consultation" | "check_in" | "lab_test" | "prescription_change"
  | "delivery" | "escalation" | "milestone" | "note";

export type ClinicalInteractionStatus =
  | "completed" | "action_required" | "upcoming" | "cancelled" | "no_show";

// ─── Weight history entry (for the in-programme weight trend chart) ───────────

export interface WeightEntry {
  readonly week: number;
  readonly date: string;          // ISO date
  readonly weightKg: number;
  readonly label: string;         // e.g. "Week 1", "Week 4"
}

// ─── Detail payloads (discriminated union) ────────────────────────────────────

export interface ConsultationDetails {
  readonly kind: "consultation";
  readonly doctor: string;
  readonly durationMinutes: number;
  readonly mode: "video" | "in_person" | "phone";
  readonly chiefComplaint: string;
  readonly clinicalNotes: string;
  readonly outcome: string;
  readonly nextSteps: readonly string[];
  readonly prescriptionIssued: boolean;
}

export interface CheckInDetails {
  readonly kind: "check_in";
  readonly weightKg: number | null;
  readonly glucoseMgDl: number | null;
  readonly doseTaken: boolean | null;       // null = not yet filled in
  readonly sideEffects: readonly string[];
  readonly patientNote: string;
  readonly doctorResponse: string | null;
}

export interface LabTestDetails {
  readonly kind: "lab_test";
  readonly testPanel: string;
  readonly labName: string;
  readonly results: readonly {
    readonly marker: string;
    readonly value: string;
    readonly range: string;
    readonly flag: "normal" | "high" | "low" | "critical";
  }[];
  readonly interpretation: string;
  readonly reviewedBy: string | null;
}

export interface PrescriptionChangeDetails {
  readonly kind: "prescription_change";
  readonly medication: string;
  readonly previousDose: string;
  readonly newDose: string;
  readonly reason: string;
  readonly approvedBy: string;
  readonly effectiveDate: string;
}

export interface DeliveryDetails {
  readonly kind: "delivery";
  readonly medication: string;
  readonly quantity: string;
  readonly trackingId: string;
  readonly coldChainIntact: boolean;
  readonly deliveryNote: string;
}

export interface EscalationDetails {
  readonly kind: "escalation";
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly trigger: string;
  readonly description: string;
  readonly resolvedBy: string | null;
  readonly resolutionNote: string | null;
  readonly resolvedAt: string | null;
}

export interface MilestoneDetails {
  readonly kind: "milestone";
  readonly description: string;
  readonly metric: string | null;
  readonly value: string | null;
}

export interface NoteDetails {
  readonly kind: "note";
  readonly author: string;
  readonly role: "doctor" | "coordinator" | "patient";
  readonly content: string;
}

export type ClinicalInteractionDetails =
  | ConsultationDetails | CheckInDetails | LabTestDetails
  | PrescriptionChangeDetails | DeliveryDetails | EscalationDetails
  | MilestoneDetails | NoteDetails;

// ─── ClinicalInteraction ──────────────────────────────────────────────────────

export interface ClinicalInteraction {
  readonly id: string;
  readonly type: ClinicalInteractionType;
  readonly status: ClinicalInteractionStatus;
  readonly title: string;
  readonly date: string;       // ISO datetime
  readonly summary: string;
  readonly actor: string;
  readonly details: ClinicalInteractionDetails;
}

// ─── TreatmentPlan (versioned) ────────────────────────────────────────────────
// Programmes carry an array of TreatmentPlanVersion objects.
// Index 0 is always the LATEST (highest version number).

export interface TreatmentPlanVersion {
  readonly version: number;
  readonly issuedAt: string;
  readonly issuedBy: string;
  readonly changeReason: string;        // why this version was created
  readonly medication: {
    readonly name: string;
    readonly brandName: string;
    readonly form: string;
    readonly currentDose: string;
    readonly targetDose: string;
    readonly escalationSchedule: readonly {
      readonly period: string;
      readonly dose: string;
      readonly status: "completed" | "active" | "pending";
    }[];
  };
  readonly instructions: readonly string[];
  readonly dietaryGuidance: readonly string[];
  readonly monitoring: readonly string[];
}

// ─── LifelineItem (unified entity) ───────────────────────────────────────────

export interface ProgrammeLifelineItem {
  readonly isProgramme: true;
  readonly id: string;
  readonly name: string;
  readonly programmeType: string;
  readonly status: ProgrammeStatus;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly currentWeek: number | null;
  readonly totalWeeks: number | null;
  readonly primaryMedication: string;
  readonly assignedDoctor: string;
  readonly assignedCoordinator: string;
  readonly summaryLine: string;
  /** Weekly weight readings for in-programme chart, chronological (oldest first). */
  readonly weightHistory: readonly WeightEntry[];
  /** Child clinical interactions, NEWEST → OLDEST. */
  readonly children: readonly ClinicalInteraction[];
  /** Versioned treatment plans — index 0 = latest. */
  readonly treatmentPlans: readonly TreatmentPlanVersion[];
}

export interface StandaloneLifelineItem extends ClinicalInteraction {
  readonly isProgramme: false;
}

export type LifelineItem = ProgrammeLifelineItem | StandaloneLifelineItem;

// ─── Patient Lifeline ─────────────────────────────────────────────────────────
// Ordered: active programmes first, then completed programmes, then standalones.

export const patientLifeline: readonly LifelineItem[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // PROGRAMME 1: Weight Loss Programme 2026 (ACTIVE)
  // Patient: Arjun Mehta · Start: 19 Apr 2026 · Week 8 of 24 · Semaglutide
  // ════════════════════════════════════════════════════════════════════════════
  {
    isProgramme: true,
    id: "prog_001",
    name: "Weight Loss Programme 2026",
    programmeType: "Weight Loss · GLP-1",
    status: "active",
    startDate: "2026-04-19",
    endDate: null,
    currentWeek: 8,
    totalWeeks: 24,
    primaryMedication: "Semaglutide (Ozempic)",
    assignedDoctor: "Dr. Rahul Sharma",
    assignedCoordinator: "Priya Nair",
    summaryLine: "Week 8 of 24 · 3.9 kg lost · Dose escalation to 0.5 mg approved",

    // ── Weekly weight history (chronological, oldest first) ─────────────────
    // Used by the WeightTrendChart component
    weightHistory: [
      { week: 0, date: "2026-04-19", weightKg: 92.0, label: "Start"  },
      { week: 1, date: "2026-04-26", weightKg: 91.3, label: "Week 1" },
      { week: 2, date: "2026-05-03", weightKg: 90.9, label: "Week 2" },
      { week: 3, date: "2026-05-10", weightKg: 90.4, label: "Week 3" },
      { week: 4, date: "2026-05-17", weightKg: 90.1, label: "Week 4" },
      { week: 5, date: "2026-05-24", weightKg: 89.5, label: "Week 5" },
      { week: 6, date: "2026-05-31", weightKg: 89.0, label: "Week 6" },
      { week: 7, date: "2026-06-07", weightKg: 88.6, label: "Week 7" },
      { week: 8, date: "2026-06-14", weightKg: 88.1, label: "Week 8" },
    ],

    // ── Treatment plan versions — index 0 = LATEST ──────────────────────────
    treatmentPlans: [
      // v3 — latest (after Week 12 review, further escalation planned)
      {
        version: 3,
        issuedAt: "2026-07-05",
        issuedBy: "Dr. Rahul Sharma",
        changeReason: "Week 12 review: continued good response. Escalating to 1.0 mg target dose and adding structured dietary intervention.",
        medication: {
          name: "Semaglutide",
          brandName: "Ozempic",
          form: "Subcutaneous injection — abdomen, thigh, or upper arm",
          currentDose: "0.5 mg weekly",
          targetDose: "1.0 mg weekly",
          escalationSchedule: [
            { period: "Wk 1–4",  dose: "0.25 mg", status: "completed" },
            { period: "Wk 5–12", dose: "0.5 mg",  status: "completed" },
            { period: "Wk 13–24",dose: "1.0 mg",  status: "active"    },
          ],
        },
        instructions: [
          "Inject subcutaneously — rotate sites weekly",
          "Administer on same day each week",
          "Refrigerate at 2–8 °C; bring to room temp 30 min before use",
          "Do not shake the pen",
          "Dispose of used pen in sharps container",
        ],
        dietaryGuidance: [
          "Calorie deficit of 500 kcal/day (structured meal plan provided)",
          "Avoid high-fat meals within 2 hours of injection",
          "Minimum 100 g protein per day to preserve lean mass",
          "2–3 L water daily; limit alcohol to 1 unit/week max",
        ],
        monitoring: [
          "Weekly weight logging (morning, post-bathroom, pre-breakfast)",
          "Bi-weekly fasting glucose",
          "HbA1c + fasting lipids at Week 24 (programme close)",
          "Side-effect check-in after each dose escalation",
        ],
      },

      // v2 — after Week 8 dose escalation
      {
        version: 2,
        issuedAt: "2026-06-10",
        issuedBy: "Dr. Rahul Sharma",
        changeReason: "Week 8 review: 3.9 kg lost, tolerating 0.25 mg well. Dose escalated to 0.5 mg per protocol.",
        medication: {
          name: "Semaglutide",
          brandName: "Ozempic",
          form: "Subcutaneous injection",
          currentDose: "0.5 mg weekly",
          targetDose: "1.0 mg weekly",
          escalationSchedule: [
            { period: "Wk 1–4",  dose: "0.25 mg", status: "completed" },
            { period: "Wk 5–8",  dose: "0.5 mg",  status: "active"    },
            { period: "Wk 9+",   dose: "1.0 mg",  status: "pending"   },
          ],
        },
        instructions: [
          "Inject subcutaneously — rotate sites weekly",
          "Keep refrigerated at 2–8 °C",
          "Bring to room temperature 30 min before use",
        ],
        dietaryGuidance: [
          "Avoid high-fat meals around injection time",
          "Smaller, more frequent meals — aim for 4–5 per day",
          "Stay hydrated — minimum 2 L water daily",
        ],
        monitoring: [
          "Weekly weight logging",
          "Monthly consultation review",
          "Fasting glucose daily if monitoring pre-diabetes",
        ],
      },

      // v1 — initial plan at enrolment
      {
        version: 1,
        issuedAt: "2026-04-19",
        issuedBy: "Dr. Rahul Sharma",
        changeReason: "Initial treatment plan at programme enrolment.",
        medication: {
          name: "Semaglutide",
          brandName: "Ozempic",
          form: "Subcutaneous injection",
          currentDose: "0.25 mg weekly",
          targetDose: "1.0 mg weekly",
          escalationSchedule: [
            { period: "Wk 1–4",  dose: "0.25 mg", status: "pending" },
            { period: "Wk 5–8",  dose: "0.5 mg",  status: "pending" },
            { period: "Wk 9+",   dose: "1.0 mg",  status: "pending" },
          ],
        },
        instructions: [
          "Inject subcutaneously in abdomen, thigh, or upper arm",
          "Rotate injection sites weekly",
          "Keep refrigerated at 2–8 °C",
          "Bring to room temperature 30 min before use",
        ],
        dietaryGuidance: [
          "Avoid high-fat meals around injection time",
          "Eat smaller, more frequent meals",
          "Stay hydrated — minimum 2 L water daily",
        ],
        monitoring: [
          "Weekly weight logging (morning, after bathroom, before breakfast)",
          "Monthly consultation review",
          "Fasting glucose daily if monitoring diabetes",
        ],
      },
    ],

    // ── Clinical interactions — NEWEST FIRST ────────────────────────────────
    children: [
      // ── Week 8: action required (pending patient input) ──
      {
        id: "ci_001_checkin_wk8",
        type: "check_in",
        status: "action_required",
        title: "Week 8 Progress Check-In",
        date: "2026-06-14T09:00:00+05:30",
        summary: "Due today — log your weight, dose status, and any side effects.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: null,
          glucoseMgDl: null,
          doseTaken: null,
          sideEffects: [],
          patientNote: "",
          doctorResponse: null,
        },
      },

      // ── Week 8 review consultation ──
      {
        id: "ci_002_consult_wk8",
        type: "consultation",
        status: "completed",
        title: "Week 8 Review — Dose Escalation Decision",
        date: "2026-06-10T16:00:00+05:30",
        summary: "Video consult. 3.9 kg lost. Dose escalated to 0.5 mg. Next review Week 12.",
        actor: "Dr. Rahul Sharma",
        details: {
          kind: "consultation",
          doctor: "Dr. Rahul Sharma",
          durationMinutes: 20,
          mode: "video",
          chiefComplaint: "8-week progress review and dose escalation assessment",
          clinicalNotes:
            "Patient has lost 3.9 kg over 8 weeks (start: 92.0 kg, current: 88.1 kg). Adherence excellent — 7/8 doses taken, one missed during travel (escalation raised & resolved). Mild nausea in Weeks 1–2, fully resolved. Fasting glucose trending down: 138 → 121 mg/dL. No signs of pancreatitis, gallbladder issues, or thyroid involvement. Tolerating 0.25 mg well. Blood pressure 124/80 — normal.",
          outcome:
            "Dose escalation to Semaglutide 0.5 mg approved. Treatment Plan v2 issued. Next review at Week 12. Repeat fasting lipids + HbA1c at Week 12.",
          nextSteps: [
            "Escalate to 0.5 mg from next injection (14 Jun 2026)",
            "Patient to log Week 8 check-in (weight + glucose)",
            "Repeat fasting lipids + LFT + HbA1c at Week 12",
            "Book Week 12 consultation for 8 Jul 2026",
          ],
          prescriptionIssued: true,
        },
      },

      // ── Prescription change: 0.25 → 0.5 ──
      {
        id: "ci_003_rx_wk8",
        type: "prescription_change",
        status: "completed",
        title: "Rx Updated — Semaglutide 0.25 mg → 0.5 mg",
        date: "2026-06-10T16:30:00+05:30",
        summary: "Dose escalated to 0.5 mg weekly, effective 14 Jun 2026.",
        actor: "Dr. Rahul Sharma",
        details: {
          kind: "prescription_change",
          medication: "Semaglutide (Ozempic)",
          previousDose: "0.25 mg weekly",
          newDose: "0.5 mg weekly",
          reason:
            "Patient completed 8 weeks at 0.25 mg with excellent tolerability and 3.9 kg weight loss. Escalation per standard GLP-1 dose titration protocol. No adverse events noted.",
          approvedBy: "Dr. Rahul Sharma",
          effectiveDate: "2026-06-14",
        },
      },

      // ── Week 7 check-in (completed) ──
      {
        id: "ci_004_checkin_wk7",
        type: "check_in",
        status: "completed",
        title: "Week 7 Progress Check-In",
        date: "2026-06-07T08:45:00+05:30",
        summary: "Weight 88.6 kg · Glucose 122 mg/dL · Dose taken · No side effects.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 88.6,
          glucoseMgDl: 122,
          doseTaken: true,
          sideEffects: [],
          patientNote:
            "Feeling really good. Appetite is noticeably lower — I'm satisfied with smaller portions. No nausea at all now. Energy levels are up.",
          doctorResponse:
            "Excellent progress, Arjun. 3.4 kg lost in 7 weeks — right on track. Glucose at 122 is great, trending down well. Keep up the consistency. See you at the Week 8 review.",
        },
      },

      // ── Week 6 check-in (completed) ──
      {
        id: "ci_005_checkin_wk6",
        type: "check_in",
        status: "completed",
        title: "Week 6 Progress Check-In",
        date: "2026-05-31T09:00:00+05:30",
        summary: "Weight 89.0 kg · Glucose 124 mg/dL · Dose taken · No side effects.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 89.0,
          glucoseMgDl: 124,
          doseTaken: true,
          sideEffects: [],
          patientNote:
            "Steady progress. The reduced appetite is becoming my new normal. I've started going for morning walks — 30 minutes most days.",
          doctorResponse:
            "Great to hear about the walks — that will help accelerate the metabolic improvement. 3 kg down in 6 weeks is excellent. No clinical concerns.",
        },
      },

      // ── Week 5 check-in (completed) ──
      {
        id: "ci_006_checkin_wk5",
        type: "check_in",
        status: "completed",
        title: "Week 5 Progress Check-In",
        date: "2026-05-24T09:30:00+05:30",
        summary: "Weight 89.5 kg · Glucose 126 mg/dL · Dose taken · No side effects.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 89.5,
          glucoseMgDl: 126,
          doseTaken: true,
          sideEffects: [],
          patientNote:
            "All good this week. Took dose on schedule. No nausea or discomfort. Eating lighter meals naturally.",
          doctorResponse: null,
        },
      },

      // ── Escalation: missed dose Week 5 ──
      {
        id: "ci_007_esc_wk5",
        type: "escalation",
        status: "completed",
        title: "Missed Dose Alert — Week 5",
        date: "2026-05-22T10:00:00+05:30",
        summary: "Dose not logged for 7 days. Coordinator followed up; patient confirmed late dose.",
        actor: "Priya Nair (Coordinator)",
        details: {
          kind: "escalation",
          severity: "low",
          trigger: "Dose not logged for 7 consecutive days — automatic system alert",
          description:
            "Patient was travelling for 3 days during scheduled injection window. Less than 48 hours had elapsed since the scheduled time when flagged.",
          resolvedBy: "Priya Nair (Coordinator)",
          resolutionNote:
            "Patient contacted via message. Confirmed dose was taken 18 hours late due to travel. Schedule resumed. Dr. Sharma notified — no clinical concern.",
          resolvedAt: "2026-05-22T11:15:00+05:30",
        },
      },

      // ── Month 2 medication delivery ──
      {
        id: "ci_008_delivery_m2",
        type: "delivery",
        status: "completed",
        title: "Month 2 Medication Delivery",
        date: "2026-05-18T16:30:00+05:30",
        summary: "Semaglutide 0.25 mg × 4 doses delivered. Cold chain intact.",
        actor: "Laso Fulfilment",
        details: {
          kind: "delivery",
          medication: "Semaglutide (Ozempic) 0.25 mg pre-filled pen × 4 doses",
          quantity: "1 box (4-week supply)",
          trackingId: "LASO-DEL-20260518-8841",
          coldChainIntact: true,
          deliveryNote:
            "Delivered in insulated cold pack with 3 frozen gel inserts. Patient confirmed receipt and cold packs still frozen on delivery.",
        },
      },

      // ── Week 4 check-in (completed) ──
      {
        id: "ci_009_checkin_wk4",
        type: "check_in",
        status: "completed",
        title: "Week 4 Progress Check-In",
        date: "2026-05-17T09:00:00+05:30",
        summary: "Weight 90.1 kg · Glucose 129 mg/dL · Dose taken · No side effects.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 90.1,
          glucoseMgDl: 129,
          doseTaken: true,
          sideEffects: [],
          patientNote:
            "Nausea is completely gone. Appetite reduction is significant — eating maybe 70% of what I used to without feeling deprived. Sleeping better too.",
          doctorResponse:
            "1.9 kg in 4 weeks — excellent. Nausea resolution is expected and on schedule. Glucose at 129 is trending down nicely from 138. No clinical concerns. Continue current dose.",
        },
      },

      // ── Week 3 check-in (completed) ──
      {
        id: "ci_010_checkin_wk3",
        type: "check_in",
        status: "completed",
        title: "Week 3 Progress Check-In",
        date: "2026-05-10T08:30:00+05:30",
        summary: "Weight 90.4 kg · Glucose 131 mg/dL · Dose taken · Mild nausea (resolving).",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 90.4,
          glucoseMgDl: 131,
          doseTaken: true,
          sideEffects: ["Mild nausea (improving)"],
          patientNote:
            "Nausea is much better than Week 1 — maybe 2/10 now vs 6/10 at start. I eat smaller portions around injection day and that helps a lot.",
          doctorResponse:
            "Good progress. Nausea typically resolves by Week 4 — you're already seeing improvement. 1.6 kg lost so far — right on target.",
        },
      },

      // ── Week 2 check-in (completed) ──
      {
        id: "ci_011_checkin_wk2",
        type: "check_in",
        status: "completed",
        title: "Week 2 Progress Check-In",
        date: "2026-05-03T09:00:00+05:30",
        summary: "Weight 90.9 kg · Glucose 134 mg/dL · Dose taken · Moderate nausea.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 90.9,
          glucoseMgDl: 134,
          doseTaken: true,
          sideEffects: ["Nausea (moderate)", "Reduced appetite"],
          patientNote:
            "Nausea is the main issue — starts about 3–4 hours after the injection and lasts most of the day. Appetite is lower which helps, but the nausea is uncomfortable.",
          doctorResponse:
            "Nausea is a very common and expected side effect in the first 2–3 weeks as your body adjusts. Try injecting in the evening before bed — many patients find this reduces daytime nausea. 1.1 kg down — great start.",
        },
      },

      // ── Week 1 check-in (completed) ──
      {
        id: "ci_012_checkin_wk1",
        type: "check_in",
        status: "completed",
        title: "Week 1 Progress Check-In",
        date: "2026-04-26T08:00:00+05:30",
        summary: "Weight 91.3 kg · Glucose 136 mg/dL · First dose taken · Mild nausea.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 91.3,
          glucoseMgDl: 136,
          doseTaken: true,
          sideEffects: ["Mild nausea"],
          patientNote:
            "Took the first injection on Saturday morning. Mild nausea started after about 2 hours — manageable. Ate a light meal which helped. Feeling optimistic.",
          doctorResponse:
            "Well done on completing your first injection. Mild nausea is entirely expected and should ease over the next 2–3 weeks. 0.7 kg in week one is a promising start.",
        },
      },

      // ── First injection milestone ──
      {
        id: "ci_013_milestone_firstdose",
        type: "milestone",
        status: "completed",
        title: "First Semaglutide Injection Administered",
        date: "2026-04-22T09:30:00+05:30",
        summary: "Patient self-administered first 0.25 mg dose. Mild nausea onset as expected.",
        actor: "Arjun Mehta",
        details: {
          kind: "milestone",
          description:
            "Arjun successfully self-administered the first semaglutide injection in the abdomen following the injection tutorial. Priya confirmed via message that the procedure went well. Mild nausea reported ~3 hours post-injection — expected and monitored.",
          metric: "Starting weight",
          value: "92.0 kg",
        },
      },

      // ── Month 1 delivery ──
      {
        id: "ci_014_delivery_m1",
        type: "delivery",
        status: "completed",
        title: "Month 1 Medication Delivery",
        date: "2026-04-21T17:00:00+05:30",
        summary: "Semaglutide 0.25 mg pen dispatched. Cold chain intact on delivery.",
        actor: "Laso Fulfilment",
        details: {
          kind: "delivery",
          medication: "Semaglutide (Ozempic) 0.25 mg pre-filled pen × 4 doses",
          quantity: "1 box (4-week supply)",
          trackingId: "LASO-DEL-20260421-7823",
          coldChainIntact: true,
          deliveryNote:
            "Delivered in Laso insulated cold pack within 24-hour dispatch window. Patient confirmed cold packs still frozen on receipt. Injection tutorial link sent via WhatsApp.",
        },
      },

      // ── Onboarding consultation ──
      {
        id: "ci_015_consult_onboard",
        type: "consultation",
        status: "completed",
        title: "Initial Consultation — Programme Onboarding",
        date: "2026-04-19T11:00:00+05:30",
        summary: "18-min video consult. BMI 31.2, pre-diabetic. Semaglutide 0.25 mg initiated. Treatment Plan v1 issued.",
        actor: "Dr. Rahul Sharma",
        details: {
          kind: "consultation",
          doctor: "Dr. Rahul Sharma",
          durationMinutes: 18,
          mode: "video",
          chiefComplaint: "Obesity (BMI 31.2), seeking medically supervised weight loss",
          clinicalNotes:
            "Arjun Mehta, 34M. Weight 92.0 kg, height 172 cm, BMI 31.2 (Obese Class I). Fasting glucose 138 mg/dL (pre-diabetic). BP 128/82. No thyroid or pancreatic history. No current medications. Non-smoker. Moderate alcohol (4–5 units/week). Sedentary work. Eligible for GLP-1 agonist therapy. Informed consent obtained. Sharps disposal explained.",
          outcome:
            "Semaglutide 0.25 mg weekly started. Treatment Plan v1 issued. Target: 10–15% body weight reduction over 24 weeks. Medication to be dispatched within 24 hours.",
          nextSteps: [
            "Medication dispatched — expected delivery 21 Apr",
            "Patient to watch injection tutorial (link sent via WhatsApp)",
            "First injection: 22 Apr 2026",
            "Coordinator (Priya) to introduce via message and confirm first dose",
            "Week 1 check-in: 26 Apr 2026",
          ],
          prescriptionIssued: true,
        },
      },

      // ── Enrolment milestone ──
      {
        id: "ci_016_milestone_enrol",
        type: "milestone",
        status: "completed",
        title: "Enrolled in Weight Loss Programme 2026",
        date: "2026-04-18T14:00:00+05:30",
        summary: "Eligibility quiz completed. BMI 31.2. Consultation booked for 19 Apr.",
        actor: "Arjun Mehta",
        details: {
          kind: "milestone",
          description:
            "Arjun completed the Laso eligibility assessment. BMI 31.2 (Obese Class I). Fasting glucose flagged as pre-diabetic (138 mg/dL). Meets clinical criteria for GLP-1 therapy. Initial consultation auto-scheduled for 19 April 2026.",
          metric: "BMI at enrolment",
          value: "31.2",
        },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // PROGRAMME 2: Weight Loss Programme 2024 (COMPLETED)
  // Patient: Arjun Mehta · Liraglutide · Dr. Meena Iyer · Completed Jun 2024
  // First attempt — partial success, stopped due to GI intolerance.
  // ════════════════════════════════════════════════════════════════════════════
  {
    isProgramme: true,
    id: "prog_002",
    name: "Weight Loss Programme 2024",
    programmeType: "Weight Loss · GLP-1",
    status: "completed",
    startDate: "2024-01-08",
    endDate: "2024-06-30",
    currentWeek: null,
    totalWeeks: 24,
    primaryMedication: "Liraglutide (Saxenda)",
    assignedDoctor: "Dr. Meena Iyer",
    assignedCoordinator: "Sonal Joshi",
    summaryLine: "Completed Jun 2024 · 6.2 kg lost over 24 weeks · Discontinued — persistent GI intolerance",

    // ── Weight history for 2024 programme ───────────────────────────────────
    weightHistory: [
      { week: 0,  date: "2024-01-08", weightKg: 97.5, label: "Start"   },
      { week: 4,  date: "2024-02-05", weightKg: 96.2, label: "Week 4"  },
      { week: 8,  date: "2024-03-04", weightKg: 95.1, label: "Week 8"  },
      { week: 12, date: "2024-04-01", weightKg: 94.0, label: "Week 12" },
      { week: 16, date: "2024-04-29", weightKg: 93.1, label: "Week 16" },
      { week: 20, date: "2024-05-27", weightKg: 92.2, label: "Week 20" },
      { week: 24, date: "2024-06-24", weightKg: 91.3, label: "Week 24" },
    ],

    // ── Treatment plans ──────────────────────────────────────────────────────
    treatmentPlans: [
      // v2 — updated at Week 12 (dose held due to GI symptoms)
      {
        version: 2,
        issuedAt: "2024-04-01",
        issuedBy: "Dr. Meena Iyer",
        changeReason: "Week 12 review: GI symptoms (nausea, loose stools) persisting at 1.2 mg dose. Decision to hold at 1.2 mg and not escalate further.",
        medication: {
          name: "Liraglutide",
          brandName: "Saxenda",
          form: "Subcutaneous injection — daily (same time each day)",
          currentDose: "1.2 mg daily",
          targetDose: "1.2 mg daily (capped — GI intolerance)",
          escalationSchedule: [
            { period: "Wk 1–2",  dose: "0.6 mg",  status: "completed" },
            { period: "Wk 3–4",  dose: "1.2 mg",  status: "completed" },
            { period: "Wk 5–12", dose: "1.8 mg",  status: "completed" },
            { period: "Wk 12–24",dose: "1.2 mg",  status: "completed" },
          ],
        },
        instructions: [
          "Daily subcutaneous injection — same time each day",
          "Rotate injection sites weekly",
          "Refrigerate at 2–8 °C after first use (discard after 30 days)",
        ],
        dietaryGuidance: [
          "Reduce meal portions — avoid overeating",
          "Low-fat diet to minimise GI symptoms",
          "Avoid greasy or spicy food on injection days",
        ],
        monitoring: [
          "Weekly weight logging",
          "Monitor GI symptoms closely — report if worsening",
          "Final review and closure at Week 24",
        ],
      },

      // v1 — initial plan
      {
        version: 1,
        issuedAt: "2024-01-12",
        issuedBy: "Dr. Meena Iyer",
        changeReason: "Initial treatment plan at programme enrolment.",
        medication: {
          name: "Liraglutide",
          brandName: "Saxenda",
          form: "Subcutaneous injection — daily",
          currentDose: "0.6 mg daily",
          targetDose: "3.0 mg daily",
          escalationSchedule: [
            { period: "Wk 1–2",  dose: "0.6 mg",  status: "pending" },
            { period: "Wk 3–4",  dose: "1.2 mg",  status: "pending" },
            { period: "Wk 5–6",  dose: "1.8 mg",  status: "pending" },
            { period: "Wk 7–8",  dose: "2.4 mg",  status: "pending" },
            { period: "Wk 9+",   dose: "3.0 mg",  status: "pending" },
          ],
        },
        instructions: [
          "Daily subcutaneous injection — consistent timing daily",
          "Rotate injection sites",
          "Refrigerate — discard pen after 30 days of first use",
        ],
        dietaryGuidance: [
          "500 kcal/day caloric deficit recommended",
          "High protein intake to preserve lean mass",
          "Limit alcohol to maximise weight loss",
        ],
        monitoring: [
          "Weekly weight logging",
          "Monthly consultation review",
          "Fasting lipids + HbA1c at Weeks 12 and 24",
        ],
      },
    ],

    // ── Children — NEWEST FIRST ──────────────────────────────────────────────
    children: [
      // Closure consultation
      {
        id: "ci_p2_001_closure",
        type: "consultation",
        status: "completed",
        title: "Programme Closure — 24-Week Review",
        date: "2024-06-30T11:00:00+05:30",
        summary: "Programme concluded. 6.2 kg lost. Liraglutide discontinued. Recommended reassessment in 2025.",
        actor: "Dr. Meena Iyer",
        details: {
          kind: "consultation",
          doctor: "Dr. Meena Iyer",
          durationMinutes: 25,
          mode: "video",
          chiefComplaint: "24-week programme closure review",
          clinicalNotes:
            "Arjun completed 24 weeks on Liraglutide (Saxenda). Final weight 91.3 kg — total loss of 6.2 kg (6.4% of starting body weight). GI symptoms (nausea, intermittent loose stools) persisted throughout, requiring dose to be held at 1.2 mg rather than escalating to the target of 3.0 mg. At 1.2 mg the response was suboptimal. Fasting glucose improved from 141 → 128 mg/dL. No cardiac, thyroid, or hepatic concerns. Patient remained motivated but frustrated by GI side effects.",
          outcome:
            "Liraglutide discontinued. 6.2 kg lost — clinically meaningful but below programme target. Recommended 6-month washout then reassessment with Semaglutide (weekly dosing, better GI tolerability profile). Patient expressed willingness to try again.",
          nextSteps: [
            "Discontinue Liraglutide — no tapering required",
            "Maintain dietary and activity changes",
            "Reassess BMI and fasting glucose in 6 months",
            "If BMI remains ≥ 30 or glucose deteriorates, consider Semaglutide",
            "Final summary letter to GP issued",
          ],
          prescriptionIssued: false,
        },
      },

      // Week 24 final check-in
      {
        id: "ci_p2_002_checkin_wk24",
        type: "check_in",
        status: "completed",
        title: "Week 24 Final Check-In",
        date: "2024-06-24T09:00:00+05:30",
        summary: "Weight 91.3 kg · Glucose 128 mg/dL · Dose taken · Persistent nausea.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 91.3,
          glucoseMgDl: 128,
          doseTaken: true,
          sideEffects: ["Nausea (mild)", "Loose stools (intermittent)"],
          patientNote:
            "Still getting nausea most days, though it's milder than before. Lost 6 kg overall which I'm happy about, but the daily injection and ongoing nausea have been tough. Ready to take a break.",
          doctorResponse:
            "You've done really well to complete the full 24 weeks. 6.2 kg is a meaningful result. The GI intolerance is the main limiting factor — we'll discuss switching to Semaglutide which many patients tolerate better. Talk soon at the closure review.",
        },
      },

      // Rx change: dose held at 1.2 mg
      {
        id: "ci_p2_003_rx_hold",
        type: "prescription_change",
        status: "completed",
        title: "Rx Updated — Dose Held at 1.2 mg (GI Intolerance)",
        date: "2024-04-01T14:00:00+05:30",
        summary: "Escalation to 1.8 mg reversed. Dose held at 1.2 mg due to persistent nausea and GI symptoms.",
        actor: "Dr. Meena Iyer",
        details: {
          kind: "prescription_change",
          medication: "Liraglutide (Saxenda)",
          previousDose: "1.8 mg daily",
          newDose: "1.2 mg daily",
          reason:
            "Patient experienced persistent nausea and daily loose stools at 1.8 mg dose despite 6 weeks of escalation. GI side effects impacting quality of life and work. Clinical decision: hold dose at 1.2 mg for remainder of programme.",
          approvedBy: "Dr. Meena Iyer",
          effectiveDate: "2024-04-03",
        },
      },

      // Week 12 review consultation
      {
        id: "ci_p2_004_consult_wk12",
        type: "consultation",
        status: "completed",
        title: "Week 12 Review — GI Intolerance Assessment",
        date: "2024-04-01T10:30:00+05:30",
        summary: "GI symptoms persisting at 1.8 mg. Dose reduced to 1.2 mg. Treatment Plan v2 issued.",
        actor: "Dr. Meena Iyer",
        details: {
          kind: "consultation",
          doctor: "Dr. Meena Iyer",
          durationMinutes: 22,
          mode: "video",
          chiefComplaint: "Week 12 progress review — ongoing GI side effects",
          clinicalNotes:
            "Patient reports daily nausea (5/10 severity) and intermittent loose stools since dose escalation to 1.8 mg at Week 5. Weight at 94.0 kg — 3.5 kg lost in 12 weeks. Glucose 131 mg/dL. No red flags. GI symptoms not progressing to vomiting or dehydration but significantly impacting quality of life.",
          outcome:
            "Dose reduced from 1.8 mg → 1.2 mg. Patient counselled that full dose target of 3.0 mg unlikely to be tolerated. Remain at 1.2 mg for remainder of programme. Treatment Plan v2 issued.",
          nextSteps: [
            "Reduce dose to 1.2 mg immediately",
            "Patient to reduce meal size around injection time",
            "Reassess GI symptoms in 4 weeks",
            "Continue programme to 24 weeks at 1.2 mg",
          ],
          prescriptionIssued: true,
        },
      },

      // Week 8 check-in
      {
        id: "ci_p2_005_checkin_wk8",
        type: "check_in",
        status: "completed",
        title: "Week 8 Progress Check-In",
        date: "2024-03-04T08:30:00+05:30",
        summary: "Weight 95.1 kg · Glucose 133 mg/dL · Dose taken · Persistent nausea at 1.8 mg.",
        actor: "Arjun Mehta",
        details: {
          kind: "check_in",
          weightKg: 95.1,
          glucoseMgDl: 133,
          doseTaken: true,
          sideEffects: ["Nausea (moderate — daily)", "Loose stools"],
          patientNote:
            "The 1.8 mg dose is harder than the lower doses. Nausea is almost every day now. 2.4 kg lost overall which is good but this side effect is getting tiring. Sticking with it for now.",
          doctorResponse:
            "2.4 kg in 8 weeks is solid progress. The nausea at 1.8 mg is unfortunately common. Let's discuss at the Week 12 review — we may need to hold the dose here rather than escalating further.",
        },
      },

      // Month 1 delivery
      {
        id: "ci_p2_006_delivery",
        type: "delivery",
        status: "completed",
        title: "Month 1 Medication Delivery",
        date: "2024-01-14T16:00:00+05:30",
        summary: "Liraglutide (Saxenda) 6 mg/mL pen delivered. Cold chain intact.",
        actor: "Laso Fulfilment",
        details: {
          kind: "delivery",
          medication: "Liraglutide (Saxenda) 6 mg/mL pre-filled injection pen × 3 pens",
          quantity: "3 pens (30-day supply)",
          trackingId: "LASO-DEL-20240114-3312",
          coldChainIntact: true,
          deliveryNote:
            "3 Saxenda pens delivered in insulated pack. Cold packs intact. Patient confirmed receipt and storage in refrigerator.",
        },
      },

      // Initial consultation
      {
        id: "ci_p2_007_consult_onboard",
        type: "consultation",
        status: "completed",
        title: "Initial Consultation — Programme Onboarding",
        date: "2024-01-12T10:00:00+05:30",
        summary: "First weight loss programme. BMI 33.2. Liraglutide initiated. Treatment Plan v1 issued.",
        actor: "Dr. Meena Iyer",
        details: {
          kind: "consultation",
          doctor: "Dr. Meena Iyer",
          durationMinutes: 25,
          mode: "video",
          chiefComplaint: "Obesity (BMI 33.2), multiple failed diet attempts, seeking medically supervised programme",
          clinicalNotes:
            "Arjun Mehta, 32M. Weight 97.5 kg, height 172 cm, BMI 33.2 (Obese Class II). Fasting glucose 141 mg/dL. BP 132/84. No prior GLP-1 therapy. Non-smoker. Alcohol: 5–6 units/week. Desk job, minimal physical activity. Two failed diet attempts (low-carb 2022, intermittent fasting 2023). Motivated, good insight into his condition.",
          outcome:
            "Liraglutide (Saxenda) initiated at 0.6 mg with weekly titration to target 3.0 mg. Treatment Plan v1 issued. Medication to be dispatched within 48 hours.",
          nextSteps: [
            "Medication dispatched — expected 14 Jan",
            "Patient to watch Saxenda injection tutorial",
            "First dose: 15 Jan 2024",
            "Week 4 check-in: 5 Feb 2024",
          ],
          prescriptionIssued: true,
        },
      },

      // Enrolment milestone
      {
        id: "ci_p2_008_milestone_enrol",
        type: "milestone",
        status: "completed",
        title: "Enrolled in Weight Loss Programme 2024",
        date: "2024-01-08T12:00:00+05:30",
        summary: "Eligibility quiz completed. BMI 33.2. Consultation booked for 12 Jan.",
        actor: "Arjun Mehta",
        details: {
          kind: "milestone",
          description:
            "First Laso programme enrolment. Arjun completed the eligibility quiz. BMI 33.2, fasting glucose 141 mg/dL — meets criteria for GLP-1 therapy. Initial consultation with Dr. Meena Iyer scheduled.",
          metric: "BMI at enrolment",
          value: "33.2",
        },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // STANDALONE: Ad-hoc GP consultation (not part of any programme)
  // ════════════════════════════════════════════════════════════════════════════
  {
    isProgramme: false,
    id: "sa_001",
    type: "consultation",
    status: "completed",
    title: "Ad-hoc Consult — Acute Lower Back Pain",
    date: "2025-11-08T10:30:00+05:30",
    summary: "One-off consult for lower back pain. Not related to any active programme.",
    actor: "Dr. Anand Desai",
    details: {
      kind: "consultation",
      doctor: "Dr. Anand Desai",
      durationMinutes: 15,
      mode: "in_person",
      chiefComplaint: "Lower back pain, onset 3 days ago, worsening with prolonged sitting",
      clinicalNotes:
        "No neurological deficits. No radiation to legs. Likely musculoligamentous strain — desk work and sedentary posture. No red flags for serious pathology.",
      outcome:
        "Physiotherapy referral issued. Ibuprofen 400 mg TDS × 5 days. Advised postural correction and standing desk.",
      nextSteps: [
        "Start physiotherapy within 3 days",
        "Ibuprofen 400 mg TDS × 5 days with food",
        "Avoid heavy lifting for 2 weeks",
        "Return if pain radiates below knee or does not improve in 2 weeks",
      ],
      prescriptionIssued: true,
    },
  },
] as const;

// ─── Typed helpers ────────────────────────────────────────────────────────────

/** All Programme items on the lifeline. */
export function getProgrammes(): ProgrammeLifelineItem[] {
  return patientLifeline.filter(
    (item): item is ProgrammeLifelineItem => item.isProgramme,
  ) as ProgrammeLifelineItem[];
}

/** All standalone (ad-hoc) items on the lifeline. */
export function getStandalones(): StandaloneLifelineItem[] {
  return patientLifeline.filter(
    (item): item is StandaloneLifelineItem => !item.isProgramme,
  ) as StandaloneLifelineItem[];
}

/** Find any lifeline item by id. */
export function findLifelineItem(id: string): LifelineItem | undefined {
  return patientLifeline.find((item) => item.id === id) as LifelineItem | undefined;
}

/** Latest treatment plan for a programme. */
export function getLatestTreatmentPlan(prog: ProgrammeLifelineItem): TreatmentPlanVersion {
  return prog.treatmentPlans[0];
}
