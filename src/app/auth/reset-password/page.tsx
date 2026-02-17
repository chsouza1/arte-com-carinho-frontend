"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, CheckCircle2, Loader2, KeyRound, Scissors } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mutation para enviar a nova senha
  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      if (!token) throw new Error("Token de segurança inválido.");
      
      // Simulação de delay para UX
      await new Promise(resolve => setTimeout(resolve, 800));

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
      const msg = error?.response?.data?.message || "Não foi possível redefinir a senha.";
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
        return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    mutation.mutate();
  };

  // Estado de Token Inválido
  if (!token) {
    return (
      <div className="w-full max-w-md bg-white border-2 border-dashed border-[#D7CCC8] p-8 text-center rounded-sm">
         <div className="mx-auto w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mb-4 border border-[#FFCDD2]">
            <Scissors className="h-8 w-8 text-[#E53935]" />
         </div>
         <h2 className="text-xl font-serif font-bold text-[#5D4037] mb-2">Link Inválido</h2>
         <p className="text-[#8D6E63] text-sm mb-6">
            O link de recuperação parece estar quebrado ou expirou.
         </p>
         <Button 
            onClick={() => router.push("/auth/login")}
            className="bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs"
         >
            Voltar ao Login
         </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md relative">
      {/* Decoração de fundo (Papel) */}
      <div className="absolute top-2 left-2 w-full h-full border-2 border-[#D7CCC8] rounded-sm bg-[#EFEBE9] -z-10"></div>

      <div className="bg-white border border-[#D7CCC8] shadow-lg rounded-sm overflow-hidden">
        
        {/* Faixa decorativa superior */}
        <div className="h-1 bg-[#E53935] w-full"></div>

        {/* Cabeçalho */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-dashed border-[#D7CCC8]">
            <div className="mx-auto w-14 h-14 bg-[#FAF7F5] rounded-full flex items-center justify-center mb-4 border border-[#EFEBE9]">
                <KeyRound className="h-7 w-7 text-[#5D4037]" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#5D4037]">Nova Senha</h1>
            <p className="text-xs text-[#8D6E63] mt-2 font-medium">
                Crie uma senha segura para proteger sua conta.
            </p>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
            {isSuccess ? (
                // Estado de Sucesso
                <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-4 border border-[#C8E6C9]">
                        <CheckCircle2 size={32} className="text-[#2E7D32]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2E7D32] mb-1">Tudo Certo!</h3>
                    <p className="text-[#1B5E20] text-sm mb-2">Sua senha foi alterada com sucesso.</p>
                    <p className="text-[#8D6E63] text-xs italic">Redirecionando para o login...</p>
                </div>
            ) : (
                // Formulário
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1">
                                <Lock size={12} /> Nova Senha
                            </label>
                            <Input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                className="bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm" 
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1">
                                <Lock size={12} /> Confirmar Senha
                            </label>
                            <Input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="••••••••"
                                className="bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm" 
                                required 
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="flex items-start gap-2 bg-[#FFEBEE] border border-[#FFCDD2] p-3 rounded-sm text-[#C62828] text-xs font-bold">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            {errorMsg}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={mutation.isPending} 
                        className="w-full h-12 bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs rounded-sm shadow-md transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : "Redefinir Senha"}
                    </Button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    // Fundo Creme
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 py-12 font-sans text-[#5D4037]">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#D7CCC8]" size={40} />
          <p className="text-[#8D6E63] text-sm font-bold uppercase tracking-widest">Carregando...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}