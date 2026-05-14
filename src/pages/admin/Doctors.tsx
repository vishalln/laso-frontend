import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorService } from "@/services/doctorService";
import { doctorSchema, type DoctorFormData } from "@/schemas/doctorSchema";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Doctor } from "@/types/doctor";

export default function Doctors() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const { data: doctors, isLoading } = useQuery({ queryKey: ["doctors"], queryFn: doctorService.listAll });

  const form = useForm<DoctorFormData>({ resolver: zodResolver(doctorSchema) });

  const createMut = useMutation({
    mutationFn: (data: DoctorFormData) => doctorService.create(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); toast.success("Doctor added"); closeForm(); },
    onError: () => toast.error("Failed to add doctor"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) => doctorService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); toast.success("Doctor updated"); closeForm(); },
    onError: () => toast.error("Failed to update doctor"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => doctorService.toggleStatus(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); toast.success("Status toggled"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); toast.success("Doctor deleted"); setDeleteTarget(null); },
    onError: () => toast.error("Cannot delete — doctor may have dependencies"),
  });

  function openAdd() { setEditing(null); form.reset({ name: "", email: "", specialisation: "general_practice", phone: "" }); setFormOpen(true); }
  function openEdit(d: Doctor) { setEditing(d); form.reset({ name: d.name, email: d.email, specialisation: d.specialisation as any, phone: d.phone ?? "" }); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); form.reset(); }

  function onSubmit(data: DoctorFormData) {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Doctor</Button>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Specialisation</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {doctors?.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell className="capitalize">{d.specialisation.replace("_", " ")}</TableCell>
                <TableCell>{d.phone ?? "—"}</TableCell>
                <TableCell><Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleMut.mutate(d.id)}>{d.status === "active" ? "Deactivate" : "Activate"}</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(d)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            <Input placeholder="Email" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            <Select value={form.watch("specialisation")} onValueChange={(v) => form.setValue("specialisation", v as any)}>
              <SelectTrigger><SelectValue placeholder="Specialisation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="endocrinology">Endocrinology</SelectItem>
                <SelectItem value="obesity_medicine">Obesity Medicine</SelectItem>
                <SelectItem value="general_practice">General Practice</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Phone" {...form.register("phone")} />
            <DialogFooter><Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Active patient assignments may be affected.</AlertDialogDescription>
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
