/**
 * Consult — patient consultation booking + clinical documents
 * Data: useMockData().forPatient("patient_001")
 */

import { useState } from "react";
import { Calendar, Clock, Video, MessageSquare, Star, CheckCircle2, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { PrescriptionBanner } from "@/components/shared/PrescriptionBanner";
import { useMockData } from "@/contexts/MockDataContext";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import type { DoctorProfile } from "@/data/mockDB";

const TIMES = ["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"];
const DATES = [
  { label: "Mon, Apr 28", value: "2026-04-28" },
  { label: "Tue, Apr 29", value: "2026-04-29" },
  { label: "Wed, Apr 30", value: "2026-04-30" },
  { label: "Thu, May 1",  value: "2026-05-01" },
  { label: "Fri, May 2",  value: "2026-05-02" },
];

// ─── Doctor card ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, selected, onSelect }: {
  doctor: DoctorProfile; selected: boolean; onSelect: () => void;
}) {
  return (
    <Card
      className={cn("cursor-pointer transition-all hover:shadow-md", selected && "border-primary ring-2 ring-primary/20")}
      onClick={onSelect}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0", doctor.colorClass)}>
            {doctor.imageInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{doctor.name}</h3>
              {doctor.glp1Certified && (
                <Badge className="bg-success/10 text-success border-success/20 text-xs">GLP-1 Certified</Badge>
              )}
              {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">{doctor.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{doctor.hospital} · {doctor.city}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {doctor.rating} ({doctor.reviewCount} reviews)
              </span>
              <span className="text-muted-foreground">{doctor.experienceYears} yrs exp.</span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {doctor.languages.map((l) => (
                <span key={l} className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">{l}</span>
              ))}
              {doctor.specialisation.slice(0, 2).map((s) => (
                <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-foreground">₹{doctor.consultFeeINR.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per session</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Booking flow ─────────────────────────────────────────────────────────────

function BookingFlow({ doctors }: { doctors: DoctorProfile[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate,   setSelectedDate]   = useState<string | null>(null);
  const [selectedTime,   setSelectedTime]   = useState<string | null>(null);
  const [mode,           setMode]           = useState<"video" | "async">("video");
  const [booked,         setBooked]         = useState(false);

  const canBook = selectedDoctor && selectedDate && selectedTime;
  const activeDoctors = doctors.filter((d) => d.status === "active");

  if (booked) {
    const doc = doctors.find((d) => d.id === selectedDoctor);
    return (
      <div className="text-center py-12">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Consultation booked!</h2>
        <p className="text-muted-foreground mb-6">
          {doc?.name} · {DATES.find((d) => d.value === selectedDate)?.label} at {selectedTime} ·{" "}
          {mode === "video" ? "Video call" : "Async / text"}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
          You'll receive a confirmation via email and SMS. A Laso care coordinator will send you a pre-consultation guide within 2 hours.
        </p>
        <Button onClick={() => setBooked(false)} variant="outline">Book another</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4">Choose your doctor</h3>
        <div className="grid gap-4">
          {activeDoctors.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              selected={selectedDoctor === d.id}
              onSelect={() => setSelectedDoctor(d.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Consultation type</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "video" as const,  icon: Video,          label: "Video call",     desc: "Live 20–30 min session" },
            { value: "async" as const,  icon: MessageSquare,  label: "Async / text",   desc: "Doctor replies within 4 hrs" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all",
                mode === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <opt.icon className={cn("h-5 w-5", mode === opt.value ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Select date</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DATES.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                selectedDate === d.value
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:border-primary/50",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="font-semibold mb-3">Select time</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                  selectedTime === t
                    ? "border-primary bg-primary text-white"
                    : "border-border hover:border-primary/50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!canBook}
        onClick={() => canBook && setBooked(true)}
      >
        Confirm booking <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Clinical documents tab ───────────────────────────────────────────────────

function ClinicalDocuments({ patientId }: { patientId: string }) {
  const { forPatient } = useMockData();
  const view = forPatient(patientId);
  if (!view) return null;

  const { plan, prescription, notes, doctor } = view;

  return (
    <div className="space-y-6">
      <PrescriptionBanner />

      {/* Treatment Plan */}
      {plan && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Treatment Plan v{plan.version}</p>
                  <p className="text-xs text-muted-foreground">{doctor.name} · {plan.createdDate}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Medication:</span>{" "}
                <span className="font-medium">{plan.medication} — {plan.dose} · {plan.frequency}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Diagnosis:</span>{" "}
                <span className="font-medium">{plan.diagnosis.join(", ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Next follow-up:</span>{" "}
                <span className="font-medium">{plan.followUpDate}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription */}
      {prescription && (
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Digital Prescription</p>
                <p className="text-xs text-muted-foreground">
                  Rx #{prescription.id} · {doctor.name} · {prescription.date}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Download</Button>
          </CardContent>
        </Card>
      )}

      {/* Doctor Notes */}
      {notes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Doctor Notes</h3>
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{note.subject}</p>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{note.body}</p>
                  <Badge className="mt-2 bg-muted text-muted-foreground text-xs">{note.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Consult() {
  const { user } = useUser();
  const { forAdmin } = useMockData();
  const patientId = user?.patientId ?? "patient_001";
  const { allDoctors } = forAdmin();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader
        title="Consult"
        subtitle="Book a consultation with a specialist or view your clinical documents"
      />
      <Tabs defaultValue="book">
        <TabsList className="mb-6">
          <TabsTrigger value="book">
            <Calendar className="h-4 w-4 mr-2" />Book Consultation
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Clock className="h-4 w-4 mr-2" />Clinical Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="book">
          <BookingFlow doctors={allDoctors} />
        </TabsContent>
        <TabsContent value="docs">
          <ClinicalDocuments patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
