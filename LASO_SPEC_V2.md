# LASO — MASTER SYSTEM SPEC V2 (UPDATED)
## Full-Stack Continuous Metabolic Care Engine
### Complete Journey: Landing → Auth → Quiz → Consult → Order → Journey → Progression

---

> **DIRECTIVE**: This document is the single source of truth for the Laso platform.
> Every component, every data model, every interaction, and every state transition is defined here with full JSON examples and dummy data.
> The system must feel like a **live clinical product** — not a prototype.

---

# PART 0 — PRODUCT PHILOSOPHY

## What Laso Is

Laso is a **closed-loop metabolic care engine**.

It is NOT:
- A telehealth booking app
- A dashboard with charts
- A pharmacy storefront
- A prescription checkout flow
- A static dashboard

It IS:
> A **longitudinal treatment system** where doctors define care, patients execute, the system tracks outcomes, and care continuously adapts. It is a **lifelong relationship with the patient**.

## The Core Loop (Non-Negotiable)

Every single feature in this system must serve this loop:

```
1. Patient provides data  →
2. System records state  →
3. Doctor/coordinator reviews  →
4. Action is defined  →
5. Patient executes action  →
6. Outcome is recorded  →
7. Doctor/system adjusts treatment  →
(repeat continuously, for life)
```

If a feature does not contribute to this loop → it is incomplete.

## Critical Product Principles

> **DO NOT build**: analytics dashboard, data-heavy UI, 10-card layouts, AI-generated insights, computed intelligence engines

> **DO build**: guided story of treatment, human-driven care coordination, structured longitudinal care, 1–2 actions shown at a time

> **What success feels like to the patient**:
> - "This system understands my journey"
> - "It tells me what to do next"
> - "My doctor is continuously involved"
> - "This is not an app — this is my treatment system"

## The MVP Intelligence Rule

**For MVP, the system does not use AI or computed algorithms.**

Intelligence in this system comes from two human sources:

1. **Patient's own logged data** — weekly Progress Entries (weight, glucose, side effects, adherence, hunger level). The system surfaces this data as-is. No algorithmic interpretation.
2. **Human clinical judgment** — doctors manually reviewing progress logs, writing notes, and sending messages. Coordinators manually flagging patients who need attention and sending check-in messages.

The system does not:
- Auto-generate insights or recommendations
- Compute a "Next Best Action"
- Score metabolic health algorithmically
- Auto-detect plateaus

The system does:
- Display patient-logged data clearly so doctors and coordinators can act on it
- Surface raw flags from progress entries (e.g., `missed_dose`, `mild_side_effect`) for coordinators to review
- Let patients see their own progress trends from data they entered

---

# PART 0B — THE FUNDAMENTAL DATA MODEL: PATIENT LIFELINE

## The Most Important Concept in This System

A patient in Laso has **one lifelong record**. That record never resets, never closes.

On top of that record, there are exactly **two types of events** that can happen over a patient's lifetime:

```
PATIENT (single lifelong record, forever)
│
├── EVENT TYPE 1: JOURNEY
│   └── A structured, multi-week/month treatment course
│   └── Has defined start, goal, steps, end
│   └── Example: "Weight Loss 2026 — Semaglutide 1 year"
│   └── Example: "Diabetes Management 2031 — Return course"
│
└── EVENT TYPE 2: CLINICAL INTERACTION
    └── A one-off event NOT part of any Journey
    └── Quick, standalone, small
    └── Example: "Patient called about nausea in 2028"
    └── Example: "Prescription renewal — no new journey needed"
    └── Example: "Quick check-in after 2 years off-program"
```

**Both event types appear on the patient's permanent timeline — forever.**

If a patient loses weight in 2026, disappears, then comes back in 2031 with weight regain — they start a new Journey. But they can see everything from 2026 on their profile. Every doctor who treats them in the future can see the full history.

## Why This Matters

This is what separates Laso from every telehealth product:
- Telehealth = isolated appointments
- Laso = continuous relationship with full longitudinal memory

A patient's entire metabolic health story lives in one place, permanently.

---

# PART 1 — SYSTEM ARCHITECTURE

## 1.1 Core Philosophy on Information Architecture

```
Dashboard = "What's happening RIGHT NOW" (summary only)
Journey Page = "Full treatment story + control" (the real product)
```

**The Dashboard should show ONLY 5 things:**
1. Active Journey card
2. Current Step (action focus)
3. Progress bar
4. Alerts
5. Recent message

**Everything else lives in the Journey page.**

## 1.2 Folder Structure

```
src/
├── contexts/
│   ├── UserContext.tsx           # Auth state, user profile, role
│   ├── JourneyContext.tsx        # Active journey, steps, progress
│   └── AppContext.tsx            # Global app state, notifications
│
├── data/
│   ├── mockPatients.ts           # Full patient profiles with history
│   ├── mockDoctors.ts            # Doctor profiles, availability
│   ├── mockJourneys.ts           # Journey objects with steps
│   ├── mockTreatmentPlans.ts     # Versioned treatment plans
│   ├── mockProgressEntries.ts    # Progress logs over time
│   ├── mockOrders.ts             # Orders, prescriptions, delivery
│   ├── mockMessages.ts           # Chat message threads
│   ├── mockInteractions.ts       # Clinical interactions (standalone + within journeys)
│   ├── mockTemplates.ts          # Admin-created protocol templates
│   └── medications.ts            # Drug database
│
├── hooks/
│   ├── useJourney.ts             # Journey state management
│   ├── useAdherenceScore.ts      # Adherence calculation (manual data only)
│   └── useMobile.ts
│
├── lib/
│   ├── bmiCalculator.ts
│   └── utils.ts
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ProgramCards.tsx
│   │   ├── TrustSignals.tsx
│   │   ├── Testimonials.tsx
│   │   └── FAQ.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── GoogleLoginButton.tsx
│   │   └── EmailVerificationBanner.tsx
│   │
│   ├── quiz/
│   │   ├── QuizProgress.tsx
│   │   ├── StepAge.tsx
│   │   ├── StepBodyMetrics.tsx
│   │   ├── StepConditions.tsx
│   │   ├── StepContraindications.tsx
│   │   └── QuizResult.tsx
│   │
│   ├── consult/
│   │   ├── DoctorCard.tsx
│   │   ├── SlotPicker.tsx
│   │   ├── PreConsultSummary.tsx
│   │   └── BookingConfirmation.tsx
│   │
│   ├── orders/
│   │   ├── PrescriptionLifecycle.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── DeliveryTracker.tsx
│   │   └── RefillEngine.tsx
│   │
│   ├── journey/
│   │   ├── JourneyView.tsx             # Master journey page
│   │   ├── JourneyHeader.tsx
│   │   ├── StepCard.tsx                # Current treatment step (with fulfillment options)
│   │   ├── StepFulfillmentOptions.tsx  # Buy / Self-managed / Skip
│   │   ├── ProgressLogger.tsx          # Quick log widget (human input)
│   │   ├── TimelineView.tsx            # Chronological event feed
│   │   ├── StepsList.tsx               # All steps grouped by status
│   │   └── TreatmentPlanCard.tsx
│   │
│   ├── dashboard/
│   │   ├── ActiveJourneyCard.tsx       # Journey name, goal, progress summary
│   │   ├── CurrentStepWidget.tsx       # Current step + quick action buttons
│   │   ├── ProgressBar.tsx             # kg lost / target progress
│   │   ├── AlertsWidget.tsx            # Human-raised alerts only
│   │   └── MessagePreview.tsx          # Latest message from doctor/coordinator
│   │
│   ├── doctor/
│   │   ├── DoctorDashboard.tsx
│   │   ├── PatientList.tsx
│   │   ├── PatientDetail.tsx           # Tabs: Overview, Journey, Steps, Plan, Messages, Notes
│   │   ├── CreateTreatmentPlan.tsx     # Select template, customize steps, assign
│   │   └── DoctorNotes.tsx
│   │
│   ├── coordinator/
│   │   ├── CoordinatorDashboard.tsx
│   │   ├── AlertsList.tsx              # Patients needing attention
│   │   └── FollowUpQueue.tsx
│   │
│   ├── admin/
│   │   ├── AdminDashboard.tsx          # System overview
│   │   ├── TemplateBuilder.tsx         # Protocol template designer
│   │   ├── TemplateStepEditor.tsx      # Add/edit steps in a template
│   │   ├── DoctorManagement.tsx        # Assign doctors to patients
│   │   └── CatalogManager.tsx          # Manage products/services in step options
│   │
│   ├── patient/
│   │   ├── PatientLifeline.tsx         # Full history: all journeys + clinical interactions
│   │   └── ClinicalInteractionCard.tsx    # Display a standalone clinical event
│   │
│   └── shared/
│       ├── StatCard.tsx
│       ├── SeverityBadge.tsx
│       ├── PageHeader.tsx
│       └── ScoreRing.tsx
│
└── pages/
    ├── Landing.tsx
    ├── Login.tsx
    ├── Quiz.tsx
    ├── Consult.tsx
    ├── Orders.tsx
    ├── Journey.tsx          # THE core patient page
    ├── Dashboard.tsx        # Simplified: 5 elements only
    ├── Support.tsx
    ├── DoctorPortal.tsx
    ├── CoordinatorPortal.tsx
    └── AdminPortal.tsx      # NEW: admin-only
```

---

# PART 2 — AUTH SYSTEM

## 2.1 Login Page (`/login`)

### Two Auth Modes:

1. **Google Login** — auto-verified, immediate access
2. **Email/Password** — requires email verification before dashboard access

### Demo Mode:
```
Email: arjun@laso.health       |  Password: demo123   |  Role: patient
Email: dr.sharma@laso.health   |  Password: doctor123 |  Role: doctor
Email: coord@laso.health       |  Password: coord123  |  Role: coordinator
Email: admin@laso.health       |  Password: admin123  |  Role: admin
```

### User Schema (TypeScript)

```typescript
interface User {
  id: string;
  email: string;
  role: "patient" | "doctor" | "coordinator" | "admin";
  authProvider: "google" | "email";
  isVerified: boolean;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}
```

### Mock Users

```json
[
  {
    "id": "user_001",
    "email": "arjun@laso.health",
    "role": "patient",
    "authProvider": "email",
    "isVerified": true,
    "name": "Arjun Sharma",
    "createdAt": "2026-01-01T09:00:00Z",
    "lastLoginAt": "2026-04-18T07:30:00Z"
  },
  {
    "id": "user_002",
    "email": "dr.sharma@laso.health",
    "role": "doctor",
    "authProvider": "google",
    "isVerified": true,
    "name": "Dr. Rahul Sharma",
    "createdAt": "2025-06-01T09:00:00Z",
    "lastLoginAt": "2026-04-18T08:00:00Z"
  },
  {
    "id": "user_003",
    "email": "coord@laso.health",
    "role": "coordinator",
    "authProvider": "email",
    "isVerified": true,
    "name": "Priya Coordinator",
    "createdAt": "2025-07-01T09:00:00Z",
    "lastLoginAt": "2026-04-18T09:00:00Z"
  },
  {
    "id": "user_004",
    "email": "admin@laso.health",
    "role": "admin",
    "authProvider": "email",
    "isVerified": true,
    "name": "Admin User",
    "createdAt": "2025-01-01T09:00:00Z",
    "lastLoginAt": "2026-04-18T10:00:00Z"
  }
]
```

### Role-Based Routing After Login

| Role | Redirect |
|---|---|
| `patient` | `/dashboard` |
| `doctor` | `/doctor-portal` |
| `coordinator` | `/coordinator-portal` |
| `admin` | `/admin` |

---

# PART 3 — LANDING PAGE (`/`)

## 3.1 Hero Section

**Headline**: "Doctor-led metabolic care that works continuously"
**Subtext**: "Clinically supervised GLP-1 therapy. Evidence-based. Delivered to your door. Tracked every step."
**Primary CTA**: "Check Your Eligibility" → `/quiz`
**Secondary CTA**: "See How It Works" → scroll anchor

## 3.2 How It Works — 5 Steps

```
Step 1: Complete Health Assessment    (3 min quiz)
Step 2: Consult Licensed Physician    (15-min video)
Step 3: Receive Personalised Plan     (prescription + journey)
Step 4: Medication Delivered          (temperature-controlled)
Step 5: Continuous Care Loop          (track → review → adapt)
```

## 3.3 Program Cards

Toggle: **Weight Loss** | **Diabetes Management**

**Weight Loss Card:**
- Drug: Semaglutide (GLP-1 agonist)
- Evidence: "STEP 1 trial: 14.9% average body weight reduction over 68 weeks"
- Includes: Doctor consultation, prescription, monthly follow-ups, journey tracking

**Diabetes Card:**
- Drug: Metformin + Liraglutide
- Evidence: "Metformin monotherapy lowers HbA1c by ~1.12% (95% CI: 0.92–1.32%)"
- Includes: HbA1c monitoring, medication management, glucose tracking

## 3.4 Trust Signals

```
✅ Licensed Physicians (MCI registered, min 5 years experience)
✅ Verified Pharmacy Partners (Drugs & Cosmetics Act, 1940)
✅ Continuous Medical Oversight (monthly reviews, plan adaptation)
```

## 3.5 Testimonials (Mock)

```json
[
  {
    "name": "Priya Mehta",
    "age": 34,
    "city": "Mumbai",
    "program": "Weight Loss",
    "outcome": "Lost 9 kg over 4 months with semaglutide under Dr. Sharma's supervision.",
    "detail": "Mild nausea in the first two weeks, which resolved on its own."
  },
  {
    "name": "Rajesh Nair",
    "age": 52,
    "city": "Bangalore",
    "program": "Diabetes Management",
    "outcome": "HbA1c reduced from 8.2% to 6.9% over 6 months.",
    "detail": "No major side effects. Felt more energy after week 4."
  },
  {
    "name": "Sunita Krishnan",
    "age": 41,
    "city": "Chennai",
    "program": "Weight Loss",
    "outcome": "11 kg lost over 5 months.",
    "detail": "Plateau at month 3 was resolved with dose adjustment by Dr. Patel."
  }
]
```

**Mandatory disclaimer**: *"Individual results vary. These reflect personal experiences and not guaranteed outcomes."*

---

# PART 4 — ELIGIBILITY QUIZ (`/quiz`)

## 4.1 Quiz State Schema

```typescript
interface QuizState {
  currentStep: number;
  completionPercent: number;
  data: QuizData;
  result: QuizResult | null;
  flags: string[];
}

interface QuizData {
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer_not_to_say";
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  program: "weight_loss" | "diabetes" | "both";
  conditions: string[];
  medications: string;
  noMedications: boolean;
  contraindications: {
    pregnant: boolean;
    thyroidCancer: boolean;
    type1Diabetes: boolean;
  };
  hba1c: number | null;
  hba1cKnown: boolean;
}

interface QuizResult {
  eligible: boolean;
  reason: string;
  recommendation: string;
  flags: string[];
}
```

## 4.2 Step-by-Step Specification

### Step 1 — Age
Input: number (18–75). Validation: < 18 → "Program available for adults 18 and above"

### Step 2 — Gender
Options: Male | Female | Non-binary | Prefer not to say

### Step 3 — Body Metrics (KEY STEP)

```typescript
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25.0) return "Normal weight";
  if (bmi < 30.0) return "Overweight";
  if (bmi < 35.0) return "Obese Class I";
  if (bmi < 40.0) return "Obese Class II";
  return "Obese Class III";
}
```

**Example display**:
```
Your BMI: 31.2 — Obese Class I
"Your BMI places you in Obese Class I. You may benefit from GLP-1 therapy."
```

### Step 4 — Program Selection
Options: Weight Loss | Diabetes Management | Both

### Step 5 — Existing Conditions
Multi-select: Type 2 Diabetes | Hypertension | PCOS | Thyroid disorder | Heart disease | Kidney disease | Liver disease | None

### Step 6 — Current Medications
Text input + "I am not currently taking any medications" checkbox

### Step 7 — Contraindication Screening
Q1: Pregnancy → flag contraindication
Q2: Medullary thyroid carcinoma or MEN 2 history → flag
Q3: Type 1 diabetes or DKA → flag

### Step 8 — HbA1c (if program includes diabetes)

## 4.3 Quiz Result Screen

### Eligible Path:
```json
{
  "eligible": true,
  "bmi": 31.2,
  "bmiCategory": "Obese Class I",
  "program": "weight_loss",
  "interpretation": "Based on your responses, you may be a candidate for our Weight Loss program using GLP-1 therapy.",
  "recommendation": "The next step is a consultation with one of our physicians.",
  "cta": "Book Your Consultation",
  "ctaRoute": "/consult"
}
```

### Flagged Path:
```json
{
  "eligible": false,
  "flags": ["thyroid_contraindication"],
  "interpretation": "Based on your family history, GLP-1 receptor agonists may not be appropriate for you.",
  "recommendation": "Our medical team will follow up with personalised guidance within 24 hours.",
  "cta": "We'll Be In Touch"
}
```

*"This assessment does not constitute a medical diagnosis. All treatment decisions are made by a licensed physician."*

---

# PART 5 — CONSULTATION BOOKING (`/consult`)

## 5.1 Pre-Consult Summary (Auto-Generated)

```json
{
  "patientBrief": {
    "generatedAt": "2026-04-18T10:00:00Z",
    "patientName": "Arjun Sharma",
    "age": 34,
    "bmi": 31.2,
    "bmiCategory": "Obese Class I",
    "program": "weight_loss",
    "conditions": ["none_declared"],
    "medications": "none",
    "contraindications": "none",
    "hba1c": null,
    "suggestedDirection": "GLP-1 receptor agonist therapy (semaglutide) — eligibility to be confirmed by physician",
    "urgencyLevel": "routine"
  }
}
```

## 5.2 Doctor Selection

```json
[
  {
    "id": "doctor_001",
    "name": "Dr. Rahul Sharma",
    "credentials": "MBBS, MD (Internal Medicine), Fellowship in Diabetes Management",
    "mciReg": "MH/2015/04523",
    "experience": "8 years",
    "specialty": "Metabolic disorders and medical weight management",
    "rating": 4.8,
    "totalConsults": 127,
    "availableSlots": [
      "2026-04-19T10:00:00",
      "2026-04-19T11:30:00",
      "2026-04-19T14:00:00",
      "2026-04-20T10:00:00"
    ]
  },
  {
    "id": "doctor_002",
    "name": "Dr. Anjali Deshmukh",
    "credentials": "MBBS, MD (Endocrinology)",
    "mciReg": "KA/2012/03891",
    "experience": "11 years",
    "specialty": "Type 2 diabetes management and thyroid disorders",
    "rating": 4.9,
    "totalConsults": 203,
    "availableSlots": [
      "2026-04-19T09:00:00",
      "2026-04-19T13:00:00",
      "2026-04-21T10:00:00"
    ]
  }
]
```

## 5.3 Booking Schema

```typescript
interface Booking {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomLink: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  preConsultBriefId: string;
  postConsultArtifacts?: PostConsultArtifacts;
  createdAt: string;
}
```

```json
{
  "id": "booking_001",
  "patientId": "patient_001",
  "doctorId": "doctor_001",
  "scheduledAt": "2026-04-19T14:00:00Z",
  "durationMinutes": 15,
  "zoomLink": "https://zoom.us/j/9876543210",
  "status": "confirmed",
  "preConsultBriefId": "brief_001",
  "createdAt": "2026-04-18T10:05:00Z"
}
```

## 5.4 Post-Consultation Artifacts (CRITICAL)

### A. Doctor Notes
```json
{
  "id": "notes_001",
  "bookingId": "booking_001",
  "doctorId": "doctor_001",
  "patientId": "patient_001",
  "createdAt": "2026-04-19T14:20:00Z",
  "chiefComplaint": "Weight loss — BMI 31.2, motivated to lose 12-15 kg",
  "clinicalAssessment": "34-year-old male, Obese Class I. No contraindications to GLP-1 therapy. Good candidate for semaglutide.",
  "plan": "Initiate semaglutide 0.25mg weekly for 4 weeks, then escalate to 0.5mg. Monthly follow-ups. Weekly weight logging.",
  "followUpDate": "2026-05-19",
  "doctorSignature": "Dr. Rahul Sharma, MH/2015/04523"
}
```

### B. Treatment Plan (Versioned)
```json
{
  "id": "plan_001",
  "version": 1,
  "patientId": "patient_001",
  "journeyId": "journey_001",
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:25:00Z",
  "status": "active",
  "medications": [
    {
      "id": "med_001",
      "name": "Semaglutide",
      "brandName": "Ozempic",
      "form": "subcutaneous injection",
      "startDose": "0.25mg weekly",
      "targetDose": "1.0mg weekly",
      "escalationSchedule": [
        { "week": 1, "dose": "0.25mg" },
        { "week": 5, "dose": "0.5mg" },
        { "week": 9, "dose": "1.0mg" }
      ],
      "instructions": [
        "Inject subcutaneously in abdomen, thigh, or upper arm",
        "Rotate injection sites",
        "Store in refrigerator (2–8°C)"
      ]
    }
  ],
  "dietaryGuidance": [
    "Avoid high-fat meals around injection time",
    "Eat smaller, more frequent meals",
    "Stay hydrated — minimum 2L water daily"
  ],
  "monitoringRequirements": [
    "Weekly weight logging (morning, after bathroom, before breakfast)",
    "Monthly consultation review"
  ]
}
```

---

# PART 6 — PRESCRIPTION → ORDER → DELIVERY LIFECYCLE

## 6.1 Order Status Lifecycle

```typescript
type PrescriptionLifecycleStatus =
  | "prescription_issued"
  | "order_created"
  | "payment_pending"
  | "payment_confirmed"
  | "pharmacy_verifying"
  | "pharmacist_approved"
  | "packing"
  | "temperature_check_passed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "delivery_confirmed_by_patient";
```

## 6.2 Full Order Object

```json
{
  "id": "order_001",
  "patientId": "patient_001",
  "prescriptionId": "rx_001",
  "doctorId": "doctor_001",
  "placedAt": "2026-04-19T14:35:00Z",
  "status": "delivered",
  "items": [
    {
      "itemId": "item_001",
      "name": "Semaglutide (Ozempic) 0.25mg Pre-filled Pen",
      "quantity": 4,
      "unitPrice": 2200,
      "totalPrice": 8800,
      "storageRequirement": "2–8°C refrigerated"
    },
    {
      "itemId": "item_002",
      "name": "Consultation Fee — Dr. Rahul Sharma",
      "quantity": 1,
      "unitPrice": 599,
      "totalPrice": 599
    }
  ],
  "subtotal": 9399,
  "deliveryFee": 0,
  "total": 9399,
  "payment": {
    "status": "paid",
    "method": "UPI",
    "transactionId": "TXN20260419143600LASO",
    "paidAt": "2026-04-19T14:36:00Z",
    "amount": 9399
  },
  "delivery": {
    "courier": "BlueDart Express",
    "trackingId": "BD202604191500",
    "address": {
      "line1": "Flat 402, Sai Krupa Apartments",
      "area": "Bandra West",
      "city": "Mumbai",
      "pincode": "400050"
    },
    "estimatedDelivery": "2026-04-21T18:00:00Z",
    "deliveredAt": "2026-04-21T16:45:00Z",
    "temperatureLog": [
      { "timestamp": "2026-04-19T16:00:00Z", "tempC": 5.2, "status": "ok" },
      { "timestamp": "2026-04-20T08:00:00Z", "tempC": 4.8, "status": "ok" },
      { "timestamp": "2026-04-21T10:00:00Z", "tempC": 6.1, "status": "ok" }
    ]
  },
  "lifecycleTimeline": [
    { "status": "prescription_issued",           "timestamp": "2026-04-19T14:30:00Z", "note": "Prescription issued by Dr. Rahul Sharma" },
    { "status": "order_created",                 "timestamp": "2026-04-19T14:35:00Z", "note": "Order auto-created from prescription" },
    { "status": "payment_confirmed",             "timestamp": "2026-04-19T14:36:00Z", "note": "Payment ₹9,399 confirmed via UPI" },
    { "status": "pharmacy_verifying",            "timestamp": "2026-04-19T15:00:00Z", "note": "MedPlus reviewing prescription" },
    { "status": "pharmacist_approved",           "timestamp": "2026-04-19T16:00:00Z", "note": "Pharmacist Ravi Kulkarni approved" },
    { "status": "packing",                       "timestamp": "2026-04-19T16:30:00Z", "note": "Packed in temperature-controlled packaging" },
    { "status": "shipped",                       "timestamp": "2026-04-19T17:00:00Z", "note": "Handed to BlueDart. Tracking: BD202604191500" },
    { "status": "out_for_delivery",              "timestamp": "2026-04-21T09:00:00Z", "note": "Out for delivery in Bandra West" },
    { "status": "delivered",                     "timestamp": "2026-04-21T16:45:00Z", "note": "Delivered to Flat 402, Sai Krupa Apartments" },
    { "status": "delivery_confirmed_by_patient", "timestamp": "2026-04-21T17:00:00Z", "note": "Patient confirmed receipt. Cold chain intact." }
  ],
  "patientDeliveryConfirmation": {
    "confirmed": true,
    "confirmedAt": "2026-04-21T17:00:00Z",
    "packageCondition": "good",
    "coldChainIntact": true
  }
}
```

---

# PART 7 — PATIENT PROFILE

## 7.1 Full Patient Schema

```typescript
interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  conditions: string[];
  medications: string;
  hba1c?: number;
  program: "weight_loss" | "diabetes" | "both";
  primaryDoctorId: string;
  coordinatorId: string;
  journeyIds: string[];             // ALL journeys, past and present
  clinicalInteractionIds: string[];    // All standalone clinical interactions
  createdAt: string;
  lastActiveAt: string;
}
```

## 7.2 Mock Patient

```json
{
  "id": "patient_001",
  "userId": "user_001",
  "name": "Arjun Sharma",
  "age": 34,
  "gender": "male",
  "heightCm": 172,
  "weightKg": 92,
  "bmi": 31.1,
  "bmiCategory": "Obese Class I",
  "conditions": [],
  "medications": "none",
  "hba1c": null,
  "program": "weight_loss",
  "primaryDoctorId": "doctor_001",
  "coordinatorId": "coord_001",
  "journeyIds": ["journey_001"],
  "clinicalInteractionIds": [],
  "createdAt": "2026-04-18T10:00:00Z",
  "lastActiveAt": "2026-04-18T07:30:00Z"
}
```

---

# PART 8 — PATIENT LIFELINE (THE LIFELONG RECORD)

## 8.1 What the Patient Sees When They Log In After Years

The patient's entire metabolic health history lives in one place, permanently.

**Example: A patient who comes back after 5 years:**

```
MY HEALTH HISTORY — Arjun Sharma

JOURNEYS:
  ◉ Weight Loss 2026 (Completed — lost 14.2 kg over 11 months) → [View Full Journey]
  ◉ Weight Management 2031 (Active — Week 6) → [View Journey]

CLINICAL INTERACTIONS:
  • Jul 2028 — Quick consult with Dr. Patel (mild fatigue inquiry)
  • Mar 2030 — Prescription renewal (no new journey started)
```

Each item is fully clickable and shows its complete history.

## 8.2 PatientLifeline Schema

```typescript
interface PatientLifeline {
  patientId: string;
  name: string;
  lifetimeEvents: LifetimeEvent[];
}

type LifetimeEventType = "journey" | "clinical_interaction";

interface LifetimeEvent {
  id: string;
  type: LifetimeEventType;
  date: string;
  title: string;
  summary: string;
  status: "active" | "completed" | "cancelled";
  linkedId: string;  // journeyId or interactionId
}
```

```json
{
  "patientId": "patient_001",
  "name": "Arjun Sharma",
  "lifetimeEvents": [
    {
      "id": "le_001",
      "type": "journey",
      "date": "2026-04-21",
      "title": "Weight Loss Journey 2026",
      "summary": "Semaglutide 1-year course. Goal: -15kg.",
      "status": "active",
      "linkedId": "journey_001"
    }
  ]
}
```

---

# PART 9 — CLINICAL INTERACTION (STANDALONE)

## 9.1 Definition

A Clinical Interaction is a **standalone medical event** that is NOT part of any Journey.

Examples:
- Patient calls to ask about a side effect (when not currently in active Journey)
- Prescription renewal without starting a new Journey
- Quick check-in 2 years after completing a Journey
- Emergency consult
- Lab result review

## 9.2 Schema

```typescript
interface ClinicalInteraction {
  id: string;
  patientId: string;
  doctorId?: string;
  coordinatorId?: string;
  type: "consultation" | "prescription_renewal" | "emergency_consult" | "lab_review" | "check_in";
  date: string;
  durationMinutes?: number;
  notes: string;
  outcome: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: string[];
  createdAt: string;
}
```

```json
{
  "id": "adhoc_001",
  "patientId": "patient_001",
  "doctorId": "doctor_001",
  "type": "consultation",
  "date": "2028-07-15",
  "durationMinutes": 12,
  "notes": "Patient reported mild fatigue 2 years post-journey. No new medication needed. Lifestyle review done.",
  "outcome": "No changes. Monitor. Patient advised to return if symptoms worsen.",
  "followUpRequired": false,
  "createdAt": "2028-07-15T10:30:00Z"
}
```

---

# PART 10 — JOURNEY SYSTEM (CORE ENGINE)

## 10.1 What a Journey Is

A Journey is a **structured, multi-week treatment course** with:
- A defined start date, goal, and expected duration
- A treatment plan (medication, doses, escalation schedule)
- A sequence of Treatment Steps (the clinical flow)
- Multiple Clinical Interactions embedded within it (consultations, reviews)
- Weekly Progress Entries
- An embedded message thread

## 10.2 Journey Schema

```typescript
interface Journey {
  id: string;
  patientId: string;
  name: string;
  goal: string;
  type: "weight_loss" | "diabetes_management" | "combined";
  status: "active" | "paused" | "completed" | "cancelled";
  startDate: string;
  endDate: string | null;
  targetWeightKg?: number;
  targetHba1c?: number;
  currentWeekNumber: number;
  prescriptionId: string;
  treatmentPlanId: string;
  stepIds: string[];
  clinicalInteractionIds: string[];   // Consultations and reviews within this journey
  templateId: string;                 // Which admin template was used
  createdBy: string;                  // doctor_id
  createdAt: string;
}
```

## 10.3 Mock Journey

```json
{
  "id": "journey_001",
  "patientId": "patient_001",
  "name": "Weight Loss Journey 2026",
  "goal": "Lose 15 kg in 12 months",
  "type": "weight_loss",
  "status": "active",
  "startDate": "2026-04-21",
  "endDate": null,
  "targetWeightKg": 77,
  "currentWeekNumber": 8,
  "prescriptionId": "rx_001",
  "treatmentPlanId": "plan_001",
  "stepIds": ["step_001", "step_002", "step_003", "step_004", "step_005", "step_006", "step_007", "step_008"],
  "clinicalInteractionIds": ["ci_001"],
  "templateId": "template_001",
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

---

# PART 11 — TREATMENT STEPS (THE CORE ENGINE)

## 11.1 The Step Engine — The Most Important Concept

A Treatment Step is NOT just a task. It is a **decision point** with multiple fulfillment paths.

The Admin (owner of Laso) designs step templates in advance.
The Doctor assigns a template to a patient and can customize steps.
The Patient sees only the next step to execute and chooses how to fulfill it.

## 11.2 Step Schema

```typescript
type StepType = "device" | "test" | "medication" | "lifestyle" | "consultation" | "check_in" | "supplement" | "behavior";
type StepStatus = "pending" | "active" | "completed" | "skipped" | "blocked";

interface FulfillmentOption {
  id: string;
  label: string;
  type: "buy_from_iaso" | "self_managed" | "skip" | "book" | "already_done";
  actionUrl?: string;
  price?: number;
  metadata?: Record<string, string>;
}

interface TreatmentStep {
  id: string;
  journeyId: string;
  order: number;
  title: string;
  type: StepType;
  instruction: string;
  detail?: string;
  isOptional: boolean;
  fulfillmentOptions: FulfillmentOption[];
  selectedOptionId: string | null;
  selectedOptionReason?: string;    // why skipped, etc.
  status: StepStatus;
  completedAt: string | null;
  dependsOn: string | null;         // step_id that must be complete first
  triggerCondition: string | null;  // condition like "weight_loss_kg >= 9"
  triggerMet: boolean;
  createdBy: string;                // doctor_id or admin_id
  createdAt: string;
  notes?: string;                   // doctor can add notes to any step
}
```

## 11.3 The 3 Fulfillment Paths (Always the Same Pattern)

**For any step involving a product or service, the patient always has exactly these options:**

```
Option A: Buy from Laso     [link to Laso store/partner]    — keeps revenue in-house
Option B: I have it / doing it myself                       — self-managed
Option C: Skip                                              — skipped (with reason)
```

This pattern works for:
- Blood glucose monitor → "Order from Laso (₹899)" / "I already have one" / "Skip"
- DEXA scan → "Book via Laso lab partner (₹2,200)" / "I'll book myself" / "Skip"
- Protein supplement → "Buy Laso Protein (₹1,499)" / "I'll source it myself" / "Skip"
- Consultation → "Book now" / "Request reschedule" (N/A for skip)
- Medication → "Confirm delivery received" / "Report issue"

## 11.4 Full Mock Steps (All 8 Steps of Journey)

### Step 1 — Receive Medication
```json
{
  "id": "step_001",
  "journeyId": "journey_001",
  "order": 1,
  "title": "Receive Your Semaglutide",
  "type": "medication",
  "instruction": "Your first month supply of Semaglutide (0.25mg pre-filled pen) is on its way. Confirm receipt when delivered.",
  "detail": "Store in refrigerator between 2–8°C. Do not freeze. Bring to room temperature 30 minutes before use.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_1a", "label": "Confirm Delivery Received", "type": "already_done" },
    { "id": "opt_1b", "label": "Report Delivery Issue",     "type": "skip" }
  ],
  "selectedOptionId": "opt_1a",
  "status": "completed",
  "completedAt": "2026-04-21T17:00:00Z",
  "dependsOn": null,
  "triggerCondition": null,
  "triggerMet": true,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 2 — First Injection
```json
{
  "id": "step_002",
  "journeyId": "journey_001",
  "order": 2,
  "title": "Administer First Dose",
  "type": "medication",
  "instruction": "Administer your first 0.25mg semaglutide injection. Use the abdomen, thigh, or upper arm. Rotate sites each week.",
  "detail": "Keep it consistent every week (e.g., every Sunday). The injection takes less than 30 seconds.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_2a", "label": "Mark Dose as Taken",               "type": "already_done" },
    { "id": "opt_2b", "label": "Watch Injection Tutorial",          "type": "book",        "actionUrl": "https://youtube.com/watch?v=example" },
    { "id": "opt_2c", "label": "I need help — message coordinator", "type": "skip" }
  ],
  "selectedOptionId": "opt_2a",
  "status": "completed",
  "completedAt": "2026-04-22T09:00:00Z",
  "dependsOn": "step_001",
  "triggerCondition": null,
  "triggerMet": true,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 3 — Blood Glucose Monitor
```json
{
  "id": "step_003",
  "journeyId": "journey_001",
  "order": 3,
  "title": "Set Up Blood Glucose Monitor",
  "type": "device",
  "instruction": "A blood glucose monitor helps track your fasting sugar levels. This provides important data for your doctor.",
  "detail": "Fasting glucose should be measured every morning before eating. Target range: 70–100 mg/dL for non-diabetics.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_3a", "label": "Order via Laso (₹899)",  "type": "buy_from_iaso", "actionUrl": "/orders/new?item=glucose_monitor", "price": 899 },
    { "id": "opt_3b", "label": "I already have one",      "type": "self_managed" },
    { "id": "opt_3c", "label": "Skip for now",             "type": "skip" }
  ],
  "selectedOptionId": "opt_3b",
  "status": "completed",
  "completedAt": "2026-04-22T10:00:00Z",
  "dependsOn": null,
  "triggerCondition": null,
  "triggerMet": true,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 4 — Log Baseline Weight
```json
{
  "id": "step_004",
  "journeyId": "journey_001",
  "order": 4,
  "title": "Log Your Starting Weight",
  "type": "check_in",
  "instruction": "Log your weight first thing in the morning, after visiting the bathroom, before eating or drinking.",
  "detail": "Consistency matters more than precision. Same scale, same time, same conditions every week.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_4a", "label": "Log Weight Now", "type": "already_done" }
  ],
  "selectedOptionId": "opt_4a",
  "status": "completed",
  "completedAt": "2026-04-22T07:00:00Z",
  "dependsOn": null,
  "triggerCondition": null,
  "triggerMet": true,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 5 — Week 4 Check-In
```json
{
  "id": "step_005",
  "journeyId": "journey_001",
  "order": 5,
  "title": "Week 4 Progress Check-In",
  "type": "check_in",
  "instruction": "Log your weight, any side effects, and how you've been feeling. Your doctor will review this before deciding whether to escalate your dose.",
  "detail": "Dose escalation from 0.25mg to 0.5mg will be considered based on your response and tolerability.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_5a", "label": "Log Progress Now",              "type": "already_done" },
    { "id": "opt_5b", "label": "Schedule message with doctor",  "type": "book" }
  ],
  "selectedOptionId": null,
  "status": "active",
  "completedAt": null,
  "dependsOn": "step_002",
  "triggerCondition": "week_number >= 4",
  "triggerMet": true,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 6 — Blood Work
```json
{
  "id": "step_006",
  "journeyId": "journey_001",
  "order": 6,
  "title": "Baseline Blood Work",
  "type": "test",
  "instruction": "Get a fasting lipid panel, liver function test, and kidney function test. This is your baseline before dose escalation.",
  "detail": "Tests required: Fasting lipids, LFT, KFT, HbA1c (if diabetic). Can be done at any certified lab.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_6a", "label": "Book via Laso Lab Partners", "type": "buy_from_iaso", "actionUrl": "/orders/lab?test=baseline_panel" },
    { "id": "opt_6b", "label": "I will do it myself",         "type": "self_managed" },
    { "id": "opt_6c", "label": "Skip",                        "type": "skip" }
  ],
  "selectedOptionId": null,
  "status": "pending",
  "completedAt": null,
  "dependsOn": "step_005",
  "triggerCondition": "week_number >= 6",
  "triggerMet": false,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 7 — Month 1 Consultation
```json
{
  "id": "step_007",
  "journeyId": "journey_001",
  "order": 7,
  "title": "Month 1 Review Consultation",
  "type": "consultation",
  "instruction": "Book your follow-up consultation with Dr. Sharma. He will review your progress and decide on dose escalation.",
  "detail": "Dose escalation from 0.25mg to 0.5mg will be decided here.",
  "isOptional": false,
  "fulfillmentOptions": [
    { "id": "opt_7a", "label": "Book Consultation",    "type": "book", "actionUrl": "/consult?doctor=doctor_001&type=followup" },
    { "id": "opt_7b", "label": "Request to reschedule", "type": "skip" }
  ],
  "selectedOptionId": null,
  "status": "pending",
  "completedAt": null,
  "dependsOn": "step_006",
  "triggerCondition": "week_number >= 8",
  "triggerMet": false,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### Step 8 — DEXA Scan (Conditional — THE KEY EXAMPLE)
```json
{
  "id": "step_008",
  "journeyId": "journey_001",
  "order": 8,
  "title": "DEXA Scan — Body Composition",
  "type": "test",
  "instruction": "A DEXA scan measures your lean muscle mass versus fat mass. This helps ensure you're losing fat, not muscle.",
  "detail": "This step is triggered when you've lost 9 kg or more. It's optional but clinically valuable.",
  "isOptional": true,
  "fulfillmentOptions": [
    { "id": "opt_8a", "label": "Book via Laso (₹2,200)",  "type": "buy_from_iaso", "actionUrl": "/orders/scan?type=dexa", "price": 2200 },
    { "id": "opt_8b", "label": "I will book it myself",    "type": "self_managed" },
    { "id": "opt_8c", "label": "Skip",                     "type": "skip" }
  ],
  "selectedOptionId": null,
  "status": "pending",
  "completedAt": null,
  "dependsOn": null,
  "triggerCondition": "weight_loss_kg >= 9",
  "triggerMet": false,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

### (Diabetes-specific Step — Protein Supplement)
```json
{
  "id": "step_009",
  "journeyId": "journey_001",
  "order": 9,
  "title": "Add Protein Supplement",
  "type": "supplement",
  "instruction": "Your doctor recommends adding a protein supplement to protect lean muscle mass during weight loss. GLP-1 therapy can sometimes reduce muscle alongside fat.",
  "detail": "Target: 1.2g protein per kg body weight daily. A supplement can help bridge the gap.",
  "isOptional": true,
  "fulfillmentOptions": [
    { "id": "opt_9a", "label": "Buy Laso Protein (₹1,499)", "type": "buy_from_iaso", "actionUrl": "/orders/supplements?item=protein_whey", "price": 1499 },
    { "id": "opt_9b", "label": "I'll source it myself",      "type": "self_managed" },
    { "id": "opt_9c", "label": "Skip",                       "type": "skip" }
  ],
  "selectedOptionId": null,
  "status": "pending",
  "completedAt": null,
  "dependsOn": null,
  "triggerCondition": "week_number >= 8",
  "triggerMet": false,
  "createdBy": "doctor_001",
  "createdAt": "2026-04-19T14:40:00Z"
}
```

---

# PART 12 — CLINICAL INTERACTIONS (WITHIN A JOURNEY)

## 12.1 What They Are

Clinical Interactions are medical events that happen **inside a Journey**. They are different from Treatment Steps — they are the doctor's actual engagements with the patient during the course of treatment.

## 12.2 Schema

```typescript
type ClinicalInteractionType = "initial_consultation" | "monthly_review" | "async_review" | "dose_adjustment" | "emergency" | "check_in_call";

interface ClinicalInteraction {
  id: string;
  journeyId: string;
  type: ClinicalInteractionType;
  doctorId: string;
  bookingId?: string;
  date: string;
  durationMinutes?: number;
  notes: string;
  actionsTaken: string[];
  planVersion?: number;           // if plan was updated, which version
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
}
```

## 12.3 Mock Clinical Interactions

```json
[
  {
    "id": "ci_001",
    "journeyId": "journey_001",
    "type": "initial_consultation",
    "doctorId": "doctor_001",
    "bookingId": "booking_001",
    "date": "2026-04-19",
    "durationMinutes": 18,
    "notes": "Initiated semaglutide 0.25mg. Patient well-motivated. No contraindications. Monthly follow-up plan set.",
    "actionsTaken": ["treatment_plan_created", "prescription_issued", "journey_started"],
    "planVersion": 1,
    "followUpRequired": true,
    "followUpDate": "2026-05-19",
    "createdAt": "2026-04-19T14:20:00Z"
  },
  {
    "id": "ci_002",
    "journeyId": "journey_001",
    "type": "async_review",
    "doctorId": "doctor_001",
    "date": "2026-06-10",
    "notes": "8-week log review. 3.9 kg lost, adherence 87.5%, glucose improving. Recommending dose escalation to 0.5mg at next visit.",
    "actionsTaken": ["message_sent_to_patient"],
    "followUpRequired": true,
    "followUpDate": "2026-06-14",
    "createdAt": "2026-06-10T16:00:00Z"
  }
]
```

---

# PART 13 — PROGRESS ENTRIES (THE DATA ENGINE)

## 13.1 Progress Entry Schema

```typescript
interface Observation {
  type: "weight" | "blood_glucose" | "hba1c" | "medication_adherence" | "side_effect" | "hunger_level" | "mood" | "steps";
  value: number | string;
  unit?: string;
  context?: string;
}

interface ProgressEntry {
  id: string;
  journeyId: string;
  patientId: string;
  timestamp: string;
  weekNumber: number;
  source: "manual" | "device_sync" | "system_auto";
  observations: Observation[];
  linkedStepId?: string;
  notes?: string;
  flags: string[];
  reviewedByDoctorId?: string;
  reviewedAt?: string;
}
```

## 13.2 Full 8-Week Progress Log

```json
[
  {
    "id": "entry_001",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-04-22T07:00:00Z",
    "weekNumber": 1,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 92.0, "unit": "kg" },
      { "type": "blood_glucose",        "value": 178,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "nausea", "context": "mild, after injection" },
      { "type": "hunger_level",         "value": 3, "context": "scale 1-5" }
    ],
    "linkedStepId": "step_002",
    "notes": "First injection done. Mild nausea for about 2 hours after.",
    "flags": ["mild_side_effect"]
  },
  {
    "id": "entry_002",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-04-29T07:00:00Z",
    "weekNumber": 2,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 91.2, "unit": "kg" },
      { "type": "blood_glucose",        "value": 162,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "nausea", "context": "mild, improving" },
      { "type": "hunger_level",         "value": 2, "context": "noticeably less hungry" }
    ],
    "linkedStepId": "step_002",
    "notes": "Nausea improving. Appetite noticeably reduced.",
    "flags": []
  },
  {
    "id": "entry_003",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-05-06T07:00:00Z",
    "weekNumber": 3,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 91.5, "unit": "kg" },
      { "type": "blood_glucose",        "value": 155,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "none" },
      { "type": "hunger_level",         "value": 2 }
    ],
    "linkedStepId": null,
    "notes": "Weight bounced slightly — felt bloated last 2 days.",
    "flags": ["weight_rebound_minor"]
  },
  {
    "id": "entry_004",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-05-13T07:00:00Z",
    "weekNumber": 4,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 90.4, "unit": "kg" },
      { "type": "blood_glucose",        "value": 148,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "none" },
      { "type": "hunger_level",         "value": 2 }
    ],
    "linkedStepId": "step_005",
    "notes": "Feeling good. 1.6 kg lost this week.",
    "flags": []
  },
  {
    "id": "entry_005",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-05-20T07:00:00Z",
    "weekNumber": 5,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 89.7, "unit": "kg" },
      { "type": "blood_glucose",        "value": 140,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "missed" },
      { "type": "side_effect",          "value": "fatigue", "context": "mild" },
      { "type": "hunger_level",         "value": 3, "context": "hunger returning slightly" }
    ],
    "linkedStepId": null,
    "notes": "Missed dose this week — forgot while traveling.",
    "flags": ["missed_dose", "adherence_drop"]
  },
  {
    "id": "entry_006",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-05-27T07:00:00Z",
    "weekNumber": 6,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 89.9, "unit": "kg" },
      { "type": "blood_glucose",        "value": 143,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "none" },
      { "type": "hunger_level",         "value": 3 }
    ],
    "linkedStepId": null,
    "notes": "Resumed dose. Weight barely moved — likely from last week's miss.",
    "flags": ["plateau_risk"]
  },
  {
    "id": "entry_007",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-06-03T07:00:00Z",
    "weekNumber": 7,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 88.8, "unit": "kg" },
      { "type": "blood_glucose",        "value": 132,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "none" },
      { "type": "hunger_level",         "value": 2 }
    ],
    "linkedStepId": null,
    "notes": "Good week. Glucose trending down.",
    "flags": []
  },
  {
    "id": "entry_008",
    "journeyId": "journey_001",
    "patientId": "patient_001",
    "timestamp": "2026-06-10T07:00:00Z",
    "weekNumber": 8,
    "source": "manual",
    "observations": [
      { "type": "weight",               "value": 88.1, "unit": "kg" },
      { "type": "blood_glucose",        "value": 126,  "unit": "mg/dL", "context": "fasting" },
      { "type": "medication_adherence", "value": "taken" },
      { "type": "side_effect",          "value": "none" },
      { "type": "hunger_level",         "value": 2 }
    ],
    "linkedStepId": null,
    "notes": "Steady progress. Doctor consultation coming up.",
    "flags": []
  }
]
```

## 13.3 Derived Data Arrays (for Charts)

```typescript
// Weight trend — 8 weeks
export const weightData = [
  { week: 1, label: "Week 1", weightKg: 92.0 },
  { week: 2, label: "Week 2", weightKg: 91.2 },
  { week: 3, label: "Week 3", weightKg: 91.5 },  // slight bounce
  { week: 4, label: "Week 4", weightKg: 90.4 },
  { week: 5, label: "Week 5", weightKg: 89.7 },
  { week: 6, label: "Week 6", weightKg: 89.9 },  // missed dose effect
  { week: 7, label: "Week 7", weightKg: 88.8 },
  { week: 8, label: "Week 8", weightKg: 88.1 },
];

// Fasting blood glucose trend
export const glucoseData = [
  { week: 1, label: "Week 1", glucoseMgDl: 178 },
  { week: 2, label: "Week 2", glucoseMgDl: 162 },
  { week: 3, label: "Week 3", glucoseMgDl: 155 },
  { week: 4, label: "Week 4", glucoseMgDl: 148 },
  { week: 5, label: "Week 5", glucoseMgDl: 140 },
  { week: 6, label: "Week 6", glucoseMgDl: 143 }, // missed dose
  { week: 7, label: "Week 7", glucoseMgDl: 132 },
  { week: 8, label: "Week 8", glucoseMgDl: 126 },
];

// HbA1c (quarterly — for diabetes patients)
export const hba1cData = [
  { month: 0, label: "Baseline", hba1c: 8.4 },
  { month: 3, label: "Month 3",  hba1c: 7.6 },
  { month: 6, label: "Month 6",  hba1c: 7.1 },
];

// Adherence per week
export const adherenceData = [
  { week: 1, taken: true,  score: 100 },
  { week: 2, taken: true,  score: 100 },
  { week: 3, taken: true,  score: 100 },
  { week: 4, taken: true,  score: 100 },
  { week: 5, taken: false, score: 0   }, // missed
  { week: 6, taken: true,  score: 100 },
  { week: 7, taken: true,  score: 100 },
  { week: 8, taken: true,  score: 100 },
];
```

---

# PART 14 — MESSAGING SYSTEM

## 14.1 Message Schema

```typescript
type SenderRole = "patient" | "doctor" | "coordinator" | "system";

interface Message {
  id: string;
  journeyId: string;        // Messages always belong to a journey OR are standalone
  threadId: string;
  sender: SenderRole;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: "text" | "alert" | "log_request" | "action_prompt";
  attachments?: string[];
}
```

## 14.2 Full Message Thread (8 Weeks) — ALL HUMAN-WRITTEN

These are NOT AI-generated. Every message is written by a human (coordinator or doctor).

```json
[
  {
    "id": "msg_001",
    "sender": "coordinator",
    "content": "Welcome to Laso, Arjun! I'm your care coordinator. Your medication (Semaglutide 0.25mg) will arrive by April 21st. I'll walk you through what to expect.",
    "timestamp": "2026-04-19T15:00:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_002",
    "sender": "coordinator",
    "content": "Quick reminder: Store your medication in the refrigerator between 2–8°C. Bring to room temperature 30 minutes before injecting. Let me know when it arrives!",
    "timestamp": "2026-04-19T15:01:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_003",
    "sender": "patient",
    "content": "Medication arrived today. Package looks perfect. Cold packs still frozen.",
    "timestamp": "2026-04-21T17:15:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_004",
    "sender": "coordinator",
    "content": "Excellent! Glad it arrived safely. Go ahead and store it. Your first injection is whenever you're ready — ideally this week. Any questions about the injection process?",
    "timestamp": "2026-04-21T17:20:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_005",
    "sender": "patient",
    "content": "Did my first injection this morning. Feeling a bit nauseous now.",
    "timestamp": "2026-04-22T11:00:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_006",
    "sender": "coordinator",
    "content": "Mild nausea is one of the most common early side effects — it occurs in roughly 20–40% of patients and typically resolves within 2–4 weeks as your body adjusts. Try eating smaller meals, avoid fatty foods, and stay hydrated. If nausea becomes severe or lasts more than 3 weeks, I'll flag it for Dr. Sharma.",
    "timestamp": "2026-04-22T11:05:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_007",
    "sender": "coordinator",
    "content": "Weekly check-in: How are you feeling? Any symptoms to report? Please log your weight when you get a chance.",
    "timestamp": "2026-04-29T09:00:00Z",
    "messageType": "log_request"
  },
  {
    "id": "msg_008",
    "sender": "patient",
    "content": "91.2 kg this morning. Nausea is mostly gone. Appetite is definitely lower — I'm eating less without trying.",
    "timestamp": "2026-04-29T09:30:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_009",
    "sender": "coordinator",
    "content": "Great progress! 0.8 kg lost in Week 2 — right on track. The reduced appetite is exactly how semaglutide works. Dr. Sharma will review your Week 4 log before deciding on dose escalation.",
    "timestamp": "2026-04-29T09:35:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_010",
    "sender": "coordinator",
    "content": "Hi Arjun — I noticed you may have missed your dose this week. It's okay, it happens. If fewer than 48 hours have passed, take it now. If more, skip and resume next week on schedule. Consistency is key.",
    "timestamp": "2026-05-22T10:00:00Z",
    "messageType": "text"
  },
  {
    "id": "msg_011",
    "sender": "doctor",
    "content": "Hi Arjun — I've reviewed your 8-week logs. Your progress is solid: 3.9 kg lost, glucose trending down well. I'm recommending we escalate your dose to 0.5mg at your next consultation. Book a slot when convenient. Well done on staying consistent.",
    "timestamp": "2026-06-10T16:00:00Z",
    "messageType": "text"
  }
]
```

---

# PART 15 — PATIENT DASHBOARD (`/dashboard`) — SIMPLIFIED

## 15.1 Design Principle

> The Dashboard shows ONLY what demands immediate attention. Everything else lives in the Journey page.
> Maximum 5 components. No computed scores. No insight engines. No algorithm outputs.

## 15.2 The 5 Dashboard Components

### Component 1 — Active Journey Card
```
Journey: "Weight Loss Journey 2026"
Goal: Lose 15 kg | Target: 77 kg
Progress: 3.9 kg lost (26% of goal)
Week 8 of ~52 | Status: Active
[View Journey →]
```

### Component 2 — Current Step (Action Focus)
```
Current Step: Week 4 Progress Check-In
"Log your weight, any side effects, and how you've been feeling."

[Log Progress Now]   [Ask a Question]
```

### Component 3 — Progress Bar
```
Weight Progress
|████████████████████░░░░░░░░░░░░░░░░░| 
Start: 92 kg   3.9 kg lost (26%)   Target: 77 kg
```

### Component 4 — Alerts (Human-Raised Only)
```
🔔 Doctor review pending
   Book your Month 1 consultation (due June 14)
   [Book Now]
```

### Component 5 — Recent Message
```
Dr. Rahul Sharma — 2h ago
"I've reviewed your 8-week logs. Progress is solid. 
 Recommending dose escalation at next visit..."
[View & Reply →]
```

## 15.3 What Is Explicitly NOT on the Dashboard
- No Metabolic Health Score
- No AI-generated health score cards
- No generic "how are you feeling?" prompts unrelated to the active step
- No charts or trend graphs (those belong on the Journey page)

## 15.4 Dashboard Empty State (No Active Journey)
When a patient has no active journey, the Dashboard MUST show an onboarding prompt — NOT an empty page.

**Required elements:**
1. A welcoming headline: "Welcome to Laso, [firstName] 👋"
2. A short explanation that no active programme exists yet
3. Two programme path cards side by side:
   - **Weight Loss** → links to `/quiz?program=weight_loss`
   - **Diabetes Management** → links to `/quiz?program=diabetes`
4. A secondary link: "Already completed the quiz? Book your consultation" → `/consult`

**Rationale:** A new patient who logs in before booking should be guided toward the quiz, not confronted with a blank dashboard.

## 15.5 Dashboard Active Journey Enhancements (Part 15 Update)

### 15.5.1 Dose Phase Badge
The `ActiveJourneyCard` MUST display the patient's current dose phase as a `Badge` component, showing:
- The phase label (e.g. "Phase 1: 0.25mg")
- The applicable weeks range (e.g. "Weeks 1–4")
- Rendered inline next to the "Active" status badge and week counter
- Style: outlined badge with primary colour tint (`border-primary/30 bg-primary/5 text-primary`)
- Icon: `Pill` (lucide-react)

This comes from the treatment plan's dose titration schedule, not from any AI inference.

### 15.5.2 Weekly Dose Status Pill
The progress bar row MUST include a weekly dose status pill showing whether the patient has logged their injection for the current week:
- Green pill (`bg-success/10 text-success`): "Dose taken this week ✓"
- Amber pill (`bg-amber-100 text-amber-700`): "Dose not yet logged"
- Rendered between the start weight and target weight labels, centred under the progress bar
- Driven by the most recent `weeklyDoseTaken` boolean on the patient's progress entry

### 15.5.3 Program Deep-Link Flow (Landing → Quiz)
The Landing page programme cards MUST link to `/quiz?program=<value>` where `<value>` is:
- `weight_loss` for MetaboReset 12
- `diabetes` for MetaboReset 24

The Quiz page MUST read this `?program=` URL parameter on mount and pre-select the corresponding `primaryGoal` answer in step 7 (Goals), using the mapping:
```
weight_loss  →  primaryGoal = "weight_loss"
diabetes     →  primaryGoal = "diabetes_control"
```
This is a UX convenience — the patient can still change the selection manually.
- No adherence percentage widget
- No plateau detection widget
- No "insight" cards with computed analysis
- No side effect tracker widget
- No dose optimization widget
- No simulation controls
- No charts (charts are in Journey page)

---

# PART 16 — JOURNEY PAGE (`/journey`) — THE REAL PRODUCT

## 16.1 Page Philosophy

> When patient clicks "View Journey", THIS is where everything lives.
> Think: Timeline + Control + Context

## 16.2 Full Page Structure

### SECTION 1 — HEADER
```
Weight Loss Journey 2026
Goal: Lose 15 kg | Target: 77 kg
Week 8 of ~52 | Status: Active
3.9 kg lost (26% of goal)
```

### SECTION 2 — CURRENT STEP (THE FOCUS ZONE)
This is where the patient spends most of their time.
```
[CURRENT STEP]
Week 4 Progress Check-In

"Log your weight, any side effects, and how you've been feeling.
Your doctor will review this before deciding on dose escalation."

ACTIONS:
[✓ Log Progress Now]    [💬 Ask a Question]    [⏭ Come Back Later]
```

Step fulfillment options appear when step type requires a decision:
```
[DEVICE STEP EXAMPLE]
Set Up Blood Glucose Monitor

"A blood glucose monitor helps track your fasting sugar levels."

How would you like to proceed?
[📦 Order via Laso — ₹899]    [✓ I already have one]    [Skip for now]
```

### SECTION 3 — PROGRESS CHARTS
```
[Weight]  [Blood Glucose]  [Adherence]    ← tabs

[Line chart — Recharts]
Week 1: 92.0 kg
Week 2: 91.2 kg
Week 3: 91.5 kg  (slight bounce)
Week 4: 90.4 kg
Week 5: 89.7 kg
Week 6: 89.9 kg  (missed dose — annotated)
Week 7: 88.8 kg
Week 8: 88.1 kg

"Total lost: 3.9 kg over 8 weeks"
```

### SECTION 4 — TIMELINE (THE DIFFERENTIATOR)

A chronological feed mixing steps, logs, messages, and clinical interactions.

```
Jun 10   🩺 Dr. Sharma reviewed 8-week log — recommends dose escalation to 0.5mg
Jun 3    ⚖ Week 7 log: 88.8 kg | Glucose 132 | Dose taken ✓
May 27   ⚖ Week 6 log: 89.9 kg | Weight stalled (missed dose effect)
May 20   ⚠️ Missed semaglutide dose this week — traveling
May 13   ✅ Week 4 check-in completed: 90.4 kg
May 6    ⚖ Week 3 log: 91.5 kg | Minor rebound (normal)
Apr 29   ⚖ Week 2 log: 91.2 kg | Nausea improving, appetite reduced
Apr 22   💊 First dose taken | Mild nausea reported
Apr 21   📦 Medication delivered — confirmed receipt
Apr 19   📋 Treatment plan issued — Semaglutide 0.25mg weekly
Apr 19   🩺 Consultation with Dr. Rahul Sharma (18 min)
Apr 18   📝 Eligibility quiz completed — BMI 31.2, Obese Class I
```

Mix of event types in the timeline:
- `step` — step completed/skipped
- `log` — progress entry submitted
- `consultation` — clinical interaction
- `alert` — coordinator flag
- `message` — doctor/coordinator message
- `milestone` — significant progress event
- `delivery` — medication/product received

### SECTION 5 — STEPS LIST
```
ACTIVE (1)
🔵 Week 4 Progress Check-In — due now

COMPLETED (4)
✅ Receive Semaglutide — Apr 21
✅ First Dose Administered — Apr 22
✅ Blood Glucose Monitor (self-managed) — Apr 22
✅ Baseline Weight Logged (92 kg) — Apr 22

UPCOMING (3)
⏳ Baseline Blood Work — unlocks at Week 6
⏳ Month 1 Review Consultation — unlocks at Week 8
🔒 DEXA Scan — triggers when 9 kg lost (currently 3.9 kg)
```

### SECTION 6 — TREATMENT PLAN
```
Current Medication: Semaglutide (Ozempic) 0.25mg weekly
Escalation Plan:
  Week 1–4:  0.25mg
  Week 5–8:  0.5mg  (pending doctor approval)
  Week 9+:   1.0mg  (pending doctor approval)

Instructions:
  • Inject subcutaneously in abdomen, thigh, or upper arm
  • Rotate injection sites weekly
  • Keep refrigerated (2–8°C)

Doctor: Dr. Rahul Sharma | Plan v1 | Issued Apr 19, 2026
```

### SECTION 7 — MESSAGES (ALWAYS ACCESSIBLE)
Full chat UI embedded in the journey page.
Patient can message doctor or coordinator at any time from within the journey.
```
[Dr. Rahul Sharma]   [Care Coordinator]

[conversation thread]

[Type a message...                        Send]
```

---

# PART 17 — ADMIN PORTAL (`/admin`) — NEW

## 17.1 Who Uses It

The Admin is the **business owner / platform operator** (e.g., you). Admin has full visibility across the entire system and is responsible for:

1. **Designing treatment protocol templates** — the pre-built step sequences that doctors use
2. **Managing the product/service catalog** — what can be offered as "Buy from Laso" in steps
3. **Assigning doctors to patients**
4. **System-wide overview** — all patients, all journeys, all flags

## 17.2 Admin Dashboard

```
SYSTEM OVERVIEW
  Total Patients: 47
  Active Journeys: 31
  Completed Journeys: 9
  Total Clinical Interactions: 23

FLAGS NEEDING ATTENTION:
  3 patients — no logs in 3+ days
  2 patients — missed 2+ consecutive doses

RECENT ACTIVITY:
  Arjun Sharma — Week 8 log submitted
  Meera Iyer — Journey started (Week 1)
  Rajesh Nair — Dose adjustment by Dr. Patel
```

## 17.3 Protocol Template Builder

Admin creates template = a named sequence of steps.

```typescript
interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  category: "weight_loss" | "diabetes" | "combined";
  steps: TemplateStep[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

interface TemplateStep {
  order: number;
  title: string;
  type: StepType;
  instruction: string;
  detail?: string;
  isOptional: boolean;
  fulfillmentOptions: FulfillmentOption[];
  triggerCondition?: string;   // condition for conditional steps
  dependsOnOrder?: number;     // which step must be complete first
}
```

```json
{
  "id": "template_001",
  "name": "Weight Loss Standard — GLP-1",
  "description": "12-month semaglutide-based weight loss program with monthly doctor reviews",
  "category": "weight_loss",
  "steps": [
    {
      "order": 1,
      "title": "Confirm Medication Delivery",
      "type": "medication",
      "instruction": "Confirm receipt of your first month's semaglutide supply.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Confirm Delivery Received", "type": "already_done" },
        { "label": "Report Delivery Issue",     "type": "skip" }
      ]
    },
    {
      "order": 2,
      "title": "Set Up Blood Glucose Monitor",
      "type": "device",
      "instruction": "A glucose monitor helps track your fasting sugar levels.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Order via Laso (₹899)",  "type": "buy_from_iaso" },
        { "label": "I already have one",      "type": "self_managed" },
        { "label": "Skip for now",             "type": "skip" }
      ]
    },
    {
      "order": 3,
      "title": "First Dose Administered",
      "type": "medication",
      "instruction": "Administer your first 0.25mg injection.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Mark Dose as Taken", "type": "already_done" }
      ]
    },
    {
      "order": 4,
      "title": "Log Baseline Weight",
      "type": "check_in",
      "instruction": "Log your starting weight before first dose effect.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Log Weight Now", "type": "already_done" }
      ]
    },
    {
      "order": 5,
      "title": "Week 4 Progress Check-In",
      "type": "check_in",
      "instruction": "Log weight, side effects, and appetite level.",
      "isOptional": false,
      "triggerCondition": "week_number >= 4",
      "fulfillmentOptions": [
        { "label": "Log Progress Now", "type": "already_done" }
      ]
    },
    {
      "order": 6,
      "title": "Baseline Blood Work",
      "type": "test",
      "instruction": "Fasting lipid panel, LFT, KFT before dose escalation.",
      "isOptional": false,
      "triggerCondition": "week_number >= 6",
      "fulfillmentOptions": [
        { "label": "Book via Laso Lab", "type": "buy_from_iaso" },
        { "label": "I will do it myself", "type": "self_managed" },
        { "label": "Skip", "type": "skip" }
      ]
    },
    {
      "order": 7,
      "title": "Month 1 Review Consultation",
      "type": "consultation",
      "instruction": "Book follow-up consultation with your doctor.",
      "isOptional": false,
      "triggerCondition": "week_number >= 8",
      "fulfillmentOptions": [
        { "label": "Book Consultation", "type": "book" }
      ]
    },
    {
      "order": 8,
      "title": "DEXA Scan — Body Composition",
      "type": "test",
      "instruction": "Recommended after losing 9+ kg. Measures lean muscle vs fat.",
      "isOptional": true,
      "triggerCondition": "weight_loss_kg >= 9",
      "fulfillmentOptions": [
        { "label": "Book via Laso (₹2,200)", "type": "buy_from_iaso" },
        { "label": "I will book myself",      "type": "self_managed" },
        { "label": "Skip",                    "type": "skip" }
      ]
    },
    {
      "order": 9,
      "title": "Add Protein Supplement",
      "type": "supplement",
      "instruction": "Doctor recommends protein to protect lean muscle.",
      "isOptional": true,
      "triggerCondition": "week_number >= 8",
      "fulfillmentOptions": [
        { "label": "Buy Laso Protein (₹1,499)", "type": "buy_from_iaso" },
        { "label": "I'll source it myself",      "type": "self_managed" },
        { "label": "Skip",                       "type": "skip" }
      ]
    }
  ],
  "createdBy": "admin_001",
  "createdAt": "2026-01-01T09:00:00Z",
  "isActive": true
}
```

```json
{
  "id": "template_002",
  "name": "Diabetes Management — GLP-1 + Metformin",
  "description": "6-month program for Type 2 diabetes with HbA1c monitoring",
  "category": "diabetes",
  "steps": [
    {
      "order": 1,
      "title": "Order Blood Glucose Testing Kit",
      "type": "device",
      "instruction": "For diabetes management, daily glucose monitoring is essential.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Order via Laso (₹899)",  "type": "buy_from_iaso" },
        { "label": "I already have one",      "type": "self_managed" },
        { "label": "Skip",                    "type": "skip" }
      ]
    },
    {
      "order": 2,
      "title": "Baseline HbA1c Test",
      "type": "test",
      "instruction": "Get your baseline HbA1c before starting medication.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Book via Laso Lab", "type": "buy_from_iaso" },
        { "label": "I will do it myself", "type": "self_managed" }
      ]
    },
    {
      "order": 3,
      "title": "Start Metformin",
      "type": "medication",
      "instruction": "Confirm you have received and started Metformin 500mg.",
      "isOptional": false,
      "fulfillmentOptions": [
        { "label": "Confirm Medication Received", "type": "already_done" }
      ]
    }
  ],
  "createdBy": "admin_001",
  "createdAt": "2026-01-01T09:00:00Z",
  "isActive": true
}
```

## 17.4 Product/Service Catalog (Admin-Managed)

The Admin manages what can appear as "Buy from Laso" in step fulfillment options.

```typescript
interface CatalogItem {
  id: string;
  name: string;
  category: "device" | "test" | "supplement" | "medication" | "service";
  description: string;
  price: number;
  currency: "INR";
  actionUrl: string;
  isActive: boolean;
  addedBy: string;
  addedAt: string;
}
```

```json
[
  {
    "id": "catalog_001",
    "name": "Blood Glucose Monitor (Accu-Chek)",
    "category": "device",
    "description": "Standard blood glucose monitor with 50 test strips",
    "price": 899,
    "currency": "INR",
    "actionUrl": "/orders/new?item=glucose_monitor",
    "isActive": true,
    "addedBy": "admin_001",
    "addedAt": "2026-01-01T09:00:00Z"
  },
  {
    "id": "catalog_002",
    "name": "DEXA Scan (Partner Lab)",
    "category": "test",
    "description": "Full body composition scan at certified partner lab",
    "price": 2200,
    "currency": "INR",
    "actionUrl": "/orders/scan?type=dexa",
    "isActive": true,
    "addedBy": "admin_001",
    "addedAt": "2026-01-01T09:00:00Z"
  },
  {
    "id": "catalog_003",
    "name": "Laso Whey Protein (1kg)",
    "category": "supplement",
    "description": "High-quality whey protein, 24g protein per serving",
    "price": 1499,
    "currency": "INR",
    "actionUrl": "/orders/supplements?item=protein_whey",
    "isActive": true,
    "addedBy": "admin_001",
    "addedAt": "2026-01-01T09:00:00Z"
  },
  {
    "id": "catalog_004",
    "name": "Baseline Blood Panel (Lipids + LFT + KFT)",
    "category": "test",
    "description": "Fasting lipid profile, liver function test, kidney function test",
    "price": 1200,
    "currency": "INR",
    "actionUrl": "/orders/lab?test=baseline_panel",
    "isActive": true,
    "addedBy": "admin_001",
    "addedAt": "2026-01-01T09:00:00Z"
  }
]
```

---

# PART 18 — DOCTOR PORTAL (`/doctor-portal`)

## 18.1 Doctor Dashboard

```
MY PATIENTS

Filters:
  [All]  [Active Journeys]  [Needs Review]  [No Logs 2+ Days]  [Missed Doses]

PATIENT TABLE:
Name            | Program        | Week | Last Log   | Status        | Alerts    |
Arjun Sharma    | Weight Loss    | 8    | Jun 10     | ✅ On track   | Review    | [View]
Meera Iyer      | Diabetes       | 2    | Jun 8      | ⚠️ No log     | 2d ago    | [View]
Rajesh Nair     | Weight Loss    | 15   | Jun 9      | ⚠️ Missed dose|           | [View]
Sunita Krishnan | Diabetes       | 6    | Jun 10     | ✅ On track   |           | [View]
```

## 18.2 Patient Detail Page (Doctor View)

```
HEADER: Arjun Sharma | 34M | BMI 31.1 | Weight Loss | Week 8

TABS: [Overview] [Journey & Steps] [Progress Charts] [Treatment Plan] [Messages] [Notes] [Clinical Interactions]

OVERVIEW TAB:
  Quick stats: Weight today, last log, adherence this week (manual count)
  Quick actions:
    [Write Note] [Adjust Plan] [Send Message] [Add Step to Journey]

JOURNEY & STEPS TAB:
  All steps with status — doctor can add, edit, reorder steps mid-journey
  [+ Add Step] button

PROGRESS CHARTS TAB:
  Weight chart, glucose chart, adherence (manual dots per week)
  All annotated with dose changes and clinical events

TREATMENT PLAN TAB:
  Current plan version (v1)
  [Update Plan] → creates plan v2 with full version history

MESSAGES TAB:
  Full conversation thread

NOTES TAB:
  All doctor notes chronologically
  [Add Note] button

CLINICAL INTERACTIONS TAB:
  All consultations and reviews linked to this journey
  [Add Interaction] button
```

## 18.3 Create/Assign Treatment Plan Flow

```
STEP 1: Select Template
  [Weight Loss Standard — GLP-1]
  [Diabetes Management — GLP-1 + Metformin]
  [Custom — build from scratch]

STEP 2: Customize Steps (add/remove/reorder)
  Drag and drop step order
  Edit any step instruction
  Set/remove trigger conditions
  Mark steps as optional/required

STEP 3: Set Medication
  Drug: [dropdown]
  Starting dose: [dropdown]
  Escalation schedule: [auto or manual]

STEP 4: Preview Journey
  See the full step sequence as patient will see it
  See conditional steps and their trigger conditions

STEP 5: Assign to Patient
  Select patient → creates Journey + Steps + Plan
  Patient immediately sees their Journey on their dashboard
```

---

# PART 19 — COORDINATOR PORTAL (`/coordinator-portal`)

## 19.1 Philosophy

The coordinator does NOT use algorithms. Flags come from patient-logged Progress Entries. Everything else is manual human observation and action.

## 19.2 Dashboard

```
PATIENTS NEEDING ATTENTION (sorted by urgency)

🔴 IMMEDIATE:
  Meera Iyer — No log in 3 days
    [📱 Send Message]  [📋 Mark Follow-Up Done]  [🚨 Escalate to Doctor]

  Preethi Kumar — Reported severe nausea (3 days)
    [📱 Send Message]  [🚨 Escalate to Doctor]

🟡 MONITOR:
  Rajesh Nair — Missed 2 consecutive doses
    [📱 Send Message]  [📋 Mark Follow-Up Done]

  Ankit Shah — No weight log for Week 5 and 6
    [📱 Send Message]

🟢 ON TRACK (12 patients — no flags)
```

## 19.3 Follow-Up Queue

Each action a coordinator takes is logged:

```typescript
interface CoordinatorAction {
  id: string;
  coordinatorId: string;
  patientId: string;
  journeyId: string;
  actionType: "message_sent" | "follow_up_marked" | "escalated_to_doctor" | "note_added";
  notes?: string;
  timestamp: string;
  resolvedAt?: string;
}
```

## 19.4 Pre-Written Message Templates (Human-Curated, Not AI)

These are manually written messages the coordinator can send with one click:

```json
[
  {
    "id": "template_msg_001",
    "trigger": "missed_dose",
    "message": "Hi {name}, I saw from your progress log that you may have missed your semaglutide dose this week. It's okay — if fewer than 48 hours have passed, take it now. If more, skip and resume your regular schedule next week. Let me know if you have any questions!"
  },
  {
    "id": "template_msg_002",
    "trigger": "no_log_2_days",
    "message": "Hi {name}, quick check-in — we haven't received a progress log from you in a couple of days. Logging consistently helps your doctor track progress accurately. Takes just 30 seconds! Let me know how you're feeling."
  },
  {
    "id": "template_msg_003",
    "trigger": "weight_stalled",
    "message": "Hi {name}, I can see from your logs that your weight has been stable this week. This is normal — plateaus happen. Stay consistent with your dose and diet. Dr. Sharma will review at your next consultation and may recommend adjustments."
  },
  {
    "id": "template_msg_004",
    "trigger": "nausea_reported",
    "message": "Hi {name}, I saw from your progress entry that you reported nausea. This is one of the most common early side effects and typically improves within 2–4 weeks. Try smaller meals, avoid fatty foods, and stay hydrated. If it becomes severe, let me know immediately."
  }
]
```

---

# PART 20 — SAFETY SYSTEM

## 20.1 Safety Rules (Human-Reviewed, Coordinator-Flagged)

```typescript
interface SafetyRule {
  id: string;
  name: string;
  trigger: string;
  severity: "warning" | "escalate" | "stop";
  output: string;
  action: "notify_coordinator" | "notify_doctor" | "display_alert";
}
```

```json
[
  {
    "id": "safety_001",
    "name": "Severe vomiting",
    "trigger": "side_effect.vomiting AND context == 'severe'",
    "severity": "stop",
    "output": "Stop medication immediately. Do not take next dose. Contact Dr. Sharma.",
    "action": "notify_doctor"
  },
  {
    "id": "safety_002",
    "name": "No progress — 4 weeks",
    "trigger": "plateau_weeks >= 4",
    "severity": "escalate",
    "output": "Doctor review required. Weight has not changed in 4 weeks.",
    "action": "notify_doctor"
  },
  {
    "id": "safety_003",
    "name": "Critical glucose",
    "trigger": "blood_glucose > 350 OR blood_glucose < 60",
    "severity": "stop",
    "output": "⚠️ Your blood glucose reading is dangerously abnormal. Stop medication and seek medical attention immediately.",
    "action": "notify_doctor"
  },
  {
    "id": "safety_004",
    "name": "Very low adherence",
    "trigger": "adherence_score < 50 AND weeks_on_program >= 4",
    "severity": "escalate",
    "output": "Adherence critically low. Doctor has been notified to review treatment plan.",
    "action": "notify_coordinator"
  }
]
```

---

# PART 21 — JOURNEY TIMELINE DATA

## 21.1 Full Mock Timeline (Week 1–8)

```json
[
  { "date": "2026-04-18", "event": "Eligibility quiz completed — BMI 31.2, Obese Class I",             "type": "system" },
  { "date": "2026-04-19", "event": "Consultation with Dr. Rahul Sharma — 18 min video",                "type": "consultation" },
  { "date": "2026-04-19", "event": "Treatment plan issued — Semaglutide 0.25mg weekly",                 "type": "treatment" },
  { "date": "2026-04-19", "event": "Prescription issued — Order #order_001 created",                    "type": "prescription" },
  { "date": "2026-04-21", "event": "Medication delivered — Patient confirmed receipt",                   "type": "delivery" },
  { "date": "2026-04-22", "event": "Journey started — Baseline weight: 92.0 kg",                        "type": "milestone" },
  { "date": "2026-04-22", "event": "First dose administered — Mild nausea reported",                    "type": "dose" },
  { "date": "2026-04-29", "event": "Week 2 — Weight: 91.2 kg | Nausea improving",                      "type": "log" },
  { "date": "2026-05-06", "event": "Week 3 — Weight: 91.5 kg | Minor rebound (normal)",                "type": "log" },
  { "date": "2026-05-13", "event": "Week 4 — Weight: 90.4 kg | Check-in completed",                    "type": "log" },
  { "date": "2026-05-20", "event": "⚠️ Week 5 — Missed dose while traveling",                          "type": "alert" },
  { "date": "2026-05-27", "event": "Week 6 — Weight stalled at 89.9 kg (missed dose effect)",           "type": "log" },
  { "date": "2026-06-03", "event": "Week 7 — Recovery: 88.8 kg | Glucose 132 mg/dL",                   "type": "log" },
  { "date": "2026-06-10", "event": "Week 8 — Weight: 88.1 kg | Total lost: 3.9 kg",                    "type": "milestone" },
  { "date": "2026-06-10", "event": "Dr. Sharma async review — recommends escalation to 0.5mg",          "type": "consultation" }
]
```

---

# PART 22 — FULL USER FLOW (END TO END)

```
1. User visits /
   └── Reads: "Doctor-led metabolic care"
   └── Clicks: "Check Your Eligibility"

2. User completes /quiz (8 steps)
   └── BMI: 31.2 (Obese Class I) [auto-computed]
   └── Program: Weight Loss
   └── Result: Eligible → "Book Your Consultation"

3. User visits /consult
   └── Sees pre-consult brief (auto-generated)
   └── Selects Dr. Rahul Sharma
   └── Picks slot: April 19, 2:00 PM
   └── Post-consult artifacts created:
         • DoctorNotes (notes_001)
         • TreatmentPlan (plan_001)
         • Prescription (rx_001)

4. Prescription triggers order
   └── Order created (order_001)
   └── Payment: ₹9,399 via UPI
   └── Pharmacy verifies → approves → packs → ships
   └── Delivered April 21
   └── Patient confirms delivery → Step 1 ✅

5. Journey starts (journey_001)
   └── Template: "Weight Loss Standard — GLP-1"
   └── Step 1: Delivery confirmed ✅
   └── Step 2: Blood glucose monitor (self-managed) ✅
   └── Step 3: First dose ✅
   └── Step 4: Baseline weight (92 kg) ✅
   └── Steps 5–9: Pending/Active

6. Patient logs weekly progress
   └── Week 1: 92.0 kg, glucose 178, nausea mild
   └── Week 2: 91.2 kg, glucose 162
   └── Week 3: 91.5 kg (minor rebound)
   └── Week 4: 90.4 kg — Step 5 check-in triggered
   └── Week 5: 89.7 kg — missed dose, coordinator sends manual message
   └── Week 6: 89.9 kg — coordinator follows up
   └── Week 7: 88.8 kg — recovery
   └── Week 8: 88.1 kg — doctor manually reviews logs, writes note

7. Doctor (manually) reviews Week 8
   └── Opens patient detail in doctor portal
   └── Reads progress entries
   └── Writes clinical note
   └── Sends message: "Recommend escalation to 0.5mg"
   └── Books follow-up for June 14

8. Coordinator monitors throughout
   └── Saw Week 5 missed dose → manually sent message
   └── Marked follow-up done after patient replied

9. Month 1 consultation
   └── Dr. Sharma escalates dose to 0.5mg
   └── Creates TreatmentPlan v2
   └── New prescription issued (rx_002)
   └── New order auto-created
   └── Journey continues with updated steps

10. Future: Patient completes Journey
    └── Journey status → "completed"
    └── Appears in Patient Lifeline as completed journey
    └── If patient returns years later → sees full history
    └── Doctor can see full past journey when starting new treatment
```

---

# PART 23 — DESIGN SYSTEM

```
Primary:      Deep teal   #0D9488
Secondary:    Warm slate  #475569
Background:   Warm white  #FAFAF9
Card:         White       #FFFFFF
Accent:       Amber       #F59E0B  (CTAs, highlights)
Error:        Rose        #E11D48
Success:      Emerald     #059669
Warning:      Amber       #D97706
Info:         Sky         #0284C7

Typography:
  Body:       Inter (400, 500, 600)
  Headings:   System sans-serif (700)

Spacing:      8px grid system
Border radius: 12px (cards), 8px (buttons), 6px (inputs)
Shadows:      shadow-sm (cards), shadow-md (modals)

Severity badges:
  Green:      bg-emerald-100  text-emerald-800
  Amber:      bg-amber-100    text-amber-800
  Red:        bg-rose-100     text-rose-800

Chart colors:
  Primary line:  #0D9488 (teal)
  Glucose line:  #F59E0B (amber)
  Expected:      #94A3B8 (slate, dashed)
  Annotations:   #E11D48 (rose, for alerts)
```

---

# PART 24 — GLOBAL APP STATE

```typescript
interface AppState {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  role: "patient" | "doctor" | "coordinator" | "admin" | null;

  // Quiz
  quizCompleted: boolean;
  quizData: QuizData | null;
  quizResult: QuizResult | null;

  // Patient
  patientProfile: PatientProfile | null;
  patientLifeline: LifetimeEvent[];   // ALL journeys + clinical interactions

  // Active Journey
  activeJourney: Journey | null;
  journeySteps: TreatmentStep[];
  progressEntries: ProgressEntry[];
  clinicalInteractions: ClinicalInteraction[];

  // Consultation
  booking: Booking | null;

  // Orders
  orders: Order[];
  activeOrder: Order | null;

  // Messages
  messageThread: Message[];
  unreadCount: number;

  // Alerts (human-raised only)
  alerts: Alert[];
}
```

---

# PART 25 — FAILURE & SUCCESS CRITERIA

## ❌ Failure State

The implementation has FAILED if:
- Dashboard shows more than 5 components
- Dashboard has computed insight cards or score widgets
- Journey page looks like a dashboard (too many cards)
- Steps cannot be accepted/skipped with fulfillment option chosen
- Timeline is not a chronological mix of all event types
- Doctor portal has no way to add steps mid-journey
- Admin portal doesn't exist or is a stub
- Messages are AI-generated (not human-authored in mock data)
- Patient Lifeline (history view) is missing
- Any page shows "N/A" or placeholder text

## ✅ Success State

The implementation has SUCCEEDED when:
- A user can go from `/` → quiz → consult → order → journey → log progress → see timeline update
- Dashboard shows ONLY: Active Journey card, Current Step, Progress bar, Alerts, Messages preview
- Journey page feels like "a guided story of my treatment"
- Steps have 3 real fulfillment options with proper actions
- DEXA and protein supplement steps appear correctly with "Buy from Laso" option
- Timeline mixes logs, steps, messages, and clinical events chronologically
- Doctor can create a treatment plan from a template and assign it
- Admin can view/edit protocol templates
- Coordinator sees patients needing attention and can send messages manually
- The system feels like it was built by a clinical product team, not a developer filling templates

---

# PART 26 — CONTENT TONE RULES

```
✅ DO:
  - "In clinical trials, semaglutide 2.4mg resulted in average weight loss of 14.9% over 68 weeks (STEP 1 trial)"
  - "Mild nausea occurs in approximately 20–40% of patients and typically resolves within 2–4 weeks"
  - "Your doctor will determine if medication is clinically appropriate"
  - "Results vary based on adherence, baseline health, and clinical factors"

❌ DO NOT:
  - "Revolutionary weight loss solution"
  - "Guaranteed results"
  - "100% effective"
  - "No side effects"
  - Before/after transformation photos
  - Any claim not backed by clinical trial data
  - AI-sounding language ("Our algorithm has determined..." / "Based on your data, we recommend...")
```

---

# PART 27 — WHAT THIS PRODUCT MUST NOT BECOME

```
❌ A prescription checkout flow
❌ A static dashboard
❌ A doctor booking marketplace
❌ A 10-card analytics platform
❌ An AI-powered insight engine
❌ A form-heavy data entry system
❌ A generic health tracker
```

# PART 28 — WHAT THIS PRODUCT IS

```
✅ A continuous, doctor-led metabolic care system
✅ A lifelong patient record with structured treatment journeys
✅ Driven by: patient-logged Progress Entries + doctor & coordinator human judgment
✅ A step-by-step treatment protocol engine with commercial fulfillment options
✅ A longitudinal platform where a patient who returns after 5 years sees their full history
✅ An extensible system that can add supplements, devices, new drug categories in the future
✅ A system where every screen answers: "what changes because of this?"
```

---

*END OF LASO MASTER SPEC V2 (UPDATED) — All flows, schemas, mock data, component specs, product philosophy, and role definitions are defined above.*
*This document is the single source of truth. Build from this.*

---

# PART 30 — ADMIN PORTAL EXTENSIONS: ANALYTICS TAB + DOCTORS MANAGEMENT TAB

> **Added:** April 2026
> **File:** `src/pages/AdminPortal.tsx`
> **Tabs added:** `analytics` · `doctors` (inserted between Overview and Users)

---

## 30.1 Analytics Tab (`value="analytics"`)

### Purpose
Programme-level business intelligence for the Admin. Six read-only Recharts charts rendered in a 2-column responsive grid (`sm:grid-cols-2`). All data is static mock series defined at module level.

### Chart inventory

| # | Chart Title | Component | Recharts type | X-axis | Y-axis / Key | Stroke / Fill |
|---|---|---|---|---|---|---|
| 1 | Monthly Enrolment | `LineChart` | Line | `month` | `patients` | `#0D9488` (primary teal) |
| 2 | Avg Weight Lost by Programme Week (kg) | `BarChart` | Bar | `week` | `avg` | `#0D9488`, radius `[4,4,0,0]` |
| 3 | Programme-wide Adherence Trend (%) | `AreaChart` | Area | `week` | `adherence` | `#0D9488`, gradient fill `adh` |
| 4 | Patient Status Breakdown | `PieChart` | Pie | — | `value` | `PIE_COLORS` (6 colours) |
| 5 | Avg Fasting Glucose (mg/dL) | `LineChart` | Line | `week` | `glucose` | `#F59E0B` (amber) |
| 6 | Top Side Effects Reported | `BarChart` (layout=`"vertical"`) | Bar (horizontal) | count | `effect` | `#8B5CF6` (violet), radius `[0,4,4,0]` |

### Static data series (TypeScript)

```typescript
const enrolmentData = [
  { month: "Nov", patients: 3 }, { month: "Dec", patients: 5 },
  { month: "Jan", patients: 8 }, { month: "Feb", patients: 11 },
  { month: "Mar", patients: 9 }, { month: "Apr", patients: 14 },
];

const weightLossByWeek = [
  { week: "W2",  avg: 0.8 }, { week: "W4",  avg: 1.7 },
  { week: "W6",  avg: 2.6 }, { week: "W8",  avg: 3.5 },
  { week: "W10", avg: 4.4 }, { week: "W12", avg: 5.2 },
  { week: "W14", avg: 6.0 }, { week: "W16", avg: 6.9 },
];

const adherenceTrend = [
  { week: "W1", adherence: 94 }, { week: "W2", adherence: 91 },
  { week: "W3", adherence: 89 }, { week: "W4", adherence: 87 },
  { week: "W5", adherence: 82 }, { week: "W6", adherence: 85 },
  { week: "W7", adherence: 88 }, { week: "W8", adherence: 84 },
];

const glucoseData = [
  { week: "W1", glucose: 174 }, { week: "W2", glucose: 162 },
  { week: "W3", glucose: 155 }, { week: "W4", glucose: 148 },
  { week: "W5", glucose: 143 }, { week: "W6", glucose: 146 },
  { week: "W7", glucose: 134 }, { week: "W8", glucose: 128 },
];

const sideEffectData = [
  { effect: "Nausea",       count: 18 },
  { effect: "Fatigue",      count: 11 },
  { effect: "Headache",     count: 7  },
  { effect: "Vomiting",     count: 4  },
  { effect: "Diarrhoea",    count: 3  },
  { effect: "Constipation", count: 2  },
];

// Pie data is derived live from mockPatients
const statusPieData = (["active","review_needed","plateau","adherence_risk","completed","inactive"]).map(s => ({
  name: s.replace(/_/g," "),
  value: mockPatients.filter(p => p.status === s).length,
}));

const PIE_COLORS = ["#0D9488","#F59E0B","#E11D48","#8B5CF6","#059669","#94A3B8"];
```

### `ChartCard` reusable wrapper

```typescript
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  // renders Card > CardHeader (title) > CardContent (h-44 pr-2)
}
```

All charts use `<ResponsiveContainer width="100%" height="100%" />`.
Shared margin: `{ top: 4, right: 12, left: -16, bottom: 0 }` (except horizontal bar which uses `left: 64`).

---

## 30.2 Doctors Management Tab (`value="doctors"`)

### Purpose
Full CRUD management of registered Laso doctors. Supports: Add, inline Edit (all fields + working hours), Delete with confirmation, Toggle active/inactive status. Working hours are editable per day-of-week.

### TypeScript types

```typescript
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;
type Day = typeof DAYS[number];

interface DaySchedule {
  open:  boolean;   // whether the doctor works this day
  start: string;    // HH:mm (24-hour, from <input type="time">)
  end:   string;    // HH:mm
}

type WeekSchedule = Record<Day, DaySchedule>;

interface Doctor {
  id:        string;
  name:      string;
  email:     string;
  specialty: string;
  phone:     string;
  status:    "active" | "inactive";
  hours:     WeekSchedule;
}
```

### Default hours seed

```typescript
const DEFAULT_HOURS: WeekSchedule = {
  Mon: { open: true,  start: "09:00", end: "17:00" },
  Tue: { open: true,  start: "09:00", end: "17:00" },
  Wed: { open: true,  start: "09:00", end: "17:00" },
  Thu: { open: true,  start: "09:00", end: "17:00" },
  Fri: { open: true,  start: "09:00", end: "17:00" },
  Sat: { open: false, start: "10:00", end: "14:00" },
  Sun: { open: false, start: "10:00", end: "14:00" },
};
```

### Mock doctors (seed data)

```json
[
  {
    "id": "dr-001",
    "name": "Dr. Rahul Sharma",
    "email": "rahul@laso.care",
    "specialty": "Internal Medicine / Metabolic",
    "phone": "+91-98765-43210",
    "status": "active",
    "hours": "Mon–Fri 09:00–17:00"
  },
  {
    "id": "dr-002",
    "name": "Dr. Sneha Kapoor",
    "email": "sneha@laso.care",
    "specialty": "Endocrinology",
    "phone": "+91-91234-56789",
    "status": "active",
    "hours": "Mon–Fri 09:00–17:00, Sat 10:00–13:00"
  },
  {
    "id": "dr-003",
    "name": "Dr. Anjali Deshmukh",
    "email": "anjali@laso.care",
    "specialty": "Diabetology",
    "phone": "+91-90000-11111",
    "status": "active",
    "hours": "Mon–Fri 09:00–17:00"
  },
  {
    "id": "dr-004",
    "name": "Dr. Vikram Nair",
    "email": "vikram@laso.care",
    "specialty": "Obesity Medicine",
    "phone": "+91-88888-22222",
    "status": "inactive",
    "hours": "Mon–Fri 09:00–17:00"
  }
]
```

### Table schema (columns)

| Column | Read mode | Edit mode |
|---|---|---|
| Name / Contact | Name (bold) + Email (Mail icon) + Phone (Phone icon) | Three stacked `<Input>` (name h-7, email h-6, phone h-6) |
| Specialty | Plain text | `<Input>` h-7 |
| Status | `<Badge>` green/grey | `<Select>` Active/Inactive |
| Hours | `<Button>` "View" / "Hide" — toggles inline expansion row | Same toggle available; expansion row becomes editable when row is in edit mode |
| Actions (read) | "Deactivate"/"Activate" text button · Edit pencil · Trash (with Yes/No confirm) | Save ✓ · Cancel ✗ |

### `HoursGrid` sub-component

```typescript
function HoursGrid({
  hours,    // WeekSchedule
  onChange, // (h: WeekSchedule) => void  — no-op when read-only (view expansion)
}: { hours: WeekSchedule; onChange: (h: WeekSchedule) => void })
```

Renders a plain `<table>` (NOT shadcn `<Table>`) with columns: Day | Open (Switch) | Start (time input) | End (time input).
Time inputs are `disabled` when `hours[d].open === false` (opacity 40%).

### State model

```typescript
const [doctors,       setDoctors]       = useState<Doctor[]>(INITIAL_DOCTORS);
const [editId,        setEditId]        = useState<string | null>(null);
const [editDoc,       setEditDoc]       = useState<Doctor | null>(null);
const [adding,        setAdding]        = useState(false);
const [newDoc,        setNewDoc]        = useState<Omit<Doctor,"id">>(JSON.parse(JSON.stringify(BLANK_DOCTOR)));
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
const [expandHours,   setExpandHours]   = useState<string | null>(null);
```

### Interaction rules

| Action | Behaviour |
|---|---|
| "Add Doctor" button | Toggles `adding` panel (inline card above table); cancels any active `editId` |
| Save new doctor | Validates `name.trim() !== ""`; appends `{ ...newDoc, id: "dr-" + Date.now() }`; resets form |
| Edit (pencil icon) | Sets `editId` + deep-clones doctor into `editDoc`; hides add panel |
| Save edit (✓) | Replaces record in `doctors` array; clears `editId` / `editDoc` |
| Cancel edit (✗) | Clears `editId` / `editDoc` with no changes |
| "View"/"Hide" hours | Toggles `expandHours === doc.id`; shows a colSpan-5 `<TableRow>` below with read-only `HoursGrid` |
| Hours in edit mode | When `editId === doc.id`, the expansion row renders `HoursGrid` in write mode (onChange updates `editDoc.hours`) |
| Delete (Trash) | Sets `confirmDelete = doc.id`; shows "Yes" (destructive variant) + "No" buttons inline in Actions cell |
| Confirm delete | Filters doctor out of array; clears `confirmDelete` |
| Toggle Status | Flips `status` between `"active"` / `"inactive"` without entering edit mode |

---

## 30.3 Updated Admin Portal Tab List

| Tab value | Icon | Description |
|---|---|---|
| `overview` | `BarChart3` | KPI tiles + status bars + staff counts |
| `analytics` | `TrendingUp` | 6 Recharts charts (NEW) |
| `doctors` | `Stethoscope` | Doctor CRUD + working hours (NEW) |
| `users` | `Users` | All-user table with role/status toggle |
| `protocol` | `Layers` | Protocol step builder |
| `catalog` | `Package` | Catalog item CRUD |
| `system` | `Settings` | Feature flag toggles |

---

# PART 29 — TERMINOLOGY & STATUS MODEL (ADDENDUM — Apr 2026)

## Terminology

| Old term | Canonical term | Notes |
|---|---|---|
| Journey (structured multi-week) | **Programme** | e.g. "Weight Loss Programme 2026" |
| Treatment Course (tab) | **Journey** (tab / page label) | Nav link remains "My Journey" |
| Standalone event | **Clinical Interaction** (standalone) | `journeyId = null` — not part of any Programme |

## Programme Status
Applies to `PatientJourney.status` (`ProgrammeStatus` type):

| Status | Meaning |
|---|---|
| `scheduled` | Programme approved, not yet started |
| `active` | Currently ongoing |
| `paused` | Temporarily suspended (patient or clinical decision) |
| `cancelled` | Permanently stopped before completion |
| `completed` | All milestones met; patient discharged |

## Clinical Interaction Status
Applies to `ClinicalInteraction.status` (`ClinicalInteractionStatus` type):

| Status | Meaning |
|---|---|
| `completed` | Event occurred and is fully documented |
| `action_required` | Patient or clinician must act (e.g. pending check-in) |
| `upcoming` | Scheduled; no action needed yet |
| `cancelled` | Event did not occur; cancelled in advance |
| `no_show` | Appointment existed but patient did not attend |

## Standalone Clinical Interactions
A `ClinicalInteraction` with `journeyId = null` is an **ad-hoc / standalone** event — a one-off consultation, lab test, or note that is recorded on the patient's lifeline but is not part of any structured Programme. These appear in the "One-off Consultations" section of the left panel on the Journey page.

---

# PART 31 — ROLE PERMISSION ARCHITECTURE (Apr 2026)

## 31.1 Overview

All role/route/navigation knowledge is centralised in **`src/lib/roles.ts`**. No component duplicates role arrays or route mappings. Every consumer imports from this single file.

## 31.2 `src/lib/roles.ts` — Full Schema

```typescript
// Role type (mirrors UserContext.UserRole)
export type Role = "patient" | "doctor" | "coordinator" | "admin";

// Post-login redirect per role
export const ROLE_HOME: Record<Role, string> = {
  patient:     "/dashboard",
  doctor:      "/doctor",
  coordinator: "/coordinator",
  admin:       "/admin",
};

// Allowed roles per route
export const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard":      ["patient"],
  "/journey":        ["patient"],
  "/consult":        ["patient"],
  "/orders":         ["patient"],
  "/support":        ["patient"],
  "/doctor":         ["doctor"],
  "/doctor-consult": ["doctor", "coordinator"],   // shared ConsultHub
  "/coordinator":    ["coordinator"],
  "/admin":          ["admin"],
};

// Nav links rendered per role in Navbar
export const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  patient: [
    { href: "/dashboard",      label: "Dashboard" },
    { href: "/journey",        label: "My Journey" },
    { href: "/consult",        label: "Consult" },
    { href: "/orders",         label: "Orders" },
    { href: "/support",        label: "Support" },
  ],
  doctor: [
    { href: "/doctor",         label: "Patient Panel" },
    { href: "/doctor-consult", label: "My Consultations" },
  ],
  coordinator: [
    { href: "/coordinator",    label: "Care Queue" },
    { href: "/doctor-consult", label: "My Consultations" },
  ],
  admin: [
    { href: "/admin",          label: "Admin Portal" },
  ],
};
```

## 31.3 Route Guard Pattern (App.tsx)

Every route uses `<RequireRole roles={[...]}>` wrapper. No route uses bare `<RequireAuth>`.

```
/consult        → RequireRole(["patient"])       — patients only; doctors see 404 redirect to /
/doctor         → RequireRole(["doctor"])
/doctor-consult → RequireRole(["doctor","coordinator"])
/coordinator    → RequireRole(["coordinator"])
/admin          → RequireRole(["admin"])
```

## 31.4 Navbar

`Navbar.tsx` imports `NAV_LINKS` from `roles.ts`:
```tsx
const nav = NAV_LINKS[(user?.role as Role) ?? "patient"];
```
Zero duplicated nav arrays in the component file.

## 31.5 Login Redirect

`Login.tsx` imports `ROLE_HOME` from `roles.ts`:
```tsx
navigate(ROLE_HOME[role] ?? "/dashboard", { replace: true });
```

---

# PART 32 — CONSULT HUB PAGE (Apr 2026)

## 32.1 Overview

**Route:** `/doctor-consult`
**Allowed roles:** `doctor`, `coordinator`
**Component:** `src/pages/ConsultHub.tsx`

The ConsultHub replaces the incorrect `/consult` (patient booking page) that was previously visible to doctors and coordinators. It is a shared page: both roles see the same 4-tab UI with minor role-aware differences.

All consultations on this platform are **video consultations** (Zoom). There is no async/text option at this level — async reviews happen in the Patient Panel / Care Queue.

## 32.2 Consultation Data Model

**File:** `src/data/consultations.ts`

```typescript
export type ConsultType   = "Initial" | "Follow-up" | "Dose Review";
export type ConsultStatus = "Upcoming" | "In Progress" | "Completed" | "No-show";

export interface Consultation {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColorClass: string;       // Tailwind bg- class for avatar
  type: ConsultType;
  date: string;                    // YYYY-MM-DD
  time: string;                    // "10:00 AM"
  durationMin: number;             // 15 | 20 | 30
  status: ConsultStatus;
  zoomUrl: string;                 // pre-generated Zoom link
  noteWritten: boolean;            // has clinical note been written?
  noteSummary?: string;            // text of the note if written
  doctorId: string;                // which doctor owns this consult
  pendingAction?: "write-note" | "approve-dose" | "review-labs";
}
```

### Mock Data Summary (9 records)

| id    | Patient        | Type        | Date       | Time     | Status      | pendingAction  |
|-------|----------------|-------------|------------|----------|-------------|----------------|
| c-001 | Arjun Sharma   | Follow-up   | 2026-04-20 | 10:00 AM | In Progress | write-note     |
| c-002 | Meera Pillai   | Dose Review | 2026-04-20 | 11:30 AM | Upcoming    | approve-dose   |
| c-003 | Ravi Kumar     | Initial     | 2026-04-20 | 2:00 PM  | Upcoming    | —              |
| c-004 | Sunita Verma   | Follow-up   | 2026-04-21 | 9:00 AM  | Upcoming    | —              |
| c-005 | Priya Menon    | Dose Review | 2026-04-22 | 3:30 PM  | Upcoming    | review-labs    |
| c-006 | Anita Singh    | Initial     | 2026-04-24 | 10:00 AM | Upcoming    | —              |
| c-007 | Karan Mehta    | Follow-up   | 2026-04-17 | 11:00 AM | Completed   | —              |
| c-008 | Divya Nair     | Initial     | 2026-04-15 | 9:30 AM  | Completed   | write-note     |
| c-009 | Rajesh Iyer    | Dose Review | 2026-04-14 | 4:00 PM  | No-show     | —              |

### Exported filter views
```typescript
todayConsults    = consultations.filter(c => c.date === "2026-04-20")   // 3 records
upcomingConsults = consultations.filter(c => c.date > "2026-04-20" && c.date <= "2026-04-27")  // 3 records
completedConsults = consultations.filter(c => c.status === "Completed" || c.status === "No-show")  // 3 records
pendingActions   = consultations.filter(c => c.pendingAction)           // 4 records
```

## 32.3 Page Structure — 4 Tabs

### Tab 1: Today
- Card-per-consultation layout (not a table)
- Each card: patient avatar + name, type badge, time + duration, status badge
- `🟢 Live` animated badge when `status === "In Progress"`
- **Join Now** button: enabled only when `status === "In Progress"`; renders as `<a href={zoomUrl} target="_blank">` via shadcn `asChild`; disabled otherwise
- **Copy Link** icon button (ghost): copies zoomUrl to clipboard
- **Escalate** button (coordinator only): visible for coordinator role

### Tab 2: Upcoming
- shadcn `<Table>` — columns: Patient | Type | Date | Time | Duration | Zoom (Copy link button)
- No filtering; simple list of next 7 days

### Tab 3: Completed
- shadcn `<Input>` search bar (filters by patient name, client-side)
- shadcn `<Table>` — columns: Patient | Type | Date | Duration | Status | Note (✅ / ⚠️ icon)
- Click any row → opens shadcn `<Sheet>` side panel showing: patient info, type+status badges, clinical note text (or "no note" amber warning box)

### Tab 4: Pending Actions
- Cards for consultations with `pendingAction` set
- Each card: icon (ClipboardList / CheckCircle2 / FlaskConical), action description, patient name, date
- Doctor: shows generic "Action" button
- Coordinator: shows "Escalate to Doctor" for `approve-dose` actions (coordinators cannot approve dose changes)

## 32.4 Role Differences Inside ConsultHub

| Feature | Doctor | Coordinator |
|---|---|---|
| Page subtitle | "Your patient consultation schedule and history" | "Manage and join your scheduled patient video consultations" |
| Today tab — Escalate button | Hidden | Visible |
| Pending tab — approve-dose action | "Action" button | "Escalate to Doctor" button |
| All data shown | Same mock data (in production: filtered by doctorId) | Same mock data (in production: all assigned consultations) |

## 32.5 shadcn Components Used
`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Badge`, `Button`, `Card`, `CardContent`, `Input`, `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`

Zero custom components created. Zero new UI primitives.

## 32.6 Badge Colour System

```typescript
const STATUS_STYLES = {
  "In Progress": "bg-success/15 text-success border-success/30",
  "Upcoming":    "bg-blue-50 text-blue-700 border-blue-200",
  "Completed":   "bg-muted text-muted-foreground border-border",
  "No-show":     "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_STYLES = {
  "Initial":     "bg-primary/10 text-primary",
  "Follow-up":   "bg-accent/10 text-accent",
  "Dose Review": "bg-amber-50 text-amber-700",
};
```

---

# PART 33 — DUAL ID SPACE ARCHITECTURE (Apr 2026)

## 33.1 The Problem This Solves

The system has **two separate ID spaces** that must never be conflated:

| ID Space | Lives In | Purpose | Example |
|---|---|---|---|
| **Auth ID** (`user.id`) | `UserContext` | Identity for auth, session, logging | `"user_001"`, `"user_002"` |
| **Clinical Entity ID** | `mockDB.ts` | Lookup in MockDataContext query helpers | `"patient_001"`, `"doctor_001"` |

Before this fix (Apr 2026), pages were passing `user.id` (e.g. `"user_002"`) into `forDoctor("user_002")`, which returns `null` because mockDB only knows `"doctor_001"`. This caused every data-driven page to silently fall back to an empty/null state.

## 33.2 `UserProfile` Schema — Both ID Fields

```typescript
// src/contexts/UserContext.tsx

export interface UserProfile {
  id:             string;    // Auth identity ID — NOT used for mockDB lookups
  name:           string;
  email:          string;
  role:           UserRole;
  avatarInitials: string;
  colorClass:     string;
  patientId?:     string;    // Clinical entity ID for forPatient() lookups
  doctorId?:      string;    // Clinical entity ID for forDoctor() lookups
}
```

## 33.3 Demo User Mapping (Full)

```json
[
  {
    "email":          "arjun@laso.health",
    "password":       "demo123",
    "role":           "patient",
    "id":             "user_001",
    "patientId":      "patient_001",
    "doctorId":       null,
    "name":           "Arjun Sharma",
    "avatarInitials": "AS",
    "colorClass":     "bg-primary"
  },
  {
    "email":          "dr.sharma@laso.health",
    "password":       "doctor123",
    "role":           "doctor",
    "id":             "user_002",
    "patientId":      null,
    "doctorId":       "doctor_001",
    "name":           "Dr. Rahul Sharma",
    "avatarInitials": "RS",
    "colorClass":     "bg-emerald-600"
  },
  {
    "email":          "coord@laso.health",
    "password":       "coord123",
    "role":           "coordinator",
    "id":             "user_003",
    "patientId":      null,
    "doctorId":       null,
    "name":           "Priya Coordinator",
    "avatarInitials": "PC",
    "colorClass":     "bg-violet-600"
  },
  {
    "email":          "admin@laso.health",
    "password":       "admin123",
    "role":           "admin",
    "id":             "user_004",
    "patientId":      null,
    "doctorId":       null,
    "name":           "Admin User",
    "avatarInitials": "AU",
    "colorClass":     "bg-slate-700"
  }
]
```

> **Rule:** `coordinator` and `admin` roles have **no** `patientId` / `doctorId` — they call `forCoordinator()` / `forAdmin()` which take no ID argument.

## 33.4 Correct ID Wiring Per Page

| Page | MockDataContext call | Correct ID source | Default fallback |
|---|---|---|---|
| `Dashboard.tsx` | `forPatient(patientId)` | `user?.patientId` | `"patient_001"` |
| `Consult.tsx` | `forPatient(patientId)` | `user?.patientId` | `"patient_001"` |
| `DoctorPortal.tsx` | `forDoctor(doctorId)` | `user?.doctorId` | `"doctor_001"` |
| `ConsultHub.tsx` | `forDoctor(doctorId)` | `user?.doctorId` | `"doctor_001"` |
| `CoordinatorPortal.tsx` | `forCoordinator()` | _(no ID needed)_ | — |
| `AdminPortal.tsx` | `forAdmin()` | _(no ID needed)_ | — |
| `Journey.tsx` | `forPatient(patientId)` | `user?.patientId` | `"patient_001"` |
| `Orders.tsx` | `forPatient(patientId)` | `user?.patientId` | `"patient_001"` |
| `Support.tsx` | `forPatient(patientId)` | `user?.patientId` | `"patient_001"` |

## 33.5 The Rule (Enforced in Code)

```typescript
// ✅ CORRECT — uses clinical entity ID
const patientId = user?.patientId ?? "patient_001";
const doctorId  = user?.doctorId  ?? "doctor_001";

// ❌ WRONG — auth ID, not a mockDB key
const patientId = user?.id ?? "patient_001";   // user.id = "user_001", not "patient_001"
const doctorId  = user?.id ?? "doctor_001";    // user.id = "user_002", not "doctor_001"
```

`forDoctor("user_002")` → `DOCTORS.find(d => d.id === "user_002")` → `undefined` → returns `null` → page shows empty/fallback state.

`forDoctor("doctor_001")` → `DOCTORS.find(d => d.id === "doctor_001")` → full `DoctorView` → page renders correctly.

## 33.6 MockDataContext Query Signatures (Reference)

```typescript
interface MockDataContextValue {
  forPatient:     (patientId: string) => PatientView | null;   // pass user?.patientId
  forDoctor:      (doctorId: string)  => DoctorView  | null;   // pass user?.doctorId
  forCoordinator: ()                  => CoordinatorView;      // no ID
  forAdmin:       ()                  => AdminView;            // no ID
}
```

When `forPatient` / `forDoctor` return `null`, every page has a safe fallback (empty state or redirect), but **the fallback should never trigger for authenticated users** — the correct entity ID is always present on the `UserProfile` object.
