import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="animate-fade-in mb-6">
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no FinanceHub
          </p>
        </div>

        <Card className="premium-card p-12 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground">
            Página de configurações em desenvolvimento
          </p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
