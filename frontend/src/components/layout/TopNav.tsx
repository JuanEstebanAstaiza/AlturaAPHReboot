"use client";

import { Search, Bell, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TenantBadge } from "@/components/layout/TenantBadge";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth/store";

interface TopNavProps {
  role: string;
  userName?: string;
  tenantName?: string;
  tenantPlan?: string;
  className?: string;
}

export function TopNav({ role, userName, tenantName, tenantPlan, className }: TopNavProps) {
  return (
    <header className={cn("h-16 border-b border-border bg-card flex items-center justify-between px-6", className)}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        {role !== "superuser" && role !== "resident" && (
          <TenantSwitcher />
        )}
        {role === "resident" && tenantName && (
          <TenantBadge name={tenantName} unit="Torre A-101" plan="professional" />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 h-9 pl-10 bg-muted/50 border-border"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
          <Bell className="h-4 w-4" />
          <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
            3
          </Badge>
        </Button>

        {/* User */}
        <UserMenu userName={userName} role={role} />
      </div>
    </header>
  );
}

function UserMenu({ userName, role }: { userName?: string; role: string }) {
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar name={userName || "User"} />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{userName || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium text-foreground">{userName || "User"}</p>
          <p className="text-muted-foreground capitalize">{role}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-alert">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
