"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFeatures } from "@/hooks/useFeatures";
import {
  Home,
  DollarSign,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Shield,
  Settings,
  Building2,
  BarChart3,
  ClipboardList,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FolderTree,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

interface SidebarProps {
  role: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const sidebarItems: Record<string, { label: string; href: string; icon: React.ReactNode; feature?: string }[]> = {
  superuser: [
    { label: "Dashboard", href: "/superuser", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Tenants", href: "/superuser/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Planes", href: "/superuser/plans", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Administradores", href: "/superuser/admins", icon: <Users className="h-5 w-5" /> },
    { label: "Audit Logs", href: "/superuser/audit", icon: <ClipboardList className="h-5 w-5" /> },
    { label: "Analytics", href: "/superuser/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Revenue", href: "/superuser/analytics/revenue", icon: <TrendingUp className="h-5 w-5" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { label: "PQRS", href: "/dashboard/pqrs", icon: <MessageSquare className="h-5 w-5" />, feature: "pqrs" },
    { label: "Documents", href: "/dashboard/documents", icon: <FileText className="h-5 w-5" />, feature: "documents" },
    { label: "Residents", href: "/dashboard/residents", icon: <Users className="h-5 w-5" /> },
    { label: "Units", href: "/dashboard/units", icon: <Building2 className="h-5 w-5" /> },
    { label: "Reservations", href: "/dashboard/reservations", icon: <Calendar className="h-5 w-5" />, feature: "reservations" },
    { label: "Config", href: "/dashboard/config", icon: <Settings className="h-5 w-5" /> },
  ],
  resident: [
    { label: "Portal", href: "/resident", icon: <Home className="h-5 w-5" /> },
    { label: "PQRS", href: "/resident/pqrs", icon: <MessageSquare className="h-5 w-5" />, feature: "pqrs" },
    { label: "Documents", href: "/resident/documents", icon: <FileText className="h-5 w-5" />, feature: "documents" },
    { label: "Reservations", href: "/resident/reservas", icon: <Calendar className="h-5 w-5" />, feature: "reservations" },
  ],
  vigilancia: [
    { label: "Access Control", href: "/vigilancia", icon: <Shield className="h-5 w-5" />, feature: "access" },
    { label: "Documents", href: "/vigilancia/documents", icon: <FileText className="h-5 w-5" />, feature: "documents" },
  ],
  comite: [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { label: "PQRS", href: "/dashboard/pqrs", icon: <MessageSquare className="h-5 w-5" />, feature: "pqrs" },
    { label: "Documents", href: "/dashboard/documents", icon: <FileText className="h-5 w-5" />, feature: "documents" },
    { label: "Assemblies", href: "/dashboard/assemblies", icon: <ClipboardList className="h-5 w-5" />, feature: "assemblies" },
    { label: "Convivencia", href: "/dashboard/convivencia", icon: <Users className="h-5 w-5" />, feature: "convivencia" },
  ],
};

export function Sidebar({ role, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const features = useFeatures();
  const items = sidebarItems[role] || [];

  return (
    <div className={cn(
      "flex flex-col border-r border-border bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Altura PH</span>
          </div>
        )}
        {collapsed && <Building2 className="h-6 w-6 text-primary" />}
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const feature = item.feature;
            if (feature && !features.check(feature)) return null;

            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return collapsed ? (
              <Tooltip key={item.href} content={item.label}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                </Link>
              </Tooltip>
            ) : (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <Separator className="mx-2" />
      <div className={cn("flex items-center border-t border-border py-3", collapsed ? "justify-center px-0" : "px-4")}>
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Altura PH v1.0</p>
            <p>MVP-1 Foundation</p>
          </div>
        )}
        {collapsed && (
          <Tooltip content="Altura PH v1.0">
            <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-xs text-primary">A</span>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
