import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase, ADMIN_TOKEN_KEY } from "@/lib/supabase";
import type { Profile } from "@/types/database";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (_email: string) => Promise<never>;
}

function decodeTokenPayload(token: string): { sub: string; exp: number } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): token is string {
  if (!token) return false;
  const payload = decodeTokenPayload(token);
  return !!payload?.exp && payload.exp * 1000 > Date.now();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  const loadProfileForToken = useCallback(async (token: string) => {
    const payload = decodeTokenPayload(token);
    if (!payload?.sub) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.sub)
      .single();
    return data;
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (isTokenValid(token)) {
        const profile = await loadProfileForToken(token);
        if (profile) {
          setState({ user: { id: profile.id, email: profile.email }, profile, isLoading: false });
          return;
        }
      }
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setState({ user: null, profile: null, isLoading: false });
    };
    init();
  }, [loadProfileForToken]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.rpc("login", { p_email: email, p_password: password });
    if (error) throw new Error("Invalid email or password");
    const token = data as string;
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    const profile = await loadProfileForToken(token);
    if (!profile) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      throw new Error("Signed in, but the profile could not be loaded");
    }
    setState({ user: { id: profile.id, email: profile.email }, profile, isLoading: false });
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setState({ user: null, profile: null, isLoading: false });
  };

  const resetPassword = async (_email: string): Promise<never> => {
    throw new Error("Self-service password reset isn't available. Please ask another admin to reset it for you.");
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
