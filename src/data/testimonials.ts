export interface Testimonial {
  id: string;
  name: string;
  age: number;
  city: string;
  condition: string;
  weightLostKg: number;
  hba1cImprovement: string;
  weeksOnProgram: number;
  quote: string;
  initials: string;
  colorClass: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Meera S.",
    age: 42,
    city: "Bengaluru",
    condition: "Type 2 Diabetes + Obesity",
    weightLostKg: 9.2,
    hba1cImprovement: "8.9% → 6.8%",
    weeksOnProgram: 16,
    quote: "I'd tried everything — keto, intermittent fasting, endless gym sessions. Laso was different. The doctor actually looked at my data every week and adjusted the plan. I've lost 9 kg and my diabetes is almost in remission. First time in 6 years I feel in control.",
    initials: "MS",
    colorClass: "bg-primary",
    rating: 5,
  },
  {
    id: "t2",
    name: "Vikram R.",
    age: 38,
    city: "Mumbai",
    condition: "Obesity + Pre-diabetes",
    weightLostKg: 7.8,
    hba1cImprovement: "6.2% → 5.4%",
    weeksOnProgram: 12,
    quote: "The combination of the app tracking every dose, the doctor monitoring my progress, and the medication working properly — it's a complete system. I didn't feel alone for the first time. 7.8 kg in 12 weeks and my pre-diabetes markers are now normal.",
    initials: "VR",
    colorClass: "bg-accent",
    rating: 5,
  },
  {
    id: "t3",
    name: "Sunita P.",
    age: 51,
    city: "Delhi",
    condition: "Metabolic Syndrome",
    weightLostKg: 11.4,
    hba1cImprovement: "9.1% → 7.2%",
    weeksOnProgram: 20,
    quote: "The GLP-1 medication alone wouldn't have worked without the clinical oversight Laso provides. My doctor caught a plateau in week 7 and changed the dose — I would never have known that was possible. 11 kg later, I'm off one of my blood pressure medications.",
    initials: "SP",
    colorClass: "bg-success",
    rating: 5,
  },
  {
    id: "t4",
    name: "Rohit M.",
    age: 29,
    city: "Hyderabad",
    condition: "Obesity + NAFLD",
    weightLostKg: 6.5,
    hba1cImprovement: "N/A",
    weeksOnProgram: 12,
    quote: "I was sceptical about an online programme, but the doctor actually read my weekly check-in data and sent personalised notes. The care coordinator was responsive. It felt like having a private health concierge. Lost 6.5 kg and my liver enzymes are normalising.",
    initials: "RM",
    colorClass: "bg-primary",
    rating: 5,
  },
  {
    id: "t5",
    name: "Ananya K.",
    age: 35,
    city: "Pune",
    condition: "PCOS + Insulin Resistance",
    weightLostKg: 8.1,
    hba1cImprovement: "6.8% → 5.9%",
    weeksOnProgram: 16,
    quote: "With PCOS, weight loss felt impossible. My previous doctors dismissed it as a 'lifestyle issue'. Dr. Nair through Laso understood the hormonal picture completely. The structured GLP-1 programme, with weekly monitoring and diet guidance, changed everything for me.",
    initials: "AK",
    colorClass: "bg-accent",
    rating: 5,
  },
];
