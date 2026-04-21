import type { WeeklySnapshot } from "@/data/patientJourney";
import type { AdherenceResult } from "./adherenceEngine";

export interface MetabolicScore {
  total: number; // 0-100
  components: {
    weightLoss: number;      // 0-30
    glucoseControl: number;  // 0-25
    adherence: number;       // 0-25
    sideEffects: number;     // 0-20
  };
  grade: "A" | "B" | "C" | "D" | "F";
  trend: "improving" | "stable" | "declining";
  interpretation: string;
}

export function calculateMetabolicScore(
  weeks: WeeklySnapshot[],
  adherence: AdherenceResult
): MetabolicScore {
  if (weeks.length === 0) {
    return {
      total: 0,
      components: { weightLoss: 0, glucoseControl: 0, adherence: 0, sideEffects: 0 },
      grade: "F",
      trend: "stable",
      interpretation: "Insufficient data",
    };
  }

  const firstWeek = weeks[0];
  const lastWeek = weeks[weeks.length - 1];

  // Weight loss component (0-30): max score at ≥8% loss
  const weightLossPct = ((firstWeek.weight - lastWeek.weight) / firstWeek.weight) * 100;
  const weightLossScore = Math.min(30, Math.round((weightLossPct / 8) * 30));

  // Glucose control component (0-25): based on fasting glucose reduction
  const glucoseReduction = firstWeek.fastingGlucose - lastWeek.fastingGlucose;
  const glucoseScore = Math.min(25, Math.max(0, Math.round((glucoseReduction / 50) * 25)));

  // Adherence component (0-25)
  const adherenceScore = Math.round((adherence.score / 100) * 25);

  // Side effect burden component (0-20): fewer/milder = higher score
  const avgSeverity = weeks.length > 0
    ? weeks.reduce((acc, w) => {
        const total = w.sideEffects.reduce((s, e) => s + e.severity, 0);
        return acc + total;
      }, 0) / weeks.length
    : 0;
  const sideEffectScore = Math.round(Math.max(0, 20 - avgSeverity * 4));

  const total = weightLossScore + glucoseScore + adherenceScore + sideEffectScore;

  let grade: MetabolicScore["grade"];
  if (total >= 85) grade = "A";
  else if (total >= 70) grade = "B";
  else if (total >= 55) grade = "C";
  else if (total >= 40) grade = "D";
  else grade = "F";

  // Trend: compare last 4 weeks vs previous 4
  let trend: MetabolicScore["trend"] = "stable";
  if (weeks.length >= 8) {
    const recent = weeks.slice(-4);
    const prior = weeks.slice(-8, -4);
    const recentLoss = prior[0].weight - recent[recent.length - 1].weight;
    const priorLoss = weeks[weeks.length - 8].weight - prior[prior.length - 1].weight;
    if (recentLoss > priorLoss + 0.2) trend = "improving";
    else if (recentLoss < priorLoss - 0.2) trend = "declining";
  }

  const interpretation =
    grade === "A" ? "Excellent metabolic response — on track for clinical targets" :
    grade === "B" ? "Good response — minor optimisations can improve outcomes further" :
    grade === "C" ? "Moderate response — consider reviewing adherence and diet" :
    grade === "D" ? "Suboptimal response — clinical review recommended" :
    "Poor metabolic response — urgent intervention needed";

  return {
    total,
    components: {
      weightLoss: weightLossScore,
      glucoseControl: glucoseScore,
      adherence: adherenceScore,
      sideEffects: sideEffectScore,
    },
    grade,
    trend,
    interpretation,
  };
}
