import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { SUPABASE_ENABLED, supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { signIn, signInDemo, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [registerMode, setRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (registerMode) {
      if (!SUPABASE_ENABLED) {
        toast.message("Cadastro indisponível em modo dev. Use 'Entrar como demo'.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) toast.error(error.message);
      else toast.success("Conta criada! Verifique seu e-mail (se exigido) e faça login.");
      return;
    }
    const { error } = await signIn(email, password, remember);
    setLoading(false);
    if (error) toast.error(error);
    else toast.success("Login realizado!");
  };

  const onResetPassword = async () => {
    if (!email) { toast.message("Informe seu e-mail primeiro"); return; }
    if (!SUPABASE_ENABLED) { toast.message("Recuperação indisponível em modo dev"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    if (error) toast.error(error.message); else toast.success("Se o e-mail existir, enviaremos instruções de redefinição.");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 animate-pulse-subtle" style={{
        background: "radial-gradient(1000px 600px at 10% -20%, rgba(99,102,241,.25), transparent 60%), radial-gradient(800px 600px at 110% 120%, rgba(34,197,94,.2), transparent 60%)"
      }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/90 to-background" />
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-elevated animate-fade-in-up">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary mx-auto mb-3 shadow-glow" />
            <h1 className="text-2xl font-bold">Bem-vindo ao FinanceHub</h1>
            <p className="text-muted-foreground">Faça login para continuar</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@exemplo.com" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                Lembrar-me
              </label>
              <button type="button" className="text-sm text-primary/90 hover:underline" onClick={onResetPassword}>Esqueci a senha</button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (registerMode ? "Cadastrando..." : "Entrando...") : (registerMode ? "Criar conta" : "Entrar")}
            </Button>
          </form>
          <div className="mt-3 text-center text-sm">
            {registerMode ? (
              <button className="text-primary hover:underline" onClick={() => setRegisterMode(false)}>Já tenho conta</button>
            ) : (
              <button className="text-primary hover:underline" onClick={() => setRegisterMode(true)}>Criar uma conta</button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-muted" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-muted" />
          </div>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full" type="button" onClick={() => signInDemo()}>Entrar como demo</Button>
            {!SUPABASE_ENABLED && (
              <p className="text-xs text-muted-foreground text-center">Modo desenvolvimento ativo (Supabase não configurado). Use o botão acima para entrar.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
