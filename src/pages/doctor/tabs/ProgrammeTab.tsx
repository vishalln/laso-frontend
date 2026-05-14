import { ProgramTimeline } from "@/components/shared/ProgramTimeline";
import { EmptyState } from "@/components/shared/EmptyState";

interface Props {
  patientId: string;
  programmeId?: string;
}

export default function ProgrammeTab({ patientId, programmeId }: Props) {
  if (!programmeId) {
    return <EmptyState title="No active programme" description="This patient has not been enrolled in a programme yet." />;
  }

  return (
    <div className="pt-4">
      <ProgramTimeline programmeId={programmeId} mode="full" showControls={true} />
    </div>
  );
}
