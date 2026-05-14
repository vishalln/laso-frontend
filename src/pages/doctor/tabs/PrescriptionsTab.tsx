import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { prescriptionService } from "@/services/prescriptionService";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import type { Prescription } from "@/types/prescription";

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Required"),
  dose_value: z.coerce.number().positive(),
  dose_unit: z.string().min(1, "Required"),
  frequency: z.string().min(1, "Required"),
  duration_weeks: z.coerce.number().int().positive(),
  special_instructions: z.string().optional(),
});

type FormValues = z.infer<typeof prescriptionSchema>;

interface Props {
  patientId: string;
}

export default function PrescriptionsTab({ patientId }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: () => prescriptionService.listForPatient(patientId),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { medication: "Semaglutide", dose_value: 0.25, dose_unit: "mg", frequency: "weekly", duration_weeks: 4 },
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      prescriptionService.create({ ...values, patient_id: patientId, doctor_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions", patientId] });
      toast({ title: "Prescription created" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to create prescription", variant: "destructive" }),
  });

  if (isLoading) return <Skeleton className="h-64 mt-4" />;

  const active = prescriptions?.filter((p) => p.status === "active") ?? [];
  const history = prescriptions?.filter((p) => p.status !== "active") ?? [];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Prescriptions</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Prescription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Prescription</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3">
                <FormField control={form.control} name="medication" render={({ field }) => (
                  <FormItem><FormLabel>Medication</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-3 gap-2">
                  <FormField control={form.control} name="dose_value" render={({ field }) => (
                    <FormItem><FormLabel>Dose</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dose_unit" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="frequency" render={({ field }) => (
                    <FormItem><FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="duration_weeks" render={({ field }) => (
                  <FormItem><FormLabel>Duration (weeks)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="special_instructions" render={({ field }) => (
                  <FormItem><FormLabel>Special Instructions</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Prescription"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {active.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {active.map((p) => <PrescriptionRow key={p.id} prescription={p} />)}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {history.map((p) => <PrescriptionRow key={p.id} prescription={p} />)}
          </CardContent>
        </Card>
      )}

      {!prescriptions?.length && <EmptyState title="No prescriptions" description="Create the first prescription for this patient." />}
    </div>
  );
}

function PrescriptionRow({ prescription }: { prescription: Prescription }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium text-sm">{prescription.medication} {prescription.dose_value}{prescription.dose_unit}</p>
        <p className="text-xs text-muted-foreground">{prescription.frequency} for {prescription.duration_weeks} weeks</p>
      </div>
      <Badge variant={prescription.status === "active" ? "default" : "secondary"}>{prescription.status}</Badge>
    </div>
  );
}
