import { useMemo } from "react";
import { calculateAdherenceScore } from "@/lib/adherenceEngine";
import { detectPlateau } from "@/lib/plateauEngine";
import { calculateMetabolicScore } from "@/lib/metabolicScoreEngine";
import { generateInsights } from "@/lib/insightEngine";
import { weeklyData, expectedWeightCurve, patientProfile } from "@/data/patientJourney";
import type { AdherenceResult } from "@/lib/adherenceEngine";
import type { PlateauResult } from "@/lib/plateauEngine";
import type { MetabolicScore } from "@/lib/metabolicScoreEngine";
import type { ClinicalInsight } from "@/lib/insightEngine";

export interface ChartDataPoint {
  week: number;
  weight: number;
  expected: number;
  glucose: number;
  adherencePct: number;
}

export interface PatientAnalytics {
  adherence: AdherenceResult;
  plateau: PlateauResult;
  metabolicScore: MetabolicScore;
  insights: ClinicalInsight[];
  chartData: ChartDataPoint[];
  totalWeightLostKg: number;
  totalWeightLostPct: number;
  currentWeight: number;
  currentHbA1c: number | null;
  weeklyAvgLoss: number;
  programWeek: number;
}

export function usePatientAnalytics(weeks = weeklyData): PatientAnalytics {
  return useMemo(() => {
    if (weeks.length === 0) {
      const emptyAdherence = calculateAdherenceScore([]);
      const emptyPlateau = detectPlateau([]);
      const emptyScore = calculateMetabolicScore([], emptyAdherence);
      return {
        adherence: emptyAdherence,
        plateau: emptyPlateau,
        metabolicScore: emptyScore,
        insights: [],
        chartData: [],
        totalWeightLostKg: 0,
        totalWeightLostPct: 0,
        currentWeight: patientProfile.startWeight,
        currentHbA1c: null,
        weeklyAvgLoss: 0,
        programWeek: 0,
      };
    }

    const adherence = calculateAdherenceScore(weeks);
    const plateau = detectPlateau(weeks);
    const metabolicScore = calculateMetabolicScore(weeks, adherence);
    const insights = generateInsights(weeks, adherence, plateau);

    const first = weeks[0];
    const last = weeks[weeks.length - 1];
    const totalWeightLostKg = parseFloat((first.weight - last.weight).toFixed(1));
    const totalWeightLostPct = parseFloat(((totalWeightLostKg / first.weight) * 100).toFixed(1));
    const weeklyAvgLoss = parseFloat((totalWeightLostKg / weeks.length).toFixed(2));

    // Latest non-null HbA1c
    const currentHbA1c = [...weeks].reverse().find((w) => w.hba1c !== null)?.hba1c ?? null;

    const chartData: ChartDataPoint[] = weeks.map((w) => {
      const expected = expectedWeightCurve.find((e) => e.week === w.week)?.expected ?? w.weight;
      return {
        week: w.week,
        weight: w.weight,
        expected,
        glucose: w.fastingGlucose,
        adherencePct: Math.round((w.dosesTaken / w.dosesScheduled) * 100),
      };
    });

    return {
      adherence,
      plateau,
      metabolicScore,
      insights,
      chartData,
      totalWeightLostKg,
      totalWeightLostPct,
      currentWeight: last.weight,
      currentHbA1c,
      weeklyAvgLoss,
      programWeek: last.week,
    };
  }, [weeks]);
}
