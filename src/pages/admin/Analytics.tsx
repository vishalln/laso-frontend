import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function ChartSkeleton() {
  return <Skeleton className="h-[250px] w-full" />;
}

export default function Analytics() {
  const { data: enrolment, isLoading: l1 } = useQuery({ queryKey: ["analytics", "enrolment"], queryFn: analyticsService.enrolment });
  const { data: weight, isLoading: l2 } = useQuery({ queryKey: ["analytics", "weightByWeek"], queryFn: analyticsService.weightByWeek });
  const { data: adherence, isLoading: l3 } = useQuery({ queryKey: ["analytics", "adherenceTrend"], queryFn: analyticsService.adherenceTrend });
  const { data: status, isLoading: l4 } = useQuery({ queryKey: ["analytics", "statusDistribution"], queryFn: analyticsService.statusDistribution });
  const { data: glucose, isLoading: l5 } = useQuery({ queryKey: ["analytics", "glucoseTrend"], queryFn: analyticsService.glucoseTrend });
  const { data: sideEffects, isLoading: l6 } = useQuery({ queryKey: ["analytics", "sideEffects"], queryFn: analyticsService.sideEffects });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Enrolment */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Enrolment</CardTitle></CardHeader>
          <CardContent>{l1 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={enrolment}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>

        {/* Weight by Week */}
        <Card>
          <CardHeader><CardTitle className="text-base">Avg Weight Lost by Week</CardTitle></CardHeader>
          <CardContent>{l2 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weight}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /><Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>

        {/* Adherence Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Adherence Trend</CardTitle></CardHeader>
          <CardContent>{l3 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={adherence}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /><Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Patient Status Distribution</CardTitle></CardHeader>
          <CardContent>{l4 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={status} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={100} strokeWidth={2}>{status?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /></PieChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>

        {/* Glucose Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fasting Glucose Trend</CardTitle></CardHeader>
          <CardContent>{l5 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucose}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /><ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label="Upper" /><ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label="Lower" /><Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>

        {/* Side Effects */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Side Effects</CardTitle></CardHeader>
          <CardContent>{l6 ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sideEffects} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} /><Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} /><Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} /></BarChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>
      </div>
    </div>
  );
}
