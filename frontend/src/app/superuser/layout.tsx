"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth/store";
import { isSuperuser } from "@/lib/auth/jwt";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function SuperuserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    if (!isSuperuser(token)) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="superuser" />
      <div className="lg:pl-64">
        <TopNav role="superuser" userName="Superuser" />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
