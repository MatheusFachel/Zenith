import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export const StatCard = ({ title, value, change, changeType, icon: Icon }: StatCardProps) => {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }[changeType];

  return (
    <Card className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
        <span className="text-xs text-muted-foreground">vs mês anterior</span>
      </div>
    </Card>
  );
};
