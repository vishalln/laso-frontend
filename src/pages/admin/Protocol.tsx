import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { protocolService } from "@/services/protocolService";
import { protocolStepSchema, type ProtocolStepFormData } from "@/schemas/protocolStepSchema";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2, Star, Rocket } from "lucide-react";
import type { ProtocolStep, ProtocolTemplate } from "@/types/protocol";

const STEP_TYPES: ProtocolStep["step_type"][] = ["consultation", "blood_test", "check_in", "medication_start", "dose_change"];
const RULES: ProtocolStep["auto_activate_rule"][] = ["manual", "auto", "on_previous_complete"];

export default function Protocol() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProtocolStep | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProtocolStep | null>(null);

  const { data: templates, isLoading } = useQuery({ queryKey: ["protocols"], queryFn: protocolService.getTemplates });
  const template = templates?.[0] as ProtocolTemplate | undefined;

  const { data: versions } = useQuery({
    queryKey: ["protocols", template?.id, "versions"],
    queryFn: () => protocolService.getVersions(template!.id),
    enabled: !!template,
  });

  const form = useForm<ProtocolStepFormData>({ resolver: zodResolver(protocolStepSchema) });

  const addMut = useMutation({
    mutationFn: (data: ProtocolStepFormData) => protocolService.addStep(template!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["protocols"] }); toast.success("Step added"); closeForm(); },
    onError: () => toast.error("Failed to add step"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProtocolStep> }) => protocolService.updateStep(template!.id, id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["protocols"] }); toast.success("Step updated"); closeForm(); },
    onError: () => toast.error("Failed to update step"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => protocolService.deleteStep(template!.id, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["protocols"] }); toast.success("Step deleted"); setDeleteTarget(null); },
    onError: () => toast.error("Failed to delete step"),
  });

  const reorderMut = useMutation({
    mutationFn: (ids: string[]) => protocolService.reorderSteps(template!.id, ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["protocols"] }),
  });

  const publishMut = useMutation({
    mutationFn: () => protocolService.publish(template!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["protocols"] }); toast.success("Protocol published"); },
    onError: () => toast.error("Publish failed"),
  });

  const steps = [...(template?.steps ?? [])].sort((a, b) => a.order - b.order);

  function move(step: ProtocolStep, dir: -1 | 1) {
    const idx = steps.findIndex((s) => s.id === step.id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === steps.length - 1)) return;
    const ids = steps.map((s) => s.id);
    [ids[idx], ids[idx + dir]] = [ids[idx + dir], ids[idx]];
    reorderMut.mutate(ids);
  }

  function openAdd() { setEditingStep(null); form.reset({ title: "", step_type: "consultation", week_offset: 0, duration_minutes: 30, is_recurring: false, auto_activate_rule: "manual" }); setFormOpen(true); }
  function openEdit(s: ProtocolStep) { setEditingStep(s); form.reset({ title: s.title, step_type: s.step_type, week_offset: s.week_offset, duration_minutes: s.duration_minutes ?? 30, is_recurring: s.is_recurring, auto_activate_rule: s.auto_activate_rule }); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditingStep(null); form.reset(); }

  function onSubmit(data: ProtocolStepFormData) {
    if (editingStep) updateMut.mutate({ id: editingStep.id, data });
    else addMut.mutate(data);
  }

  function inlineRename(step: ProtocolStep, newTitle: string) {
    if (newTitle && newTitle !== step.title) updateMut.mutate({ id: step.id, data: { title: newTitle } });
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Protocol Builder</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Step</Button>
          <Button variant="default" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}><Rocket className="h-4 w-4 mr-1" />Publish</Button>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((s) => (
          <Card key={s.id} className="flex items-center px-4 py-2">
            <span className="text-muted-foreground text-sm w-8">{s.order}</span>
            <input className="flex-1 bg-transparent border-none focus:outline-none font-medium" defaultValue={s.title} onBlur={(e) => inlineRename(s, e.target.value)} />
            <Badge variant="outline" className="mx-2 capitalize">{s.step_type.replace("_", " ")}</Badge>
            <span className="text-xs text-muted-foreground mr-2">W{s.week_offset}</span>
            {s.duration_minutes && <span className="text-xs text-muted-foreground mr-2">{s.duration_minutes}m</span>}
            {s.is_recurring && <Star className="h-3 w-3 text-amber-500 mr-2" />}
            <Button size="icon" variant="ghost" onClick={() => move(s, -1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => move(s, 1)}><ArrowDown className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(s)}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>

      {/* Version History */}
      {versions && versions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Version History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {versions.map((v) => (
              <div key={v.version} className="flex justify-between text-sm border-b pb-1 last:border-0">
                <span>v{v.version}</span>
                <span className="text-muted-foreground">{v.step_count} steps</span>
                <span className="text-muted-foreground">{v.published_at ? new Date(v.published_at).toLocaleDateString() : "Draft"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Title" {...form.register("title")} />
            <Select value={form.watch("step_type")} onValueChange={(v) => form.setValue("step_type", v as any)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{STEP_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Week Offset" {...form.register("week_offset", { valueAsNumber: true })} />
            <Input type="number" placeholder="Duration (min)" {...form.register("duration_minutes", { valueAsNumber: true })} />
            <Select value={form.watch("auto_activate_rule")} onValueChange={(v) => form.setValue("auto_activate_rule", v as any)}>
              <SelectTrigger><SelectValue placeholder="Activation Rule" /></SelectTrigger>
              <SelectContent>{RULES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.watch("is_recurring")} onCheckedChange={(v) => form.setValue("is_recurring", !!v)} />
              <span className="text-sm">Recurring</span>
            </div>
            <DialogFooter><Button type="submit" disabled={addMut.isPending || updateMut.isPending}>{editingStep ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete step "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the step from the protocol template.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
