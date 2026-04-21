/**
 * Dashboard — patient home screen
 * Data: useMockData().forPatient("patient_001")
 */

import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Bell, MessageCircle, Zap, Pill, ClipboardList, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { useMockData } from "@/contexts/MockDataContext";
import { PrescriptionBanner } from "@/components/shared/PrescriptionBanner";

// ─── Onboarding (no active journey) ─────────────────────────────────────────

function OnboardingPrompt({ firstName }: { firstName: string }) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-10">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <TrendingDown className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Laso, {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          You don't have an active treatment programme yet. Take the eligibility quiz to get started — it takes under 3 minutes.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-primary/30 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold mb-1">Weight Loss</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              GLP-1 therapy (semaglutide). Avg 14.9% body weight reduction in STEP 1 trial over 68 weeks.
            </p>
            <Button size="sm" className="w-full gap-1" asChild>
              <Link to="/quiz?program=weight_loss">Check Eligibility <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Pill className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold mb-1">Diabetes Management</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Metformin + GLP-1. Metformin lowers HbA1c by ~1.12% (95% CI: 0.92–1.32%) in clinical studies.
            </p>
            <Button size="sm" variant="outline" className="w-full gap-1" asChild>
              <Link to="/quiz?program=diabetes">Check Eligibility <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Already completed the quiz?{" "}
        <Link to="/consult" className="text-primary font-medium hover:underline">
          Book your consultation <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { forPatient } = useMockData();

  const firstName = user?.name.split(" ")[0] ?? "there";
  const patientId = user?.patientId ?? "patient_001";
  const view = forPatient(patientId);

  if (!view) return <OnboardingPrompt firstName={firstName} />;

  const { patient, programme, plan, messages } = view;
  const latestLog = view.logs[view.logs.length - 1];
  const goalKg = patient.startWeightKg - programme.targetWeightLossKg;
  const progressPct = Math.min(100, Math.round((patient.weightLostKg / programme.targetWeightLossKg) * 100));
  const latestMsg = messages[messages.length - 1];

  // Dose phase from treatment plan titration schedule
  const schedule = plan?.titrationSchedule ?? [];
  const currentDoseLine = [...schedule].reverse().find((s) => s.week <= programme.currentWeek);
  const nextDoseLine    = schedule.find((s) => s.week > programme.currentWeek);
  const dosePhasLabel   = currentDoseLine ? `${plan!.medication} ${currentDoseLine.dose}` : patient.currentDose;

  // Alerts — only surfaced from flags
  const alerts = patient.flags.map((f, i) => ({ id: `flag_${i}`, message: f }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Good morning, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-primary" />
          Week {programme.currentWeek} · {programme.name}
        </p>
      </div>

      <div className="space-y-4">
        {/* 1 — Active journey card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="bg-success/10 text-success border-success/20 text-xs">Active</Badge>
                  <span className="text-xs text-muted-foreground">
                    Week {programme.currentWeek} of {programme.totalWeeks}
                  </span>
                  <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5 gap-1">
                    <Pill className="h-3 w-3" />
                    {dosePhasLabel}
                    {nextDoseLine ? ` · next: ${nextDoseLine.dose} wk ${nextDoseLine.week}` : ""}
                  </Badge>
                </div>
                <h2 className="font-bold text-lg leading-tight">{programme.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Goal: −{programme.targetWeightLossKg} kg · Target: {goalKg.toFixed(1)} kg
                </p>
              </div>
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-1" onClick={() => navigate("/journey")}>
                View Journey <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Separator className="my-4" />
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Weight progress</span>
                <span className="font-semibold">
                  {patient.weightLostKg} kg lost ({progressPct}% of goal)
                </span>
              </div>
              <Progress value={progressPct} className="h-2.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                <span>Start: {patient.startWeightKg} kg</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  latestLog?.dosesTaken === latestLog?.dosesScheduled
                    ? "bg-success/10 text-success"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  <Pill className="h-3 w-3" />
                  {latestLog?.dosesTaken === latestLog?.dosesScheduled
                    ? "All doses taken ✓"
                    : `${latestLog?.dosesTaken ?? 0}/${latestLog?.dosesScheduled ?? 7} doses this week`}
                </span>
                <span>Target: {goalKg.toFixed(1)} kg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2 — Current step */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Current Step</span>
            </div>
            <h3 className="font-semibold text-base mb-1">Week {programme.currentWeek} Progress Check-In</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Log your weight, side effects, and how you're feeling. Your doctor will review before deciding on dose escalation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate("/journey")}>Log Progress Now</Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/support")}>Ask a Question</Button>
            </div>
          </CardContent>
        </Card>

        {/* 3 — Alerts (human-raised only) */}
        {alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Attention Required</span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between gap-4">
                    <p className="text-sm text-amber-900 leading-snug">{alert.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100"
                      onClick={() => navigate("/consult")}
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4 — Latest message */}
        {latestMsg && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest Message</span>
              </div>
              <p className="font-semibold text-sm">{latestMsg.senderName}</p>
              <p className="text-xs text-muted-foreground mb-2">{latestMsg.timestamp}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                "{latestMsg.text}"
              </p>
              <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => navigate("/support")}>
                View &amp; Reply <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 5 — Prescription banner */}
        <PrescriptionBanner compact />
      </div>
    </div>
  );
}
