import { useMemo } from "react";
import type { PatientAnalytics } from "./usePatientAnalytics";

export type NbaCategory = "consultation" | "refill" | "lab" | "lifestyle" | "adherence";

export interface NextBestAction {
  id: string;
  category: NbaCategory;
  priority: 1 | 2 | 3; // 1 = highest
  title: string;
  description: string;
  dueDate: string | null;
  cta: string;
  href: string;
}

export function useNextBestAction(analytics: PatientAnalytics): NextBestAction[] {
  return useMemo(() => {
    const actions: NextBestAction[] = [];

    // Adherence critical
    if (analytics.adherence.riskFlag) {
      actions.push({
        id: "nba-adherence",
        category: "adherence",
        priority: 1,
        title: "Missed doses detected",
        description: `${analytics.adherence.missedDoses} doses missed this cycle — take today's dose as soon as possible`,
        dueDate: null,
        cta: "Log today's dose",
        href: "/journey",
      });
    }

    // Plateau detected
    if (analytics.plateau.isPlateau) {
      actions.push({
        id: "nba-plateau",
        category: "consultation",
        priority: 1,
        title: "Book consultation — plateau detected",
        description: "Weight loss has stalled for 2+ weeks — your doctor may recommend dose escalation",
        dueDate: "Apr 28, 2026",
        cta: "Book now",
        href: "/consult",
      });
    }

    // Upcoming consultation
    actions.push({
      id: "nba-consult",
      category: "consultation",
      priority: 2,
      title: "Month 4 review",
      description: "Schedule your next consultation with Dr. Sharma",
      dueDate: "Apr 28, 2026",
      cta: "Book consultation",
      href: "/consult",
    });

    // Refill
    actions.push({
      id: "nba-refill",
      category: "refill",
      priority: analytics.adherence.score > 80 ? 2 : 1,
      title: "Medication refill needed",
      description: "8 days of Rybelsus 14mg remaining — auto-refill on Apr 22",
      dueDate: "Apr 22, 2026",
      cta: "View orders",
      href: "/orders",
    });

    // Lab test
    if (analytics.programWeek >= 12) {
      actions.push({
        id: "nba-labs",
        category: "lab",
        priority: 2,
        title: "HbA1c + Lipid panel due",
        description: "6-month labs due per your treatment plan — download requisition",
        dueDate: "Jul 16, 2026",
        cta: "Download requisition",
        href: "/dashboard",
      });
    }

    // Lifestyle
    if (analytics.adherence.score >= 85 && !analytics.plateau.isPlateau) {
      actions.push({
        id: "nba-fitness",
        category: "lifestyle",
        priority: 3,
        title: "Start HIIT protocol",
        description: "Dr. Sharma recommends adding HIIT training from month 4 to accelerate results",
        dueDate: null,
        cta: "Connect fitness coach",
        href: "/journey",
      });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [analytics]);
}
