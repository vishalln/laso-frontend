import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import type { Role } from "@/lib/roles";

const PAGE_SIZE = 20;
const ROLES: Role[] = ["patient", "coordinator", "doctor", "admin"];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive" | "suspended";
}

export default function Users() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminService.listUsers,
  });

  const users = ((allUsers as any)?.users as AdminUser[]) ?? [];
  const paginated = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const roleMut = useMutation({
    mutationFn: ({ email, role }: { email: string; role: Role }) => adminService.updateUserRole(email, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Role updated"); },
    onError: () => toast.error("Failed to update role"),
  });

  const statusMut = useMutation({
    mutationFn: ({ email, active }: { email: string; active: boolean }) => adminService.toggleUserStatus(email, active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const purgeMut = useMutation({
    mutationFn: (email: string) => adminService.purgeUser(email),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`User purged — ${Object.values(data?.deleted ?? {}).reduce((a, b) => a + b, 0)} records deleted`);
    },
    onError: () => toast.error("Failed to purge user"),
  });

  const statusColor = (s: string) => {
    if (s === "active") return "default";
    if (s === "suspended") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {paginated.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => roleMut.mutate({ email: u.email, role: v as Role })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Badge variant={statusColor(u.status)}>{u.status}</Badge></TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => statusMut.mutate({ email: u.email, active: u.status !== "active" })}>
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setPurgeTarget(u.email)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">{users.length} users total</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">{page + 1} / {totalPages || 1}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={!!purgeTarget} onOpenChange={() => setPurgeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purge user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{purgeTarget}</strong> from Cognito and remove all their data from the database (quiz submissions, programmes, orders, consultations, messages, etc.). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (purgeTarget) purgeMut.mutate(purgeTarget); setPurgeTarget(null); }}
            >
              Purge User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
