import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { checkInSchema, type CheckInFormData } from "@/schemas/checkInSchema";
import { checkInService } from "@/services/checkInService";
import { programService } from "@/services/programService";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const SIDE_EFFECTS = [
  "Nausea",
  "Vomiting",
  "Diarrhoea",
  "Constipation",
  "Headache",
  "Fatigue",
  "Dizziness",
  "Injection site reaction",
];

export default function CheckIn() {
  const navigate = useNavigate();
  const { user } = useUser();

  const { data: programme, isLoading: progLoading } = useQuery({
    queryKey: ["programme", "active"],
    queryFn: () => programService.getActive(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      weight_kg: undefined,
      fasting_glucose: undefined,
      doses_taken: 7,
      side_effects: [],
      appetite_level: 3,
      energy_level: 3,
      notes: "",
    },
  });

  const sideEffects = watch("side_effects");
  const appetiteLevel = watch("appetite_level");
  const energyLevel = watch("energy_level");

  const submitMutation = useMutation({
    mutationFn: (data: CheckInFormData) =>
      checkInService.submit({
        programme_id: programme!.id,
        patient_id: user!.id,
        week_number: programme!.current_week,
        ...data,
      }),
    onSuccess: () => {
      toast.success("Check-in submitted successfully!");
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Failed to submit check-in. Please try again.");
    },
  });

  const onSubmit = (data: CheckInFormData) => {
    submitMutation.mutate(data);
  };

  const toggleSideEffect = (effect: string) => {
    const current = sideEffects ?? [];
    const updated = current.includes(effect)
      ? current.filter((e) => e !== effect)
      : [...current, effect];
    setValue("side_effects", updated);
  };

  if (progLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl text-center">
        <p className="text-muted-foreground">No active programme found. Start a programme first.</p>
        <Button className="mt-4" onClick={() => navigate("/programme/start")}>Start Programme</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Weekly Check-in</h1>
      <p className="text-sm text-muted-foreground mb-6">Week {programme.current_week} progress update</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Weight */}
            <div>
              <Label htmlFor="weight_kg">Weight (kg) *</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                placeholder="e.g. 78.5"
                {...register("weight_kg", { valueAsNumber: true })}
              />
              {errors.weight_kg && <p className="text-xs text-destructive mt-1">{errors.weight_kg.message}</p>}
            </div>

            {/* Fasting Glucose */}
            <div>
              <Label htmlFor="fasting_glucose">Fasting Glucose (mg/dL) — optional</Label>
              <Input
                id="fasting_glucose"
                type="number"
                step="1"
                placeholder="e.g. 95"
                {...register("fasting_glucose", { valueAsNumber: true })}
              />
              {errors.fasting_glucose && <p className="text-xs text-destructive mt-1">{errors.fasting_glucose.message}</p>}
            </div>

            {/* Doses Taken */}
            <div>
              <Label htmlFor="doses_taken">Doses Taken This Week *</Label>
              <Input
                id="doses_taken"
                type="number"
                min="0"
                {...register("doses_taken", { valueAsNumber: true })}
              />
              {errors.doses_taken && <p className="text-xs text-destructive mt-1">{errors.doses_taken.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Side Effects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {SIDE_EFFECTS.map((effect) => (
                <label key={effect} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={sideEffects?.includes(effect)}
                    onCheckedChange={() => toggleSideEffect(effect)}
                  />
                  {effect}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Wellbeing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Appetite Level */}
            <div>
              <Label>Appetite Level (1 = very low, 5 = very high)</Label>
              <Select
                value={String(appetiteLevel)}
                onValueChange={(v) => setValue("appetite_level", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appetite_level && <p className="text-xs text-destructive mt-1">{errors.appetite_level.message}</p>}
            </div>

            {/* Energy Level */}
            <div>
              <Label>Energy Level (1 = very low, 5 = very high)</Label>
              <Select
                value={String(energyLevel)}
                onValueChange={(v) => setValue("energy_level", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.energy_level && <p className="text-xs text-destructive mt-1">{errors.energy_level.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations, questions, or concerns..."
                className="resize-none"
                rows={3}
                {...register("notes")}
              />
              {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? "Submitting..." : "Submit Check-in"}
        </Button>
      </form>
    </div>
  );
}
