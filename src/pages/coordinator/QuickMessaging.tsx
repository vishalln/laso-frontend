import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { useUser } from "@/contexts/UserContext";
import { ChatThread } from "@/components/shared/ChatThread";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";

const TEMPLATES = [
  { label: "Missed Dose", text: "Hi, we noticed you may have missed your dose. Please remember to take it as soon as possible, or let us know if you need help." },
  { label: "No Check-in", text: "Hi, we haven't received your weekly check-in yet. Please complete it when you have a moment so we can track your progress." },
  { label: "Weight Stalled", text: "Hi, we noticed your weight has plateaued. This is common and we can adjust your plan. Let's discuss at your next consultation." },
  { label: "Nausea Support", text: "Hi, nausea is a common side effect that usually improves over time. Try eating smaller, bland meals and stay hydrated. Let us know if it persists." },
];

export default function QuickMessaging() {
  const { user } = useUser();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [templateText, setTemplateText] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["coordinator-all-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quick Messaging</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a patient..." />
            </SelectTrigger>
            <SelectContent>
              {patients?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Templates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.label}
                  size="sm"
                  variant="outline"
                  onClick={() => setTemplateText(t.text)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" /> {t.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="h-[500px]">
            <ChatThread patientId={selectedPatient} initialMessage={templateText} />
          </div>
        </>
      )}

      {!selectedPatient && (
        <EmptyState title="Select a patient" description="Choose a patient from the dropdown above to start messaging." />
      )}
    </div>
  );
}
