"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, User, Mail, Lock, Sparkles, AlertCircle, Heart } from "lucide-react";

type RegisterResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

type ApiError = {
  error?: string;
  message?: string;
  status?: number;
  validationErrors?: Record<string, string>;
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const fromCheckout = searchParams.get("from") === "checkout";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);

      // Validação básica no front
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error("Preencha nome, e-mail e senha.");
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      const res = await api.post<RegisterResponse>("/auth/register", {
        name,
        email,
        password,
        role: "CUSTOMER",
      });

      return res.data;
    },
    onSuccess: (data) => {
      const session = {
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setAuthToken(session.token);
      saveSession(session);

      // Ordem de prioridade do redirecionamento:
      if (redirectParam) {
        router.push(redirectParam);
      } else if (fromCheckout) {
        router.push("/account/orders");
      } else if (session.role?.toUpperCase().includes("ADMIN")) {
        router.push("/admin");
      } else {
        router.push("/account/orders");
      }
    },
    onError: (error: any) => {
      console.error("Erro ao registrar:", error?.response?.data || error);

      const apiError: ApiError | undefined = error?.response?.data;

      if (apiError?.validationErrors) {
        const msgs = Object.values(apiError.validationErrors);
        if (msgs.length > 0) {
          setErrorMsg(msgs.join(" "));
          return;
        }
      }

      if (apiError?.message) {
        setErrorMsg(apiError.message);
        return;
      }

      if (error instanceof Error) {
        setErrorMsg(error.message);
        return;
      }

      setErrorMsg(
        "Não foi possível criar a conta. Verifique os dados e tente novamente."
      );
    },
  });

  const isSubmitting = registerMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="relative bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 pb-8 pt-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <UserPlus className="h-8 w-8 text-rose-600" />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/30">
              <Heart size={14} className="animate-pulse" />
              Bem-vindo ao Arte com Carinho By Simone
            </span>

            <CardTitle className="text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Criar conta na Arte com Carinho
            </CardTitle>

            <p className="text-center text-xs font-semibold text-slate-600 max-w-sm">
              Preencha seus dados para acompanhar seus pedidos e personalizar suas peças.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-rose-500" />
                Nome completo
              </label>
              <Input
                className="h-12 rounded-xl border-2 border-rose-200 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                placeholder="Ex.: Annelise Hoffmann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-rose-500" />
                E-mail
              </label>
              <Input
                type="email"
                className="h-12 rounded-xl border-2 border-rose-200 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-500" />
                Senha
              </label>
              <Input
                type="password"
                className="h-12 rounded-xl border-2 border-rose-200 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 font-medium">
                💡 Use pelo menos 6 caracteres para sua segurança
              </p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="pt-4 border-t-2 border-rose-100 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-600">
              Já tem conta?
            </p>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-2 border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
              onClick={() => router.push("/auth/login")}
              disabled={isSubmitting}
            >
              Fazer login
            </Button>
          </div>

          <div className="pt-3 text-center">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              🔒 Seus dados estão seguros e protegidos conosco
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}