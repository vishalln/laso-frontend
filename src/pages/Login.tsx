import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { ROLE_HOME, type Role } from "@/lib/roles";

// ─── Demo credentials — must match UserContext DEMO_USERS ────────────────────

const DEMO_CREDS = [
  { role: "Patient",     email: "arjun@laso.health",        password: "demo123",    color: "bg-primary",     initial: "P" },
  { role: "Doctor",      email: "dr.sharma@laso.health",    password: "doctor123",  color: "bg-emerald-600", initial: "D" },
  { role: "Coordinator", email: "coord@laso.health",        password: "coord123",   color: "bg-violet-600",  initial: "C" },
  { role: "Admin",       email: "admin@laso.health",        password: "admin123",   color: "bg-slate-700",   initial: "A" },
] as const;

export default function Login() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login }             = useUser();
  const navigate              = useNavigate();
  const location              = useLocation();
  const redirectTo            = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed");
      return;
    }
    // If redirected here from a protected route, send back there
    if (redirectTo) { navigate(redirectTo, { replace: true }); return; }
    const matched = DEMO_CREDS.find((d) => d.email === email.trim().toLowerCase());
    const role = (matched?.role.toLowerCase() ?? "patient") as Role;
    navigate(ROLE_HOME[role] ?? "/dashboard", { replace: true });
  };

  const quickLogin = (cred: typeof DEMO_CREDS[number]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            L
          </div>
          <h1 className="text-2xl font-bold">Sign in to Laso Health</h1>
          <p className="text-muted-foreground mt-1 text-sm">Select a demo role or enter credentials manually</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Quick demo login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Role quick-select */}
            <div className="grid grid-cols-4 gap-2">
              {DEMO_CREDS.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => quickLogin(d)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                    ${email === d.email
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                >
                  <div className={`h-8 w-8 rounded-full ${d.color} text-white text-xs font-bold flex items-center justify-center`}>
                    {d.initial}
                  </div>
                  <span className="text-xs font-medium leading-tight">{d.role}</span>
                </button>
              ))}
            </div>

            {/* Credential hint when a demo is selected */}
            {email && (
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{email}</span> · password pre-filled
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted-foreground">or enter manually</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arjun@laso.health"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/5 px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Signing in…" : <><LogIn className="h-4 w-4" /> Sign in</>}
              </Button>
            </form>

            {/* Credential legend */}
            <div className="border rounded-lg overflow-hidden text-xs">
              <div className="bg-muted/40 px-3 py-2 font-medium text-muted-foreground">Demo credentials</div>
              <div className="divide-y">
                {DEMO_CREDS.map((d) => (
                  <div key={d.role} className="grid grid-cols-[80px_1fr_auto] gap-x-2 px-3 py-1.5 items-center">
                    <span className="text-muted-foreground">{d.role}</span>
                    <span className="font-mono text-[11px] truncate">{d.email}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{d.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New patient?{" "}
          <Link to="/quiz" className="text-primary font-medium hover:underline">
            Take the eligibility quiz
          </Link>
        </p>
      </div>
    </div>
  );
}
