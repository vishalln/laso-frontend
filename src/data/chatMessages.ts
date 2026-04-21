export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  day: number;
  time: string;
}

export const initialChatMessages: ChatMessage[] = [
  {
    id: "bot-welcome",
    sender: "bot",
    text: "Hi Arjun 👋 I'm your Laso Health Care Coordinator. I have full context on your 12-week programme with Dr. Sharma. How can I help you today?",
    day: 0,
    time: "9:00 AM",
  },
  {
    id: "bot-checkin",
    sender: "bot",
    text: "Quick update: Your next consultation with Dr. Sharma is scheduled for April 28. Your current medication supply (Rybelsus 14mg) has approximately 8 days remaining — an auto-refill is scheduled for April 22.",
    day: 0,
    time: "9:01 AM",
  },
];

export const autoReplies: { keywords: string[]; response: string }[] = [
  {
    keywords: ["nausea", "sick", "vomit", "stomach"],
    response:
      "Nausea is a common and usually transient side effect of semaglutide, especially during the first 2–4 weeks or after dose escalation. Tips: take your medication 30 minutes before your first small meal (not on an empty stomach), eat slowly, and avoid fatty or spicy foods. If nausea is severe or persists for more than 7 days, please let us know and we'll escalate to Dr. Sharma.",
  },
  {
    keywords: ["dose", "medication", "rybelsus", "semaglutide"],
    response:
      "You are currently on Rybelsus (Semaglutide) 14mg once daily, taken 30 minutes before your first meal with up to 120ml of plain water. Do not crush or chew the tablet. Your current dose was escalated from 7mg at week 9 based on Dr. Sharma's recommendation following the plateau period.",
  },
  {
    keywords: ["weight", "loss", "plateau", "slow"],
    response:
      "Over 12 weeks, you've lost 6.2 kg (6.7% of your starting weight). You did experience a plateau in weeks 6–8, which is clinically expected and was resolved by escalating your dose to 14mg. Your progress is currently back on track and within the expected range for your treatment protocol.",
  },
  {
    keywords: ["appointment", "consult", "doctor", "sharma"],
    response:
      "Your next consultation with Dr. Rahul Sharma is on April 28, 2026 at 9:00 AM (online). This will be your Month 4 review — a good time to discuss progress on the extended protocol and any lifestyle adjustments. You can reschedule from the Consult page if needed.",
  },
  {
    keywords: ["hba1c", "glucose", "blood sugar", "diabetes"],
    response:
      "Your HbA1c has improved from 8.4% at baseline to 7.1% at your 12-week check — a reduction of 1.3% absolute, which is clinically significant. Your fasting glucose has come down from 178 mg/dL to 122 mg/dL. These are excellent glycaemic outcomes.",
  },
  {
    keywords: ["constipation", "bowel", "stomach ache", "bloat"],
    response:
      "Constipation is a known GI side effect of GLP-1 agonists. Recommendations: increase fluid intake (at least 2.5 litres/day), add more fibre (fruits, vegetables, whole grains), and take short walks after meals. If it persists beyond 5 days or is severe, we can arrange a review with Dr. Sharma or a dietary consultation.",
  },
  {
    keywords: ["cost", "price", "fee", "payment", "insurance"],
    response:
      "Your current Rybelsus 14mg supply costs ₹8,499/month through Laso's pharmacy network. Consultations with Dr. Sharma are covered under your active programme plan. Lab tests and ancillary care packs are charged separately. For detailed billing queries, please contact our support team at care@laso.health.",
  },
  {
    keywords: ["exercise", "activity", "workout", "gym"],
    response:
      "Your treatment plan includes 150 minutes of moderate aerobic activity per week plus 2× resistance training sessions. Dr. Sharma has also recommended starting a HIIT protocol from month 4. Laso's fitness coaching module is now available in your Journey page — we can connect you with a certified trainer.",
  },
];
