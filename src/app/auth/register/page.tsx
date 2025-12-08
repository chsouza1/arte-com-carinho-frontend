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

type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account/orders";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useMutation<AuthResponse>({
    mutationFn: async () => {
      const res = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
        role: "CUSTOMER",
      });
      return res.data;
    },
    onSuccess: (data) => {
      const session: AuthSession = {
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role as AuthSession["role"],
      };

      saveAuthSession(session);
      setAuthToken(session.token);

      router.push(redirectTo);
    },
    onError: (error: any) => {
      console.error("Erro ao registrar:", error?.response?.data || error);
      setErrorMsg(
        "Não foi possível criar sua conta. Verifique os dados informados."
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    registerMutation.mutate();
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm border-rose-100 bg-white/95 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-sm font-semibold text-slate-800">
            Criar conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Nome completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-500">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="mt-2 w-full bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full border-rose-200 text-[11px]"
              onClick={() => router.push("/auth/login")}
            >
              Já tenho conta — entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
