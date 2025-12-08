"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
import type { AuthSession } from "@/lib/auth";
import { saveAuthSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";

function LoginPageInner() {
  "use client";

  type AuthResponse = {
    token: string;
    userId: number;
    name: string;
    email: string;
    role: string;
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fromCheckout = searchParams.get("from") === "checkout";
  const timeout = searchParams.get("timeout") === "1";

  const loginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const session: AuthSession = {
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setAuthToken(session.token);
      saveAuthSession(session);

      if (fromCheckout) {
        router.push("/account/orders");
      } else {
        if (session.role?.toUpperCase().includes("ADMIN")) {
          router.push("/admin");
        } else {
          router.push("/account/orders");
        }
      }
    },
    onError: (error: any) => {
      console.error("Erro ao fazer login:", error?.response?.data || error);
      setErrorMsg("E-mail ou senha inválidos. Tente novamente.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Preencha e-mail e senha para continuar.");
      return;
    }
    loginMutation.mutate();
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-sm border-rose-50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-base text-slate-800">
            Entrar na sua conta
          </CardTitle>
          {fromCheckout && (
            <p className="mt-1 text-center text-[11px] text-slate-500">
              Faça login para acompanhar seus pedidos e agilizar próximas
              compras.
            </p>
          )}
          {timeout && (
            <p className="mt-1 text-center text-[11px] text-amber-600">
              Sua sessão expirou por inatividade. Faça login novamente.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[11px] font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="h-9 text-xs"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-600">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="mt-1 h-9 w-full bg-rose-600 text-[11px] font-semibold hover:bg-rose-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            <p>Ainda não tem cadastro?</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50"
              onClick={() => router.push("/auth/register")}
            >
              Criar conta para acompanhar pedidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center text-xs text-slate-500">
          Carregando página de login...
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}