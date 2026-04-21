export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "eligibility" | "medication" | "program" | "safety" | "cost";
}

export const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Am I eligible for the Laso programme?",
    answer:
      "You may be eligible if you have a BMI ≥ 27 with a weight-related comorbidity (Type 2 diabetes, hypertension, dyslipidaemia, fatty liver), or a BMI ≥ 30 without a comorbidity. You'll complete a short medical questionnaire which our doctors review before your first consultation. We currently serve adults aged 18–70 across India.",
    category: "eligibility",
  },
  {
    id: "faq-2",
    question: "What is GLP-1 and how does it work?",
    answer:
      "GLP-1 (Glucagon-like peptide-1) receptor agonists are a class of medications that mimic a natural gut hormone. They work by reducing appetite, slowing gastric emptying (so you feel full longer), improving insulin secretion in response to meals, and reducing glucagon (which lowers blood sugar). The result is clinically meaningful weight loss — typically 5–15% of body weight — alongside strong glycaemic control in people with Type 2 diabetes.",
    category: "medication",
  },
  {
    id: "faq-3",
    question: "Which medications does Laso prescribe?",
    answer:
      "Laso prescribes clinically approved GLP-1 receptor agonists that are legally available in India, including oral semaglutide (Rybelsus) and injectable semaglutide (Ozempic/Wegovy). The specific medication, dose, and titration schedule are determined by your assigned doctor based on your health profile and labs. We do not prescribe compounded or unapproved alternatives.",
    category: "medication",
  },
  {
    id: "faq-4",
    question: "What does the programme include?",
    answer:
      "The Laso MetaboReset programme includes: (1) Initial comprehensive medical consultation with a specialist, (2) Personalised treatment plan with dose titration schedule, (3) Monthly follow-up consultations (video or async), (4) Weekly progress monitoring via the app, (5) AI-assisted insight alerts for plateaus and adherence gaps, (6) Prescription management and same-day pharmacy delivery with cold-chain tracking, (7) Access to nutritionist and fitness coach, and (8) 24/7 care coordinator chat support.",
    category: "program",
  },
  {
    id: "faq-5",
    question: "What are the side effects of GLP-1 medications?",
    answer:
      "The most common side effects are nausea (especially in the first 2–4 weeks or after dose escalation), constipation, and occasionally vomiting or diarrhoea. These are usually mild to moderate and transient. To minimise nausea: take your medication 30 minutes before your first meal (not on an empty stomach), eat slowly, and avoid large or fatty meals. Rare but serious side effects include pancreatitis and gallbladder issues. Our doctors monitor you throughout and will adjust your plan if needed.",
    category: "safety",
  },
  {
    id: "faq-6",
    question: "Is the programme safe if I have Type 2 diabetes?",
    answer:
      "Yes — GLP-1 agonists are FDA and CDSCO-approved specifically for Type 2 diabetes management, and have demonstrated cardiovascular benefit in multiple major trials (LEADER, SUSTAIN-6, STEP trials). Our programme is designed with endocrinologists who specialise in T2DM. Your blood sugar, HbA1c, and other labs are monitored throughout. If you're on other diabetes medications (e.g., sulfonylureas), your doctor will adjust your regimen to avoid hypoglycaemia.",
    category: "safety",
  },
  {
    id: "faq-7",
    question: "How much does the programme cost?",
    answer:
      "The initial consultation is ₹1,000–₹1,500 depending on the doctor. Monthly medication cost depends on the prescribed molecule — oral semaglutide (Rybelsus) is approximately ₹8,500/month. Follow-up consultations are ₹500–₹1,000. We offer programme bundles at ₹12,499/month (medication + monthly consult + nutritionist session + monitoring) which represent significant savings versus individual billing. EMI options are available.",
    category: "cost",
  },
  {
    id: "faq-8",
    question: "How is medication delivered?",
    answer:
      "Once your doctor issues a digital prescription, it is sent to our pharmacy partner network. Medications are dispensed, cold-chain verified (where required), and shipped via our express logistics partners with same-day or next-day delivery in major metros. You can track your order status in real time within the Laso app, including cold-chain integrity status throughout transit.",
    category: "program",
  },
  {
    id: "faq-9",
    question: "What if I plateau or stop losing weight?",
    answer:
      "Plateaus are clinically expected in GLP-1 therapy — they commonly occur around weeks 5–8 as your body adjusts. Laso's platform automatically detects plateaus from your weekly weigh-ins and flags them to your care team. Your doctor will review your dose, adherence data, and dietary patterns and may recommend dose escalation, a dietary adjustment, or increased activity. You will never be left to figure out a plateau alone.",
    category: "program",
  },
  {
    id: "faq-10",
    question: "Can I stop the medication whenever I want?",
    answer:
      "You can discontinue at any time, but we strongly recommend consulting your doctor first. Abrupt discontinuation, especially if you have diabetes, can destabilise blood sugar control. Some patients experience weight regain after stopping GLP-1 therapy. Your doctor will create a proper tapering and transition plan. Long-term maintenance strategies (lifestyle, diet, reduced-dose medication) are part of the Laso extended programme.",
    category: "safety",
  },
];
