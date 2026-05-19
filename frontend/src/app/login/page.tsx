"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, getCurrentTenant, storeToken } from "@/lib/auth/store";
import { isSuperuser } from "@/lib/auth/jwt";
import { api, handleAuthResult } from "@/lib/api/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const tenant = getCurrentTenant();
      if (isSuperuser(token)) {
        router.push("/superuser");
      } else if (tenant) {
        router.push("/dashboard");
      } else {
        router.push("/login/tenant-select");
      }
    }
  }, [router]);

  const handleLogin = async (email: string, password: string): Promise<string> => {
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      storeToken(res.access_token);
      router.push(handleAuthResult(res.role));
      return res.role;
    } catch (e: any) {
      setError(e.message || "Login failed");
      throw e;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa con tu cuenta para acceder al panel</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onLogin={handleLogin} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
