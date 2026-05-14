import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { catalogService } from "@/services/catalogService";
import { productSchema, type ProductFormData } from "@/schemas/productSchema";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { CatalogProduct } from "@/types/catalog";

const CATEGORIES: CatalogProduct["category"][] = ["medication", "supplement", "device", "consumable"];

export default function Catalog() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogProduct | null>(null);

  const { data: products, isLoading } = useQuery({ queryKey: ["catalog"], queryFn: catalogService.listAll });

  const form = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const createMut = useMutation({
    mutationFn: (data: ProductFormData) => catalogService.create(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Product added"); closeForm(); },
    onError: () => toast.error("Failed to add product"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogProduct> }) => catalogService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Product updated"); closeForm(); },
    onError: () => toast.error("Failed to update product"),
  });

  const toggleStockMut = useMutation({
    mutationFn: (id: string) => catalogService.toggleStock(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Stock status toggled"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => catalogService.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Product deleted"); setDeleteTarget(null); },
    onError: () => toast.error("Cannot delete — product may be in active prescriptions"),
  });

  function openAdd() { setEditing(null); form.reset({ name: "", brand: "", category: "medication", price_inr: 0, stock_count: 0 }); setFormOpen(true); }
  function openEdit(p: CatalogProduct) { setEditing(p); form.reset({ name: p.name, brand: p.brand, category: p.category, price_inr: p.price_inr, stock_count: p.stock_count }); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); form.reset(); }

  function onSubmit(data: ProductFormData) {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Product</Button>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead>Category</TableHead><TableHead>Price (INR)</TableHead><TableHead>In Stock</TableHead><TableHead>Rx</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{p.category}</Badge></TableCell>
                <TableCell>{p.price_inr.toLocaleString("en-IN")}</TableCell>
                <TableCell><Switch checked={p.in_stock} onCheckedChange={() => toggleStockMut.mutate(p.id)} /></TableCell>
                <TableCell>{p.category === "medication" ? <Badge>Rx</Badge> : "—"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            <Input placeholder="Brand" {...form.register("brand")} />
            {form.formState.errors.brand && <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>}
            <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v as any)}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Price (INR)" {...form.register("price_inr", { valueAsNumber: true })} />
            {form.formState.errors.price_inr && <p className="text-sm text-destructive">{form.formState.errors.price_inr.message}</p>}
            <Input type="number" placeholder="Stock Count" {...form.register("stock_count", { valueAsNumber: true })} />
            <DialogFooter><Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. If this product is in active prescriptions, deletion will fail.</AlertDialogDescription>
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
