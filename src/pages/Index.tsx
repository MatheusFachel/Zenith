import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AssetsGrid } from "@/components/dashboard/AssetsGrid";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useTransactions } from "@/contexts/TransactionContext";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Target, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile, user } = useAuth();
  const { addTransaction, getTotalBalance, transactions } = useTransactions();

  const totalBalance = getTotalBalance();
  const monthExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const monthIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (transaction: any) => {
    addTransaction(transaction);
    toast.success(transaction.type === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo de volta, <span className="gradient-text">{profile?.full_name || user?.email || 'Usuário'}</span>
            </h1>
            <p className="text-muted-foreground">
              Aqui está um resumo das suas finanças hoje
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Saldo
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Saldo Total"
            value={`R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+12,5%"
            changeType="positive"
            icon={Wallet}
          />
          <StatCard
            title="Receitas do Mês"
            value={`R$ ${monthIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+8,3%"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="Despesas do Mês"
            value={`R$ ${monthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="-5,2%"
            changeType="negative"
            icon={TrendingDown}
          />
          <StatCard
            title="Meta de Economia"
            value="73%"
            change="+15%"
            changeType="positive"
            icon={Target}
          />
        </div>

        {/* Balance Chart */}
        <BalanceChart />

        {/* Assets Grid */}
        <AssetsGrid />

        {/* Recent Transactions */}
        <RecentTransactions />

        {/* Transaction Modal */}
        <TransactionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTransaction}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
