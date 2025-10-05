import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, SUPABASE_ENABLED } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void> | void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => Promise<void> | void;
  deleteTransaction: (id: string) => Promise<void> | void;
  getTotalBalance: () => number;
  getTotalByCategory: (category: string) => number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    if (!user || !SUPABASE_ENABLED) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (!error) {
      setTransactions((data as any[]).map(row => ({
        id: row.id,
        amount: Number(row.amount),
        date: row.date,
        description: row.description ?? '',
        category: row.category,
        type: row.type,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, SUPABASE_ENABLED]);

  // Realtime: sincroniza lista ao vivo
  useEffect(() => {
    if (!user || !SUPABASE_ENABLED) return;

    const mapRow = (row: any): Transaction => ({
      id: row.id,
      amount: Number(row.amount),
      date: row.date,
      description: row.description ?? '',
      category: row.category,
      type: row.type,
    });

    const channel = supabase
      .channel(`realtime:transactions:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newRow = mapRow(payload.new);
            setTransactions(prev => (prev.some(t => t.id === newRow.id) ? prev : [newRow, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const newRow = mapRow(payload.new);
            setTransactions(prev => prev.map(t => (t.id === newRow.id ? newRow : t)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId) setTransactions(prev => prev.filter(t => t.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, SUPABASE_ENABLED]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (user && SUPABASE_ENABLED) {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
      });
      if (!error) await fetchTransactions();
      return;
    }
    // Fallback local (sem Supabase)
    const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = async (id: string, transaction: Omit<Transaction, 'id'>) => {
    if (user && SUPABASE_ENABLED) {
      const { error } = await supabase.from('transactions').update({
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
      }).eq('id', id).eq('user_id', user.id);
      if (!error) await fetchTransactions();
      return;
    }
    setTransactions(prev => prev.map(t => (t.id === id ? { ...transaction, id } : t)));
  };

  const deleteTransaction = async (id: string) => {
    if (user && SUPABASE_ENABLED) {
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
      if (!error) await fetchTransactions();
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getTotalBalance = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalByCategory = (category: string) => {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTotalBalance,
        getTotalByCategory,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};
