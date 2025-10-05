import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Mock data for stocks
const mockStocks = [
  { ticker: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.34, sector: "Tecnologia", sparkline: [175, 176, 174, 177, 178, 179, 178.45] },
  { ticker: "MSFT", name: "Microsoft Corp.", price: 412.80, change: 1.89, sector: "Tecnologia", sparkline: [405, 408, 410, 411, 413, 414, 412.80] },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 142.65, change: -0.45, sector: "Tecnologia", sparkline: [144, 143, 142, 143, 142.5, 143, 142.65] },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 3.12, sector: "Tecnologia", sparkline: [173, 175, 176, 177, 179, 180, 178.25] },
  { ticker: "TSLA", name: "Tesla Inc.", price: 248.50, change: -2.15, sector: "Tecnologia", sparkline: [254, 252, 250, 249, 248, 247, 248.50] },
  { ticker: "JNJ", name: "Johnson & Johnson", price: 159.30, change: 0.78, sector: "Saúde", sparkline: [158, 158.5, 159, 159.2, 159.5, 159.8, 159.30] },
  { ticker: "PFE", name: "Pfizer Inc.", price: 28.95, change: -1.23, sector: "Saúde", sparkline: [29.5, 29.3, 29.1, 29, 28.9, 28.8, 28.95] },
  { ticker: "XOM", name: "Exxon Mobil", price: 112.40, change: 1.45, sector: "Energia", sparkline: [110, 111, 111.5, 112, 112.5, 113, 112.40] },
  { ticker: "CVX", name: "Chevron Corp.", price: 158.75, change: 0.95, sector: "Energia", sparkline: [157, 157.5, 158, 158.5, 159, 159.5, 158.75] },
  { ticker: "JPM", name: "JPMorgan Chase", price: 198.65, change: 2.05, sector: "Financeiro", sparkline: [195, 196, 197, 198, 199, 200, 198.65] },
  { ticker: "BAC", name: "Bank of America", price: 42.35, change: 1.34, sector: "Financeiro", sparkline: [41.5, 41.8, 42, 42.2, 42.5, 42.8, 42.35] },
  { ticker: "WMT", name: "Walmart Inc.", price: 167.80, change: -0.65, sector: "Varejo", sparkline: [168.5, 168, 167.5, 167, 167.5, 168, 167.80] },
];

const sectors = ["Todos", "Tecnologia", "Saúde", "Energia", "Financeiro", "Varejo"];

const Mercado = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("Todos");

  const filteredStocks = mockStocks.filter((stock) => {
    const matchesSearch = 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "Todos" || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const width = 60;
    const height = 20;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] >= data[0];
    
    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mercado</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as ações listadas em tempo real
          </p>
        </div>

        <Card className="premium-card p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <Button
                  key={sector}
                  variant={selectedSector === sector ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSector(sector)}
                  className="transition-all"
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="premium-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead className="text-right">Últimos 7 dias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.ticker} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-bold">{stock.ticker}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stock.sector}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${stock.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      stock.change >= 0 ? "text-success" : "text-destructive"
                    }`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {renderSparkline(stock.sparkline)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma ação encontrada com os filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Mercado;
