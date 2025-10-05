import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, SUPABASE_ENABLED } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, profile, updateProfile, updateEmail, updatePassword, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [currency, setCurrency] = useState(profile?.default_currency ?? "BRL");
  const [theme, setTheme] = useState(profile?.theme_preference ?? "dark");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  // Sincroniza o formulário quando o perfil/usuário é carregado/atualizado
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setCurrency(profile?.default_currency ?? "BRL");
    setTheme(profile?.theme_preference ?? "dark");
    // Preferir o email do perfil; se não houver, cair para o email do auth
    setEmail(profile?.email ?? user?.email ?? "");
  }, [profile, user?.email]);

  const saveProfile = async () => {
    const { error } = await updateProfile({ full_name: fullName, default_currency: currency, theme_preference: theme });
    if (error) toast.error(error); else toast.success("Preferências salvas");
  };

  const saveEmail = async () => {
    if (!email) return; 
    const { error } = await updateEmail(email);
    if (error) toast.error(error); else { toast.success("Email atualizado"); await refreshProfile(); }
  };

  const savePassword = async () => {
    if (!password) return;
    const { error } = await updatePassword(password);
    if (error) toast.error(error); else toast.success("Senha atualizada");
    setPassword("");
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
  if (!SUPABASE_ENABLED) { toast.message("Upload simulado em modo dev"); setUploading(false); return; }
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await updateProfile({ avatar_url: data.publicUrl });
    setUploading(false);
    if (error) toast.error(error); else toast.success("Foto atualizada");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Perfil do Usuário</h1>
          <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
        </div>

        <Card className="premium-card p-6">
          {!SUPABASE_ENABLED && (
            <div className="mb-4 text-sm text-muted-foreground">
              Supabase não configurado. Usando modo desenvolvimento. Para ativar recursos completos, defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
            </div>
          )}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                (fullName || email)?.[0]?.toUpperCase() ?? "U"
              )}
            </div>
            <div>
              <input id="avatar" type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
              <label htmlFor="avatar">
                <Button variant="outline" disabled={uploading}>{uploading ? "Enviando..." : "Atualizar foto"}</Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>E-mail</Label>
              <div className="flex gap-2">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button onClick={saveEmail} variant="outline">Salvar</Button>
              </div>
            </div>
            <div>
              <Label>Moeda padrão</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferência de tema</Label>
              <Select value={theme ?? "dark"} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Senha</Label>
              <div className="flex gap-2">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" />
                <Button onClick={savePassword} variant="outline">Atualizar</Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={saveProfile}>Salvar preferências</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
