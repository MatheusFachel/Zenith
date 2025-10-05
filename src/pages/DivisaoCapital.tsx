import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactions } from '@/contexts/TransactionContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetCategory {
  name: string;
  percentage: number;
  color: string;
}

const defaultCategories: BudgetCategory[] = [
  { name: 'Essenciais', percentage: 50, color: '#8b5cf6' },
  { name: 'Lazer', percentage: 30, color: '#06b6d4' },
  { name: 'Investimentos', percentage: 20, color: '#10b981' },
];

const DivisaoCapital = () => {
  const { getTotalBalance, transactions } = useTransactions();
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);
  const [modelName, setModelName] = useState('');
  const [savedModels, setSavedModels] = useState<{ name: string; categories: BudgetCategory[] }[]>([]);

  const totalBalance = getTotalBalance();
  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);

  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: (totalBalance * cat.percentage) / 100,
    percentage: cat.percentage,
    color: cat.color,
  }));

  const handlePercentageChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index].percentage = parseFloat(value) || 0;
    setCategories(newCategories);
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      { name: 'Nova Categoria', percentage: 0, color: '#' + Math.floor(Math.random()*16777215).toString(16) }
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const saveModel = () => {
    if (!modelName.trim()) {
      toast.error('Digite um nome para o modelo');
      return;
    }
    if (totalPercentage !== 100) {
      toast.error('O total das porcentagens deve ser 100%');
      return;
    }
    setSavedModels([...savedModels, { name: modelName, categories: [...categories] }]);
    toast.success('Modelo salvo com sucesso!');
    setModelName('');
  };

  const loadModel = (model: { name: string; categories: BudgetCategory[] }) => {
    setCategories(model.categories);
    toast.success(`Modelo "${model.name}" carregado`);
  };

  const getCategorySpent = (categoryName: string) => {
    return transactions
      .filter(t => t.category === categoryName && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Divisão de Capital</h1>
          <p className="text-muted-foreground">
            Organize seu dinheiro por categorias e metas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="premium-card p-6">
            <h3 className="text-lg font-semibold mb-4">Configurar Distribuição</h3>
            
            <div className="space-y-4 mb-6">
              {categories.map((cat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={cat.name}
                    onChange={(e) => {
                      const newCategories = [...categories];
                      newCategories[index].name = e.target.value;
                      setCategories(newCategories);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={cat.percentage}
                    onChange={(e) => handlePercentageChange(index, e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <Button onClick={addCategory} variant="outline" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Categoria
              </Button>
            </div>

            <div className={`text-sm font-medium mb-4 ${totalPercentage === 100 ? 'text-success' : 'text-destructive'}`}>
              Total: {totalPercentage}% {totalPercentage !== 100 && '(Deve ser 100%)'}
            </div>

            <div className="space-y-3">
              <Label>Nome do Modelo</Label>
              <div className="flex gap-2">
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Ex: Modelo Padrão"
                />
                <Button onClick={saveModel}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>

            {savedModels.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Modelos Salvos</h4>
                <div className="space-y-2">
                  {savedModels.map((model, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => loadModel(model)}
                    >
                      {model.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="premium-card p-6">
            <h3 className="text-lg font-semibold mb-4">Visualização</h3>
            
            <div className="mb-6">
              <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => 
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {categories.map((cat, index) => {
                const allocated = (totalBalance * cat.percentage) / 100;
                const spent = getCategorySpent(cat.name);
                const remaining = allocated - spent;
                const usedPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="font-medium">
                        R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restante
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(usedPercentage, 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usado: R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {allocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DivisaoCapital;
