"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // se não usar, pode apagar

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const res = await api.post<RegisterResponse>("/auth/register", {
        name,
        email,
        password,
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

      router.push("/account/orders");
    },
    onError: (error: any) => {
      console.error("Erro ao registrar:", error?.response?.data || error);
      setErrorMsg("Não foi possível criar a conta. Verifique os dados.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Preencha todos os campos para continuar.");
      return;
    }
    registerMutation.mutate();
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-sm border-rose-50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-base text-slate-800">
            Criar sua conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-[11px] font-medium">
                Nome
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-9 text-xs"
                required
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            <p>Já tem conta?</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50"
              onClick={() => router.push("/auth/login")}
            >
              Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
