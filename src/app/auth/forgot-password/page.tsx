"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (emailToRecover: string) => {
      setErrorMsg(null);
      // Pequeno delay artificial para UX (feedback de "processando")
      await new Promise(r => setTimeout(r, 500));
      await api.post("/auth/forgot-password", { email: emailToRecover });
    },
    onSuccess: () => {
      setIsSent(true);
    },
    onError: (error: any) => {
      setErrorMsg(error?.response?.data?.message || "Não encontramos este e-mail.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate(email);
  };

  return (
    // Fundo Creme
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 py-12 font-sans text-[#5D4037]">
      
      {/* Cartão Estilo Papelaria */}
      <div className="w-full max-w-md bg-white border border-[#D7CCC8] shadow-xl rounded-sm relative overflow-hidden">
        
        {/* Faixa Decorativa Superior */}
        <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>

        {/* Cabeçalho */}
        <div className="text-center pt-10 pb-6 px-8 border-b border-dashed border-[#D7CCC8]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF7F5] border border-[#EFEBE9] shadow-sm">
                <KeyRound className="h-7 w-7 text-[#E53935]" />
            </div>

            <h1 className="text-2xl font-serif font-bold text-[#5D4037]">
              Esqueceu a senha?
            </h1>
            
            {!isSent && (
              <p className="text-sm text-[#8D6E63] mt-2 leading-relaxed">
                Não se preocupe! Digite seu e-mail abaixo e enviaremos um link para você recuperar seu acesso.
              </p>
            )}
        </div>

        <div className="p-8">
          {isSent ? (
            // Estado: E-mail Enviado
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center justify-center text-center space-y-3 bg-[#E8F5E9] border border-[#C8E6C9] p-6 rounded-sm">
                <div className="bg-white p-2 rounded-full border border-[#C8E6C9]">
                    <CheckCircle2 size={32} className="text-[#2E7D32]" />
                </div>
                <div>
                    <h3 className="font-bold text-[#1B5E20] text-lg">Verifique seu e-mail</h3>
                    <p className="text-[#2E7D32] text-xs mt-1">
                        Enviamos um link de recuperação para <strong>{email}</strong>.
                    </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                 <p className="text-xs text-[#8D6E63] italic">
                    Não recebeu? Verifique sua caixa de spam.
                 </p>
                 <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-sm border border-[#D7CCC8] text-[#5D4037] hover:bg-[#FAF7F5] uppercase text-xs font-bold tracking-widest"
                    onClick={() => router.push("/auth/login")}
                >
                    Voltar para o Login
                </Button>
              </div>
            </div>
          ) : (
            // Estado: Formulário
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Seu E-mail Cadastrado
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-sm bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] placeholder:text-[#D7CCC8]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="rounded-sm bg-[#FFEBEE] border border-[#FFCDD2] p-3 flex items-start gap-2 text-[#C62828]">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-12 w-full rounded-sm bg-[#E53935] hover:bg-[#C62828] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                    </>
                ) : (
                    "Enviar Link de Recuperação"
                )}
              </Button>

              <div className="pt-4 border-t border-dashed border-[#D7CCC8] text-center">
                <button
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#8D6E63] hover:text-[#E53935] uppercase tracking-wide transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para o login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}