"use client";

import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TenantBadge } from "@/components/layout/TenantBadge";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";

interface TopNavProps {
  role: string;
  userName?: string;
  tenantName?: string;
  tenantPlan?: string;
}

export function TopNav({ role, userName, tenantName, tenantPlan }: TopNavProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
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
        <div className="flex items-center gap-2">
          <Avatar name={userName || "User"} />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{userName || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
