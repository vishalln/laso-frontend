import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { weeklyData, patientProfile, type WeeklySnapshot } from "@/data/patientJourney";

export type JourneyView = "overview" | "charts" | "insights" | "timeline" | "treatment";

interface SimulationState {
  enabled: boolean;
  simulatedWeek: number;
  doseMultiplier: number; // 0.5x to 2x
  adherenceOverride: number | null; // override adherence %
}

interface JourneyContextValue {
  weeks: WeeklySnapshot[];
  visibleWeeks: WeeklySnapshot[];
  currentWeek: number;
  setCurrentWeek: (w: number) => void;
  activeView: JourneyView;
  setActiveView: (v: JourneyView) => void;
  simulation: SimulationState;
  setSimulation: (s: Partial<SimulationState>) => void;
  resetSimulation: () => void;
  profile: typeof patientProfile;
}

const DEFAULT_SIMULATION: SimulationState = {
  enabled: false,
  simulatedWeek: weeklyData.length,
  doseMultiplier: 1,
  adherenceOverride: null,
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { readonly children: ReactNode }) {
  const [currentWeek, setCurrentWeek] = useState(weeklyData.length);
  const [activeView, setActiveView] = useState<JourneyView>("overview");
  const [simulation, setSimulationState] = useState<SimulationState>(DEFAULT_SIMULATION);

  const visibleWeeks = useMemo(() => {
    const limit = simulation.enabled ? simulation.simulatedWeek : currentWeek;
    return weeklyData.slice(0, limit);
  }, [currentWeek, simulation]);

  const setSimulation = useCallback((s: Partial<SimulationState>) => {
    setSimulationState((prev) => ({ ...prev, ...s }));
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationState(DEFAULT_SIMULATION);
  }, []);

  return (
    <JourneyContext.Provider
      value={{
        weeks: weeklyData,
        visibleWeeks,
        currentWeek,
        setCurrentWeek,
        activeView,
        setActiveView,
        simulation,
        setSimulation,
        resetSimulation,
        profile: patientProfile,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
