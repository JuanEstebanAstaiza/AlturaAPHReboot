"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, getCurrentTenant } from "@/lib/auth/store";
import { isSuperuser } from "@/lib/auth/jwt";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      if (isSuperuser(token)) {
        router.push("/superuser");
      } else {
        const tenant = getCurrentTenant();
        if (tenant) {
          router.push("/admin");
        } else {
          router.push("/login/tenant-select");
        }
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
