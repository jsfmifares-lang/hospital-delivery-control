import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { requestNotificationPermission } from "@/lib/notify";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isAnderson: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, username: string, password: string) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function checkRoles(username: string) {
  const lower = username.toLowerCase();
  return {
    isAdmin: lower.includes("adm"),
    isAnderson: lower.includes("anderson"),
  };
}

const STORAGE_KEY = "hd_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser({ ...parsed, ...checkRoles(parsed.username) });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, username: string, password: string): Promise<{ error: string | null }> => {
    const { data: existing } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return { error: "Nome de usuario ja existe" };
    }

    const { error } = await supabase
      .from("usuarios")
      .insert({ email, username, senha: password });

    if (error) {
      return { error: "Erro ao cadastrar" };
    }

    const { data: newUser } = await supabase
      .from("usuarios")
      .select("id, email, username")
      .eq("username", username)
      .single();

    if (newUser) {
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        ...checkRoles(newUser.username),
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    }

    return { error: null };
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    const { data: usuario, error: lookupError } = await supabase
      .from("usuarios")
      .select("id, email, username, senha")
      .eq("username", username)
      .maybeSingle();

    if (lookupError || !usuario) {
      return { error: "Usuario nao encontrado" };
    }

    if (usuario.senha !== password) {
      return { error: "Senha incorreta" };
    }

    const authUser: AuthUser = {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      ...checkRoles(usuario.username),
    };

    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    requestNotificationPermission();

    return { error: null };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
