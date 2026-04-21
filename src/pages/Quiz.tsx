import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { quizSteps, type QuizAnswers } from "@/data/quizData";
import { calculateBmi } from "@/lib/bmiCalculator";

// ─── Result screen ────────────────────────────────────────────────────────────
function QuizResult({ answers }: { answers: QuizAnswers }) {
  const navigate = useNavigate();
  const bmiResult = answers.heightCm && answers.weightKg
    ? calculateBmi(answers.weightKg, answers.heightCm)
    : null;
  const hasComorbidity = (answers.conditions ?? []).some((c) => c !== "none");
  const eligible = bmiResult !== null && (bmiResult.bmi >= 30 || (bmiResult.bmi >= 27 && hasComorbidity));

  return (
    <div className="text-center max-w-lg mx-auto py-8">
      <div className={cn("h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl", eligible ? "bg-success/10" : "bg-muted")}>
        {eligible ? "✅" : "📋"}
      </div>
      <h2 className="text-2xl font-bold mb-3">
        {eligible ? "Great news — you appear eligible!" : "Let's get more information"}
      </h2>
      {bmiResult && (
        <p className="text-muted-foreground mb-2">
          Your BMI is <strong className="text-foreground">{bmiResult.bmi.toFixed(1)}</strong> — {bmiResult.category}
        </p>
      )}
      <p className="text-muted-foreground mb-8 leading-relaxed">
        {eligible
          ? "Based on your responses, you meet the clinical criteria for GLP-1 therapy. Book a consultation with a specialist doctor within 48 hours."
          : "A doctor will review your questionnaire and advise on the best approach for your health goals. Book a consultation to proceed."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="gap-2" onClick={() => navigate("/consult")}>
          Book my consultation <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
          Create account
        </Button>
      </div>
    </div>
  );
}

// Maps ?program= query param → primaryGoal quiz answer
const PROGRAM_TO_GOAL: Record<string, QuizAnswers["primaryGoal"]> = {
  weight_loss: "weight_loss",
  diabetes:    "diabetes_control",
};

// ─── Main Quiz ────────────────────────────────────────────────────────────────
export default function Quiz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select primaryGoal from ?program= URL param (Landing → Quiz deep link)
  useEffect(() => {
    const program = searchParams.get("program");
    if (program && PROGRAM_TO_GOAL[program]) {
      setAnswers((prev) => ({ ...prev, primaryGoal: PROGRAM_TO_GOAL[program] }));
    }
  }, [searchParams]);

  const step = quizSteps[stepIdx];
  const progress = ((stepIdx) / quizSteps.length) * 100;

  const update = (key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key: string, value: string) => {
    const current = (answers[key as keyof QuizAnswers] as string[] | undefined) ?? [];
    if (value === "none") {
      setAnswers((prev) => ({ ...prev, [key]: ["none"] }));
      return;
    }
    const next = current.includes(value)
      ? current.filter((v) => v !== value && v !== "none")
      : [...current.filter((v) => v !== "none"), value];
    setAnswers((prev) => ({ ...prev, [key]: next }));
  };

  const next = () => {
    if (stepIdx < quizSteps.length - 1) setStepIdx((i) => i + 1);
    else setDone(true);
  };
  const back = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
    else navigate("/");
  };

  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <QuizResult answers={answers} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>Step {stepIdx + 1} of {quizSteps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step {step.stepNumber}</p>
          <h2 className="text-xl font-bold mb-1">{step.title}</h2>
          <p className="text-muted-foreground text-sm mb-8">{step.subtitle}</p>

          <div className="space-y-6">
            {step.fields.map((field) => {
              const val = answers[field.key as keyof QuizAnswers];

              if (field.type === "number") {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}{field.unit ? ` (${field.unit})` : ""}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      value={(val as number | undefined)?.toString() ?? ""}
                      onChange={(e) => update(field.key, e.target.value ? Number(e.target.value) : undefined)}
                    />
                    {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                    {field.key === "weightKg" && answers.heightCm && answers.weightKg && (
                      <p className="text-xs font-medium text-primary">
                        BMI: {calculateBmi(answers.weightKg, answers.heightCm).bmi.toFixed(1)} — {calculateBmi(answers.weightKg, answers.heightCm).category}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {field.options?.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => update(field.key, opt.value)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border text-sm text-left transition-all",
                            val === opt.value
                              ? "border-primary bg-primary/5 text-primary font-medium"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          {opt.icon && <span className="text-base flex-shrink-0">{opt.icon}</span>}
                          <div>
                            <p className="font-medium">{opt.label}</p>
                            {opt.description && <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>}
                          </div>
                          {val === opt.value && <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                    {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                  </div>
                );
              }

              if (field.type === "multiselect") {
                const selected = (val as string[] | undefined) ?? [];
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {field.options?.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleMulti(field.key, opt.value)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border text-sm text-left transition-all",
                            selected.includes(opt.value)
                              ? "border-primary bg-primary/5 text-primary font-medium"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          {opt.icon && <span className="text-base flex-shrink-0">{opt.icon}</span>}
                          <div className="flex-1">
                            <p className="font-medium">{opt.label}</p>
                            {opt.description && <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>}
                          </div>
                          {selected.includes(opt.value) && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                    {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                  </div>
                );
              }

              if (field.type === "slider") {
                const sliderVal = (val as number | undefined) ?? field.min ?? 1;
                return (
                  <div key={field.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{field.label}</Label>
                      <span className="font-bold text-primary">{sliderVal}{field.unit ? ` ${field.unit}` : ""}</span>
                    </div>
                    <Slider
                      min={field.min ?? 1}
                      max={field.max ?? 10}
                      step={1}
                      value={[sliderVal]}
                      onValueChange={([v]) => update(field.key, v)}
                      className="w-full"
                    />
                    {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={back} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={next} className="gap-2">
            {stepIdx === quizSteps.length - 1 ? "See my results" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
