import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAnderson: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, username: string, password: string) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setSession(session);

    const { data } = await supabase
      .from("usuarios")
      .select("username")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        username: data.username,
        isAnderson: data.username.toLowerCase() === "anderson",
      });
    } else {
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        username: session.user.email ?? "",
        isAnderson: false,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, username: string, password: string): Promise<{ error: string | null }> => {
    const { data: existing } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return { error: "Nome de usuario ja existe" };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    const { data: usuario, error: lookupError } = await supabase
      .from("usuarios")
      .select("email")
      .eq("username", username)
      .single();

    if (lookupError || !usuario) {
      return { error: "Usuario nao encontrado" };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password,
    });

    if (error) {
      return { error: "Senha incorreta" };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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
