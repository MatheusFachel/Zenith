import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_ENABLED } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Investment = {
  id: string;
  ticker: string;
  company_name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  dividend_frequency: string | null;
  dividend_amount: number | null;
};

const Investimentos = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user || !SUPABASE_ENABLED) return;
    const load = async () => {
      const { data } = await supabase.from("user_investments").select("*").order("created_at", { ascending: false });
      setInvestments((data as any) ?? []);
    };
    load();
  }, [user]);

  useEffect(() => {
    // Mock price updates every 10s
    const tickers = Array.from(new Set(investments.map(i => i.ticker)));
    if (tickers.length === 0) return;
    const init: Record<string, number> = {};
    tickers.forEach(t => { init[t] = init[t] ?? (Math.random() * 50 + 20); });
    setPrices(prev => ({ ...init, ...prev }));
    const id = setInterval(() => {
      setPrices(prev => {
        const next: Record<string, number> = { ...prev };
        tickers.forEach(t => {
          const base = next[t] ?? (Math.random() * 50 + 20);
          const delta = (Math.random() - 0.5) * 0.5;
          next[t] = Math.max(0.01, +(base + delta).toFixed(2));
        });
        return next;
      });
    }, 10000);
    return () => clearInterval(id);
  }, [investments]);

  const rows = useMemo(() => investments.map(inv => {
    const cur = prices[inv.ticker] ?? inv.purchase_price;
    const market = cur * inv.quantity;
    const cost = inv.purchase_price * inv.quantity;
    const pl = market - cost;
    const plPct = cost ? (pl / cost) * 100 : 0;
    const div = (inv.dividend_amount ?? 0) * inv.quantity;
    return { inv, cur, market, cost, pl, plPct, div };
  }), [investments, prices]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Investimentos</h1>
          <p className="text-muted-foreground">Sua carteira e dividendos estimados</p>
        </div>

        <Card className="premium-card overflow-x-auto">
          {!SUPABASE_ENABLED && (
            <div className="p-4 text-sm text-muted-foreground">
              Supabase não configurado. Mostrando tabela vazia. Configure o banco para ver seus investimentos.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço de Compra</TableHead>
                <TableHead>Preço Atual</TableHead>
                <TableHead>Valor de Mercado</TableHead>
                <TableHead>P/L</TableHead>
                <TableHead>Dividendos</TableHead>
                <TableHead>Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ inv, cur, market, cost, pl, plPct, div }) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-semibold">{inv.company_name} <span className="text-muted-foreground">({inv.ticker})</span></TableCell>
                  <TableCell>{inv.quantity}</TableCell>
                  <TableCell>R$ {inv.purchase_price.toFixed(2)}</TableCell>
                  <TableCell>R$ {cur.toFixed(2)}</TableCell>
                  <TableCell>R$ {market.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={pl >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                      R$ {pl.toFixed(2)} ({plPct.toFixed(2)}%)
                    </span>
                  </TableCell>
                  <TableCell>R$ {div.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inv.dividend_frequency ?? '—'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Investimentos;
