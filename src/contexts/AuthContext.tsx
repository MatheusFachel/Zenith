import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, SUPABASE_ENABLED } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string | null;
  theme_preference: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<{ error?: string }>;
  signInDemo: (email?: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  updateEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    setLoading(true);
    if (!SUPABASE_ENABLED) {
      // In dev mode, allow local demo session
      const local = localStorage.getItem("dev_user");
      if (local) {
        const dev = JSON.parse(local);
        setUser(dev);
        setProfile({ id: "dev", email: dev.email ?? "dev@example.com", full_name: "Usuário Dev", avatar_url: null, default_currency: "BRL", theme_preference: "dark" });
        setLoading(false);
        return;
      }
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url,default_currency,theme_preference")
      .eq("id", user.id)
      .single();
    if (!error) setProfile(data as Profile);
  };

  useEffect(() => {
    loadSession();
    if (!SUPABASE_ENABLED) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  // Realtime do perfil: assina mudanças em public.profiles do usuário atual
  useEffect(() => {
    if (!SUPABASE_ENABLED || !user) return;
    const channel = supabase
      .channel(`realtime:profiles:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        async () => {
          await refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, SUPABASE_ENABLED]);

  useEffect(() => {
    // Apply theme preference if available
    const root = document.documentElement;
    const prefersDark = profile?.theme_preference === "dark";
    if (prefersDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [profile?.theme_preference]);

  const signIn: AuthContextType["signIn"] = async (email, password, _remember) => {
    if (!SUPABASE_ENABLED) {
      const devUser: any = { id: "dev", email };
      localStorage.setItem("dev_user", JSON.stringify(devUser));
      setUser(devUser);
      setProfile({ id: "dev", email, full_name: "Usuário Dev", avatar_url: null, default_currency: "BRL", theme_preference: "dark" });
      return {};
    } else {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setUser(data.user);
    await refreshProfile();
    return {};
    }
  };

  const signInDemo: AuthContextType["signInDemo"] = (email = "dev@example.com") => {
    const devUser: any = { id: "dev", email };
    localStorage.setItem("dev_user", JSON.stringify(devUser));
    setUser(devUser);
    setProfile({ id: "dev", email, full_name: "Usuário Dev", avatar_url: null, default_currency: "BRL", theme_preference: "dark" });
  };

  const signOut = async () => {
    // Always clear demo user
    localStorage.removeItem("dev_user");
    if (SUPABASE_ENABLED) {
    await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile: AuthContextType["updateProfile"] = async (updates) => {
    if (!user) return { error: "Not authenticated" };
    if (!SUPABASE_ENABLED) {
      // Atualiza apenas localmente no modo demo
      setProfile((prev) => (prev ? { ...prev, ...updates } as Profile : prev));
      return {};
    }
    // Usa upsert para garantir registro mesmo para usuários antigos sem linha em profiles
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...(updates as any) }, { onConflict: 'id' });
    if (error) return { error: error.message };
    await refreshProfile();
    return {};
  };

  const updateEmail: AuthContextType["updateEmail"] = async (email) => {
    if (!SUPABASE_ENABLED) { setProfile(prev => prev ? { ...prev, email } : prev); return {}; }
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    // Sincroniza também a coluna email na tabela profiles
    await supabase.from('profiles').upsert({ id: (await supabase.auth.getUser()).data.user?.id as string, email }, { onConflict: 'id' });
    await refreshProfile();
    return {};
  };

  const updatePassword: AuthContextType["updatePassword"] = async (password) => {
    if (!SUPABASE_ENABLED) return {};
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return {};
  };

  const value = useMemo(() => ({ user, profile, loading, signIn, signInDemo, signOut, refreshProfile, updateProfile, updateEmail, updatePassword }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
