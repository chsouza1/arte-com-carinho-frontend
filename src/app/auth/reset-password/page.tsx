"use client";

import { Suspense, useState } from "react"; // Adicionado Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// 1. Criamos um componente interno para a lógica do formulário
function ResetPasswordForm() {
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
      setErrorMsg(error?.response?.data?.message || "Erro ao redefinir senha.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    mutation.mutate();
  };

  if (!token) {
    return <div className="p-10 text-center text-rose-600 font-bold">Link inválido ou expirado.</div>;
  }

  return (
    <Card className="w-full max-w-md rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl">
      <CardHeader className="border-b-2 border-rose-100 pb-8 pt-10">
        <CardTitle className="text-center text-2xl font-black text-rose-600">Nova Senha</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-5">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center text-emerald-600 py-4 italic font-bold">
            <CheckCircle2 size={48} className="mb-2" />
            Senha alterada! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Lock size={14}/> Nova Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border-2 border-rose-200" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Lock size={14}/> Confirmar Senha</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl border-2 border-rose-200" required />
            </div>
            {errorMsg && <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border-2 border-rose-200">{errorMsg}</div>}
            <Button type="submit" disabled={mutation.isPending} className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-white shadow-lg">
              {mutation.isPending ? "Salvando..." : "Redefinir Senha"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-rose-500" size={32} />
          <p className="text-rose-500 font-bold">Carregando...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}