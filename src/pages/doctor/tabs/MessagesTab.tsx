import { ChatThread } from "@/components/shared/ChatThread";

interface Props {
  patientId: string;
}

export default function MessagesTab({ patientId }: Props) {
  return (
    <div className="pt-4 h-[600px]">
      <ChatThread patientId={patientId} />
    </div>
  );
}
