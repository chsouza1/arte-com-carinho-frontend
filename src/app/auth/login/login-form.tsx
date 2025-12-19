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
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? api.defaults.baseURL;

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

  // --- FUNÇÃO DE LOGIN SOCIAL ---
  const handleSocialLogin = (provider: "google" | "facebook") => {
    window.location.href = `${API_URL}/oauth2/authorization/${provider}`;
  };

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

          {/* --- LOGIN SOCIAL (Google / Facebook) --- */}
          <div className="space-y-4 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-bold">Ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("google")}
                className="w-full h-11 gap-2 rounded-xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600 font-bold"
                type="button"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

              <Button 
                variant="outline"
                onClick={() => handleSocialLogin("facebook")}
                className="w-full h-11 gap-2 rounded-xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600 font-bold"
                type="button"
              >
                <svg className="h-4 w-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.742-2.971 2.28v1.692h3.921l-.512 3.667h-3.409v7.98h-4.843Z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

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