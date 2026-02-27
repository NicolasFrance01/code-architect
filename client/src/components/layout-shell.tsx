import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  HardHat,
  Clock,
  Wrench,
  LogOut,
  User,
  Package,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AiAssistant } from "./ai-assistant";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Projects", icon: HardHat, href: "/projects" },
    { label: "Timesheets", icon: Clock, href: "/timesheets" },
    { label: "Inventory", icon: Package, href: "/inventory" },
    { label: "Equipment", icon: Truck, href: "/equipment" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-border/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Botello</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link href={item.href} className="flex items-center gap-3 font-medium">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border/10">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            {/* 
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
            */}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-border/50 flex items-center px-4 md:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-4 font-display font-bold text-lg text-muted-foreground uppercase tracking-widest">
              Construction Management System
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>

        <AiAssistant />
      </div>
    </SidebarProvider>
  );
}
