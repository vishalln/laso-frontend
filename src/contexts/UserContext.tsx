import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "coordinator" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  colorClass: string;
  patientId?: string;
  doctorId?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface UserContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
  isRole: (...roles: UserRole[]) => boolean;
}

// ─── Demo Users (matches LASO_SPEC_V2 Part 2.1) ──────────────────────────────

const DEMO_USERS: Record<string, UserProfile & { password: string }> = {
  "arjun@laso.health": {
    id: "user_001",
    name: "Arjun Sharma",
    email: "arjun@laso.health",
    role: "patient",
    avatarInitials: "AS",
    colorClass: "bg-primary",
    patientId: "patient_001",
    password: "demo123",
  },
  "dr.sharma@laso.health": {
    id: "user_002",
    name: "Dr. Rahul Sharma",
    email: "dr.sharma@laso.health",
    role: "doctor",
    avatarInitials: "RS",
    colorClass: "bg-emerald-600",
    doctorId: "doctor_001",
    password: "doctor123",
  },
  "coord@laso.health": {
    id: "user_003",
    name: "Priya Coordinator",
    email: "coord@laso.health",
    role: "coordinator",
    avatarInitials: "PC",
    colorClass: "bg-violet-600",
    password: "coord123",
  },
  "admin@laso.health": {
    id: "user_004",
    name: "Admin User",
    email: "admin@laso.health",
    role: "admin",
    avatarInitials: "AU",
    colorClass: "bg-slate-700",
    password: "admin123",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((email: string, password: string): AuthResult => {
    const record = DEMO_USERS[email.toLowerCase().trim()];
    if (!record) return { success: false, error: "No account found with this email." };
    if (record.password !== password) return { success: false, error: "Incorrect password." };
    const { password: _pw, ...profile } = record;
    void _pw;
    setUser(profile);
    return { success: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const isRole = useCallback((...roles: UserRole[]) => roles.includes(user?.role as UserRole), [user]);

  return (
    <UserContext.Provider value={{ user, isLoggedIn: user !== null, login, logout, isRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
