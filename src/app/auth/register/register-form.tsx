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
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-rose-100 bg-white/90 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-base font-semibold text-slate-800">
            Criar conta na Arte com Carinho
          </CardTitle>
          <p className="mt-1 text-center text-[11px] text-slate-500">
            Preencha seus dados para acompanhar seus pedidos e personalizar
            suas peças.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Nome completo
              </label>
              <Input
                className="h-9 text-xs"
                placeholder="Ex.: Ana Souza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                E-mail
              </label>
              <Input
                type="email"
                className="h-9 text-xs"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Senha
              </label>
              <Input
                type="password"
                className="h-9 text-xs"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-600">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="mt-2 h-9 w-full bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="mt-3 border-t pt-3 text-center text-[11px] text-slate-600">
            <p>Já tem conta?</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50"
              onClick={() => router.push("/auth/login")}
              disabled={isSubmitting}
            >
              Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
