import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { treatmentPlanService } from "@/services/treatmentPlanService";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const schema = z.object({
  goals: z.string().min(1, "Required"),
  medications: z.string().min(1, "Required"),
  lifestyle_notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  programmeId?: string;
}

export default function TreatmentPlanTab({ programmeId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["treatment-plan", programmeId],
    queryFn: () => treatmentPlanService.getForProgramme(programmeId!),
    enabled: !!programmeId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { goals: "", medications: "", lifestyle_notes: "" },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        goals: plan.goals.join("\n"),
        medications: plan.medications.join("\n"),
        lifestyle_notes: plan.lifestyle_notes ?? "",
      });
    }
  }, [plan, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      treatmentPlanService.update(programmeId!, {
        goals: values.goals.split("\n").filter(Boolean),
        medications: values.medications.split("\n").filter(Boolean),
        lifestyle_notes: values.lifestyle_notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plan", programmeId] });
      toast({ title: "Treatment plan updated" });
    },
    onError: () => toast({ title: "Failed to update plan", variant: "destructive" }),
  });

  if (!programmeId) return <EmptyState title="No active programme" description="Assign a programme first." />;
  if (isLoading) return <Skeleton className="h-96 w-full mt-4" />;

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base">Treatment Plan</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="goals" render={({ field }) => (
              <FormItem>
                <FormLabel>Goals (one per line)</FormLabel>
                <FormControl><Textarea rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="medications" render={({ field }) => (
              <FormItem>
                <FormLabel>Medications (one per line)</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lifestyle_notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Lifestyle Notes</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Treatment Plan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
