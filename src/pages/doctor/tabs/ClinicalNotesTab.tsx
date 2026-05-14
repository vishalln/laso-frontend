import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clinicalNoteService } from "@/services/clinicalNoteService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import type { ClinicalNote } from "@/types/clinicalNote";

const noteSchema = z.object({
  note_type: z.enum(["consultation", "progress", "alert", "general"]),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

type FormValues = z.infer<typeof noteSchema>;

interface Props {
  patientId: string;
}

export default function ClinicalNotesTab({ patientId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["clinical-notes", patientId],
    queryFn: () => clinicalNoteService.listForPatient(patientId),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note_type: "general", subject: "", body: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => clinicalNoteService.create({ ...values, patient_id: patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-notes", patientId] });
      toast({ title: "Note added" });
      form.reset();
    },
    onError: () => toast({ title: "Failed to add note", variant: "destructive" }),
  });

  if (isLoading) return <Skeleton className="h-64 mt-4" />;

  const sorted = [...(notes ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Add Note</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="note_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem><FormLabel>Body</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Add Note"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState title="No clinical notes" description="Add the first note above." />
      ) : (
        <div className="space-y-3">
          {sorted.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }: { note: ClinicalNote }) {
  const typeColor: Record<string, string> = {
    alert: "destructive",
    consultation: "default",
    progress: "secondary",
    general: "outline",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={typeColor[note.note_type] as any}>{note.note_type}</Badge>
          <span className="font-medium text-sm">{note.subject}</span>
          <span className="text-xs text-muted-foreground ml-auto">{new Date(note.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{note.body}</p>
      </CardContent>
    </Card>
  );
}
