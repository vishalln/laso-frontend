import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { cognitoService, type UserData } from "@/services/cognitoService";

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  isRole: (...roles: UserRole[]) => boolean;
  updateUserFromSession: (session: any) => UserData;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

// Helper to convert UserData to UserProfile
function userDataToProfile(data: UserData): UserProfile {
  const initials = data.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || data.email[0].toUpperCase();

  const colorMap: Record<string, string> = {
    patient: "bg-primary",
    doctor: "bg-emerald-600",
    coordinator: "bg-violet-600",
    admin: "bg-slate-700",
  };

  return {
    id: data.id,
    name: data.name || data.email.split('@')[0],
    email: data.email,
    role: data.role as UserRole,
    avatarInitials: initials,
    colorClass: colorMap[data.role] || "bg-primary",
  };
}

export function UserProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize - restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await cognitoService.getCurrentSession();
        if (session) {
          const userData = cognitoService.getUserDataFromSession(session);
          setUser(userDataToProfile(userData));
        }
      } catch (error) {
        console.error('[UserContext] Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await cognitoService.login(email, password);
      
      if (!result.success || !result.session) {
        return { 
          success: false, 
          error: result.error || "Login failed" 
        };
      }

      const userData = cognitoService.getUserDataFromSession(result.session);
      setUser(userDataToProfile(userData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      };
    }
  }, []);

  const logout = useCallback(() => {
    cognitoService.logout();
    setUser(null);
  }, []);

  const isRole = useCallback((...roles: UserRole[]) => roles.includes(user?.role as UserRole), [user]);

  const updateUserFromSession = useCallback((session: any): UserData => {
    const userData = cognitoService.getUserDataFromSession(session);
    setUser(userDataToProfile(userData));
    console.log('[UserContext] User updated from OAuth session:', userData.email);
    return userData;
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn: user !== null, isLoading, login, logout, isRole, updateUserFromSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
