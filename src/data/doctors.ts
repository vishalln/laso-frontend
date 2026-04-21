export interface DoctorSlot {
  date: string;
  times: string[];
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialisation: string[];
  hospital: string;
  city: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultFeeINR: number;
  languages: string[];
  imageInitials: string;
  colorClass: string;
  bio: string;
  availableSlots: DoctorSlot[];
  glp1Certified: boolean;
}

export const doctors: Doctor[] = [
  {
    id: "dr-001",
    name: "Dr. Rahul Sharma",
    title: "MBBS, MD (Internal Medicine), DM (Endocrinology)",
    specialisation: ["Endocrinology", "Diabetes", "Obesity Medicine"],
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 847,
    consultFeeINR: 1500,
    languages: ["Hindi", "English", "Marathi"],
    imageInitials: "RS",
    colorClass: "bg-primary",
    bio: "Dr. Sharma specialises in GLP-1 based metabolic therapies with over 500 patients on structured obesity programmes. He is one of the lead investigators in the STEP-India trial.",
    glp1Certified: true,
    availableSlots: [
      { date: "2026-04-22", times: ["09:00", "10:30", "14:00", "15:30"] },
      { date: "2026-04-23", times: ["11:00", "12:30", "16:00"] },
      { date: "2026-04-25", times: ["09:30", "10:00", "14:30"] },
      { date: "2026-04-28", times: ["09:00", "11:00", "15:00", "16:30"] },
    ],
  },
  {
    id: "dr-002",
    name: "Dr. Priya Nair",
    title: "MBBS, DNB (Endocrinology & Metabolism)",
    specialisation: ["Endocrinology", "Metabolic Syndrome", "PCOS & Obesity"],
    hospital: "Fortis Memorial Research Institute",
    city: "Bengaluru",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 612,
    consultFeeINR: 1200,
    languages: ["English", "Kannada", "Tamil", "Malayalam"],
    imageInitials: "PN",
    colorClass: "bg-accent",
    bio: "Dr. Nair is an expert in GLP-1 agonist therapies, particularly for women with PCOS-related obesity. She runs a structured metabolic care programme combining pharmacotherapy with nutrition coaching.",
    glp1Certified: true,
    availableSlots: [
      { date: "2026-04-22", times: ["10:00", "11:30", "15:00"] },
      { date: "2026-04-24", times: ["09:00", "13:00", "16:00"] },
      { date: "2026-04-26", times: ["10:30", "14:00"] },
    ],
  },
  {
    id: "dr-003",
    name: "Dr. Aryan Kapoor",
    title: "MBBS, MD (General Medicine), Fellowship in Bariatric Medicine",
    specialisation: ["Obesity Medicine", "Bariatric Medicine", "Lifestyle Diseases"],
    hospital: "Max Super Speciality Hospital",
    city: "Delhi",
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 438,
    consultFeeINR: 1000,
    languages: ["Hindi", "English", "Punjabi"],
    imageInitials: "AK",
    colorClass: "bg-success",
    bio: "Dr. Kapoor trained in bariatric medicine at AIIMS Delhi and focuses on non-surgical weight management using GLP-1 agonists. He has a particular interest in metabolic reset protocols.",
    glp1Certified: true,
    availableSlots: [
      { date: "2026-04-23", times: ["09:00", "10:00", "14:30", "17:00"] },
      { date: "2026-04-25", times: ["11:00", "15:00"] },
      { date: "2026-04-29", times: ["09:30", "12:00", "16:00"] },
    ],
  },
];

export const assignedDoctor = doctors[0];
