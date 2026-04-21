export type QuizStepId =
  | "personal"
  | "vitals"
  | "conditions"
  | "medications"
  | "symptoms"
  | "lifestyle"
  | "goals"
  | "readiness";

export interface QuizOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface QuizStep {
  id: QuizStepId;
  stepNumber: number;
  title: string;
  subtitle: string;
  type: "text" | "select" | "multiselect" | "slider" | "number";
  fields: QuizField[];
}

export interface QuizField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect" | "slider";
  placeholder?: string;
  options?: QuizOption[];
  min?: number;
  max?: number;
  unit?: string;
  required: boolean;
  hint?: string;
}

export interface QuizAnswers {
  // Personal
  age?: number;
  gender?: string;
  // Vitals
  heightCm?: number;
  weightKg?: number;
  // Conditions
  conditions?: string[];
  // Medications
  currentMedications?: string[];
  // Symptoms
  symptoms?: string[];
  // Lifestyle
  activityLevel?: string;
  dietType?: string;
  sleepHours?: number;
  stressLevel?: number;
  // Goals
  primaryGoal?: string;
  targetWeightKg?: number;
  timelineWeeks?: number;
  // Readiness
  readinessScore?: number;
  mainConcern?: string;
}

export const quizSteps: QuizStep[] = [
  {
    id: "personal",
    stepNumber: 1,
    title: "Let's start with the basics",
    subtitle: "This helps us personalise your clinical assessment",
    type: "select",
    fields: [
      {
        key: "age",
        label: "Your age",
        type: "number",
        placeholder: "e.g. 34",
        unit: "years",
        min: 18,
        max: 70,
        required: true,
        hint: "Must be 18–70 to be eligible",
      },
      {
        key: "gender",
        label: "Biological sex",
        type: "select",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Prefer to self-describe" },
        ],
        required: true,
        hint: "Used for clinical calculations (BMI, dosing)",
      },
    ],
  },
  {
    id: "vitals",
    stepNumber: 2,
    title: "Your weight & height",
    subtitle: "We'll calculate your BMI and assess GLP-1 eligibility in real time",
    type: "number",
    fields: [
      {
        key: "heightCm",
        label: "Height",
        type: "number",
        placeholder: "e.g. 172",
        unit: "cm",
        min: 140,
        max: 220,
        required: true,
      },
      {
        key: "weightKg",
        label: "Current weight",
        type: "number",
        placeholder: "e.g. 92",
        unit: "kg",
        min: 40,
        max: 250,
        required: true,
      },
    ],
  },
  {
    id: "conditions",
    stepNumber: 3,
    title: "Health conditions",
    subtitle: "Select all that apply — this directly affects your treatment eligibility",
    type: "multiselect",
    fields: [
      {
        key: "conditions",
        label: "Diagnosed conditions",
        type: "multiselect",
        options: [
          { value: "t2dm", label: "Type 2 Diabetes", icon: "🩸", description: "Diagnosed or on medication" },
          { value: "prediabetes", label: "Pre-diabetes / insulin resistance", icon: "⚠️" },
          { value: "hypertension", label: "High blood pressure", icon: "❤️" },
          { value: "dyslipidemia", label: "High cholesterol / triglycerides", icon: "🔬" },
          { value: "nafld", label: "Fatty liver (NAFLD/NASH)", icon: "🫀" },
          { value: "pcos", label: "PCOS", icon: "🌸" },
          { value: "hypothyroid", label: "Hypothyroidism", icon: "🦋" },
          { value: "sleep_apnea", label: "Sleep apnea", icon: "😴" },
          { value: "none", label: "None of the above", icon: "✅" },
        ],
        required: true,
        hint: "Having at least one comorbidity at BMI ≥ 27 qualifies you for GLP-1 therapy",
      },
    ],
  },
  {
    id: "medications",
    stepNumber: 4,
    title: "Current medications",
    subtitle: "Helps us screen for interactions and contraindications",
    type: "multiselect",
    fields: [
      {
        key: "currentMedications",
        label: "Medications you currently take",
        type: "multiselect",
        options: [
          { value: "metformin", label: "Metformin", description: "For diabetes" },
          { value: "insulin", label: "Insulin", description: "Injectable insulin therapy" },
          { value: "sulfonylurea", label: "Sulfonylurea (Glipizide, Glimepiride)", description: "Diabetes tablets" },
          { value: "bp_meds", label: "Blood pressure medication", description: "ACE inhibitor, ARB, beta-blocker" },
          { value: "statins", label: "Statins (Atorvastatin, Rosuvastatin)", description: "Cholesterol" },
          { value: "thyroid", label: "Thyroid medication (Thyroxine)", description: "Hypothyroidism" },
          { value: "antidepressants", label: "Antidepressants / psychiatric meds", description: "" },
          { value: "none", label: "No regular medications", description: "" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "symptoms",
    stepNumber: 5,
    title: "Current symptoms",
    subtitle: "Tell us what you're experiencing right now",
    type: "multiselect",
    fields: [
      {
        key: "symptoms",
        label: "Current symptoms (select all that apply)",
        type: "multiselect",
        options: [
          { value: "fatigue", label: "Persistent fatigue", icon: "😴" },
          { value: "hunger", label: "Constant hunger / food cravings", icon: "🍔" },
          { value: "thirst", label: "Excessive thirst", icon: "💧" },
          { value: "frequent_urination", label: "Frequent urination", icon: "🚽" },
          { value: "joint_pain", label: "Joint pain / stiffness", icon: "🦵" },
          { value: "breathlessness", label: "Breathlessness on mild exertion", icon: "😮‍💨" },
          { value: "mood_issues", label: "Mood issues / depression", icon: "🧠" },
          { value: "sleep_problems", label: "Poor sleep quality", icon: "🌙" },
          { value: "none", label: "No significant symptoms", icon: "✅" },
        ],
        required: false,
      },
    ],
  },
  {
    id: "lifestyle",
    stepNumber: 6,
    title: "Your lifestyle",
    subtitle: "Helps personalise your programme beyond medication",
    type: "select",
    fields: [
      {
        key: "activityLevel",
        label: "Current activity level",
        type: "select",
        options: [
          { value: "sedentary", label: "Sedentary — mostly sitting all day", description: "Desk job, minimal movement" },
          { value: "light", label: "Light — occasional walks", description: "1–2 days/week activity" },
          { value: "moderate", label: "Moderate — regular exercise", description: "3–4 days/week" },
          { value: "active", label: "Active — gym / sports regularly", description: "5+ days/week" },
        ],
        required: true,
      },
      {
        key: "dietType",
        label: "Diet pattern",
        type: "select",
        options: [
          { value: "vegetarian", label: "Vegetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "non_veg", label: "Non-vegetarian" },
          { value: "eggetarian", label: "Eggetarian" },
          { value: "jain", label: "Jain / strict vegetarian" },
        ],
        required: true,
      },
      {
        key: "sleepHours",
        label: "Average sleep (hours/night)",
        type: "slider",
        min: 4,
        max: 10,
        unit: "hrs",
        required: true,
      },
      {
        key: "stressLevel",
        label: "Average stress level",
        type: "slider",
        min: 1,
        max: 10,
        hint: "1 = very low, 10 = extremely high",
        required: true,
      },
    ],
  },
  {
    id: "goals",
    stepNumber: 7,
    title: "Your goals",
    subtitle: "We'll build a personalised target around your aspirations",
    type: "select",
    fields: [
      {
        key: "primaryGoal",
        label: "Primary goal",
        type: "select",
        options: [
          { value: "weight_loss", label: "Lose weight", icon: "⚖️", description: "Reduce BMI and fat mass" },
          { value: "diabetes_control", label: "Control diabetes / blood sugar", icon: "🩸", description: "Improve HbA1c" },
          { value: "metabolic_health", label: "Improve overall metabolic health", icon: "🔬", description: "Lipids, BP, energy" },
          { value: "energy", label: "More energy / better quality of life", icon: "⚡", description: "Lifestyle optimisation" },
          { value: "prevention", label: "Prevent future complications", icon: "🛡️", description: "Reduce long-term risk" },
        ],
        required: true,
      },
      {
        key: "targetWeightKg",
        label: "Target weight (optional)",
        type: "number",
        placeholder: "e.g. 80",
        unit: "kg",
        min: 40,
        max: 200,
        required: false,
      },
      {
        key: "timelineWeeks",
        label: "Desired programme timeline",
        type: "select",
        options: [
          { value: "12", label: "12 weeks — Intensive start" },
          { value: "24", label: "24 weeks — Full reset" },
          { value: "36", label: "36 weeks — Long-term transformation" },
          { value: "open", label: "Open-ended — I'll review at each milestone" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "readiness",
    stepNumber: 8,
    title: "Your readiness",
    subtitle: "Help us understand what support you need most",
    type: "slider",
    fields: [
      {
        key: "readinessScore",
        label: "How ready are you to make lifestyle changes alongside medication?",
        type: "slider",
        min: 1,
        max: 10,
        hint: "1 = not ready, 10 = fully committed",
        required: true,
      },
      {
        key: "mainConcern",
        label: "What is your biggest concern about starting?",
        type: "select",
        options: [
          { value: "side_effects", label: "Side effects of the medication" },
          { value: "cost", label: "Cost and affordability" },
          { value: "effectiveness", label: "Whether it will actually work for me" },
          { value: "commitment", label: "Maintaining the lifestyle changes" },
          { value: "doctor_access", label: "Getting enough doctor support" },
          { value: "no_concern", label: "No major concerns — ready to start" },
        ],
        required: true,
      },
    ],
  },
];
