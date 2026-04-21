import type { WeeklySnapshot } from "@/data/patientJourney";

export interface PlateauResult {
  isPlateau: boolean;
  plateauStartWeek: number | null;
  plateauDurationWeeks: number;
  avgWeeklyLoss: number;
  recommendation: string | null;
  severity: "none" | "mild" | "moderate" | "severe";
}

const PLATEAU_THRESHOLD_KG = 0.3; // less than 0.3 kg/week = plateau
const PLATEAU_CONSECUTIVE_WEEKS = 2; // must persist 2+ weeks

export function detectPlateau(weeks: WeeklySnapshot[]): PlateauResult {
  if (weeks.length < 3) {
    return { isPlateau: false, plateauStartWeek: null, plateauDurationWeeks: 0, avgWeeklyLoss: 0, recommendation: null, severity: "none" };
  }

  // Find plateau: consecutive weeks with loss < threshold
  let plateauStart: number | null = null;
  let plateauDuration = 0;
  let maxDuration = 0;
  let maxStart: number | null = null;

  for (let i = 1; i < weeks.length; i++) {
    const loss = Math.abs(weeks[i].weightChange);
    if (loss < PLATEAU_THRESHOLD_KG) {
      if (plateauStart === null) plateauStart = weeks[i].week;
      plateauDuration++;
      if (plateauDuration > maxDuration) {
        maxDuration = plateauDuration;
        maxStart = plateauStart;
      }
    } else {
      plateauStart = null;
      plateauDuration = 0;
    }
  }

  const isPlateau = maxDuration >= PLATEAU_CONSECUTIVE_WEEKS;

  // Calculate average weekly loss across all weeks
  const totalLoss = weeks[0].weight - weeks[weeks.length - 1].weight;
  const avgWeeklyLoss = parseFloat((totalLoss / weeks.length).toFixed(2));

  let severity: PlateauResult["severity"] = "none";
  let recommendation: string | null = null;

  if (isPlateau) {
    if (maxDuration >= 4) {
      severity = "severe";
      recommendation = "Plateau persisting > 4 weeks — urgent dose escalation review recommended";
    } else if (maxDuration >= 3) {
      severity = "moderate";
      recommendation = "Plateau detected for 3 weeks — schedule consultation with Dr. Sharma";
    } else {
      severity = "mild";
      recommendation = "Early plateau detected — review diet adherence and activity levels";
    }
  }

  return {
    isPlateau,
    plateauStartWeek: maxStart,
    plateauDurationWeeks: maxDuration,
    avgWeeklyLoss,
    recommendation,
    severity,
  };
}
