import { useJourney } from "@/contexts/JourneyContext";
import { weeklyData, type WeeklySnapshot } from "@/data/patientJourney";
import { useMemo } from "react";

export interface SimulatedData {
  projectedWeightAtWeek: (week: number) => number;
  projectedHbA1cAtWeek: (week: number) => number;
  simulatedWeeks: WeeklySnapshot[];
}

export function useSimulation(): SimulatedData {
  const { simulation, visibleWeeks } = useJourney();

  const projectedWeightAtWeek = (week: number): number => {
    if (!simulation.enabled) {
      const found = weeklyData.find((w) => w.week === week);
      return found?.weight ?? weeklyData[weeklyData.length - 1].weight;
    }
    const baseline = visibleWeeks[visibleWeeks.length - 1]?.weight ?? 85.8;
    const avgLossPerWeek = 0.65 * simulation.doseMultiplier;
    const adherenceFactor = simulation.adherenceOverride !== null
      ? simulation.adherenceOverride / 100
      : 1;
    const weeksAhead = week - (visibleWeeks[visibleWeeks.length - 1]?.week ?? 12);
    return Math.max(
      baseline - avgLossPerWeek * weeksAhead * adherenceFactor,
      60
    );
  };

  const projectedHbA1cAtWeek = (week: number): number => {
    const current = 7.1;
    const weeksAhead = week - 12;
    const reductionPerWeek = 0.03 * simulation.doseMultiplier;
    return Math.max(current - reductionPerWeek * weeksAhead, 5.7);
  };

  const simulatedWeeks = useMemo((): WeeklySnapshot[] => {
    if (!simulation.enabled) return visibleWeeks;
    return visibleWeeks.map((w) => ({
      ...w,
      dosesTaken: simulation.adherenceOverride !== null
        ? Math.round((simulation.adherenceOverride / 100) * w.dosesScheduled)
        : w.dosesTaken,
    }));
  }, [simulation, visibleWeeks]);

  return { projectedWeightAtWeek, projectedHbA1cAtWeek, simulatedWeeks };
}
