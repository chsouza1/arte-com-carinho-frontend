"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
import { saveAuthSession, AuthRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";

type LoginResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: AuthRole;
  active: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, password });
      const { token, name, email: userEmail, role } = res.data;

      // guarda tudo
      saveAuthSession({ token, name, email: userEmail, role });
      setAuthToken(token);

      // redireciona conforme role
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account/orders");
      }
    } catch (err: any) {
      setError("Não foi possível entrar. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md border-rose-100 bg-white/90 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold text-slate-800">
            Entrar na área do ateliê
          </CardTitle>
          <p className="text-center text-xs text-slate-500">
            Use seu e-mail e senha para gerenciar produtos e pedidos.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-rose-300" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-rose-300" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-rose-500 text-xs font-semibold hover:bg-rose-600"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
