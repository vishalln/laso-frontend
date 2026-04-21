/**
 * Coordinator Portal — LASO_SPEC_V2 Part 19
 *
 * Data source: useMockData().forCoordinator()
 * Zero local mock data — all entities from the unified mockDB via MockDataContext.
 *
 * Panels: Triage (3-tier) · Tasks · Patients · Orders · Messaging · Consults
 */

import { useState } from "react";
import {
  Users, MessageCircle, Package, Calendar, CheckCircle2,
  Search, AlertTriangle, Clock, Send, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { useMockData } from "@/contexts/MockDataContext";
import { type Patient, type Order } from "@/data/mockDB";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TriageTier = "immediate" | "monitor" | "on_track";
// ─── Derived triage tier ──────────────────────────────────────────────────────

function triageTier(p: Patient): TriageTier {
  if (p.urgency === "critical" || p.urgency === "high") return "immediate";
  if (p.status === "adherence_risk" || p.status === "plateau" || p.status === "review_needed") return "monitor";
  return "on_track";
}

import type { CoordTask } from "@/data/mockDB";

type Priority = CoordTask["priority"];

const TASK_LABEL: Record<CoordTask["type"], string> = {
  check_in: "Check-in", refill: "Refill", consult_follow_up: "Follow-up",
  escalation: "Escalation", onboarding: "Onboarding",
};

const SEV_MAP: Record<Priority, "critical"|"warning"|"info"|"positive"> = {
  urgent: "critical", normal: "info", low: "positive",
};

// 4 spec-defined message templates (Part 19.4)
const MSG_TEMPLATES = [
  { trigger: "missed_dose",     label: "Missed Dose",    body: "Hi {name}, I saw from your progress log that you may have missed your semaglutide dose this week. It's okay — if fewer than 48 hours have passed, take it now. If more, skip and resume your regular schedule next week. Let me know if you have any questions!" },
  { trigger: "no_log_2_days",  label: "No Log (2d)",    body: "Hi {name}, quick check-in — we haven't received a progress log from you in a couple of days. Logging consistently helps your doctor track progress accurately. Takes just 30 seconds! Let me know how you're feeling." },
  { trigger: "weight_stalled", label: "Weight Stalled", body: "Hi {name}, I can see from your logs that your weight has been stable this week. This is normal — plateaus happen. Stay consistent with your dose and diet. Your doctor will review at your next consultation and may recommend adjustments." },
  { trigger: "nausea_reported",label: "Nausea",         body: "Hi {name}, I saw from your progress entry that you reported nausea. This is one of the most common early side effects and typically improves within 2–4 weeks. Try smaller meals, avoid fatty foods, and stay hydrated. If it becomes severe, let me know immediately." },
];

// ─── Triage patient row (expandable) ─────────────────────────────────────────

function TriagePatientRow({ p }: { p: Patient }) {
  const [expanded, setExpanded] = useState(false);
  const tier    = triageTier(p);
  const initials = p.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0", p.colorClass)}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{p.name}</p>
          <p className="text-xs text-muted-foreground">W{p.programWeek} · {p.medication} {p.currentDose}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tier === "immediate" && <AlertTriangle className="h-4 w-4 text-destructive" />}
          <Progress value={p.adherenceScore} className="h-1.5 w-14 hidden sm:block" />
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/30 px-3 py-3 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lost</p><p className="font-medium text-success">−{p.weightLostKg} kg</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Adherence</p><p className="font-medium">{p.adherenceScore}%</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last log</p><p className="font-medium">{p.lastCheckIn}</p></div>
          </div>
          {p.flags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {p.flags.map(f => <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning">{f}</span>)}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs"><MessageCircle className="h-3 w-3" />Message</Button>
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs"><CheckCircle2 className="h-3 w-3" />Mark Done</Button>
            {tier === "immediate" && (
              <Button size="sm" variant="destructive" className="gap-1.5 h-7 text-xs"><AlertTriangle className="h-3 w-3" />Escalate to Doctor</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Triage panel ─────────────────────────────────────────────────────────────

function TriagePanel({ patients }: { patients: Patient[] }) {
  const immediate = patients.filter(p => triageTier(p) === "immediate");
  const monitor   = patients.filter(p => triageTier(p) === "monitor");
  const onTrack   = patients.filter(p => triageTier(p) === "on_track");

  return (
    <div className="space-y-6">
      {immediate.length > 0 && (
        <div>
          <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2 flex items-center gap-1.5">
            🔴 Immediate — {immediate.length} patient{immediate.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-2">{immediate.map(p => <TriagePatientRow key={p.id} p={p} />)}</div>
        </div>
      )}
      {monitor.length > 0 && (
        <div>
          <p className="text-xs font-bold text-warning uppercase tracking-wider mb-2">🟡 Monitor — {monitor.length} patients</p>
          <div className="space-y-2">{monitor.map(p => <TriagePatientRow key={p.id} p={p} />)}</div>
        </div>
      )}
      {onTrack.length > 0 && (
        <div>
          <p className="text-xs font-bold text-success uppercase tracking-wider mb-2">🟢 On Track — {onTrack.length} patients</p>
          <div className="space-y-2">{onTrack.map(p => <TriagePatientRow key={p.id} p={p} />)}</div>
        </div>
      )}
    </div>
  );
}

// ─── Tasks panel ──────────────────────────────────────────────────────────────

function TaskRow({ task, onToggle }: { task: CoordTask; onToggle: (id: string) => void }) {
  return (
    <Card className={cn("transition-all", task.done && "opacity-50")}>
      <CardContent className="p-3 flex items-start gap-3">
        <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0">
          {task.done
            ? <CheckCircle2 className="h-5 w-5 text-success" />
            : <div className="h-5 w-5 rounded-full border-2 border-border" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className={cn("font-medium text-sm", task.done && "line-through text-muted-foreground")}>{task.patientName}</p>
            <Badge className="text-xs bg-muted text-muted-foreground">{TASK_LABEL[task.type]}</Badge>
            <SeverityBadge severity={SEV_MAP[task.priority]} label={task.priority} showIcon={false} />
          </div>
          <p className="text-xs text-muted-foreground">{task.note}</p>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
          <Clock className="h-3 w-3" />{task.dueDate}
        </p>
      </CardContent>
    </Card>
  );
}

function TasksPanel({ tasks, onToggle }: { tasks: CoordTask[]; onToggle: (id: string) => void }) {
  const urgent = tasks.filter(t => !t.done && t.priority === "urgent");
  return (
    <div className="space-y-4">
      {urgent.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Urgent</p>
          <div className="space-y-2">{urgent.map(t => <TaskRow key={t.id} task={t} onToggle={onToggle} />)}</div>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">All Tasks</p>
        <div className="space-y-2">{tasks.map(t => <TaskRow key={t.id} task={t} onToggle={onToggle} />)}</div>
      </div>
    </div>
  );
}

// ─── Patients panel ───────────────────────────────────────────────────────────

function PatientsPanel({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-2">
        {filtered.map(p => <TriagePatientRow key={p.id} p={p} />)}
      </div>
    </div>
  );
}

// ─── Orders panel ─────────────────────────────────────────────────────────────

function OrdersPanel({ orders, allPatients }: { orders: Order[]; allPatients: Patient[] }) {
  const recent = orders.slice(0, 3);
  return (
    <div className="space-y-4">
      {recent.map(order => {
        const patientName = allPatients.find(p => p.id === order.patientId)?.name ?? order.patientId;
        return (
          <Card key={order.id} className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {order.items[0]?.name ?? "Order"} — {patientName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {([
                    ["Order ID",      `#${order.id}`],
                    ["Date",          order.date],
                    ["Status",        order.status.replace(/_/g, " ")],
                    ["Carrier",       order.delivery.carrier],
                    ["Tracking",      order.delivery.trackingId],
                    ["Est. Delivery", order.delivery.estimatedTime],
                    ["Address",       order.delivery.address],
                    ["Cold Chain",
                      <span className={cn("font-medium", order.delivery.coldChainIntact ? "text-success" : "text-destructive")}>
                        {order.delivery.coldChainIntact ? "✓ Intact" : "⚠ Excursion"}
                      </span>
                    ],
                    ["Pharmacy",      order.pharmacy.name],
                  ] as [string, React.ReactNode][]).map(([l, v]) => (
                    <TableRow key={l}>
                      <TableCell className="text-xs text-muted-foreground w-32">{l}</TableCell>
                      <TableCell className="text-sm font-medium">{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      {recent.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No active orders.</p>}
    </div>
  );
}

// ─── Messaging sidebar ────────────────────────────────────────────────────────

function MessagingPanel({ patients }: { patients: Patient[] }) {
  const [selectedName, setSelectedName] = useState(patients[0]?.name ?? "");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState<string[]>([]);

  const applyTemplate = (tpl: typeof MSG_TEMPLATES[number]) =>
    setMessage(tpl.body.replace("{name}", selectedName.split(" ")[0]));

  const send = () => {
    if (!message.trim()) return;
    setSent(p => [`→ ${selectedName}: ${message.slice(0, 60)}…`, ...p.slice(0, 4)]);
    setMessage("");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />Quick Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedName} onValueChange={setSelectedName}>
          <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {patients.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Quick Templates</p>
          <div className="flex flex-wrap gap-1.5">
            {MSG_TEMPLATES.map(t => (
              <Button key={t.trigger} size="sm" variant="outline" className="text-xs h-7" onClick={() => applyTemplate(t)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          className="resize-none text-sm min-h-[90px]"
          placeholder="Type or pick a template above…"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Button size="sm" className="w-full gap-2" onClick={send} disabled={!message.trim()}>
          <Send className="h-3.5 w-3.5" />Send
        </Button>

        {sent.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sent</p>
            {sent.map((s, i) => <p key={i} className="text-xs text-muted-foreground truncate">{s}</p>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Consults sidebar ─────────────────────────────────────────────────────────

function ConsultsPanel({ patients }: { patients: Patient[] }) {
  const upcoming = [...patients]
    .filter(p => p.nextConsult)
    .sort((a, b) => a.nextConsult.localeCompare(b.nextConsult))
    .slice(0, 6);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />Upcoming Consults
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcoming.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-sm">{p.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">W{p.programWeek}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.nextConsult}</TableCell>
              </TableRow>
            ))}
            {upcoming.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-xs">No upcoming consults.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoordinatorPortal() {
  const { forCoordinator, updateTask } = useMockData();
  const view = forCoordinator();

  const { allPatients, allOrders, pendingConsults, tasks } = view;

  const toggleTask = (id: string) => {
    const t = tasks.find(t => t.id === id);
    if (t) updateTask(id, { done: !t.done });
  };

  const pending = tasks.filter(t => !t.done).length;
  const urgent  = tasks.filter(t => !t.done && t.priority === "urgent").length;
  const imm     = allPatients.filter(p => triageTier(p) === "immediate").length;
  const mon     = allPatients.filter(p => triageTier(p) === "monitor").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader
        title="Care Coordinator Portal"
        subtitle={`${pending} tasks pending · ${urgent} urgent · ${imm} immediate · ${mon} monitoring`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Patients"  value={allPatients.filter(p => p.status === "active").length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending Tasks"    value={pending}  icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Urgent"           value={urgent}   trend={urgent > 0 ? "up" : "neutral"} trendPositive={false} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Pending Consults" value={pendingConsults.length} icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="triage">
            <TabsList className="mb-5">
              <TabsTrigger value="triage">
                <AlertTriangle className="h-4 w-4 mr-2" />Triage
                {imm > 0 && <span className="ml-2 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">{imm}</span>}
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckCircle2 className="h-4 w-4 mr-2" />Tasks
                {urgent > 0 && <span className="ml-2 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">{urgent}</span>}
              </TabsTrigger>
              <TabsTrigger value="patients"><Users className="h-4 w-4 mr-2" />Patients</TabsTrigger>
              <TabsTrigger value="orders"><Package className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="triage"><TriagePanel patients={allPatients} /></TabsContent>
            <TabsContent value="tasks"><TasksPanel tasks={tasks} onToggle={toggleTask} /></TabsContent>
            <TabsContent value="patients"><PatientsPanel patients={allPatients} /></TabsContent>
            <TabsContent value="orders"><OrdersPanel orders={allOrders} allPatients={allPatients} /></TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <MessagingPanel patients={allPatients} />
          <ConsultsPanel  patients={allPatients} />
        </div>
      </div>
    </div>
  );
}
