/**
 * ConsultHub — doctor + coordinator consultation schedule
 * Data: useMockData().forDoctor("doctor_001")
 */

import { useState } from "react";
import { Video, Copy, ClipboardList, Clock, CheckCircle2, AlertCircle, FlaskConical, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { useMockData } from "@/contexts/MockDataContext";
import { cn } from "@/lib/utils";
import type { Consultation } from "@/data/mockDB";

// ─── Config maps ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-success/15 text-success border-success/30",
  "Upcoming":    "bg-blue-50 text-blue-700 border-blue-200",
  "Completed":   "bg-muted text-muted-foreground border-border",
  "No-show":     "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_STYLES: Record<string, string> = {
  "Initial":     "bg-primary/10 text-primary",
  "Follow-up":   "bg-accent/10 text-accent",
  "Dose Review": "bg-amber-50 text-amber-700",
};

const PENDING_META = {
  "write-note":   { label: "Write clinical note",         Icon: ClipboardList, color: "text-amber-600" },
  "approve-dose": { label: "Approve dose escalation",     Icon: CheckCircle2,  color: "text-primary"   },
  "review-labs":  { label: "Review uploaded lab results", Icon: FlaskConical,  color: "text-rose-600"  },
} as const;

// ─── Shared Avatar ────────────────────────────────────────────────────────────

function Avatar({ initials, colorClass }: { initials: string; colorClass: string }) {
  return (
    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0", colorClass)}>
      {initials}
    </div>
  );
}

function copyLink(url: string) { void navigator.clipboard.writeText(url); }

// ─── Today Tab ────────────────────────────────────────────────────────────────

function TodayTab({ consults, isCoordinator }: { consults: Consultation[]; isCoordinator: boolean }) {
  if (!consults.length) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No consultations scheduled for today.</p>;
  }
  return (
    <div className="space-y-3">
      {consults.map((c) => (
        <Card key={c.id} className={cn("transition-shadow hover:shadow-md", c.status === "In Progress" && "border-success ring-1 ring-success/30")}>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar initials={c.patientInitials} colorClass={c.patientColorClass} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{c.patientName}</span>
                <Badge variant="outline" className={cn("text-xs", TYPE_STYLES[c.type])}>{c.type}</Badge>
                {c.status === "In Progress" && (
                  <Badge className="bg-success text-white text-xs gap-1 animate-pulse">🟢 Live</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Clock className="inline h-3 w-3 mr-1" />{c.time} · {c.durationMin} min
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[c.status])}>{c.status}</Badge>
              <Button
                size="sm"
                variant={c.status === "In Progress" ? "default" : "outline"}
                disabled={c.status !== "In Progress"}
                className="gap-1.5"
                asChild={c.status === "In Progress"}
              >
                {c.status === "In Progress" ? (
                  <a href={c.zoomUrl} target="_blank" rel="noreferrer">
                    <Video className="h-3.5 w-3.5" />Join Now
                  </a>
                ) : (
                  <span><Video className="h-3.5 w-3.5" />Join Now</span>
                )}
              </Button>
              <Button size="icon" variant="ghost" title="Copy Zoom link" onClick={() => copyLink(c.zoomUrl)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {isCoordinator && (
                <Button size="sm" variant="outline" className="text-xs">Escalate</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Upcoming Tab ─────────────────────────────────────────────────────────────

function UpcomingTab({ consults }: { consults: Consultation[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Zoom</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {consults.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar initials={c.patientInitials} colorClass={c.patientColorClass} />
                <span className="font-medium text-sm">{c.patientName}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-xs", TYPE_STYLES[c.type])}>{c.type}</Badge>
            </TableCell>
            <TableCell className="text-sm">{c.date}</TableCell>
            <TableCell className="text-sm">{c.time}</TableCell>
            <TableCell className="text-sm">{c.durationMin} min</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => copyLink(c.zoomUrl)}>
                <Link2 className="h-3 w-3" />Copy link
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Completed Tab ────────────────────────────────────────────────────────────

function CompletedTab({ consults }: { consults: Consultation[] }) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Consultation | null>(null);

  const filtered = consults.filter((c) =>
    c.patientName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search by patient name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(c)}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar initials={c.patientInitials} colorClass={c.patientColorClass} />
                  <span className="font-medium text-sm">{c.patientName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", TYPE_STYLES[c.type])}>{c.type}</Badge>
              </TableCell>
              <TableCell className="text-sm">{c.date}</TableCell>
              <TableCell className="text-sm">{c.durationMin} min</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[c.status])}>{c.status}</Badge>
              </TableCell>
              <TableCell>
                {c.noteWritten
                  ? <CheckCircle2 className="h-4 w-4 text-success" />
                  : <AlertCircle  className="h-4 w-4 text-amber-500" />
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                  <Avatar initials={selected.patientInitials} colorClass={selected.patientColorClass} />
                  <div>
                    <SheetTitle>{selected.patientName}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selected.date} · {selected.time}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-xs", TYPE_STYLES[selected.type])}>{selected.type}</Badge>
                  <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[selected.status])}>{selected.status}</Badge>
                  <span className="text-muted-foreground">{selected.durationMin} min</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Clinical Note</p>
                  {selected.noteSummary
                    ? <p className="text-muted-foreground leading-relaxed">{selected.noteSummary}</p>
                    : (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-700 text-xs">
                        No note written yet. Write a note from the Patient Panel.
                      </div>
                    )
                  }
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Pending Actions Tab ──────────────────────────────────────────────────────

function PendingTab({ consults, isCoordinator }: { consults: Consultation[]; isCoordinator: boolean }) {
  const pending = consults.filter((c) => c.pendingAction);
  if (!pending.length) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No pending actions 🎉</p>;
  }
  return (
    <div className="space-y-3">
      {pending.map((c) => {
        const meta = PENDING_META[c.pendingAction!];
        return (
          <Card key={c.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <meta.Icon className={cn("h-4 w-4", meta.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{meta.label} — {c.patientName}</p>
                <p className="text-xs text-muted-foreground">{c.date} · {c.type}</p>
              </div>
              <div className="flex-shrink-0">
                {isCoordinator && c.pendingAction === "approve-dose"
                  ? <Button size="sm" variant="outline">Escalate to Doctor</Button>
                  : <Button size="sm" variant="outline">Action</Button>
                }
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultHub() {
  const { user, isRole } = useUser();
  const { forDoctor } = useMockData();

  const isCoordinator = isRole("coordinator");
  const doctorId = user?.doctorId ?? "doctor_001";
  const view = forDoctor(doctorId);

  // Coordinator sees all; doctor sees own
  const today     = view?.todayConsults     ?? [];
  const upcoming  = view?.upcomingConsults  ?? [];
  const completed = view?.completedConsults ?? [];
  const allConsults = view?.consults        ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader
        title="My Consultations"
        subtitle={
          isCoordinator
            ? "Manage and join your scheduled patient video consultations"
            : "Your patient consultation schedule and history"
        }
      />
      <Tabs defaultValue="today">
        <TabsList className="mb-6">
          <TabsTrigger value="today">
            Today
            {today.length > 0 && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                {today.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {allConsults.filter((c) => c.pendingAction).length > 0 && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                {allConsults.filter((c) => c.pendingAction).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodayTab consults={today} isCoordinator={isCoordinator} />
        </TabsContent>
        <TabsContent value="upcoming">
          <UpcomingTab consults={upcoming} />
        </TabsContent>
        <TabsContent value="completed">
          <CompletedTab consults={completed} />
        </TabsContent>
        <TabsContent value="pending">
          <PendingTab consults={allConsults} isCoordinator={isCoordinator} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
