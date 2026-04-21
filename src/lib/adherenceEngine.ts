import type { WeeklySnapshot } from "@/data/patientJourney";

export interface AdherenceResult {
  score: number; // 0-100
  level: "Excellent" | "Good" | "Fair" | "Poor";
  color: "success" | "warning" | "destructive";
  missedDoses: number;
  consecutivePerfectWeeks: number;
  riskFlag: boolean;
  insight: string;
}

export function calculateAdherenceScore(weeks: WeeklySnapshot[]): AdherenceResult {
  if (weeks.length === 0) {
    return { score: 0, level: "Poor", color: "destructive", missedDoses: 0, consecutivePerfectWeeks: 0, riskFlag: true, insight: "No data available" };
  }

  const totalDoses = weeks.reduce((acc, w) => acc + w.dosesScheduled, 0);
  const takenDoses = weeks.reduce((acc, w) => acc + w.dosesTaken, 0);
  const missedDoses = totalDoses - takenDoses;
  const rawScore = (takenDoses / totalDoses) * 100;

  // Count consecutive perfect weeks from most recent
  let consecutivePerfectWeeks = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].dosesTaken === weeks[i].dosesScheduled) {
      consecutivePerfectWeeks++;
    } else break;
  }

  // Weight recent weeks more heavily (last 4 weeks = 60% of score)
  const recentWeeks = weeks.slice(-4);
  const recentTotal = recentWeeks.reduce((acc, w) => acc + w.dosesScheduled, 0);
  const recentTaken = recentWeeks.reduce((acc, w) => acc + w.dosesTaken, 0);
  const recentScore = recentTotal > 0 ? (recentTaken / recentTotal) * 100 : rawScore;

  const score = parseFloat((rawScore * 0.4 + recentScore * 0.6).toFixed(0));

  let level: AdherenceResult["level"];
  let color: AdherenceResult["color"];
  let insight: string;

  if (score >= 90) {
    level = "Excellent";
    color = "success";
    insight = "Outstanding adherence — maximising treatment efficacy";
  } else if (score >= 75) {
    level = "Good";
    color = "success";
    insight = "Good adherence — minor gaps detected, maintain routine";
  } else if (score >= 60) {
    level = "Fair";
    color = "warning";
    insight = `${missedDoses} missed doses detected — consider setting daily reminders`;
  } else {
    level = "Poor";
    color = "destructive";
    insight = "Significant adherence issues — escalation recommended";
  }

  const riskFlag = score < 70 || missedDoses >= 3;

  return { score, level, color, missedDoses, consecutivePerfectWeeks, riskFlag, insight };
}
