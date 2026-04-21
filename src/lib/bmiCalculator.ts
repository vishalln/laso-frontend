export interface BmiResult {
  bmi: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese I" | "Obese II" | "Obese III";
  color: "success" | "warning" | "destructive";
  eligibleForGLP1: boolean;
  eligibleForProgram: boolean;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category: BmiResult["category"];
  let color: BmiResult["color"];

  if (bmi < 18.5) {
    category = "Underweight";
    color = "warning";
  } else if (bmi < 25) {
    category = "Normal";
    color = "success";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "warning";
  } else if (bmi < 35) {
    category = "Obese I";
    color = "destructive";
  } else if (bmi < 40) {
    category = "Obese II";
    color = "destructive";
  } else {
    category = "Obese III";
    color = "destructive";
  }

  // GLP-1 eligibility: BMI ≥ 27 with comorbidity or BMI ≥ 30
  const eligibleForGLP1 = bmi >= 30 || bmi >= 27;
  // Laso program eligibility: BMI ≥ 25
  const eligibleForProgram = bmi >= 25;

  return { bmi, category, color, eligibleForGLP1, eligibleForProgram };
}

export function idealWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: parseFloat((18.5 * heightM * heightM).toFixed(1)),
    max: parseFloat((24.9 * heightM * heightM).toFixed(1)),
  };
}

export function weightToLosePct(currentWeight: number, targetPct: number): number {
  return parseFloat((currentWeight * (targetPct / 100)).toFixed(1));
}
