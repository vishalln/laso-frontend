import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search } from "lucide-react";
import type { Patient } from "@/types/patient";

export default function PatientList() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: patients, isLoading } = useQuery({
    queryKey: ["coordinator-all-patients", user?.id],
    queryFn: () => patientService.listForDoctor(user!.id!),
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!patients) return [];
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [patients, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Patients</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No patients found" description="Try adjusting your search." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/coordinator/patients/${p.id}`)}
                  >
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.email}</td>
                    <td className="p-3"><Badge variant="secondary">{p.status}</Badge></td>
                    <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
