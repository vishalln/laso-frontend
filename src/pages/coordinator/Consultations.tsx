import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";
import { doctorService } from "@/services/doctorService";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { Video, Plus } from "lucide-react";
import type { Consultation } from "@/types/consultation";

const scheduleSchema = z.object({
  patient_id: z.string().min(1, "Select a patient"),
  doctor_id: z.string().min(1, "Select a doctor"),
  scheduled_at: z.string().min(1, "Select a date and time"),
});

type FormValues = z.infer<typeof scheduleSchema>;

export default function Consultations() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: today, isLoading } = useQuery({
    queryKey: ["consultations-today"],
    queryFn: consultationService.getToday,
  });

  const { data: patients } = useQuery({
    queryKey: ["coordinator-all-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  const { data: doctors } = useQuery({
    queryKey: ["all-doctors"],
    queryFn: doctorService.listAll,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { patient_id: "", doctor_id: "", scheduled_at: "" },
  });

  const scheduleMutation = useMutation({
    mutationFn: (values: FormValues) => consultationService.schedule(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations-today"] });
      toast({ title: "Consultation scheduled" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to schedule consultation", variant: "destructive" }),
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consultations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Schedule Consultation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Consultation</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => scheduleMutation.mutate(v))} className="space-y-4">
                <FormField control={form.control} name="patient_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {patients?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="doctor_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {doctors?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="scheduled_at" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={scheduleMutation.isPending}>
                  {scheduleMutation.isPending ? "Scheduling..." : "Schedule"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <h2 className="text-lg font-semibold">Today</h2>
      {!today?.length ? (
        <EmptyState title="No consultations today" description="Schedule a consultation using the button above." />
      ) : (
        <div className="space-y-3">
          {today.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ consultation }: { consultation: Consultation }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-xs text-muted-foreground">Patient: {consultation.patient_id.slice(0, 8)}</p>
          </div>
        </div>
        <Badge variant="secondary">{consultation.status.replace("_", " ")}</Badge>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
  );
}
