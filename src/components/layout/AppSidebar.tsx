import { LayoutDashboard, TrendingUp, Wallet, Target, Settings, Menu, FileSpreadsheet, PieChart, LineChart, Newspaper } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Investimentos", url: "/investimentos", icon: TrendingUp },
  { title: "Transações", url: "/transacoes", icon: Wallet },
  { title: "Planilhas", url: "/planilhas", icon: FileSpreadsheet },
  { title: "Divisão Capital", url: "/divisao-capital", icon: PieChart },
  { title: "Mercado", url: "/mercado", icon: LineChart },
  { title: "Notícias", url: "/noticias", icon: Newspaper },
  { title: "Metas", url: "/metas", icon: Target },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {open && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-lg gradient-text">FinanceHub</span>
              <span className="text-xs text-muted-foreground">Portal Financeiro</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
              <NavLink
                to="/configuracoes"
                className="hover:bg-sidebar-accent/50"
              >
                <Settings className="w-5 h-5" />
                {open && <span>Configurações</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
