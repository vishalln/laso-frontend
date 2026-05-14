import { useQuery } from "@tanstack/react-query";
import { checkInService } from "@/services/checkInService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";

interface Props {
  patientId: string;
  programmeId?: string;
}

export default function ProgressTab({ patientId, programmeId }: Props) {
  const { data: checkIns, isLoading } = useQuery({
    queryKey: ["checkins-progress", programmeId],
    queryFn: () => checkInService.listForProgramme(programmeId!),
    enabled: !!programmeId,
  });

  if (isLoading) return <div className="space-y-4 pt-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;
  if (!checkIns?.length) return <EmptyState title="No check-in data" description="Progress charts will appear once the patient submits check-ins." />;

  const weightData = checkIns.map((c) => ({ week: `W${c.week_number}`, weight: c.weight_kg }));
  const glucoseData = checkIns.filter((c) => c.fasting_glucose != null).map((c) => ({ week: `W${c.week_number}`, glucose: c.fasting_glucose }));
  const adherenceData = checkIns.map((c) => ({ week: `W${c.week_number}`, doses: c.doses_taken }));

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Weight Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Fasting Glucose</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={glucoseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <ReferenceLine y={5.6} stroke="#22c55e" strokeDasharray="3 3" label="Normal" />
              <ReferenceLine y={7.0} stroke="#ef4444" strokeDasharray="3 3" label="High" />
              <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly Adherence (Doses Taken)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={adherenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="doses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
