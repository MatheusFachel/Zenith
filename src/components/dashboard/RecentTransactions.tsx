import { Card } from "@/components/ui/card";
import { useTransactions } from "@/contexts/TransactionContext";
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Car, Home } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: Record<string, any> = {
  Mercado: ShoppingBag,
  Restaurante: Coffee,
  Combustível: Car,
  Aluguel: Home,
  Salário: ArrowDownLeft,
};

export const RecentTransactions = () => {
  const { transactions } = useTransactions();
  const recentTransactions = transactions.slice(0, 5);

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return 'Ontem';
    return `${diffDays} dias atrás`;
  };

  return (
    <Card className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Transações Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas movimentações</p>
        </div>
        <Link to="/transacoes" className="text-sm text-primary hover:underline font-medium">
          Ver todas
        </Link>
      </div>

      <div className="space-y-4">
        {recentTransactions.map((transaction) => {
          const Icon = iconMap[transaction.category] || ShoppingBag;
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                transaction.type === 'income' 
                  ? 'bg-success/10' 
                  : 'bg-muted'
              }`}>
                <Icon className={`w-5 h-5 ${
                  transaction.type === 'income' 
                    ? 'text-success' 
                    : 'text-foreground'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{transaction.category}</p>
                <p className="text-xs text-muted-foreground">{getRelativeDate(transaction.date)}</p>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-success' 
                    : 'text-foreground'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}
                  R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
