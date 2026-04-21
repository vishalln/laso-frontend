import type { WeeklySnapshot } from "@/data/patientJourney";
import type { AdherenceResult } from "./adherenceEngine";
import type { PlateauResult } from "./plateauEngine";

export type InsightSeverity = "critical" | "warning" | "info" | "positive";

export interface ClinicalInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  action: string | null;
  week: number | null;
}

export function generateInsights(
  weeks: WeeklySnapshot[],
  adherence: AdherenceResult,
  plateau: PlateauResult
): ClinicalInsight[] {
  const insights: ClinicalInsight[] = [];
  if (weeks.length === 0) return insights;

  const latest = weeks[weeks.length - 1];
  const first = weeks[0];

  // Adherence alerts
  if (adherence.score < 60) {
    insights.push({
      id: "adherence-poor",
      severity: "critical",
      title: "Critical adherence gap",
      detail: `${adherence.missedDoses} doses missed — efficacy is significantly compromised below 70% adherence`,
      action: "Escalate to care coordinator",
      week: latest.week,
    });
  } else if (adherence.score < 80) {
    insights.push({
      id: "adherence-fair",
      severity: "warning",
      title: "Adherence dip detected",
      detail: `${adherence.missedDoses} doses missed this cycle — set daily reminders to maintain efficacy`,
      action: "Send adherence nudge",
      week: latest.week,
    });
  }

  // Plateau alerts
  if (plateau.isPlateau) {
    insights.push({
      id: `plateau-${plateau.plateauStartWeek}`,
      severity: plateau.severity === "severe" ? "critical" : "warning",
      title: `Weight plateau — week ${plateau.plateauStartWeek}`,
      detail: plateau.recommendation ?? "Weight stagnating — clinical review recommended",
      action: "Book consultation",
      week: plateau.plateauStartWeek,
    });
  }

  // Glucose improvement
  const glucoseImprovement = first.fastingGlucose - latest.fastingGlucose;
  if (glucoseImprovement > 30) {
    insights.push({
      id: "glucose-improvement",
      severity: "positive",
      title: "Strong glucose response",
      detail: `Fasting glucose reduced by ${glucoseImprovement} mg/dL — excellent glycaemic benefit`,
      action: null,
      week: latest.week,
    });
  }

  // HbA1c improvement (compare available readings)
  const hba1cReadings = weeks.filter(w => w.hba1c !== null);
  if (hba1cReadings.length >= 2) {
    const firstHbA1c = hba1cReadings[0].hba1c!;
    const latestHbA1c = hba1cReadings[hba1cReadings.length - 1].hba1c!;
    if (latestHbA1c < firstHbA1c - 0.5) {
      insights.push({
        id: "hba1c-improvement",
        severity: "positive",
        title: "HbA1c improvement confirmed",
        detail: `HbA1c dropped from ${firstHbA1c}% to ${latestHbA1c}% — clinically significant improvement`,
        action: null,
        week: latest.week,
      });
    }
  }

  // Side effect severity
  const latestSevere = latest.sideEffects.filter(s => s.severity === 3);
  if (latestSevere.length > 0) {
    insights.push({
      id: "severe-side-effects",
      severity: "critical",
      title: "Severe side effects reported",
      detail: `Severe ${latestSevere.map(s => s.symptom).join(", ")} — immediate clinical review required`,
      action: "Emergency consultation",
      week: latest.week,
    });
  }

  // Weight loss milestones
  const totalLossKg = first.weight - latest.weight;
  const lossPercent = (totalLossKg / first.weight) * 100;
  if (lossPercent >= 5) {
    insights.push({
      id: "milestone-5pct",
      severity: "positive",
      title: `${lossPercent.toFixed(1)}% body weight lost`,
      detail: `${totalLossKg.toFixed(1)} kg total — crossed clinical threshold for metabolic benefit`,
      action: null,
      week: latest.week,
    });
  }

  // High appetite / cravings
  if (latest.appetite.hungerLevel >= 4 && latest.appetite.cravings >= 4) {
    insights.push({
      id: "appetite-high",
      severity: "warning",
      title: "Appetite suppression weakening",
      detail: "Hunger and cravings elevated — may indicate sub-therapeutic drug levels",
      action: "Review dose timing",
      week: latest.week,
    });
  }

  return insights.sort((a, b) => {
    const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };
    return order[a.severity] - order[b.severity];
  });
}
