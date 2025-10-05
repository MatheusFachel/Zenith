import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";

type NewsCategory = "Todos" | "Ações" | "Cripto" | "Economia Global" | "Brasil";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
}

// Mock data for news
const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "S&P 500 atinge novo recorde histórico impulsionado por resultados do setor de tecnologia",
    summary: "Índice fecha com alta de 1.2% após balanços positivos das big techs superarem expectativas do mercado.",
    url: "https://example.com/news/1",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: "Ações"
  },
  {
    id: "2",
    title: "Bitcoin ultrapassa marca de $45.000 em movimento de recuperação",
    summary: "Criptomoeda ganha 8% nas últimas 24 horas com otimismo renovado sobre ETFs de Bitcoin.",
    url: "https://example.com/news/2",
    source: "CoinDesk",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: "Cripto"
  },
  {
    id: "3",
    title: "FED mantém taxa de juros inalterada em 5.25% ao ano",
    summary: "Decisão foi unânime entre membros do comitê, sinalizando pausa no ciclo de aperto monetário.",
    url: "https://example.com/news/3",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: "Economia Global"
  },
  {
    id: "4",
    title: "Petrobras anuncia dividendos extraordinários de R$ 15 bilhões",
    summary: "Estatal distribui lucros recordes após trimestre excepcional de resultados operacionais.",
    url: "https://example.com/news/4",
    source: "Valor Econômico",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: "Brasil"
  },
  {
    id: "5",
    title: "Ethereum completa atualização importante da rede",
    summary: "Nova versão promete reduzir taxas de transação e aumentar escalabilidade da blockchain.",
    url: "https://example.com/news/5",
    source: "CoinTelegraph",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    category: "Cripto"
  },
  {
    id: "6",
    title: "PIB brasileiro cresce 0.8% no trimestre, superando projeções",
    summary: "Dados do IBGE mostram recuperação mais forte que esperada impulsionada pelo setor de serviços.",
    url: "https://example.com/news/6",
    source: "Estadão",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: "Brasil"
  },
  {
    id: "7",
    title: "Tesla reporta vendas recordes de veículos elétricos no último trimestre",
    summary: "Montadora entrega 480 mil unidades, batendo estimativas de analistas por larga margem.",
    url: "https://example.com/news/7",
    source: "CNBC",
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    category: "Ações"
  },
  {
    id: "8",
    title: "Inflação global desacelera pelo quarto mês consecutivo",
    summary: "Dados de principais economias mostram tendência de arrefecimento dos preços ao consumidor.",
    url: "https://example.com/news/8",
    source: "Financial Times",
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    category: "Economia Global"
  },
];

const categories: NewsCategory[] = ["Todos", "Ações", "Cripto", "Economia Global", "Brasil"];

const Noticias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("Todos");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch = 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffInHours = Math.floor((now - then) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - then) / (1000 * 60));
      return `há ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `há ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays}d`;
    }
  };

  return (
    <AppLayout>
      <div className="p-6 animate-fade-in max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notícias</h1>
          <p className="text-muted-foreground">
            Últimas notícias do mercado financeiro
          </p>
        </div>

        <Card className="premium-card p-6 mb-6 sticky top-0 z-10 backdrop-blur-md bg-card/95">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
              >
                {density === "comfortable" ? "Compacto" : "Confortável"}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {/* Featured first card */}
          {filteredNews[0] && (
            <a href={filteredNews[0].url} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="premium-card p-6 lg:p-8 border-l-4 border-l-primary">
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  <div className="flex-1 space-y-2">
                    <Badge variant="outline">{filteredNews[0].category}</Badge>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{filteredNews[0].title}</h3>
                    <p className="text-muted-foreground text-lg">{filteredNews[0].summary}</p>
                    <span className="text-xs text-muted-foreground">{filteredNews[0].source} · {getRelativeTime(filteredNews[0].publishedAt)}</span>
                  </div>
                </div>
              </Card>
            </a>
          )}

          {/* Horizontal scrollable list with hover arrows */}
          <div className="relative group">
            <div id="news-scroll" className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory">
              {filteredNews.slice(1).map((news) => (
                <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="min-w-[300px] max-w-[360px] snap-start">
                  <Card className={`premium-card h-full transition-all hover:bg-accent/5 cursor-pointer ${density === 'comfortable' ? 'p-6' : 'p-4'}`}>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">{news.category}</Badge>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{news.title}</h4>
                      <p className="text-muted-foreground text-sm">{news.summary}</p>
                      <span className="text-xs text-muted-foreground">{news.source} · {getRelativeTime(news.publishedAt)}</span>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
            <button onClick={() => { document.getElementById('news-scroll')?.scrollBy({ left: -320, behavior: 'smooth' }); }} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border items-center justify-center shadow-card opacity-0 group-hover:opacity-100 transition-opacity">‹</button>
            <button onClick={() => { document.getElementById('news-scroll')?.scrollBy({ left: 320, behavior: 'smooth' }); }} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border items-center justify-center shadow-card opacity-0 group-hover:opacity-100 transition-opacity">›</button>
          </div>
        </div>

        {filteredNews.length === 0 && (
          <Card className="premium-card p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma notícia encontrada com os filtros aplicados.
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Noticias;
