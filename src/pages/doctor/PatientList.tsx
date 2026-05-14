import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import { useUser } from "@/contexts/UserContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, TrendingDown, Activity, Search } from "lucide-react";
import type { PatientSummary } from "@/types/patient";

type FilterType = "all" | "review_needed" | "plateau" | "adherence_risk" | "urgent";

export default function PatientList() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: patients, isLoading } = useQuery({
    queryKey: ["doctor-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  const { data: summaries } = useQuery({
    queryKey: ["doctor-patient-summaries", patients?.map((p) => p.id)],
    queryFn: async () => {
      if (!patients) return [];
      return Promise.all(patients.map((p) => patientService.getSummary(p.id)));
    },
    enabled: !!patients?.length,
  });

  const stats = useMemo(() => {
    if (!summaries) return { total: 0, needReview: 0, urgent: 0, adherenceRisk: 0 };
    return {
      total: summaries.length,
      needReview: summaries.filter((s) => s.active_flags.some((f) => f.flag_type === "review_needed")).length,
      urgent: summaries.filter((s) => s.active_flags.some((f) => f.flag_type === "urgent")).length,
      adherenceRisk: summaries.filter((s) => s.adherence_pct < 70).length,
    };
  }, [summaries]);

  const filtered = useMemo(() => {
    if (!summaries) return [];
    let list = summaries;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.patient.name.toLowerCase().includes(q));
    }

    if (filter === "review_needed") list = list.filter((s) => s.active_flags.some((f) => f.flag_type === "review_needed"));
    else if (filter === "plateau") list = list.filter((s) => s.active_flags.some((f) => f.flag_type === "plateau"));
    else if (filter === "adherence_risk") list = list.filter((s) => s.adherence_pct < 70);
    else if (filter === "urgent") list = list.filter((s) => s.active_flags.some((f) => f.flag_type === "urgent"));

    return list;
  }, [summaries, search, filter]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Patients</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={stats.total} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Need Review" value={stats.needReview} icon={<Activity className="h-5 w-5" />} colorClass="bg-amber-100 text-amber-700" />
        <StatCard label="Urgent" value={stats.urgent} icon={<AlertTriangle className="h-5 w-5" />} colorClass="bg-red-100 text-red-700" />
        <StatCard label="Adherence Risk" value={stats.adherenceRisk} icon={<TrendingDown className="h-5 w-5" />} colorClass="bg-orange-100 text-orange-700" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <RadioGroup value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="flex gap-4">
          {[["all", "All"], ["review_needed", "Review Needed"], ["plateau", "Plateau"], ["adherence_risk", "Adherence Risk"], ["urgent", "Urgent"]].map(([v, l]) => (
            <div key={v} className="flex items-center gap-1.5">
              <RadioGroupItem value={v} id={v} />
              <Label htmlFor={v} className="text-sm cursor-pointer">{l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No patients found" description="Try adjusting your search or filter." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Week</th>
                  <th className="text-left p-3 font-medium">Weight Lost</th>
                  <th className="text-left p-3 font-medium">Adherence</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <PatientRow key={s.patient.id} summary={s} onClick={() => navigate(`/doctor/patients/${s.patient.id}`)} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PatientRow({ summary, onClick }: { summary: PatientSummary; onClick: () => void }) {
  const mainFlag = summary.active_flags[0]?.flag_type ?? "on_track";
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={onClick}>
      <td className="p-3 font-medium">{summary.patient.name}</td>
      <td className="p-3">Week {summary.current_week}</td>
      <td className="p-3">{summary.weight_change_kg != null ? `${summary.weight_change_kg} kg` : "-"}</td>
      <td className="p-3">{summary.adherence_pct}%</td>
      <td className="p-3"><StatusBadge status={mainFlag} /></td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
