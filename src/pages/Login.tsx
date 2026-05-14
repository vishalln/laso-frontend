import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { navigateToRoleHome } from "@/lib/roles";
import { cognitoService } from "@/services/cognitoService";
import { quizService } from "@/services/quizService";
import { QUIZ_MESSAGES } from "@/constants/messages";

// ─── Demo credentials — must match UserContext DEMO_USERS ────────────────────

const DEMO_CREDS = [
  { role: "Arjun (Patient)",  email: "arjun.sharma@laso.health",  password: "Patient123!", color: "bg-primary",     initial: "AS", desc: "Week 8, good progress" },
  { role: "Kavita (Patient)", email: "kavita.rao@laso.health",    password: "Patient123!", color: "bg-sky-600",     initial: "KR", desc: "Completed + maintenance" },
  { role: "Suresh (Patient)", email: "suresh.iyer@laso.health",   password: "Patient123!", color: "bg-amber-600",   initial: "SI", desc: "Week 3, adherence issues" },
  { role: "Dr. Rahul",        email: "dr.rahul@laso.health",      password: "Doctor123!",  color: "bg-emerald-600", initial: "DR", desc: "Arjun + Suresh" },
  { role: "Dr. Priya",        email: "dr.priya@laso.health",      password: "Doctor123!",  color: "bg-teal-600",    initial: "DP", desc: "Kavita" },
  { role: "Coordinator",      email: "coordinator@laso.health",   password: "Coord123!",   color: "bg-violet-600",  initial: "C",  desc: "Tasks & orders" },
  { role: "Admin",            email: "admin@laso.health",         password: "Admin123!",   color: "bg-slate-700",   initial: "A",  desc: "Full access" },
] as const;

export default function Login() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user }       = useUser();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [searchParams]        = useSearchParams();
  const redirectTo            = (location.state as { from?: string } | null)?.from;
  const quizId                = searchParams.get("quiz_id");
  const hasNavigated          = useRef(false);

  useEffect(() => {
    if (user && !hasNavigated.current) {
      hasNavigated.current = true;

      const pendingQuizId = quizId || localStorage.getItem(QUIZ_MESSAGES.ANONYMOUS_QUIZ_KEY);
      if (pendingQuizId) {
        quizService.claim(pendingQuizId)
          .then(() => localStorage.removeItem(QUIZ_MESSAGES.ANONYMOUS_QUIZ_KEY))
          .catch((err) => console.warn("[Login] quiz claim failed", err));
      }

      navigateToRoleHome(user.role, navigate, redirectTo);
    }
  }, [user, navigate, redirectTo, quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    hasNavigated.current = false;
    
    try {
      const result = await login(email.trim(), password);
      
      if (!result.success) {
        setError(result.error ?? "Login failed");
        setLoading(false);
        return;
      }

      // Success - navigation handled by useEffect above
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
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
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => quickLogin(d)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left
                    ${email === d.email
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                >
                  <div className={`h-8 w-8 shrink-0 rounded-full ${d.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {d.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{d.role}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{d.desc}</div>
                  </div>
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => cognitoService.initiateGoogleLogin()}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

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
