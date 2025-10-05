import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const assets = [
  { symbol: "PETR4", name: "Petrobras PN", value: 28.45, change: 2.34, changePercent: 8.96 },
  { symbol: "VALE3", name: "Vale ON", value: 65.32, change: -1.23, changePercent: -1.85 },
  { symbol: "ITUB4", name: "Itaú Unibanco PN", value: 25.78, change: 0.89, changePercent: 3.57 },
  { symbol: "BBDC4", name: "Bradesco PN", value: 13.42, change: 0.45, changePercent: 3.47 },
  { symbol: "BTC", name: "Bitcoin", value: 367450.00, change: 12340.00, changePercent: 3.48 },
  { symbol: "ETH", name: "Ethereum", value: 12850.00, change: -450.00, changePercent: -3.38 },
];

export const AssetsGrid = () => {
  return (
    <Card className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Meus Ativos</h3>
          <p className="text-sm text-muted-foreground">Acompanhamento em tempo real</p>
        </div>
        <button className="text-sm text-primary hover:underline font-medium">
          Ver carteira
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all hover:shadow-card cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-sm">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
              {asset.changePercent > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold">
                R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  asset.changePercent > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {asset.changePercent > 0 ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({asset.change > 0 ? '+' : ''}R$ {asset.change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
