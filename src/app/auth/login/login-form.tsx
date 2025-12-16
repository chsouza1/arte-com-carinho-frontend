"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
import type { AuthSession } from "@/lib/auth";
import { saveSession } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Lock, Sparkles, AlertCircle, Clock } from "lucide-react";

type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromCheckout = searchParams.get("from") === "checkout";
  const timeout = searchParams.get("timeout") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      saveSession(session);

      if (fromCheckout) {
        router.push("/account/orders");
      } else if (session.role?.toUpperCase().includes("ADMIN")) {
        router.push("/admin");
      } else {
        router.push("/account/orders");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="relative bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 pb-8 pt-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <LogIn className="h-8 w-8 text-rose-600" />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/30">
              <Sparkles size={14} className="animate-pulse" />
              Área do cliente
            </span>

            <CardTitle className="text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
              Entrar na sua conta
            </CardTitle>

            {fromCheckout && (
              <div className="rounded-xl bg-blue-50 border-2 border-blue-200 px-4 py-2.5 text-center max-w-sm">
                <p className="text-xs font-semibold text-blue-700">
                  Faça login para acompanhar seus pedidos e agilizar próximas compras.
                </p>
              </div>
            )}
            
            {timeout && (
              <div className="rounded-xl bg-amber-50 border-2 border-amber-200 px-4 py-2.5 flex items-center gap-2 max-w-sm">
                <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-700">
                  Sua sessão expirou por inatividade. Faça login novamente.
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-rose-500" />
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="h-12 rounded-xl border-2 border-rose-200 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-500" />
                Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="h-12 rounded-xl border-2 border-rose-200 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                required
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="pt-4 border-t-2 border-rose-100 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-600">
              Ainda não tem cadastro?
            </p>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-2 border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
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