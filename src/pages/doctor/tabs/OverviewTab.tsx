import { useQuery } from "@tanstack/react-query";
import { checkInService } from "@/services/checkInService";
import { bloodTestService } from "@/services/bloodTestService";
import { prescriptionService } from "@/services/prescriptionService";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Weight, Activity, Droplets, Pill, Calendar, Heart, Flag } from "lucide-react";
import type { PatientSummary } from "@/types/patient";

interface Props {
  patientId: string;
  summary: PatientSummary;
}

export default function OverviewTab({ patientId, summary }: Props) {
  const programmeId = summary.patient.programme_id;

  const { data: latestCheckIn } = useQuery({
    queryKey: ["latest-checkin", programmeId],
    queryFn: () => checkInService.getLatest(programmeId!),
    enabled: !!programmeId,
  });

  const { data: bloodTests } = useQuery({
    queryKey: ["blood-tests", programmeId],
    queryFn: () => bloodTestService.listForProgramme(programmeId!),
    enabled: !!programmeId,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ["active-prescriptions", patientId],
    queryFn: () => prescriptionService.getActive(patientId),
  });

  const latestBlood = bloodTests?.[bloodTests.length - 1];
  const activePrescription = prescriptions?.[0];

  return (
    <div className="grid grid-cols-4 gap-4 pt-4">
      <StatCard
        label="Weight Lost"
        value={summary.weight_change_kg != null ? `${Math.abs(summary.weight_change_kg)}` : "-"}
        unit="kg"
        icon={<Weight className="h-5 w-5" />}
        trend={summary.weight_change_kg && summary.weight_change_kg < 0 ? "down" : "neutral"}
        trendPositive={false}
      />
      <StatCard
        label="Current Weight"
        value={summary.latest_weight_kg ?? "-"}
        unit="kg"
        icon={<Weight className="h-5 w-5" />}
      />
      <StatCard
        label="Adherence"
        value={summary.adherence_pct}
        unit="%"
        icon={<Activity className="h-5 w-5" />}
        colorClass={summary.adherence_pct >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
      />
      <StatCard
        label="Fasting Glucose"
        value={latestCheckIn?.fasting_glucose ?? "-"}
        unit="mmol/L"
        icon={<Droplets className="h-5 w-5" />}
      />
      <StatCard
        label="Medication"
        value={activePrescription ? `${activePrescription.medication} ${activePrescription.dose_value}${activePrescription.dose_unit}` : "None"}
        icon={<Pill className="h-5 w-5" />}
      />
      <StatCard
        label="Programme Week"
        value={summary.current_week}
        icon={<Calendar className="h-5 w-5" />}
      />
      <StatCard
        label="HbA1c"
        value={latestBlood?.hba1c ?? "-"}
        unit="%"
        icon={<Heart className="h-5 w-5" />}
      />
      <StatCard
        label="Active Flags"
        value={summary.active_flags.length}
        icon={<Flag className="h-5 w-5" />}
        colorClass={summary.active_flags.length > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
      />
    </div>
  );
}
