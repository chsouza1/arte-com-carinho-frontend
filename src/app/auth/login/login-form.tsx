"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import ReCAPTCHA from "react-google-recaptcha"; 
import { api, setAuthToken } from "@/lib/api";
import type { AuthSession } from "@/lib/auth";
import { saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Sparkles, AlertCircle, Clock, Heart, ArrowRight } from "lucide-react";

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

  // --- ESTADOS DO CAPTCHA ---
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
        captchaToken,
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
      
      recaptchaRef.current?.reset();
      setCaptchaToken(null);

      if (error?.response?.status === 401) {
        setErrorMsg("E-mail ou senha não conferem.");
      } else if (error?.response?.status === 400 && error?.response?.data?.message?.includes("Captcha")) {
        setErrorMsg("Por favor, verifique o Captcha novamente.");
      } else {
        setErrorMsg("Ocorreu um erro. Tente novamente mais tarde.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Preencha e-mail e senha para entrar.");
      return;
    }

    if (!captchaToken) {
      setErrorMsg("Por favor, confirme que você não é um robô.");
      return;
    }

    loginMutation.mutate();
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/social-callback`);
    window.location.href = `${API_URL}/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`;
  };

  return (
    // Fundo Creme
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 py-12 font-sans text-[#5D4037]">
      
      <div className="w-full max-w-md bg-white border border-[#D7CCC8] shadow-xl rounded-sm relative overflow-hidden">
        
        {/* Faixa Decorativa */}
        <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>

        {/* Cabeçalho */}
        <div className="text-center pt-10 pb-6 px-8 bg-[url('/paper-texture.png')] border-b border-dashed border-[#D7CCC8]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF7F5] border border-[#EFEBE9] shadow-sm">
                <Heart className="h-7 w-7 text-[#E53935] fill-current" />
            </div>

            <h1 className="text-2xl font-serif font-bold text-[#5D4037]">
              Bem-vindo(a) de volta!
            </h1>
            <p className="text-sm text-[#8D6E63] mt-2 italic">
              Acesse sua conta para ver seus pedidos com carinho.
            </p>

            {/* Alertas de Contexto */}
            {fromCheckout && (
              <div className="mt-4 rounded-sm bg-[#E3F2FD] border border-[#BBDEFB] p-3 text-center">
                <p className="text-xs font-bold text-[#1565C0]">
                  Faça login para finalizar sua compra com segurança.
                </p>
              </div>
            )}
            
            {timeout && (
              <div className="mt-4 rounded-sm bg-[#FFF8E1] border border-[#FFE0B2] p-3 flex items-center gap-2 justify-center">
                <Clock className="h-3 w-3 text-[#F57F17]" />
                <p className="text-xs font-bold text-[#F57F17]">
                  Sessão expirada. Entre novamente.
                </p>
              </div>
            )}
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11 rounded-sm bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935]"
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-11 rounded-sm bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935]"
                required
              />
              <div className="flex justify-end pt-1">
                <button 
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-[10px] font-bold text-[#E53935] hover:underline uppercase tracking-wide"
                >
                    Esqueci minha senha
                </button>
               </div>
            </div>

            {/* ReCAPTCHA Centralizado */}
            <div className="flex justify-center py-2 scale-90 origin-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>

            {/* Mensagem de Erro */}
            {errorMsg && (
              <div className="rounded-sm bg-[#FFEBEE] border border-[#FFCDD2] p-3 flex items-start gap-2 text-[#C62828]">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold">{errorMsg}</p>
              </div>
            )}

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="h-12 w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs rounded-sm shadow-md transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Acessar Conta"}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed border-[#D7CCC8]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white px-2 text-[#A1887F] font-bold">Ou entre com</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin("google")}
              className="w-full h-10 gap-2 rounded-sm border border-[#D7CCC8] hover:bg-[#FAF7F5] text-[#5D4037] font-bold text-xs uppercase"
              type="button"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="w-full h-10 gap-2 rounded-sm border border-[#D7CCC8] hover:bg-[#FAF7F5] text-[#5D4037] font-bold text-xs uppercase"
              type="button"
            >
              <svg className="h-3 w-3 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.742-2.971 2.28v1.692h3.921l-.512 3.667h-3.409v7.98h-4.843Z" /></svg>
              Facebook
            </Button>
          </div>

          {/* Rodapé: Criar Conta */}
          <div className="pt-4 border-t border-dashed border-[#D7CCC8] text-center space-y-3">
            <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
              Ainda não tem cadastro?
            </p>
            <Button
              variant="outline"
              className="w-full h-10 rounded-sm border-2 border-[#E53935] text-xs font-bold text-[#E53935] hover:bg-[#E53935] hover:text-white uppercase tracking-widest transition-all"
              onClick={() => router.push("/auth/register")}
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}