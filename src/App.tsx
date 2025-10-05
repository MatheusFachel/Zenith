import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Investimentos from "./pages/Investimentos";
import Transacoes from "./pages/Transacoes";
import Metas from "./pages/Metas";
import Configuracoes from "./pages/Configuracoes";
import Planilhas from "./pages/Planilhas";
import DivisaoCapital from "./pages/DivisaoCapital";
import Mercado from "./pages/Mercado";
import Noticias from "./pages/Noticias";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TransactionProvider } from "./contexts/TransactionContext";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <TransactionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/perfil" element={<Protected><Profile /></Protected>} />
              <Route path="/" element={<Protected><Index /></Protected>} />
              <Route path="/investimentos" element={<Protected><Investimentos /></Protected>} />
              <Route path="/transacoes" element={<Protected><Transacoes /></Protected>} />
              <Route path="/metas" element={<Protected><Metas /></Protected>} />
              <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />
              <Route path="/planilhas" element={<Protected><Planilhas /></Protected>} />
              <Route path="/divisao-capital" element={<Protected><DivisaoCapital /></Protected>} />
              <Route path="/mercado" element={<Protected><Mercado /></Protected>} />
              <Route path="/noticias" element={<Protected><Noticias /></Protected>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TransactionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
