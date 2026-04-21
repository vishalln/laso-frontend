export interface Medication {
  id: string;
  name: string;
  genericName: string;
  class: "GLP-1 RA" | "SGLT2i" | "DPP4i" | "Metformin";
  route: "Oral" | "Subcutaneous";
  doses: string[];
  mechanism: string;
  avgWeightLossPct: number;
  hba1cReductionPct: number;
  sideEffects: string[];
  contraindications: string[];
  monthlyPriceINR: number;
  approvedForIndia: boolean;
}

export const medications: Medication[] = [
  {
    id: "sema-oral",
    name: "Rybelsus (Oral Semaglutide)",
    genericName: "Semaglutide",
    class: "GLP-1 RA",
    route: "Oral",
    doses: ["3mg", "7mg", "14mg"],
    mechanism: "GLP-1 receptor agonist — reduces appetite, slows gastric emptying, improves insulin secretion",
    avgWeightLossPct: 6.7,
    hba1cReductionPct: 1.4,
    sideEffects: ["Nausea", "Vomiting", "Constipation", "Diarrhoea"],
    contraindications: ["Personal/family history of MTC", "MEN2", "Pancreatitis", "Severe GI disease"],
    monthlyPriceINR: 8500,
    approvedForIndia: true,
  },
  {
    id: "sema-inject",
    name: "Ozempic (Injectable Semaglutide)",
    genericName: "Semaglutide",
    class: "GLP-1 RA",
    route: "Subcutaneous",
    doses: ["0.25mg", "0.5mg", "1mg", "2mg"],
    mechanism: "GLP-1 receptor agonist — weekly injection for T2DM and weight management",
    avgWeightLossPct: 9.6,
    hba1cReductionPct: 1.8,
    sideEffects: ["Nausea", "Injection site reactions", "Vomiting", "Diarrhoea"],
    contraindications: ["Personal/family history of MTC", "MEN2"],
    monthlyPriceINR: 11200,
    approvedForIndia: true,
  },
  {
    id: "lira-inject",
    name: "Victoza (Liraglutide)",
    genericName: "Liraglutide",
    class: "GLP-1 RA",
    route: "Subcutaneous",
    doses: ["0.6mg", "1.2mg", "1.8mg"],
    mechanism: "Daily GLP-1 receptor agonist injection",
    avgWeightLossPct: 4.5,
    hba1cReductionPct: 1.1,
    sideEffects: ["Nausea", "Headache", "Diarrhoea"],
    contraindications: ["MEN2", "Thyroid cancer history"],
    monthlyPriceINR: 6800,
    approvedForIndia: true,
  },
];

export const currentMedication = medications[0];
