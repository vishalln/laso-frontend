import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BloodTest } from "@/types/bloodTest";

interface BloodTestResultsProps {
  results: BloodTest;
  gender?: string;
}

interface LabRange {
  label: string;
  unit: string;
  low: number;
  high: number;
  borderLow?: number;
  borderHigh?: number;
}

const LAB_RANGES: Record<string, LabRange> = {
  hba1c: { label: "HbA1c", unit: "%", low: 4.0, high: 5.6, borderHigh: 6.4 },
  fasting_glucose: { label: "Fasting Glucose", unit: "mg/dL", low: 70, high: 99, borderHigh: 125 },
  total_cholesterol: { label: "Total Cholesterol", unit: "mg/dL", low: 0, high: 200, borderHigh: 239 },
  ldl: { label: "LDL", unit: "mg/dL", low: 0, high: 100, borderHigh: 159 },
  hdl: { label: "HDL", unit: "mg/dL", low: 40, high: 200 },
  triglycerides: { label: "Triglycerides", unit: "mg/dL", low: 0, high: 150, borderHigh: 199 },
  alt: { label: "ALT", unit: "U/L", low: 7, high: 56 },
  ast: { label: "AST", unit: "U/L", low: 10, high: 40 },
  creatinine: { label: "Creatinine", unit: "mg/dL", low: 0.7, high: 1.3 },
  egfr: { label: "eGFR", unit: "mL/min", low: 90, high: 200 },
};

function getStatus(value: number, range: LabRange): "normal" | "borderline" | "high" | "low" {
  if (value < range.low) return "low";
  if (range.borderHigh && value > range.high && value <= range.borderHigh) return "borderline";
  if (value > (range.borderHigh ?? range.high)) return "high";
  if (range.borderLow && value < range.low && value >= range.borderLow) return "borderline";
  return "normal";
}

const STATUS_COLORS: Record<string, string> = {
  normal: "bg-green-100 text-green-800 border-green-200",
  borderline: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
  low: "bg-red-100 text-red-800 border-red-200",
};

export function BloodTestResults({ results, gender }: BloodTestResultsProps) {
  const labKeys = Object.keys(LAB_RANGES) as Array<keyof typeof LAB_RANGES>;

  const entries = labKeys
    .filter((key) => results[key as keyof BloodTest] != null)
    .map((key) => {
      const value = results[key as keyof BloodTest] as number;
      const range = LAB_RANGES[key];
      const status = getStatus(value, range);
      return { key, value, range, status };
    });

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No lab results available yet.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(({ key, value, range, status }) => (
        <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div>
            <p className="text-sm font-medium">{range.label}</p>
            <p className="text-xs text-muted-foreground">{range.unit}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{value}</span>
            <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[status])}>
              {status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
