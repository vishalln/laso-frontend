import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Stethoscope, TrendingDown, Pill, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faq";

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          🇮🇳 India's first clinically supervised GLP-1 programme
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
          Lose weight. Control diabetes.<br />
          <span className="text-primary">Finally, a programme that works.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Laso combines GLP-1 medication prescribed by specialist doctors, AI-powered monitoring, and same-day pharmacy delivery — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-base gap-2" asChild>
            <Link to="/quiz">Check my eligibility <ArrowRight className="h-5 w-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base" asChild>
            <Link to="/#how-it-works">See how it works</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
          {[
            { value: "5–15%", label: "Avg. weight loss" },
            { value: "1.3%", label: "HbA1c reduction" },
            { value: "48 hrs", label: "First consultation" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust Signals ───────────────────────────────────────────────────────────
function TrustSignals() {
  const signals = [
    { icon: ShieldCheck, text: "CDSCO-compliant prescription" },
    { icon: Stethoscope, text: "Specialist endocrinologists" },
    { icon: Pill, text: "Authenticated pharmacy network" },
    { icon: Users, text: "2,400+ patients treated" },
  ];
  return (
    <section className="border-y border-border bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {signals.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Complete the eligibility quiz", desc: "Answer 8 clinically designed questions. We assess BMI, comorbidities, and medications in real time." },
    { n: "02", title: "Consult your specialist doctor", desc: "Get matched with an endocrinologist within 48 hours. Video or async consultation, at your convenience." },
    { n: "03", title: "Receive your personalised plan", desc: "Your doctor prescribes a GLP-1 medication with a tailored dose titration schedule and diet/fitness guidance." },
    { n: "04", title: "Medication delivered to your door", desc: "Cold-chain verified, same-day delivery in metros. Track your order and cold-chain status in real time." },
    { n: "05", title: "Weekly monitoring & AI insights", desc: "Log your weight, glucose, and symptoms weekly. Laso's AI detects plateaus and adherence gaps proactively." },
    { n: "06", title: "Monthly reviews & ongoing support", desc: "Monthly doctor check-ins, 24/7 care coordinator chat, and dose adjustment as needed — for as long as you need." },
  ];
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">The Laso MetaboReset™ Programme</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How it works — from quiz to results</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A fully supervised, end-to-end metabolic health programme. Not a generic weight-loss app.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5 p-6 rounded-xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center flex-shrink-0">{s.n}</div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Programme Cards ─────────────────────────────────────────────────────────
function ProgramCards() {
  const plans = [
    {
      name: "MetaboReset 12",
      duration: "12 weeks",
      badge: "Most popular",
      badgeColor: "bg-primary text-white",
      price: "₹12,499",
      priceNote: "/month",
      features: [
        "Initial specialist consultation",
        "Personalised dose titration plan",
        "3× monthly doctor follow-ups",
        "Monthly medication supply",
        "Weekly AI monitoring & alerts",
        "Nutritionist session (1×/month)",
        "24/7 care coordinator support",
      ],
      cta: "Start MetaboReset 12",
      program: "weight_loss",
      primary: true,
    },
    {
      name: "MetaboReset 24",
      duration: "24 weeks",
      badge: "Best value",
      badgeColor: "bg-success text-white",
      price: "₹10,999",
      priceNote: "/month",
      features: [
        "Everything in MetaboReset 12",
        "Extended metabolic panel (labs)",
        "Fitness coaching (2×/month)",
        "HbA1c + lipid tracking",
        "Priority scheduling",
        "Plateau intervention protocol",
        "Long-term maintenance plan",
      ],
      cta: "Start MetaboReset 24",
      program: "diabetes",
      primary: false,
    },
  ];
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Choose your programme</h2>
          <p className="text-muted-foreground text-lg">Both programmes include doctor supervision, medication, and monitoring. No hidden costs.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <Card key={p.name} className={p.primary ? "border-primary shadow-lg shadow-primary/10 relative" : ""}>
              {p.primary && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className={`px-4 py-1 rounded-full text-xs font-bold ${p.badgeColor}`}>{p.badge}</span></div>}
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="text-muted-foreground text-sm">{p.duration} supervised programme</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground">{p.priceNote}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={p.primary ? "default" : "outline"} asChild>
                  <Link to={`/quiz?program=${p.program}`}>{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">EMI available · Consultation ₹1,000–₹1,500 · Medication cost may vary based on prescription</p>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Real patients, real results</h2>
          <p className="text-muted-foreground text-lg">All outcomes verified by treating physician records.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${t.colorClass}`}>{t.initials}</div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}, {t.age}</p>
                    <p className="text-xs text-muted-foreground">{t.city} · {t.condition}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex gap-3 text-xs">
                  <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">−{t.weightLostKg} kg</span>
                  {t.hba1cImprovement !== "N/A" && (
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">HbA1c {t.hba1cImprovement}</span>
                  )}
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{t.weeksOnProgram} wks</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen(open === id ? null : id);
  return (
    <section id="faq" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-border bg-white overflow-hidden">
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/20 transition-colors"
              >
                {faq.question}
                {open === faq.id ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              </button>
              {open === faq.id && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-90" />
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to reset your metabolism?</h2>
        <p className="text-primary-foreground/80 text-lg mb-8">Take the 3-minute eligibility quiz and get matched with a specialist doctor within 48 hours.</p>
        <Button size="lg" variant="secondary" className="gap-2 text-base font-bold" asChild>
          <Link to="/quiz">Check my eligibility <ArrowRight className="h-5 w-5" /></Link>
        </Button>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div>
      <Hero />
      <TrustSignals />
      <HowItWorks />
      <ProgramCards />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
