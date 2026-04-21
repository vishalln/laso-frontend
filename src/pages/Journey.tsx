// ─────────────────────────────────────────────────────────────────────────────
// Journey.tsx — My Journey page
// Displays a patient's clinical lifeline: programmes + standalone interactions.
// Includes an interactive Week 8 Check-In form for the pending action item.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Clock, ChevronDown, ChevronUp, Send,
  Stethoscope, Truck, AlertTriangle, Trophy, FileText, Syringe,
  ShoppingCart, ClipboardCheck, TestTube,
  Activity, Building2, ArrowRight, Pill,
  CheckCircle, XCircle, AlertCircle, User, Calendar, Ban,
  Scale, Droplets, Pill as PillIcon, X, Check, Bell, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type LifelineItem,
  type ProgrammeLifelineItem,
  type StandaloneLifelineItem,
  type TreatmentPlanVersion,
  type ProgrammeStatus,
  type WeightEntry,
  type ClinicalInteraction,
  type ClinicalInteractionType,
  type ClinicalInteractionStatus,
  type ConsultationDetails,
  type CheckInDetails,
  type LabTestDetails,
  type PrescriptionChangeDetails,
  type DeliveryDetails,
  type EscalationDetails,
  type MilestoneDetails,
  type NoteDetails,
} from "@/data/mockJourney";
import { useMockData } from "@/contexts/MockDataContext";
import { useUser } from "@/contexts/UserContext";
import { buildLifelineFromPatientView } from "@/lib/journeyAdapter";

// ─────────────────────────────────────────────────────────────────────────────
// Types for submitted check-in overrides
// ─────────────────────────────────────────────────────────────────────────────

interface SubmittedCheckIn {
  weightKg: number;
  glucoseMgDl: number;
  doseTaken: boolean;
  sideEffects: string[];
  patientNote: string;
  submittedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const fmtDatetime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─────────────────────────────────────────────────────────────────────────────
// Metadata maps
// ─────────────────────────────────────────────────────────────────────────────

const CI_TYPE_META: Record<
  ClinicalInteractionType,
  { icon: React.ReactNode; label: string; iconBg: string; badge: string }
> = {
  consultation:        { icon: <Stethoscope className="h-4 w-4" />,    label: "Consultation", iconBg: "bg-primary/10 text-primary",           badge: "bg-primary/10 text-primary border-primary/20" },
  check_in:            { icon: <ClipboardCheck className="h-4 w-4" />, label: "Check-In",     iconBg: "bg-sky-100 text-sky-700",              badge: "bg-sky-50 text-sky-700 border-sky-200" },
  lab_test:            { icon: <TestTube className="h-4 w-4" />,       label: "Lab Test",     iconBg: "bg-violet-100 text-violet-700",        badge: "bg-violet-50 text-violet-700 border-violet-200" },
  prescription_change: { icon: <Syringe className="h-4 w-4" />,        label: "Rx Change",    iconBg: "bg-teal-100 text-teal-700",            badge: "bg-teal-50 text-teal-700 border-teal-200" },
  delivery:            { icon: <Truck className="h-4 w-4" />,          label: "Delivery",     iconBg: "bg-amber-100 text-amber-700",          badge: "bg-amber-50 text-amber-700 border-amber-200" },
  escalation:          { icon: <AlertTriangle className="h-4 w-4" />,  label: "Alert",        iconBg: "bg-destructive/10 text-destructive",   badge: "bg-destructive/10 text-destructive border-destructive/20" },
  milestone:           { icon: <Trophy className="h-4 w-4" />,         label: "Milestone",    iconBg: "bg-success/10 text-success",           badge: "bg-success/10 text-success border-success/20" },
  note:                { icon: <FileText className="h-4 w-4" />,       label: "Note",         iconBg: "bg-muted text-muted-foreground",       badge: "bg-muted text-muted-foreground" },
};

const CI_STATUS_META: Record<
  ClinicalInteractionStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed:       { label: "Completed",       icon: <CheckCircle className="h-3 w-3" />, className: "bg-success/10 text-success border-success/20" },
  action_required: { label: "Action Required", icon: <AlertCircle className="h-3 w-3" />, className: "bg-primary/10 text-primary border-primary/20" },
  upcoming:        { label: "Upcoming",         icon: <Clock className="h-3 w-3" />,       className: "bg-muted text-muted-foreground" },
  cancelled:       { label: "Cancelled",        icon: <XCircle className="h-3 w-3" />,    className: "bg-muted text-muted-foreground" },
  no_show:         { label: "No Show",          icon: <Ban className="h-3 w-3" />,         className: "bg-orange-50 text-orange-700 border-orange-200" },
};

const PROGRAMME_STATUS_META: Record<ProgrammeStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-sky-50 text-sky-700 border-sky-200" },
  active:    { label: "Active",    className: "bg-success/10 text-success border-success/20" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  paused:    { label: "Paused",    className: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Side-effect chips options
// ─────────────────────────────────────────────────────────────────────────────

const SIDE_EFFECT_OPTIONS = [
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Constipation",
  "Fatigue",
  "Headache",
  "Dizziness",
  "Reduced appetite",
  "Bloating",
  "Stomach pain",
  "Heartburn",
  "None",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Check-In Form
// ─────────────────────────────────────────────────────────────────────────────

interface CheckInFormProps {
  readonly interactionId: string;
  readonly onSubmit: (id: string, data: SubmittedCheckIn) => void;
}

function CheckInForm({ interactionId, onSubmit }: CheckInFormProps) {
  const [weight, setWeight] = useState("");
  const [glucose, setGlucose] = useState("");
  const [doseTaken, setDoseTaken] = useState<"yes" | "no" | "">("");
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleEffect = useCallback((effect: string) => {
    setSelectedEffects((prev) => {
      if (effect === "None") {
        // "None" clears all others
        return prev.includes("None") ? [] : ["None"];
      }
      // Selecting any real effect clears "None"
      const without = prev.filter((e) => e !== "None");
      return without.includes(effect)
        ? without.filter((e) => e !== effect)
        : [...without, effect];
    });
  }, []);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    const w = parseFloat(weight);
    const g = parseFloat(glucose);
    if (!weight || isNaN(w) || w < 30 || w > 300) {
      errs.weight = "Enter a valid weight (30–300 kg)";
    }
    if (!glucose || isNaN(g) || g < 50 || g > 600) {
      errs.glucose = "Enter a valid fasting glucose (50–600 mg/dL)";
    }
    if (!doseTaken) {
      errs.doseTaken = "Please indicate if you took your dose";
    }
    return errs;
  }, [weight, glucose, doseTaken]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const effects = selectedEffects.filter((e) => e !== "None");
    onSubmit(interactionId, {
      weightKg: parseFloat(weight),
      glucoseMgDl: parseFloat(glucose),
      doseTaken: doseTaken === "yes",
      sideEffects: effects,
      patientNote: note.trim(),
      submittedAt: new Date().toISOString(),
    });
  }, [validate, interactionId, weight, glucose, doseTaken, selectedEffects, note, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
        <p className="text-sm font-semibold text-primary flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Action required — log your Week 8 check-in
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This takes less than 2 minutes. Your doctor will review your response.
        </p>
      </div>

      {/* Weight */}
      <div className="space-y-1.5">
        <Label htmlFor="checkin-weight" className="text-sm font-medium flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-muted-foreground" />
          Weight (kg)
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="checkin-weight"
          type="number"
          step="0.1"
          min="30"
          max="300"
          placeholder="e.g. 88.1"
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value);
            if (errors.weight) setErrors((prev) => ({ ...prev, weight: "" }));
          }}
          className={cn("max-w-[160px]", errors.weight && "border-destructive")}
        />
        {errors.weight && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <X className="h-3 w-3" />{errors.weight}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Measure first thing in the morning, after bathroom, before eating
        </p>
      </div>

      {/* Fasting glucose */}
      <div className="space-y-1.5">
        <Label htmlFor="checkin-glucose" className="text-sm font-medium flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
          Fasting glucose (mg/dL)
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="checkin-glucose"
          type="number"
          step="1"
          min="50"
          max="600"
          placeholder="e.g. 121"
          value={glucose}
          onChange={(e) => {
            setGlucose(e.target.value);
            if (errors.glucose) setErrors((prev) => ({ ...prev, glucose: "" }));
          }}
          className={cn("max-w-[160px]", errors.glucose && "border-destructive")}
        />
        {errors.glucose && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <X className="h-3 w-3" />{errors.glucose}
          </p>
        )}
      </div>

      {/* Dose taken */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <PillIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Dose taken this week?
          <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          {(["yes", "no"] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setDoseTaken(val);
                if (errors.doseTaken) setErrors((prev) => ({ ...prev, doseTaken: "" }));
              }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                doseTaken === val
                  ? val === "yes"
                    ? "border-success bg-success/10 text-success"
                    : "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              {val === "yes"
                ? <Check className="h-3.5 w-3.5" />
                : <X className="h-3.5 w-3.5" />
              }
              {val === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
        {errors.doseTaken && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <X className="h-3 w-3" />{errors.doseTaken}
          </p>
        )}
      </div>

      {/* Side effects */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Side effects this week
          <span className="text-muted-foreground font-normal ml-1">(select all that apply)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {SIDE_EFFECT_OPTIONS.map((effect) => {
            const isSelected = selectedEffects.includes(effect);
            return (
              <button
                key={effect}
                type="button"
                onClick={() => toggleEffect(effect)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                  isSelected
                    ? effect === "None"
                      ? "border-success bg-success/10 text-success"
                      : "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {effect}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient note */}
      <div className="space-y-1.5">
        <Label htmlFor="checkin-note" className="text-sm font-medium">
          Patient note
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        </Label>
        <Textarea
          id="checkin-note"
          placeholder="Anything else you'd like your doctor to know — mood, energy, diet, exercise, concerns…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2" size="default">
        <Check className="h-4 w-4" />
        Submit Check-In
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Check-In submitted confirmation view
// ─────────────────────────────────────────────────────────────────────────────

function CheckInSubmittedView({ data }: { readonly data: SubmittedCheckIn }) {
  return (
    <div className="space-y-4">
      {/* Confirmation banner */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-success">Check-in submitted!</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted {fmtDatetime(data.submittedAt)} · Dr. Rahul Sharma will review shortly.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Weight",     value: `${data.weightKg} kg`       },
          { label: "Glucose",    value: `${data.glucoseMgDl} mg/dL` },
          { label: "Dose taken", value: data.doseTaken ? "Yes" : "No" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border p-3 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Side effects */}
      {data.sideEffects.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Reported Side Effects
          </p>
          <div className="flex flex-wrap gap-2">
            {data.sideEffects.map((e) => (
              <Badge key={e} className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                {e}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {data.sideEffects.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          No side effects reported
        </div>
      )}

      {/* Note */}
      {data.patientNote && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Your Note
          </p>
          <p className="text-sm italic leading-relaxed">"{data.patientNote}"</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail panels (typed)
// ─────────────────────────────────────────────────────────────────────────────

function ConsultationPanel({ d }: { readonly d: ConsultationDetails }) {
  const modeLabel = { video: "Video call", in_person: "In person", phone: "Phone" }[d.mode];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{d.doctor}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.durationMinutes} min · {modeLabel}</span>
        {d.prescriptionIssued && (
          <Badge className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">Rx issued</Badge>
        )}
      </div>
      {[
        { heading: "Chief Complaint", text: d.chiefComplaint },
        { heading: "Clinical Notes",  text: d.clinicalNotes  },
        { heading: "Outcome",         text: d.outcome        },
      ].map(({ heading, text }) => (
        <div key={heading}>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{heading}</p>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
      ))}
      {d.nextSteps.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Next Steps</p>
          <ul className="space-y-1.5">
            {d.nextSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface CheckInPanelProps {
  readonly d: CheckInDetails;
  readonly interactionId: string;
  readonly submittedData?: SubmittedCheckIn;
  readonly onSubmit: (id: string, data: SubmittedCheckIn) => void;
}

function CheckInPanel({ d, interactionId, submittedData, onSubmit }: CheckInPanelProps) {
  // If there's submitted override data, show submitted view
  if (submittedData) {
    return <CheckInSubmittedView data={submittedData} />;
  }

  // If this is a pending check-in (no weight yet logged), show interactive form
  if (d.weightKg === null) {
    return <CheckInForm interactionId={interactionId} onSubmit={onSubmit} />;
  }

  // Otherwise: completed read-only view
  const metrics = [
    { label: "Weight",     value: d.weightKg    != null ? `${d.weightKg} kg`             : "—" },
    { label: "Glucose",    value: d.glucoseMgDl != null ? `${d.glucoseMgDl} mg/dL`       : "—" },
    { label: "Dose taken", value: d.doseTaken   != null ? (d.doseTaken ? "Yes" : "No")   : "—" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-lg border p-3 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>
      {d.sideEffects.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Side Effects</p>
          <div className="flex flex-wrap gap-2">
            {d.sideEffects.map((e) => (
              <Badge key={e} className="bg-destructive/10 text-destructive border-destructive/20 text-xs">{e}</Badge>
            ))}
          </div>
        </div>
      )}
      {d.patientNote && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Patient Note</p>
          <p className="text-sm italic leading-relaxed">"{d.patientNote}"</p>
        </div>
      )}
      {d.doctorResponse && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" /> Doctor's Response
          </p>
          <p className="text-sm text-emerald-800 leading-relaxed">{d.doctorResponse}</p>
        </div>
      )}
    </div>
  );
}

function LabTestPanel({ d }: { readonly d: LabTestDetails }) {
  const FLAG_CLASS: Record<"normal" | "high" | "low" | "critical", string> = {
    normal:   "bg-success/10 text-success border-success/20",
    high:     "bg-destructive/10 text-destructive border-destructive/20",
    low:      "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-destructive text-white",
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{d.labName}</span>
        <span className="flex items-center gap-1"><TestTube className="h-3.5 w-3.5" />{d.testPanel}</span>
        {d.reviewedBy && (
          <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />Reviewed by {d.reviewedBy}</span>
        )}
      </div>
      {d.results.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              {["Marker", "Result", "Reference", "Flag"].map((h) => (
                <TableHead key={h} className="text-xs">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {d.results.map((r) => (
              <TableRow key={r.marker}>
                <TableCell className="text-sm font-medium">{r.marker}</TableCell>
                <TableCell className="text-sm">{r.value}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.range}</TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] capitalize", FLAG_CLASS[r.flag])}>{r.flag}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Results pending
        </p>
      )}
      {d.interpretation && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Interpretation</p>
          <p className="text-sm leading-relaxed">{d.interpretation}</p>
        </div>
      )}
    </div>
  );
}

function PrescriptionChangePanel({ d }: { readonly d: PrescriptionChangeDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
        <div className="text-center flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Previous Dose</p>
          <p className="text-lg font-bold text-muted-foreground line-through">{d.previousDose}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="text-center flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">New Dose</p>
          <p className="text-lg font-bold text-primary">{d.newDose}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Pill className="h-3.5 w-3.5" />{d.medication}</span>
        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />Approved by {d.approvedBy}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Effective {fmtDate(d.effectiveDate)}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rationale</p>
        <p className="text-sm leading-relaxed">{d.reason}</p>
      </div>
    </div>
  );
}

function DeliveryPanel({ d }: { readonly d: DeliveryDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Pill className="h-3.5 w-3.5" />{d.medication}</span>
        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{d.quantity}</span>
      </div>
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        d.coldChainIntact ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20",
      )}>
        {d.coldChainIntact
          ? <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
          : <XCircle     className="h-4 w-4 text-destructive flex-shrink-0" />
        }
        <div>
          <p className="text-sm font-medium">Cold chain {d.coldChainIntact ? "intact" : "compromised"}</p>
          <p className="text-xs text-muted-foreground">Tracking ID: {d.trackingId}</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Delivery Note</p>
        <p className="text-sm leading-relaxed">{d.deliveryNote}</p>
      </div>
    </div>
  );
}

function EscalationPanel({ d }: { readonly d: EscalationDetails }) {
  const SEV: Record<"low" | "medium" | "high" | "critical", { badge: string; bg: string }> = {
    low:      { badge: "bg-amber-50 text-amber-700 border-amber-200",              bg: "bg-amber-50 border-amber-200" },
    medium:   { badge: "bg-orange-50 text-orange-700 border-orange-200",           bg: "bg-orange-50 border-orange-200" },
    high:     { badge: "bg-destructive/10 text-destructive border-destructive/20", bg: "bg-destructive/5 border-destructive/20" },
    critical: { badge: "bg-destructive text-white",                                bg: "bg-destructive/10 border-destructive/30" },
  };
  const s = SEV[d.severity];
  return (
    <div className="space-y-4">
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border", s.bg)}>
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Severity</p>
            <Badge className={cn("text-[10px] capitalize", s.badge)}>{d.severity}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Trigger: {d.trigger}</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm leading-relaxed">{d.description}</p>
      </div>
      {d.resolvedBy && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-success uppercase tracking-wide mb-1 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> Resolved
          </p>
          <p className="text-sm leading-relaxed">{d.resolutionNote}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {d.resolvedBy} · {d.resolvedAt ? fmtDatetime(d.resolvedAt) : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function MilestonePanel({ d }: { readonly d: MilestoneDetails }) {
  return (
    <div className="space-y-4">
      {d.metric && d.value && (
        <div className="flex items-center gap-4 bg-success/5 border border-success/20 rounded-xl p-4">
          <Trophy className="h-8 w-8 text-success flex-shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{d.metric}</p>
            <p className="text-2xl font-bold text-success">{d.value}</p>
          </div>
        </div>
      )}
      <p className="text-sm leading-relaxed">{d.description}</p>
    </div>
  );
}

function NotePanel({ d }: { readonly d: NoteDetails }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <User className="h-3.5 w-3.5" /> {d.author} · {d.role}
      </p>
      <p className="text-sm leading-relaxed">{d.content}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interaction detail dispatcher
// ─────────────────────────────────────────────────────────────────────────────

interface InteractionDetailPanelProps {
  readonly interaction: ClinicalInteraction;
  readonly submittedCheckIns: Record<string, SubmittedCheckIn>;
  readonly onCheckInSubmit: (id: string, data: SubmittedCheckIn) => void;
}

function InteractionDetailPanel({
  interaction,
  submittedCheckIns,
  onCheckInSubmit,
}: InteractionDetailPanelProps) {
  const { details } = interaction;
  switch (details.kind) {
    case "consultation":
      return <ConsultationPanel d={details} />;
    case "check_in":
      return (
        <CheckInPanel
          d={details}
          interactionId={interaction.id}
          submittedData={submittedCheckIns[interaction.id]}
          onSubmit={onCheckInSubmit}
        />
      );
    case "lab_test":
      return <LabTestPanel d={details} />;
    case "prescription_change":
      return <PrescriptionChangePanel d={details} />;
    case "delivery":
      return <DeliveryPanel d={details} />;
    case "escalation":
      return <EscalationPanel d={details} />;
    case "milestone":
      return <MilestonePanel d={details} />;
    case "note":
      return <NotePanel d={details} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible interaction row
// ─────────────────────────────────────────────────────────────────────────────

interface InteractionRowProps {
  readonly interaction: ClinicalInteraction;
  readonly isExpanded: boolean;
  readonly isSubmitted: boolean;
  readonly onToggle: (id: string) => void;
  readonly submittedCheckIns: Record<string, SubmittedCheckIn>;
  readonly onCheckInSubmit: (id: string, data: SubmittedCheckIn) => void;
}

function InteractionRow({
  interaction,
  isExpanded,
  isSubmitted,
  onToggle,
  submittedCheckIns,
  onCheckInSubmit,
}: InteractionRowProps) {
  const typeMeta = CI_TYPE_META[interaction.type];
  // If submitted, treat status as completed for display purposes
  const effectiveStatus: ClinicalInteractionStatus =
    isSubmitted ? "completed" : interaction.status;
  const statusMeta = CI_STATUS_META[effectiveStatus];

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      isExpanded && "shadow-sm",
      !isSubmitted && interaction.status === "action_required" && "border-primary shadow-sm shadow-primary/10",
      interaction.status === "upcoming" && "border-dashed border-muted-foreground/30",
    )}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => onToggle(interaction.id)}
        aria-expanded={isExpanded}
      >
        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0", typeMeta.iconBg)}>
          {typeMeta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{interaction.title}</span>
            <Badge className={cn("text-[10px]", typeMeta.badge)}>{typeMeta.label}</Badge>
            <Badge className={cn("text-[10px] flex items-center gap-0.5", statusMeta.className)}>
              {statusMeta.icon}<span className="ml-0.5">{statusMeta.label}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSubmitted
              ? "Check-in submitted — awaiting doctor review"
              : interaction.summary
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:block">{fmtDate(interaction.date)}</span>
          {isExpanded
            ? <ChevronUp   className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{interaction.actor}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{fmtDatetime(interaction.date)}</span>
          </div>
          <Separator className="mb-4" />
          <InteractionDetailPanel
            interaction={interaction}
            submittedCheckIns={submittedCheckIns}
            onCheckInSubmit={onCheckInSubmit}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interaction list panel (right column)
// ─────────────────────────────────────────────────────────────────────────────

interface InteractionListPanelProps {
  readonly title: string;
  readonly subtitle: string;
  readonly statusBadge?: React.ReactNode;
  readonly interactions: readonly ClinicalInteraction[];
  readonly submittedCheckIns: Record<string, SubmittedCheckIn>;
  readonly onCheckInSubmit: (id: string, data: SubmittedCheckIn) => void;
}

function InteractionListPanel({
  title,
  subtitle,
  statusBadge,
  interactions,
  submittedCheckIns,
  onCheckInSubmit,
}: InteractionListPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    interactions.find((i) => i.status === "action_required")?.id ?? null,
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Counts: treat submitted check-ins as completed
  const completedCount = interactions.filter(
    (i) => i.status === "completed" || submittedCheckIns[i.id] != null,
  ).length;
  const actionCount = interactions.filter(
    (i) => i.status === "action_required" && !submittedCheckIns[i.id],
  ).length;
  const upcomingCount = interactions.filter((i) => i.status === "upcoming").length;

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          {statusBadge}
        </div>
        {interactions.length > 1 && (
          <div className="flex gap-4 mt-3">
            {[
              { label: "Completed",       count: completedCount, dot: "bg-success" },
              { label: "Action required", count: actionCount,    dot: "bg-primary" },
              { label: "Upcoming",        count: upcomingCount,  dot: "bg-muted-foreground" },
            ].map(({ label, count, dot }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dot)} />
                {count} {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {interactions.length === 0 ? (
        <p className="text-center py-12 text-sm text-muted-foreground">
          No clinical interactions recorded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {interactions.map((ci) => (
            <InteractionRow
              key={ci.id}
              interaction={ci}
              isExpanded={expandedId === ci.id}
              isSubmitted={submittedCheckIns[ci.id] != null}
              onToggle={handleToggle}
              submittedCheckIns={submittedCheckIns}
              onCheckInSubmit={onCheckInSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifeline panel (left column)
// ─────────────────────────────────────────────────────────────────────────────

interface LifelinePanelProps {
  readonly items: readonly LifelineItem[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}

function SectionLabel({ label }: { readonly label: string }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
      {label}
    </p>
  );
}

function ProgrammeCard({
  item, isSelected, onSelect,
}: {
  readonly item: ProgrammeLifelineItem;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const sm = PROGRAMME_STATUS_META[item.status];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{item.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{item.programmeType}</p>
        </div>
        <Badge className={cn("text-[10px] flex-shrink-0", sm.className)}>{sm.label}</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{item.summaryLine}</p>
      {item.status === "active" && item.currentWeek != null && item.totalWeeks != null && (
        <div className="mt-2">
          <Progress
            value={Math.round((item.currentWeek / item.totalWeeks) * 100)}
            className="h-1.5"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Week {item.currentWeek} of {item.totalWeeks}
          </p>
        </div>
      )}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Activity className="h-3 w-3" />{item.children.length} interactions
      </div>
    </button>
  );
}

function StandaloneCard({
  item, isSelected, onSelect,
}: {
  readonly item: StandaloneLifelineItem;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const tm = CI_TYPE_META[item.type];
  const sm = CI_STATUS_META[item.status];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={cn("h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0", tm.iconBg)}>
            {tm.icon}
          </span>
          <p className="text-sm font-semibold leading-tight truncate">{item.title}</p>
        </div>
        <Badge className={cn("text-[10px] flex-shrink-0", sm.className)}>{sm.label}</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{item.summary}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{fmtDate(item.date)}</p>
    </button>
  );
}

function LifelinePanel({ items, selectedId, onSelect }: LifelinePanelProps) {
  const programmes  = items.filter((i): i is ProgrammeLifelineItem  => i.isProgramme);
  const standalones = items.filter((i): i is StandaloneLifelineItem => !i.isProgramme);

  return (
    <div className="space-y-5">
      {programmes.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Programmes" />
          {programmes.map((item) => (
            <ProgrammeCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}
      {standalones.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="One-off Consultations" />
          {standalones.map((item) => (
            <StandaloneCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weight trend chart
// ─────────────────────────────────────────────────────────────────────────────

interface WeightTrendChartProps {
  readonly data: readonly WeightEntry[];
  readonly startWeight: number;
}

function WeightTrendChart({ data, startWeight }: WeightTrendChartProps) {
  const minW = Math.floor(Math.min(...data.map((d) => d.weightKg)) - 1);
  const maxW = Math.ceil(startWeight + 0.5);
  const latest = data[data.length - 1];
  const lost = (startWeight - latest.weightKg).toFixed(1);

  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Weight Trend
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={data as WeightEntry[]}
          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis domain={[minW, maxW]} tick={{ fontSize: 10 }} unit=" kg" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v: number) => [`${v} kg`, "Weight"]}
          />
          <ReferenceLine
            y={startWeight}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: "Start", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
        <span>Start: {startWeight} kg</span>
        <span>Latest: {latest.weightKg} kg</span>
        <span className="text-success font-medium">−{lost} kg</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Treatment plan card (versioned)
// ─────────────────────────────────────────────────────────────────────────────

function TreatmentPlanCard({ plans }: { readonly plans: readonly TreatmentPlanVersion[] }) {
  const [selectedVersion, setSelectedVersion] = useState<number>(plans[0].version);
  const plan = plans.find((p) => p.version === selectedVersion) ?? plans[0];

  const SCHED_DOT: Record<"completed" | "active" | "pending", string> = {
    completed: "bg-success",
    active:    "bg-primary",
    pending:   "bg-muted",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Treatment Plan</CardTitle>
          <Select
            value={String(selectedVersion)}
            onValueChange={(v) => setSelectedVersion(Number(v))}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.version} value={String(p.version)} className="text-xs">
                  v{p.version}{p.version === plans[0].version ? " (latest)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Issued {fmtDate(plan.issuedAt)} · {plan.issuedBy}
        </p>
        {plan.changeReason && (
          <p className="text-xs text-muted-foreground italic mt-0.5">{plan.changeReason}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-semibold">
            {plan.medication.name} ({plan.medication.brandName})
          </p>
          <p className="text-xs text-muted-foreground">{plan.medication.form}</p>
          <p className="text-xs mt-1">
            Current:{" "}
            <span className="font-medium text-primary">{plan.medication.currentDose}</span>
          </p>
          <p className="text-xs">Target: {plan.medication.targetDose}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Dose Schedule
          </p>
          <div className="space-y-1.5">
            {plan.medication.escalationSchedule.map((s) => (
              <div key={s.period} className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full flex-shrink-0", SCHED_DOT[s.status])} />
                <span className="text-xs text-muted-foreground w-20">{s.period}</span>
                <span className={cn(
                  "text-xs font-medium",
                  s.status === "completed" ? "text-success" :
                  s.status === "active"    ? "text-primary" : "text-foreground",
                )}>
                  {s.dose}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {[
          { heading: "Instructions",     items: plan.instructions    },
          { heading: "Dietary Guidance", items: plan.dietaryGuidance },
        ].map(({ heading, items }) => (
          <div key={heading}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              {heading}
            </p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex gap-1.5">
                  <span>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick actions sidebar card
// ─────────────────────────────────────────────────────────────────────────────

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[
          { to: "/consult", icon: <Stethoscope className="h-4 w-4 mr-2" />, label: "Book consultation" },
          { to: "/orders",  icon: <ShoppingCart className="h-4 w-4 mr-2" />, label: "Reorder medication" },
          { to: "/support", icon: <Send          className="h-4 w-4 mr-2" />, label: "Message support"   },
        ].map(({ to, icon, label }) => (
          <Button key={to} className="w-full justify-start" variant="outline" size="sm" asChild>
            <Link to={to}>{icon}{label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification (inline — no external dependency needed)
// ─────────────────────────────────────────────────────────────────────────────

interface ToastBannerProps {
  readonly message: string;
  readonly onDismiss: () => void;
}

function ToastBanner({ message, onDismiss }: ToastBannerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background rounded-xl px-5 py-3 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────────────────────────────────────

export default function Journey() {
  // ── Live data ──────────────────────────────────────────────────────────────
  const { user } = useUser();
  const { forPatient } = useMockData();

  // Build the lifeline from live MockDataContext for the logged-in patient.
  // Falls back to an empty array when no patient is logged in (e.g. doctor preview).
  const patientId = user?.patientId ?? "patient_001";
  const patientView = forPatient(patientId);
  const lifeline: LifelineItem[] = patientView
    ? buildLifelineFromPatientView(patientView)
    : [];

  // ── Selection state ────────────────────────────────────────────────────────
  const firstId = lifeline[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState<string>(firstId);

  // Keep selection in sync when the lifeline changes (e.g. first load)
  const resolvedSelectedId =
    lifeline.some((i) => i.id === selectedId) ? selectedId : firstId;

  // Map of interactionId → submitted check-in data (simulates save to backend)
  const [submittedCheckIns, setSubmittedCheckIns] = useState<Record<string, SubmittedCheckIn>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle check-in form submission
  const handleCheckInSubmit = useCallback((id: string, data: SubmittedCheckIn) => {
    setSubmittedCheckIns((prev) => ({ ...prev, [id]: data }));
    setToastMessage("Check-in submitted! Your doctor will review shortly.");
    // Auto-dismiss toast after 4 seconds
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const selectedItem = lifeline.find((i) => i.id === resolvedSelectedId) as LifelineItem | undefined;
  const selectedProgramme  = selectedItem?.isProgramme ? selectedItem as ProgrammeLifelineItem : null;
  const selectedStandalone = selectedItem && !selectedItem.isProgramme
    ? (selectedItem as StandaloneLifelineItem)
    : null;

  const rightInteractions: readonly ClinicalInteraction[] = selectedProgramme
    ? selectedProgramme.children
    : selectedStandalone
    ? [selectedStandalone]
    : [];

  const rightTitle    = selectedProgramme?.name ?? selectedStandalone?.title ?? "";
  const rightSubtitle = selectedProgramme
    ? `${selectedProgramme.assignedDoctor} · ${selectedProgramme.primaryMedication}`
    : selectedStandalone?.actor ?? "";

  const rightBadge = selectedProgramme ? (
    <Badge className={cn("text-xs", PROGRAMME_STATUS_META[selectedProgramme.status].className)}>
      {PROGRAMME_STATUS_META[selectedProgramme.status].label}
    </Badge>
  ) : selectedStandalone ? (
    <Badge className={cn("text-xs", CI_STATUS_META[selectedStandalone.status].className)}>
      {CI_STATUS_META[selectedStandalone.status].label}
    </Badge>
  ) : null;

  const activeProgramme = lifeline
    .filter((i): i is ProgrammeLifelineItem => i.isProgramme)
    .find((p) => p.status === "active");

  // Refill banner — driven by live refill data from context
  const refillSupply  = patientView?.refill?.currentSupply ?? 0;
  const refillMedName = patientView?.refill?.medicationName ?? "Medication";
  const refillRxId    = patientView?.prescription?.id ?? "";
  const [refillDismissed, setRefillDismissed] = useState(false);
  const showRefillBanner = !refillDismissed && refillSupply <= 7 && activeProgramme != null;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Refill banner */}
        {showRefillBanner && (
          <div className={cn(
            "rounded-xl border p-4 flex items-start gap-3 mb-6",
            "bg-amber-50 border-amber-200",
          )}>
            <Bell className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">🔔 Medication supply running low</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium">Semaglutide 1 mg</span> — 5 days remaining · Prescription <span className="font-medium">RX-2024-001</span> is active
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Link to="/orders?tab=rx">
                  <Button size="sm" className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Request Refill
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setRefillDismissed(true)}>
                  Dismiss
                </Button>
              </div>
            </div>
            <button onClick={() => setRefillDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Journey</h1>
          {activeProgramme ? (
            <p className="text-sm text-muted-foreground mt-1">
              {activeProgramme.name} · Week {activeProgramme.currentWeek} of{" "}
              {activeProgramme.totalWeeks} · {activeProgramme.primaryMedication}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Your clinical lifeline — programmes and one-off interactions.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main column */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left: lifeline selector */}
            <div className="sm:w-64 flex-shrink-0">
              <LifelinePanel
                items={lifeline}
                selectedId={resolvedSelectedId}
                onSelect={setSelectedId}
              />
            </div>

            <Separator orientation="vertical" className="hidden sm:block" />

            {/* Right: interaction list / detail */}
            <InteractionListPanel
              title={rightTitle}
              subtitle={rightSubtitle}
              statusBadge={rightBadge ?? undefined}
              interactions={rightInteractions}
              submittedCheckIns={submittedCheckIns}
              onCheckInSubmit={handleCheckInSubmit}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {selectedProgramme && selectedProgramme.weightHistory.length > 1 && (
              <Card>
                <CardContent className="pt-4">
                  <WeightTrendChart
                    data={selectedProgramme.weightHistory}
                    startWeight={selectedProgramme.weightHistory[0].weightKg}
                  />
                </CardContent>
              </Card>
            )}
            {selectedProgramme && selectedProgramme.treatmentPlans.length > 0 && (
              <TreatmentPlanCard plans={selectedProgramme.treatmentPlans} />
            )}
            <QuickActionsCard />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <ToastBanner
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </>
  );
}
