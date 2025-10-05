import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/contexts/TransactionContext';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const Planilhas = () => {
  const { transactions } = useTransactions();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [exportType, setExportType] = useState<'detailed' | 'summary'>('detailed');
  const [mode, setMode] = useState<'personalizada' | 'modelos'>('personalizada');
  const [template, setTemplate] = useState<'Investimentos' | 'Entradas' | 'Saídas' | 'Orçamento' | 'Metas'>("Investimentos");

  const templates = useMemo(() => ({
    Investimentos: {
      columns: ["Ticker", "Quantidade", "Preço de Compra", "Preço Atual", "Dividendos", "Lucro/Prejuízo"],
      rows: [
        { Ticker: "PETR4", Quantidade: 100, "Preço de Compra": 35.5, "Preço Atual": 36.8, Dividendos: 0.8, "Lucro/Prejuízo": "=(D2-C2)*B2" },
        { Ticker: "ITUB4", Quantidade: 50, "Preço de Compra": 28.2, "Preço Atual": 30.1, Dividendos: 0.4, "Lucro/Prejuízo": "=(D3-C3)*B3" },
      ],
    },
    Entradas: {
      columns: ["Data", "Categoria", "Descrição", "Valor"],
      rows: [
        { Data: "2025-10-01", Categoria: "Salário", Descrição: "Salário Mensal", Valor: 5000 },
        { Data: "2025-10-10", Categoria: "Freelance", Descrição: "Projeto X", Valor: 1200 },
      ],
    },
    "Saídas": {
      columns: ["Data", "Categoria", "Descrição", "Valor"],
      rows: [
        { Data: "2025-10-05", Categoria: "Alimentação", Descrição: "Supermercado", Valor: 350 },
        { Data: "2025-10-08", Categoria: "Transporte", Descrição: "Combustível", Valor: 200 },
      ],
    },
    "Orçamento": {
      columns: ["Categoria", "Limite", "Gasto", "Saldo"],
      rows: [
        { Categoria: "Alimentação", Limite: 1200, Gasto: 350, Saldo: "=B2-C2" },
        { Categoria: "Transporte", Limite: 600, Gasto: 200, Saldo: "=B3-C3" },
      ],
    },
    Metas: {
      columns: ["Objetivo", "Valor Alvo", "Acumulado", "Progresso"],
      rows: [
        { Objetivo: "Comprar carro", "Valor Alvo": 60000, Acumulado: 15000, Progresso: "=C2/B2" },
        { Objetivo: "Reserva de emergência", "Valor Alvo": 30000, Acumulado: 9000, Progresso: "=C3/B3" },
      ],
    },
  }), []);

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);
    const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;

    return dateMatch && categoryMatch;
  });

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const exportToCSV = () => {
    let data: any[] = [];

    if (mode === 'modelos') {
      data = templates[template].rows as any[];
    } else if (exportType === 'detailed') {
      data = filteredTransactions.map((t) => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
        Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        Categoria: t.category,
        Descrição: t.description,
        Valor: t.amount.toFixed(2),
      }));
    } else {
      const summary = categories.map((cat) => {
        const total = filteredTransactions
          .filter((t) => t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          Categoria: cat,
          Total: total.toFixed(2),
        };
      });
      data = summary;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, mode === 'modelos' ? template : 'Transações');
    XLSX.writeFile(wb, `${mode === 'modelos' ? `modelo_${template.toLowerCase()}` : `transacoes_${exportType}`}_${Date.now()}.csv`);
  };

  const exportToExcel = () => {
    let data: any[] = [];

    if (mode === 'modelos') {
      data = templates[template].rows as any[];
    } else if (exportType === 'detailed') {
      data = filteredTransactions.map((t) => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
        Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        Categoria: t.category,
        Descrição: t.description,
        Valor: t.amount.toFixed(2),
      }));
    } else {
      const summary = categories.map((cat) => {
        const total = filteredTransactions
          .filter((t) => t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          Categoria: cat,
          Total: total.toFixed(2),
        };
      });
      data = summary;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, mode === 'modelos' ? template : 'Transações');
    XLSX.writeFile(wb, `${mode === 'modelos' ? `modelo_${template.toLowerCase()}` : `transacoes_${exportType}`}_${Date.now()}.xlsx`);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Planilhas</h1>
          <p className="text-muted-foreground">
            Visualize e exporte suas transações
          </p>
        </div>

        <Card className="premium-card p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Select value={mode} onValueChange={(v: 'personalizada' | 'modelos') => setMode(v)}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="personalizada">Planilha personalizada</SelectItem>
                <SelectItem value="modelos">Modelos prontos</SelectItem>
              </SelectContent>
            </Select>
            {mode === 'modelos' && (
              <Select value={template} onValueChange={(v: any) => setTemplate(v)}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                  <SelectItem value="Entradas">Controle de Entradas</SelectItem>
                  <SelectItem value="Saídas">Controle de Saídas</SelectItem>
                  <SelectItem value="Orçamento">Orçamento Mensal</SelectItem>
                  <SelectItem value="Metas">Planejamento Financeiro (Metas)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Select value={exportType} onValueChange={(v: 'detailed' | 'summary') => setExportType(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detalhado</SelectItem>
                <SelectItem value="summary">Resumido</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={exportToExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>

          {mode === 'personalizada' ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === 'income' ? 'text-success' : 'text-muted-foreground'}>
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-foreground'
                      }`}>
                        R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {templates[template].columns.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(templates[template].rows as any[]).map((row, idx) => (
                    <TableRow key={idx}>
                      {templates[template].columns.map((c) => (
                        <TableCell key={c}>{(row as any)[c]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default Planilhas;
