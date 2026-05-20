"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, getCurrentTenant } from "@/lib/auth/store";
import { isSuperuser, parseJWT } from "@/lib/auth/jwt";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    if (isSuperuser(token)) {
      router.push("/superuser");
      return;
    }
    const payload = parseJWT(token);
    setRole(payload.role);
    const tenant = getCurrentTenant();
    if (!tenant) {
      router.push("/login/tenant-select");
      return;
    }
    setTenantName(tenant.name || "");
  }, [router]);

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role={role} userName="Admin" tenantName={tenantName} className="sticky top-0 z-10" />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
