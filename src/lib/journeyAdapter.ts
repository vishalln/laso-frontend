/**
 * journeyAdapter.ts
 *
 * Converts a `PatientView` from MockDataContext into the `LifelineItem[]`
 * shape consumed by Journey.tsx.
 *
 * Output ordering (matches UX spec):
 *   1. Active programmes  (newest startDate first)
 *   2. Completed / paused programmes (newest first)
 *   3. Standalone (one-off) consultations (newest date first)
 *
 * Programmes only receive interactions that belong to them:
 *   - WeeklyLogs filtered by programmeId
 *   - Consultations with matching programmeId (or, for legacy rows, falling
 *     back to matching the patient's primary programmeId)
 *   - Doctor notes and orders are attached to the PRIMARY (active) programme
 *     only, since they don't carry a programmeId in the current schema.
 *
 * Consults where programmeId is explicitly null / undefined AND the consult
 * date falls outside every programme window are emitted as StandaloneLifelineItem.
 */

import type { PatientView } from "@/contexts/MockDataContext";
import type {
  LifelineItem,
  ProgrammeLifelineItem,
  StandaloneLifelineItem,
  ClinicalInteraction,
  TreatmentPlanVersion,
  WeightEntry,
  ClinicalInteractionStatus,
  ProgrammeStatus,
} from "@/data/mockJourney";
import type {
  WeeklyLog,
  Consultation,
  DoctorNote,
  Order,
  TreatmentPlan,
  Programme,
} from "@/data/mockDB";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Add `n` days to an ISO date string and return an ISO datetime string. */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Map mockDB Programme.status → Journey ProgrammeStatus */
function mapProgrammeStatus(s: string): ProgrammeStatus {
  const map: Record<string, ProgrammeStatus> = {
    active: "active",
    completed: "completed",
    paused: "paused",
  };
  return map[s] ?? "active";
}

/** Map mockDB Consultation.status → ClinicalInteractionStatus */
function mapConsultStatus(s: string): ClinicalInteractionStatus {
  const map: Record<string, ClinicalInteractionStatus> = {
    Completed:    "completed",
    Upcoming:     "upcoming",
    "In Progress":"upcoming",
    "No-show":    "no_show",
  };
  return map[s] ?? "upcoming";
}

/** Map mockDB Order.status → a human-readable delivery summary */
function orderStatusLabel(s: string): string {
  const map: Record<string, string> = {
    delivered:             "Delivered",
    in_transit:            "In transit",
    out_for_delivery:      "Out for delivery",
    dispatched:            "Dispatched",
    processing:            "Processing",
    cancelled:             "Cancelled",
    prescription_received: "Prescription received",
    pharmacist_review:     "Pharmacist review",
    safety_check:          "Safety check",
    dispensed:             "Dispensed",
    packed:                "Packed",
    cold_chain_verified:   "Cold chain verified",
  };
  return map[s] ?? s;
}

/**
 * Returns true when `consultDate` falls within the window of the given
 * programme (startDate → startDate + totalWeeks * 7 days, or today if active).
 */
function dateInProgrammeWindow(consultDate: string, prog: Programme): boolean {
  const start = new Date(prog.startDate).getTime();
  const endMs = prog.status === "active"
    ? Date.now() + 90 * 86_400_000                        // active: 90-day buffer
    : start + prog.totalWeeks * 7 * 86_400_000;
  const d = new Date(consultDate).getTime();
  return d >= start && d <= endMs;
}

// ─── Interaction builders ─────────────────────────────────────────────────────

function buildCheckInFromLog(log: WeeklyLog, startDate: string): ClinicalInteraction {
  const date = addDays(startDate, log.week * 7);
  const isPast = new Date(date) <= new Date();
  const sideEffectNames = log.sideEffects.map((se) => {
    const sev = se.severity === 3 ? " (severe)" : se.severity === 2 ? " (moderate)" : " (mild)";
    return se.symptom.charAt(0).toUpperCase() + se.symptom.slice(1) + sev;
  });
  const adherencePct = log.dosesScheduled > 0
    ? Math.round((log.dosesTaken / log.dosesScheduled) * 100)
    : 100;

  return {
    id: log.id,
    type: "check_in",
    status: isPast ? "completed" : "upcoming",
    title: `Week ${log.week} Progress Check-In`,
    date,
    summary: isPast
      ? `Weight ${log.weightKg} kg · Glucose ${log.fastingGlucose} mg/dL · ${log.dosesTaken}/${log.dosesScheduled} doses taken`
      : `Due Week ${log.week} — log your weight and dose status`,
    actor: "Patient",
    details: {
      kind: "check_in",
      weightKg:     isPast ? log.weightKg          : null,
      glucoseMgDl:  isPast ? log.fastingGlucose    : null,
      doseTaken:    isPast ? log.dosesTaken >= log.dosesScheduled * 0.8 : null,
      sideEffects:  isPast ? sideEffectNames        : [],
      patientNote:  adherencePct < 80 ? `Adherence ${adherencePct}% this week` : "",
      doctorResponse: null,
    },
  } satisfies ClinicalInteraction;
}

function buildConsultationInteraction(
  c: Consultation,
  doctorName: string,
): ClinicalInteraction {
  const status = mapConsultStatus(c.status);
  // Parse "10:00 AM" / "2:00 PM" into 24-h HH:MM
  const timeParts = c.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hh = timeParts ? parseInt(timeParts[1]) : 9;
  const mm = timeParts ? timeParts[2] : "00";
  const period = timeParts ? timeParts[3].toUpperCase() : "AM";
  if (period === "PM" && hh !== 12) hh += 12;
  if (period === "AM" && hh === 12) hh = 0;
  const isoDate = `${c.date}T${String(hh).padStart(2, "0")}:${mm}:00+05:30`;

  return {
    id: c.id,
    type: "consultation",
    status,
    title: `${c.type} — ${c.patientName}`,
    date: isoDate,
    summary: c.noteSummary
      ? c.noteSummary
      : status === "upcoming"
        ? `${c.type} scheduled · ${c.durationMin} min`
        : `${c.type} · ${c.durationMin} min`,
    actor: doctorName,
    details: {
      kind: "consultation",
      doctor: doctorName,
      durationMinutes: c.durationMin,
      mode: "video",
      chiefComplaint: `${c.type} consultation`,
      clinicalNotes: c.noteSummary ?? "Notes pending.",
      outcome: c.noteSummary ?? (status === "upcoming" ? "Upcoming" : "Completed."),
      nextSteps: c.pendingAction
        ? [
            c.pendingAction === "write-note"   ? "Doctor to write clinical note" : "",
            c.pendingAction === "approve-dose" ? "Dose approval pending"         : "",
            c.pendingAction === "review-labs"  ? "Lab results to be reviewed"    : "",
          ].filter(Boolean)
        : [],
      prescriptionIssued: false,
    },
  } satisfies ClinicalInteraction;
}

function buildNoteInteraction(note: DoctorNote, doctorName: string): ClinicalInteraction {
  return {
    id: note.id,
    type: "note",
    status: "completed",
    title: note.subject,
    date: `${note.date}T12:00:00+05:30`,
    summary: note.body.slice(0, 100) + (note.body.length > 100 ? "…" : ""),
    actor: doctorName,
    details: {
      kind: "note",
      author: doctorName,
      role: "doctor",
      content: note.body,
    },
  } satisfies ClinicalInteraction;
}

function buildDeliveryInteraction(order: Order): ClinicalInteraction {
  const mainItem = order.items[0];
  const isDelivered = order.status === "delivered";
  return {
    id: order.id,
    type: "delivery",
    status: isDelivered ? "completed" : "upcoming",
    title: isDelivered
      ? `Medication Delivery — ${mainItem?.name ?? "Order"}`
      : `Medication Shipment — ${orderStatusLabel(order.status)}`,
    date: `${order.date}T14:00:00+05:30`,
    summary: mainItem
      ? `${mainItem.name} · ${orderStatusLabel(order.status)}`
      : orderStatusLabel(order.status),
    actor: "Laso Fulfilment",
    details: {
      kind: "delivery",
      medication:       mainItem?.name     ?? "Medication",
      quantity:         mainItem?.quantity ?? "—",
      trackingId:       order.delivery.trackingId,
      coldChainIntact:  order.delivery.coldChainIntact,
      deliveryNote: isDelivered
        ? `Delivered to ${order.delivery.address}. Carrier: ${order.delivery.carrier}.`
        : `Estimated delivery: ${order.delivery.estimatedTime}. Tracking: ${order.delivery.trackingId}.`,
    },
  } satisfies ClinicalInteraction;
}

function buildPrescriptionChangeInteractions(
  plan: TreatmentPlan,
  startDate: string,
  doctorName: string,
): ClinicalInteraction[] {
  return plan.titrationSchedule.map((step, idx) => {
    const prevStep = plan.titrationSchedule[idx - 1];
    const date = addDays(startDate, step.week * 7);
    return {
      id: `rx_change_${plan.id}_w${step.week}`,
      type: "prescription_change",
      status: new Date(date) <= new Date() ? "completed" : "upcoming",
      title: idx === 0
        ? `Treatment Started — ${step.dose}`
        : `Dose Escalation — ${prevStep?.dose ?? "previous"} → ${step.dose}`,
      date,
      summary: idx === 0
        ? `${plan.medication} ${step.dose} initiated per protocol`
        : `Dose escalated to ${step.dose} at Week ${step.week}`,
      actor: doctorName,
      details: {
        kind: "prescription_change",
        medication:    plan.medication,
        previousDose:  prevStep?.dose ?? "—",
        newDose:       step.dose,
        reason: idx === 0
          ? "Initial dose per titration protocol."
          : `Escalation per titration schedule at Week ${step.week}.`,
        approvedBy:    doctorName,
        effectiveDate: date.slice(0, 10),
      },
    } satisfies ClinicalInteraction;
  });
}

// ─── Weight history ───────────────────────────────────────────────────────────

function buildWeightHistory(
  logs: WeeklyLog[],
  startDate: string,
  startWeightKg: number,
): WeightEntry[] {
  const history: WeightEntry[] = [
    { week: 0, date: startDate, weightKg: startWeightKg, label: "Start" },
  ];
  for (const log of logs) {
    history.push({
      week: log.week,
      date: addDays(startDate, log.week * 7).slice(0, 10),
      weightKg: log.weightKg,
      label: `Week ${log.week}`,
    });
  }
  return history;
}

// ─── Treatment plan version ───────────────────────────────────────────────────

function buildTreatmentPlanVersion(
  plan: TreatmentPlan,
  doctorName: string,
): TreatmentPlanVersion {
  const escalationSchedule = plan.titrationSchedule.map((step, idx) => {
    const stepDate = addDays(plan.createdDate, step.week * 7);
    const isPast = new Date(stepDate) < new Date();
    const isActive =
      !isPast &&
      idx ===
        plan.titrationSchedule.findIndex(
          (s) => new Date(addDays(plan.createdDate, s.week * 7)) >= new Date(),
        );
    return {
      period: idx === 0
        ? `Wk ${step.week}–${plan.titrationSchedule[1]?.week ?? step.week + 4}`
        : `Wk ${step.week}+`,
      dose: step.dose,
      status: (isPast ? "completed" : isActive ? "active" : "pending") as
        "completed" | "active" | "pending",
    };
  });

  return {
    version: plan.version,
    issuedAt: plan.createdDate,
    issuedBy: doctorName,
    changeReason: plan.notes ? plan.notes.slice(0, 120) : "Treatment plan issued.",
    medication: {
      name: plan.medication.includes("(")
        ? plan.medication.split("(")[0].trim()
        : plan.medication,
      brandName: plan.medication.includes("(")
        ? plan.medication.match(/\(([^)]+)\)/)?.[1] ?? plan.medication
        : plan.medication,
      form: plan.frequency,
      currentDose: plan.dose.split(",")[0].replace(/^Start /, "").trim(),
      targetDose:
        plan.titrationSchedule[plan.titrationSchedule.length - 1]?.dose ??
        plan.dose,
      escalationSchedule,
    },
    instructions: [plan.frequency, ...plan.dietGuidelines.slice(0, 2)],
    dietaryGuidance: plan.dietGuidelines,
    monitoring: plan.labsRequired.map((l) => `${l.test} — due ${l.dueDate}`),
  } satisfies TreatmentPlanVersion;
}

// ─── deduplicate helper ───────────────────────────────────────────────────────

function dedup(items: ClinicalInteraction[]): ClinicalInteraction[] {
  const seen = new Set<string>();
  return items.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

// ─── Build a single ProgrammeLifelineItem ─────────────────────────────────────

function buildProgrammeItem(
  prog: Programme,
  view: PatientView,
  progConsults: Consultation[],
  isPrimary: boolean,
): ProgrammeLifelineItem {
  const { patient, doctor, plan, notes, orders } = view;

  // Logs that belong to this programme
  const progLogs = view.logs
    .filter((l) => l.programmeId === prog.id)
    .sort((a, b) => a.week - b.week);

  const checkIns = progLogs.map((l) => buildCheckInFromLog(l, prog.startDate));

  const consultInteractions = progConsults.map((c) =>
    buildConsultationInteraction(c, doctor.name),
  );

  // Notes and orders are only attached to the primary (active/latest) programme
  const noteInteractions: ClinicalInteraction[] = isPrimary
    ? notes.map((n) => buildNoteInteraction(n, doctor.name))
    : [];

  const deliveryInteractions: ClinicalInteraction[] = isPrimary
    ? orders.map(buildDeliveryInteraction)
    : [];

  const rxChangeInteractions: ClinicalInteraction[] =
    isPrimary && plan
      ? buildPrescriptionChangeInteractions(plan, prog.startDate, doctor.name)
      : [];

  const children = dedup(
    [
      ...checkIns,
      ...consultInteractions,
      ...noteInteractions,
      ...deliveryInteractions,
      ...rxChangeInteractions,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  );

  const weightHistory = buildWeightHistory(
    progLogs,
    prog.startDate,
    patient.startWeightKg,
  );

  const treatmentPlans: TreatmentPlanVersion[] =
    isPrimary && plan ? [buildTreatmentPlanVersion(plan, doctor.name)] : [];

  // Summary line — use live patient data for the primary programme
  const lostKg = isPrimary
    ? (patient.startWeightKg - patient.currentWeightKg).toFixed(1)
    : progLogs.length > 0
      ? (patient.startWeightKg - progLogs[progLogs.length - 1].weightKg).toFixed(1)
      : "—";

  const summaryLine =
    prog.status === "completed"
      ? `Completed ${prog.startDate.slice(0, 7)} · ${lostKg} kg lost over ${prog.totalWeeks} weeks`
      : `Week ${prog.currentWeek} of ${prog.totalWeeks} · ${lostKg} kg lost · ${patient.currentDose} ${patient.medication}`;

  // Doctor for this programme
  const progDoctorName = doctor.id === prog.doctorId
    ? doctor.name
    : `Dr. (Programme Physician)`; // fallback; in real app lookup by prog.doctorId

  return {
    isProgramme: true,
    id: prog.id,
    name: prog.name,
    programmeType: "Weight Loss · GLP-1",
    status: mapProgrammeStatus(prog.status),
    startDate: prog.startDate,
    endDate:
      prog.status === "completed"
        ? addDays(prog.startDate, prog.totalWeeks * 7).slice(0, 10)
        : null,
    currentWeek: prog.currentWeek,
    totalWeeks: prog.totalWeeks,
    primaryMedication: isPrimary
      ? `${patient.medication} ${patient.currentDose}`
      : `GLP-1 Programme`,
    assignedDoctor: progDoctorName,
    assignedCoordinator: "Laso Care Team",
    summaryLine,
    weightHistory,
    children,
    treatmentPlans,
  };
}

// ─── Build a standalone consultation ─────────────────────────────────────────

function buildStandaloneItem(
  c: Consultation,
  doctorName: string,
): StandaloneLifelineItem {
  const base = buildConsultationInteraction(c, doctorName);
  return { ...base, isProgramme: false } satisfies StandaloneLifelineItem;
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

/**
 * Converts a live `PatientView` (from MockDataContext) into the `LifelineItem[]`
 * array expected by Journey.tsx.
 *
 * Runs in ~O(n) and is safe to call on every render — all operations are pure.
 */
export function buildLifelineFromPatientView(view: PatientView): LifelineItem[] {
  const { programmes, consults, doctor } = view;

  // ── 1. Categorise each consult ─────────────────────────────────────────────
  //
  // A consult "belongs" to a programme when:
  //   (a) its programmeId explicitly matches that programme, OR
  //   (b) programmeId is absent AND the consult date falls within that
  //       programme's window (legacy / implicit linking)
  //
  // Consults that don't match any programme become standalones.

  const programmeConsultMap = new Map<string, Consultation[]>(
    programmes.map((p) => [p.id, []]),
  );
  const standaloneConsults: Consultation[] = [];

  for (const c of consults) {
    if (c.programmeId) {
      // Explicit programmeId
      if (programmeConsultMap.has(c.programmeId)) {
        programmeConsultMap.get(c.programmeId)!.push(c);
      } else {
        // programmeId set but not found (edge case) → standalone
        standaloneConsults.push(c);
      }
    } else if (c.programmeId === null) {
      // Explicitly null → standalone (one-off)
      standaloneConsults.push(c);
    } else {
      // programmeId absent (undefined) → try date-based matching
      const matched = programmes.find((p) => dateInProgrammeWindow(c.date, p));
      if (matched) {
        programmeConsultMap.get(matched.id)!.push(c);
      } else {
        standaloneConsults.push(c);
      }
    }
  }

  // ── 2. Build programme items ───────────────────────────────────────────────

  // Primary = active/first in sorted list (MockDataContext sorts active first)
  const programmeItems: ProgrammeLifelineItem[] = programmes.map((prog, idx) => {
    const progConsults = programmeConsultMap.get(prog.id) ?? [];
    return buildProgrammeItem(prog, view, progConsults, idx === 0);
  });

  // ── 3. Build standalone items ──────────────────────────────────────────────

  const standaloneItems: StandaloneLifelineItem[] = standaloneConsults
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((c) => buildStandaloneItem(c, doctor.name));

  // ── 4. Compose final lifeline ──────────────────────────────────────────────
  // Active programmes → completed/paused → standalones

  const activeProgs  = programmeItems.filter((p) => p.status === "active");
  const inactiveProgs = programmeItems.filter((p) => p.status !== "active");

  return [...activeProgs, ...inactiveProgs, ...standaloneItems] as LifelineItem[];
}
