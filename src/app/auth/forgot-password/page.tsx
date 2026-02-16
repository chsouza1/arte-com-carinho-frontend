"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      setErrorMsg(null);
      await api.post("/auth/forgot-password", { email });
    },
    onSuccess: () => {
      setIsSent(true);
    },
    onError: (error: any) => {
      setErrorMsg(error?.response?.data?.message || "Erro ao solicitar recuperação. Verifique o e-mail.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="relative bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 pb-8 pt-10">
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <CardTitle className="text-center text-2xl font-black text-rose-600">
              Recuperar Senha
            </CardTitle>
            <p className="text-center text-xs font-medium text-slate-500 px-6">
              {isSent 
                ? "Se este e-mail estiver cadastrado, você receberá um link em instantes." 
                : "Digite seu e-mail e enviaremos um link para você criar uma nova senha."}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-5">
          {isSent ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-emerald-600 space-y-2 py-4">
                <CheckCircle2 size={48} />
                <p className="font-bold">E-mail enviado!</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-2 border-rose-200 text-rose-600"
                onClick={() => router.push("/auth/login")}
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-rose-500" /> E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-2 border-rose-200 focus:border-rose-400"
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
                className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
              >
                {mutation.isPending ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>

              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
              >
                <ArrowLeft size={14} /> Voltar para o login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}