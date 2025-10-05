import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", balance: 95000 },
  { month: "Fev", balance: 98000 },
  { month: "Mar", balance: 102000 },
  { month: "Abr", balance: 108000 },
  { month: "Mai", balance: 115000 },
  { month: "Jun", balance: 125450 },
];

export const BalanceChart = () => {
  return (
    <Card className="premium-card p-6 animate-fade-in-up">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Evolução do Patrimônio</h3>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              padding: "0.75rem"
            }}
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Saldo']}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="hsl(262 83% 58%)" 
            strokeWidth={3}
            fill="url(#balanceGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
