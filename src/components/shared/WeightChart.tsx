import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

interface WeightChartProps {
  data: { week: number; weight: number }[];
  targetWeight?: number;
  variant: "sparkline" | "full";
}

export function WeightChart({ data, targetWeight, variant }: WeightChartProps) {
  if (variant === "sparkline") {
    return (
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="week"
          label={{ value: "Week", position: "insideBottom", offset: -5 }}
          className="text-xs"
        />
        <YAxis
          domain={["dataMin - 2", "dataMax + 2"]}
          label={{ value: "kg", angle: -90, position: "insideLeft" }}
          className="text-xs"
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
          formatter={(value: number) => [`${value} kg`, "Weight"]}
          labelFormatter={(week) => `Week ${week}`}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="hsl(var(--destructive))"
            strokeDasharray="5 5"
            label={{ value: `Target: ${targetWeight}kg`, position: "right", fontSize: 11 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
