/**
 * Doctor Portal — LASO_SPEC_V2 Part 18
 *
 * Data source: useMockData().forDoctor(doctorId) + forPatient(patientId)
 * Zero local mock data — all entities from the unified mockDB via MockDataContext.
 *
 * Tabs per selected patient:
 *   Overview · Journey & Steps · Progress Charts · Treatment Plan
 *   Messages · Notes · Clinical Interactions · Actions
 */

import { useState, useMemo } from "react";
import {
  Users, AlertTriangle, Search, Clock, XCircle, TrendingDown,
  Activity, CheckCircle2, ChevronRight, FileText, MessageCircle,
  ClipboardList, Pill, BarChart3, Send, Plus, AlertCircle,
  Stethoscope, Calendar,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { useMockData, type PatientView } from "@/contexts/MockDataContext";
import { useUser } from "@/contexts/UserContext";
import type { Patient, PatientStatus, ChatMessage, DoctorNote } from "@/data/mockDB";
import { cn } from "@/lib/utils";

// ─── Config maps ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PatientStatus, { label: string; cls: string }> = {
  active:         { label: "Active",         cls: "bg-success/10 text-success border-success/20" },
  review_needed:  { label: "Review Needed",  cls: "bg-warning/10 text-warning border-warning/20" },
  plateau:        { label: "Plateau",        cls: "bg-orange-100 text-orange-700 border-orange-200" },
  adherence_risk: { label: "Adherence Risk", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  completed:      { label: "Completed",      cls: "bg-muted text-muted-foreground" },
  inactive:       { label: "Inactive",       cls: "bg-muted text-muted-foreground" },
};

const URGENCY_MAP: Record<string, "critical" | "warning" | "info" | "positive"> = {
  critical: "critical", high: "warning", medium: "info", low: "positive",
};

const NOTE_TYPE_CLS: Record<string, string> = {
  progress:         "bg-primary/10 text-primary",
  clinical_review:  "bg-emerald-100 text-emerald-700",
  prescription:     "bg-violet-100 text-violet-700",
  alert:            "bg-destructive/10 text-destructive",
};

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ view }: { view: PatientView }) {
  const { patient, logs, programme } = view;
  const latest = logs[logs.length - 1];
  const cfg     = STATUS_CFG[patient.status];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Weight Lost"      value={`${patient.weightLostKg} kg`}    trendLabel={`${patient.weightLostPct}%`}   trend="down" trendPositive={false} icon={<TrendingDown className="h-4 w-4" />} size="sm" />
        <StatCard label="Current Wt"       value={`${patient.currentWeightKg} kg`} icon={<Activity className="h-4 w-4" />}   size="sm" />
        <StatCard label="Adherence"        value={`${patient.adherenceScore}%`}     icon={<CheckCircle2 className="h-4 w-4" />} size="sm" />
        <StatCard label="Fasting Glucose"  value={latest ? `${latest.fastingGlucose} mg/dL` : "—"} icon={<Activity className="h-4 w-4" />} size="sm" />
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableBody>
              {([
                ["Status",       <Badge className={cn("text-xs", cfg.cls)}>{cfg.label}</Badge>],
                ["Medication",   patient.medication],
                ["Dose",         <span className="text-primary font-medium">{patient.currentDose}</span>],
                ["Week",         `${programme.currentWeek} / ${programme.totalWeeks}`],
                ["Last check-in", patient.lastCheckIn],
                ["Next consult",  patient.nextConsult],
                ...(patient.currentHbA1c ? [["HbA1c", `${patient.currentHbA1c}% (baseline ${patient.baselineHbA1c}%)`]] : []),
              ] as [string, React.ReactNode][]).map(([label, val]) => (
                <TableRow key={label}>
                  <TableCell className="text-xs text-muted-foreground w-36">{label}</TableCell>
                  <TableCell className="text-sm font-medium">{val}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {patient.flags.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-warning flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />Clinical Flags
            </p>
            <ul className="space-y-1">
              {patient.flags.map(f => <li key={f} className="text-sm">• {f}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {["Write Note", "Adjust Plan", "Send Message", "Add Step to Journey"].map(a => (
          <Button key={a} size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />{a}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Journey & Steps ─────────────────────────────────────────────────────

/** Derives a step list from the real treatment plan titration + programme logs */
function JourneyStepsTab({ view }: { view: PatientView }) {
  type Step = { id: string; order: number; title: string; type: string; status: "completed" | "active" | "pending"; optional: boolean };

  const baseSteps = useMemo<Step[]>(() => {
    const { programme, plan, logs } = view;
    const maxLogWeek = (logs[logs.length - 1])?.week ?? 0;
    const steps: Step[] = [
      { id: "js1", order: 1, title: "Onboarding & Initial Consult", type: "consultation", status: maxLogWeek >= 1 ? "completed" : "pending", optional: false },
      { id: "js2", order: 2, title: "Receive Medication Kit",        type: "medication",   status: maxLogWeek >= 1 ? "completed" : "pending", optional: false },
      { id: "js3", order: 3, title: "Set Up Glucose Monitor",        type: "device",       status: maxLogWeek >= 1 ? "completed" : "pending", optional: false },
      { id: "js4", order: 4, title: "Log Baseline Weight",           type: "check_in",     status: maxLogWeek >= 1 ? "completed" : "pending", optional: false },
    ];
    // Add one step per titration milestone
    (plan?.titrationSchedule ?? []).forEach((t, i) => {
      const done = maxLogWeek >= t.week;
      steps.push({
        id: `js_tit_${i}`, order: steps.length + 1,
        title: `Dose Escalation to ${t.dose} (Week ${t.week})`,
        type: "medication",
        status: done ? "completed" : programme.currentWeek === t.week ? "active" : "pending",
        optional: false,
      });
    });
    // Final milestone
    steps.push({
      id: "js_final", order: steps.length + 1,
      title: `Programme Completion (Week ${programme.totalWeeks})`,
      type: "consultation",
      status: programme.status === "completed" ? "completed" : "pending",
      optional: false,
    });
    return steps;
  }, [view]);

  const [steps, setSteps] = useState(baseSteps);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("check_in");

  const addStep = () => {
    if (!newTitle.trim()) return;
    setSteps(prev => [...prev, { id: `s_${Date.now()}`, order: prev.length + 1, title: newTitle.trim(), type: newType, status: "pending", optional: false }]);
    setNewTitle(""); setAdding(false);
  };

  const StepStatusBadge = ({ status }: { status: string }) => {
    const cls: Record<string, string> = {
      completed: "bg-success/10 text-success border-success/20",
      active:    "bg-primary/10 text-primary border-primary/20",
      pending:   "bg-muted text-muted-foreground",
    };
    return <Badge className={cn("text-xs capitalize", cls[status] ?? "bg-muted text-muted-foreground")}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{steps.length} steps in programme</p>
        <Button size="sm" className="gap-1.5" onClick={() => setAdding(v => !v)}>
          <Plus className="h-3.5 w-3.5" />Add Step
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40 space-y-1">
              <p className="text-xs font-medium">Step Title</p>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Week 8 Check-In" className="text-sm" />
            </div>
            <div className="w-40 space-y-1">
              <p className="text-xs font-medium">Type</p>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["check_in","medication","device","test","consultation","supplement","lifestyle"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={addStep}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Optional</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map(s => (
            <TableRow key={s.id} className={s.status === "active" ? "bg-primary/5" : ""}>
              <TableCell className="text-muted-foreground text-xs">{s.order}</TableCell>
              <TableCell className="font-medium text-sm">{s.title}</TableCell>
              <TableCell><Badge variant="outline" className="text-[10px]">{s.type}</Badge></TableCell>
              <TableCell><StepStatusBadge status={s.status} /></TableCell>
              <TableCell className="text-xs text-muted-foreground">{s.optional ? "Optional" : "Required"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Tab: Progress Charts ─────────────────────────────────────────────────────

function ProgressChartsTab({ view }: { view: PatientView }) {
  const [chart, setChart] = useState<"weight" | "glucose" | "adherence">("weight");

  const chartData = useMemo(() => view.logs.map(l => ({
    week:      `W${l.week}`,
    kg:         l.weightKg,
    glucose:    l.fastingGlucose,
    adherencePct: l.dosesScheduled > 0 ? Math.round((l.dosesTaken / l.dosesScheduled) * 100) : 0,
    taken:      l.dosesTaken === l.dosesScheduled,
  })), [view.logs]);

  const startWeight = view.patient.startWeightKg;
  const totalLost = (startWeight - view.patient.currentWeightKg).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["weight", "glucose", "adherence"] as const).map(c => (
          <Button key={c} size="sm" variant={chart === c ? "default" : "outline"} className="capitalize" onClick={() => setChart(c)}>{c}</Button>
        ))}
      </div>

      {chart === "weight" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Weight (kg) — {chartData.length} weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} kg`, "Weight"]} />
                <ReferenceLine y={startWeight} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: "Start", fontSize: 11 }} />
                <Line type="monotone" dataKey="kg" stroke="#0d9488" strokeWidth={2} dot={{ r: 4, fill: "#0d9488" }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">Total lost: {totalLost} kg over {chartData.length} weeks</p>
          </CardContent>
        </Card>
      )}

      {chart === "glucose" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Fasting Glucose (mg/dL) — {chartData.length} weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[100, "auto"]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} mg/dL`, "Glucose"]} />
                <ReferenceLine y={100} stroke="#059669" strokeDasharray="4 2" label={{ value: "Target", fontSize: 11 }} />
                <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Trend: {chartData[0]?.glucose} → {chartData[chartData.length - 1]?.glucose} mg/dL
            </p>
          </CardContent>
        </Card>
      )}

      {chart === "adherence" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Dose Adherence — {chartData.length} weeks</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 py-4">
              {chartData.map(d => (
                <div key={d.week} className="flex flex-col items-center gap-1">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", d.taken ? "bg-success text-white" : "bg-destructive text-white")}>
                    {d.taken ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.week}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Overall adherence: {view.patient.adherenceScore}%
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Treatment Plan ──────────────────────────────────────────────────────

function TreatmentPlanTab({ view }: { view: PatientView }) {
  const { plan, patient } = view;
  if (!plan) return <p className="text-muted-foreground text-sm py-8 text-center">No treatment plan on record.</p>;

  const currentDoseWeek = plan.titrationSchedule.reduce((prev, cur) =>
    view.programme.currentWeek >= cur.week ? cur : prev,
    plan.titrationSchedule[0],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Plan v{plan.version} · Created {plan.createdDate}</p>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />Update Plan (v{plan.version + 1})
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Table>
            <TableBody>
              {([
                ["Medication",    patient.medication],
                ["Current Dose",  <span className="text-primary font-semibold">{currentDoseWeek?.dose ?? patient.currentDose}</span>],
                ["Target Dose",   plan.titrationSchedule[plan.titrationSchedule.length - 1]?.dose ?? "—"],
                ["Frequency",     plan.frequency],
                ["Diagnosis",     plan.diagnosis.join(" · ")],
                ["Follow-up",     plan.followUpDate],
                ["Activity",      plan.activityTarget],
              ] as [string, React.ReactNode][]).map(([l, v]) => (
                <TableRow key={l}>
                  <TableCell className="text-xs text-muted-foreground w-36">{l}</TableCell>
                  <TableCell className="text-sm">{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dose Escalation Schedule</p>
            {plan.titrationSchedule.map(s => {
              const done = view.programme.currentWeek >= s.week;
              return (
                <div key={s.week} className="flex items-center gap-3 py-1">
                  <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", done ? "bg-success" : "bg-muted")} />
                  <span className="text-xs text-muted-foreground w-24">Week {s.week}+</span>
                  <span className={cn("text-sm font-medium", done ? "text-success" : "")}>{s.dose}</span>
                  {done && <Badge className="bg-success/10 text-success text-[10px] ml-auto">Completed</Badge>}
                </div>
              );
            })}
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Targets</p>
            {plan.targets.map(t => (
              <div key={t.label} className="flex items-center gap-3 py-1">
                <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", t.achieved ? "bg-success" : "bg-muted")} />
                <span className="text-sm flex-1">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.value}</span>
                {t.achieved
                  ? <Badge className="bg-success/10 text-success text-[10px]">✓</Badge>
                  : <Badge variant="outline" className="text-[10px]">Pending</Badge>}
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Diet Guidelines</p>
            <ul className="space-y-1">
              {plan.dietGuidelines.map(g => <li key={g} className="text-xs text-muted-foreground">• {g}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" className="gap-1.5"><Pill className="h-3.5 w-3.5" />Escalate Dose</Button>
        <Button size="sm" variant="outline">Issue New Prescription</Button>
      </div>
    </div>
  );
}

// ─── Tab: Messages ────────────────────────────────────────────────────────────

function MessagesTab({ view }: { view: PatientView }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>(view.messages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, {
      id: `msg_${Date.now()}`,
      patientId: view.patient.id,
      sender: "coordinator",
      senderName: "Dr. " + view.doctor.name.replace("Dr. ", ""),
      text: input.trim(),
      timestamp: "Just now",
    }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[460px]">
      <ScrollArea className="flex-1 pr-1">
        <div className="space-y-3">
          {msgs.map(m => {
            const isDoc = m.sender !== "patient";
            return (
              <div key={m.id} className={cn("flex gap-2.5", isDoc && "flex-row-reverse")}>
                <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1",
                  isDoc ? "bg-emerald-600 text-white" : "bg-violet-600 text-white")}>
                  {isDoc ? "Dr" : view.patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className={cn("max-w-[75%]", isDoc && "items-end flex flex-col")}>
                  <p className="text-[10px] text-muted-foreground px-1 mb-0.5">{m.senderName} · {m.timestamp}</p>
                  <div className={cn("rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isDoc ? "bg-emerald-50 text-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm")}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-3 flex gap-2 items-end">
        <Textarea
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Message coordinator or patient…"
          className="resize-none text-sm min-h-[52px]"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <Button size="icon" onClick={send} disabled={!input.trim()} className="h-10 w-10 flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Tab: Notes ───────────────────────────────────────────────────────────────

function NotesTab({ view }: { view: PatientView }) {
  const [notes, setNotes] = useState<DoctorNote[]>(view.notes);
  const [draft, setDraft]   = useState("");

  const add = () => {
    if (!draft.trim()) return;
    setNotes(p => [{
      id: `note_${Date.now()}`,
      patientId: view.patient.id,
      doctorId:  view.doctor.id,
      date:      new Date().toISOString().slice(0, 10),
      type:      "clinical_review",
      subject:   "Clinical note",
      body:      draft.trim(),
      attachments: [],
    }, ...p]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-2">
          <Textarea
            value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Write a clinical note…"
            className="text-sm min-h-[76px] bg-white"
          />
          <Button size="sm" onClick={add} disabled={!draft.trim()} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Add Note
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {notes.map(n => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px]", NOTE_TYPE_CLS[n.type] ?? "bg-muted text-muted-foreground")}>{n.type.replace(/_/g, " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{n.date}</span>
                </div>
                <span className="text-xs text-muted-foreground">{view.doctor.name}</span>
              </div>
              <p className="font-medium text-sm mb-1">{n.subject}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{n.body}</p>
              {n.attachments.length > 0 && (
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {n.attachments.map(a => <Badge key={a} variant="outline" className="text-[10px]">📎 {a}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Clinical Interactions ───────────────────────────────────────────────

function ClinicalInteractionsTab({ view }: { view: PatientView }) {
  const STATUS_CLS: Record<string, string> = {
    "In Progress": "bg-success/15 text-success",
    "Upcoming":    "bg-blue-50 text-blue-700",
    "Completed":   "bg-muted text-muted-foreground",
    "No-show":     "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{view.consults.length} consultations in programme</p>
      {view.consults.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">No consultations recorded yet.</p>
      )}
      {view.consults.map(c => (
        <Card key={c.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <Badge variant="outline" className="text-xs">{c.type}</Badge>
                <Badge className={cn("text-xs", STATUS_CLS[c.status] ?? "bg-muted")}>{c.status}</Badge>
                <span className="text-xs text-muted-foreground">{c.date} · {c.time}</span>
                <span className="text-xs text-muted-foreground">· {c.durationMin} min</span>
              </div>
              {c.pendingAction && (
                <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">{c.pendingAction.replace(/-/g, " ")}</Badge>
              )}
            </div>
            {c.noteSummary
              ? <p className="text-sm leading-relaxed">{c.noteSummary}</p>
              : <p className="text-xs text-muted-foreground italic">{c.noteWritten ? "Note written." : "No clinical note yet."}</p>
            }
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />Zoom: {c.zoomUrl}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Actions ─────────────────────────────────────────────────────────────

function ActionsTab({ patient }: { patient: Patient }) {
  const ACTIONS = [
    { label: "Schedule follow-up",       icon: Clock,         desc: "Book video or in-person appointment" },
    { label: "Escalate medication dose", icon: Pill,          desc: "Move to next dose tier per escalation schedule" },
    { label: "Order lab tests",          icon: FileText,      desc: "Lipid panel, LFT, KFT, HbA1c" },
    { label: "Write clinical note",      icon: ClipboardList, desc: "Add observation to patient record" },
    { label: "Flag as urgent",           icon: AlertTriangle, desc: "Escalate to care coordinator" },
    { label: "Complete programme",       icon: CheckCircle2,  desc: "Mark patient journey as completed" },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Quick clinical actions for {patient.name}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {ACTIONS.map(a => (
          <Card key={a.label} className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <a.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Patient Detail (8 tabs) ──────────────────────────────────────────────────

function PatientDetail({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { forPatient } = useMockData();
  const view = forPatient(patientId);

  if (!view) return (
    <div className="py-16 text-center text-muted-foreground">
      <p>Patient data not found.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>← All Patients</Button>
    </div>
  );

  const { patient } = view;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{patient.name}</h2>
          <p className="text-sm text-muted-foreground">{patient.age}y · {patient.gender} · {patient.city}</p>
          <p className="text-xs text-muted-foreground">{patient.medication} {patient.currentDose} · Week {patient.programWeek}/{view.programme.totalWeeks}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>← All Patients</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          {[
            { v: "overview", icon: BarChart3,     label: "Overview" },
            { v: "steps",    icon: ClipboardList, label: "Journey & Steps" },
            { v: "charts",   icon: TrendingDown,  label: "Progress Charts" },
            { v: "plan",     icon: Pill,          label: "Treatment Plan" },
            { v: "messages", icon: MessageCircle, label: "Messages" },
            { v: "notes",    icon: FileText,      label: "Notes" },
            { v: "ci",       icon: Stethoscope,   label: "Clinical Interactions" },
            { v: "actions",  icon: Activity,      label: "Actions" },
          ].map(t => (
            <TabsTrigger key={t.v} value={t.v} className="gap-1.5 text-xs">
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview"><OverviewTab view={view} /></TabsContent>
        <TabsContent value="steps"><JourneyStepsTab view={view} /></TabsContent>
        <TabsContent value="charts"><ProgressChartsTab view={view} /></TabsContent>
        <TabsContent value="plan"><TreatmentPlanTab view={view} /></TabsContent>
        <TabsContent value="messages"><MessagesTab view={view} /></TabsContent>
        <TabsContent value="notes"><NotesTab view={view} /></TabsContent>
        <TabsContent value="ci"><ClinicalInteractionsTab view={view} /></TabsContent>
        <TabsContent value="actions"><ActionsTab patient={patient} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Patient list row ─────────────────────────────────────────────────────────

function PatientRow({ p, onSelect }: { p: Patient; onSelect: () => void }) {
  const cfg = STATUS_CFG[p.status];
  return (
    <TableRow className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={onSelect}>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0", p.colorClass)}>
            {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-sm">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.age}y · {p.city}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{p.programWeek}</TableCell>
      <TableCell className="text-sm text-success">−{p.weightLostKg} kg</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Progress value={p.adherenceScore} className="h-1.5 w-14" />
          <span className="text-xs">{p.adherenceScore}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={cn("text-xs", cfg.cls)}>{cfg.label}</Badge>
          {p.urgency !== "low" && (
            <SeverityBadge severity={URGENCY_MAP[p.urgency]} label={p.urgency} showIcon={false} />
          )}
        </div>
      </TableCell>
      <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
    </TableRow>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DoctorPortal() {
  const { user } = useUser();
  const { forDoctor } = useMockData();

  const doctorId = user?.doctorId ?? "doctor_001";
  const view     = forDoctor(doctorId);

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<PatientStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!view) return <p className="p-8 text-center text-muted-foreground">Doctor not found.</p>;

  const { doctor, patients } = view;

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
      && (filter === "all" || p.status === filter);
  });

  const critCount   = patients.filter(p => p.urgency === "critical" || p.urgency === "high").length;
  const reviewCount = patients.filter(p => p.status === "review_needed").length;
  const riskCount   = patients.filter(p => p.status === "adherence_risk").length;

  if (selectedId) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PatientDetail patientId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader
        title={`${doctor.name}'s Portal`}
        subtitle={`${doctor.specialisation.join(" · ")} · ${patients.length} patients under care`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients" value={patients.length}  icon={<Users className="h-5 w-5" />} />
        <StatCard label="Need Review"    value={reviewCount}       trend={reviewCount > 0 ? "up" : "neutral"} trendPositive={false} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Urgent / High"  value={critCount}         trend={critCount > 0 ? "up" : "neutral"}   trendPositive={false} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Adherence Risk" value={riskCount}         trend={riskCount > 0 ? "up" : "neutral"}   trendPositive={false} icon={<XCircle className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "review_needed", "plateau", "adherence_risk"] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : STATUS_CFG[f]?.label ?? f}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-5">
          <TabsTrigger value="list"><Users className="h-4 w-4 mr-1.5" />Patient List</TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-1.5" />Alerts ({critCount + reviewCount})
          </TabsTrigger>
        </TabsList>

        {(["list", "alerts"] as const).map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Week</TableHead>
                      <TableHead>Lost</TableHead>
                      <TableHead>Adherence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tab === "list"
                      ? filtered
                      : filtered.filter(p => p.urgency === "critical" || p.urgency === "high" || p.status === "review_needed")
                    ).map(p => (
                      <PatientRow key={p.id} p={p} onSelect={() => setSelectedId(p.id)} />
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No patients match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
