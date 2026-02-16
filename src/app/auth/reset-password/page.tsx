"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      if (!token) throw new Error("Token ausente.");
      await api.post("/auth/reset-password", { 
        token, 
        newPassword: password 
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    },
    onError: (error: any) => {
      setErrorMsg(error?.response?.data?.message || "Erro ao redefinir senha. O link pode ter expirado.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    mutation.mutate();
  };

  if (!token) {
    return <div className="p-10 text-center text-rose-600 font-bold">Token de recuperação inválido.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardHeader className="border-b-2 border-rose-100 pb-8 pt-10">
          <CardTitle className="text-center text-2xl font-black text-rose-600">
            Nova Senha
          </CardTitle>
          <p className="text-center text-xs font-medium text-slate-500">
            Crie uma senha forte e segura para sua conta.
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-emerald-600 space-y-4 py-4">
              <CheckCircle2 size={48} />
              <p className="font-bold text-center">Senha alterada com sucesso!<br/>Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-rose-500" /> Nova Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-2 border-rose-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-rose-500" /> Confirmar Senha
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-2 border-rose-200"
                  required
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white shadow-lg"
              >
                {mutation.isPending ? "Salvando..." : "Redefinir Senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}