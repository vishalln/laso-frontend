// ─────────────────────────────────────────────────────────────────────────────
// catalogItems.ts — LASO Product & Lab-Test Catalogue
// Each item carries:
//   - Clinical rationale (shown to patient)
//   - Programme week range when it is recommended
//   - requiresPrescription flag (Rx items blocked until prescriptionId exists)
// ─────────────────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "protein"
  | "vitamins"
  | "fibre_gut"
  | "devices"
  | "lab_test"
  | "rx_medication";

export type ProgrammeTag = "weight_loss" | "diabetes" | "both";

export interface CatalogItem {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly category: ProductCategory;
  readonly priceInr: number;
  readonly unit: string;              // "1 kg", "60 caps", "30 sachets", etc.
  readonly emoji: string;
  readonly tagline: string;           // short marketing blurb
  readonly clinicalRationale: string; // evidence-based reason shown to patient
  readonly recommendedWeeks: readonly [number, number]; // [from, to] — inclusive
  readonly programmeTag: ProgrammeTag;
  readonly requiresPrescription: boolean;
  readonly rxMedication?: string;     // e.g. "Semaglutide 0.5 mg"
  readonly inStock: boolean;
  readonly rating: number;            // 1–5
  readonly reviewCount: number;
}

// ─── OTC SUPPLEMENTS ─────────────────────────────────────────────────────────

export const SUPPLEMENTS: readonly CatalogItem[] = [
  {
    id: "sup-001",
    name: "Laso Whey Protein Isolate",
    brand: "Laso Nutrition",
    category: "protein",
    priceInr: 1499,
    unit: "1 kg (30 servings)",
    emoji: "🥛",
    tagline: "Preserve lean muscle during GLP-1 therapy",
    clinicalRationale:
      "GLP-1 agonists reduce appetite dramatically. Without adequate protein (~1.2 g/kg/day), up to 39% of weight loss can come from lean muscle (STEP trials). This whey isolate provides 26 g protein per scoop with <2 g lactose.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
  },
  {
    id: "sup-002",
    name: "Vitamin B12 (Methylcobalamin 1500 mcg)",
    brand: "Laso Health",
    category: "vitamins",
    priceInr: 399,
    unit: "60 sublingual tabs",
    emoji: "💊",
    tagline: "Critical for diabetes patients on Metformin",
    clinicalRationale:
      "Metformin depletes B12 absorption by ~30% over 2 years (BMJ 2010). Methylcobalamin (active form) is superior to cyanocobalamin for neurological protection. Deficiency causes peripheral neuropathy — a risk already elevated in T2D.",
    recommendedWeeks: [1, 52],
    programmeTag: "diabetes",
    requiresPrescription: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 198,
  },
  {
    id: "sup-003",
    name: "Vitamin D3 + K2 (5000 IU + 100 mcg)",
    brand: "Laso Health",
    category: "vitamins",
    priceInr: 499,
    unit: "60 softgels",
    emoji: "☀️",
    tagline: "Fix the deficiency that blocks fat loss",
    clinicalRationale:
      "~80% of Indian adults are Vitamin D deficient (NMHS 2016). Obesity worsens absorption due to sequestration in adipose tissue. Low D3 impairs insulin sensitivity and is associated with metabolic syndrome. K2 (MK-7) directs calcium to bones, not arteries.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 445,
  },
  {
    id: "sup-004",
    name: "Omega-3 Fish Oil (1250 mg EPA+DHA)",
    brand: "Laso Nutrition",
    category: "vitamins",
    priceInr: 649,
    unit: "90 softgels (3-month supply)",
    emoji: "🐟",
    tagline: "Enhance cardiovascular benefits of GLP-1 therapy",
    clinicalRationale:
      "High-dose omega-3 (REDUCE-IT trial) reduces cardiovascular events by 25% in patients with elevated triglycerides. GLP-1 therapy improves CV markers, and omega-3 amplifies triglyceride reduction. Also reduces GLP-1 associated inflammation.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.5,
    reviewCount: 287,
  },
  {
    id: "sup-005",
    name: "Magnesium Bisglycinate (300 mg)",
    brand: "Laso Health",
    category: "vitamins",
    priceInr: 549,
    unit: "90 capsules",
    emoji: "🔵",
    tagline: "Improve insulin sensitivity & reduce cramps",
    clinicalRationale:
      "Magnesium deficiency is prevalent in insulin-resistant patients (>60% in T2D). It acts as a co-factor for >300 enzymatic reactions including glucose metabolism. Bisglycinate form has superior absorption vs oxide. Also reduces nocturnal cramps from caloric restriction.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.4,
    reviewCount: 156,
  },
  {
    id: "sup-006",
    name: "Psyllium Husk (Isabgol) Fibre",
    brand: "Laso Nutrition",
    category: "fibre_gut",
    priceInr: 299,
    unit: "500 g (100 servings)",
    emoji: "🌾",
    tagline: "Ease GI side effects, slow glucose absorption",
    clinicalRationale:
      "GLP-1 therapy slows gastric emptying, which can cause constipation. Psyllium husk reduces post-prandial glucose spikes by forming a viscous gel in the gut (meta-analysis: −11 mg/dL fasting glucose). Recommended 30 min before meals.",
    recommendedWeeks: [1, 12],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.3,
    reviewCount: 221,
  },
  {
    id: "sup-007",
    name: "Electrolyte Sachets (Sodium + Potassium + Mg)",
    brand: "Laso Nutrition",
    category: "fibre_gut",
    priceInr: 799,
    unit: "30 sachets",
    emoji: "⚡",
    tagline: "Replace electrolytes lost during rapid weight loss",
    clinicalRationale:
      "Rapid weight loss (common in Week 1–4) depletes water-soluble electrolytes — particularly sodium, potassium, and magnesium. Symptoms: fatigue, headache, palpitations. These sugar-free sachets restore balance without spiking glucose.",
    recommendedWeeks: [1, 8],
    programmeTag: "weight_loss",
    requiresPrescription: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 178,
  },
  {
    id: "sup-008",
    name: "Probiotic (50B CFU, 10 strains)",
    brand: "Laso Health",
    category: "fibre_gut",
    priceInr: 899,
    unit: "30 capsules",
    emoji: "🦠",
    tagline: "Support gut microbiome disrupted by GLP-1",
    clinicalRationale:
      "GLP-1 therapy alters gut motility and microbiome composition. Probiotics restore Lactobacillus and Bifidobacterium populations, reducing nausea, bloating, and diarrhoea — the top 3 reported GLP-1 side effects. Particularly beneficial in first 12 weeks.",
    recommendedWeeks: [1, 12],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.5,
    reviewCount: 134,
  },
];

// ─── DEVICES ─────────────────────────────────────────────────────────────────

export const DEVICES: readonly CatalogItem[] = [
  {
    id: "dev-001",
    name: "Blood Glucose Monitor (Accu-Chek Active)",
    brand: "Roche",
    category: "devices",
    priceInr: 899,
    unit: "Monitor + 10 strips",
    emoji: "🩸",
    tagline: "Track glucose response to medication",
    clinicalRationale:
      "Home glucose monitoring is essential for titrating GLP-1 doses and detecting hypoglycaemia (rare but possible with dual therapy). Your care team uses your readings for dose decisions at every consult.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 567,
  },
  {
    id: "dev-002",
    name: "Glucometer Test Strips (50 strips)",
    brand: "Accu-Chek",
    category: "devices",
    priceInr: 649,
    unit: "50 strips",
    emoji: "📋",
    tagline: "Refill strips for Accu-Chek Active",
    clinicalRationale:
      "Regular testing (morning fasting + 2hr post-meal) generates the glucose data your doctor needs for dose titration decisions.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 892,
  },
  {
    id: "dev-003",
    name: "Smart Scale (BMI + Body Fat)",
    brand: "Laso Tech",
    category: "devices",
    priceInr: 1999,
    unit: "1 unit + app sync",
    emoji: "⚖️",
    tagline: "Track lean mass vs fat loss accurately",
    clinicalRationale:
      "Standard weight tracking misses the critical lean-vs-fat ratio. Bioelectrical impedance scales measure body fat %, muscle mass, and water %. Syncs with the Laso app to populate your weekly check-ins automatically.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.4,
    reviewCount: 203,
  },
  {
    id: "dev-004",
    name: "Insulin Pen Needles (4mm 32G, 100 pack)",
    brand: "BD Micro-Fine",
    category: "devices",
    priceInr: 349,
    unit: "100 needles",
    emoji: "💉",
    tagline: "Compatible with all GLP-1 injection pens",
    clinicalRationale:
      "4mm 32G needles are the international guideline recommendation for subcutaneous GLP-1 injections in all BMI groups. Shorter, finer needles reduce pain and intramuscular injection risk.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 1243,
  },
];

// ─── LAB TESTS ───────────────────────────────────────────────────────────────

export const LAB_TESTS: readonly CatalogItem[] = [
  {
    id: "lab-001",
    name: "Baseline Metabolic Panel",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 1200,
    unit: "Home collection",
    emoji: "🧪",
    tagline: "Lipids, Liver, Kidney — full safety baseline",
    clinicalRationale:
      "Mandatory before starting GLP-1 therapy. Panel: Lipid profile (LDL, HDL, TG), LFT (ALT, AST, ALP, Bilirubin), KFT (Creatinine, eGFR, Uric acid). Establishes baseline for monitoring medication safety.",
    recommendedWeeks: [0, 1],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 731,
  },
  {
    id: "lab-002",
    name: "HbA1c (Glycated Haemoglobin)",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 350,
    unit: "Home collection",
    emoji: "🔬",
    tagline: "3-month glucose control snapshot",
    clinicalRationale:
      "HbA1c is the gold standard for 3-month glycaemic control. Target: <7% for most T2D patients. Recommended at Week 12, 24, and 52. A drop of 1% = ~22 mg/dL average glucose reduction.",
    recommendedWeeks: [12, 52],
    programmeTag: "diabetes",
    requiresPrescription: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 912,
  },
  {
    id: "lab-003",
    name: "Body Composition DEXA Scan",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 2200,
    unit: "At-clinic scan",
    emoji: "📊",
    tagline: "Gold-standard lean muscle vs fat tracking",
    clinicalRationale:
      "DEXA is the clinical gold standard for body composition. Shows exactly how much weight lost is fat vs lean muscle. Recommended at baseline, Week 12, and Week 24 to ensure lean mass is preserved during GLP-1 therapy.",
    recommendedWeeks: [1, 24],
    programmeTag: "weight_loss",
    requiresPrescription: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 145,
  },
  {
    id: "lab-004",
    name: "Thyroid Panel (TSH + Free T3 + Free T4)",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 650,
    unit: "Home collection",
    emoji: "🦋",
    tagline: "Rule out thyroid-driven weight plateau",
    clinicalRationale:
      "Hypothyroidism affects ~12% of Indian women and causes weight resistance. If you hit a plateau despite good adherence, thyroid function is the first thing to check. TSH >5 mIU/L needs treatment before GLP-1 can work optimally.",
    recommendedWeeks: [8, 52],
    programmeTag: "weight_loss",
    requiresPrescription: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 334,
  },
  {
    id: "lab-005",
    name: "Fasting Insulin + HOMA-IR",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 850,
    unit: "Home collection",
    emoji: "🩺",
    tagline: "Measure insulin resistance directly",
    clinicalRationale:
      "HOMA-IR (Homeostatic Model Assessment of Insulin Resistance) = (Fasting insulin × Fasting glucose) / 405. HOMA-IR >2.5 confirms significant insulin resistance. Critical for monitoring whether GLP-1 therapy is reversing the underlying metabolic defect.",
    recommendedWeeks: [1, 24],
    programmeTag: "both",
    requiresPrescription: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
  },
  {
    id: "lab-006",
    name: "Complete Blood Count (CBC)",
    brand: "Laso Diagnostics",
    category: "lab_test",
    priceInr: 280,
    unit: "Home collection",
    emoji: "🧫",
    tagline: "Monitor B12 and anaemia markers",
    clinicalRationale:
      "CBC detects anaemia (low haemoglobin, MCV) — a common B12 deficiency consequence in Metformin users. Also monitors WBC (immune health) and platelet count. Recommended at Week 12 and annually.",
    recommendedWeeks: [12, 52],
    programmeTag: "diabetes",
    requiresPrescription: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 567,
  },
];

// ─── PRESCRIPTION MEDICATIONS ─────────────────────────────────────────────────

export const RX_MEDICATIONS: readonly CatalogItem[] = [
  {
    id: "rx-001",
    name: "Semaglutide (Ozempic) 0.5 mg Pen",
    brand: "Novo Nordisk",
    category: "rx_medication",
    priceInr: 8500,
    unit: "1 pen (4-week supply)",
    emoji: "💉",
    tagline: "Your prescribed GLP-1 agonist — weekly injection",
    clinicalRationale:
      "Semaglutide 0.5 mg (maintenance dose) — once-weekly subcutaneous injection. SUSTAIN-6 trial: −4.5 kg average weight loss, HbA1c reduction of −1.1%. Cold-chain required (2–8°C).",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: true,
    rxMedication: "Semaglutide 0.5 mg",
    inStock: true,
    rating: 4.9,
    reviewCount: 2341,
  },
  {
    id: "rx-002",
    name: "Semaglutide (Ozempic) 1.0 mg Pen",
    brand: "Novo Nordisk",
    category: "rx_medication",
    priceInr: 9200,
    unit: "1 pen (4-week supply)",
    emoji: "💉",
    tagline: "Your prescribed GLP-1 agonist — escalated dose",
    clinicalRationale:
      "Semaglutide 1.0 mg — used from Week 9+ after dose escalation. SUSTAIN-6: −6.1 kg, HbA1c −1.4% vs placebo. Continued cold-chain storage required.",
    recommendedWeeks: [9, 52],
    programmeTag: "both",
    requiresPrescription: true,
    rxMedication: "Semaglutide 1.0 mg",
    inStock: true,
    rating: 4.9,
    reviewCount: 1876,
  },
  {
    id: "rx-003",
    name: "Metformin 500 mg (Glycomet)",
    brand: "USV Pharma",
    category: "rx_medication",
    priceInr: 180,
    unit: "60 tablets (1-month supply)",
    emoji: "💊",
    tagline: "First-line diabetes medication — your daily tablet",
    clinicalRationale:
      "Metformin reduces hepatic glucose production and improves insulin sensitivity. HbA1c reduction: −1.0–1.5%. Combined with semaglutide: additive effect. Take with meals to minimise GI side effects.",
    recommendedWeeks: [1, 52],
    programmeTag: "diabetes",
    requiresPrescription: true,
    rxMedication: "Metformin 500 mg",
    inStock: true,
    rating: 4.7,
    reviewCount: 3421,
  },
  {
    id: "rx-004",
    name: "Rybelsus (Semaglutide Oral) 14 mg",
    brand: "Novo Nordisk",
    category: "rx_medication",
    priceInr: 4200,
    unit: "30 tablets (1-month supply)",
    emoji: "💊",
    tagline: "Oral GLP-1 — no injections needed",
    clinicalRationale:
      "Oral semaglutide 14 mg — PIONEER-6 trial. Taken 30 minutes before first meal, with ≤4 oz water only. ~75% bioavailability. Alternative to injection for needle-averse patients. Same mechanism, slightly lower efficacy vs injectable.",
    recommendedWeeks: [1, 52],
    programmeTag: "both",
    requiresPrescription: true,
    rxMedication: "Semaglutide 14 mg oral",
    inStock: true,
    rating: 4.8,
    reviewCount: 987,
  },
];

// ─── COMBINED CATALOGUE ───────────────────────────────────────────────────────

export const ALL_CATALOG_ITEMS: readonly CatalogItem[] = [
  ...SUPPLEMENTS,
  ...DEVICES,
  ...LAB_TESTS,
  ...RX_MEDICATIONS,
];

// ─── CATEGORY METADATA ────────────────────────────────────────────────────────

export const CATEGORY_META: Record<ProductCategory, { label: string; emoji: string }> = {
  protein:       { label: "Protein",       emoji: "🥛" },
  vitamins:      { label: "Vitamins",      emoji: "💊" },
  fibre_gut:     { label: "Fibre & Gut",   emoji: "🌾" },
  devices:       { label: "Devices",       emoji: "🩺" },
  lab_test:      { label: "Lab Tests",     emoji: "🧪" },
  rx_medication: { label: "Rx Medication", emoji: "💉" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Items recommended for a given programme week (week=0 means no filter) */
export function getItemsForWeek(
  items: readonly CatalogItem[],
  week: number,
): readonly CatalogItem[] {
  if (week === 0) return items;
  return items.filter(
    (i) => week >= i.recommendedWeeks[0] && week <= i.recommendedWeeks[1],
  );
}

/** Items matching a programme tag */
export function getItemsForProgramme(
  items: readonly CatalogItem[],
  tag: ProgrammeTag,
): readonly CatalogItem[] {
  return items.filter((i) => i.programmeTag === tag || i.programmeTag === "both");
}
