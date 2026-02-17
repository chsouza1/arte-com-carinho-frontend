"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function SocialCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      console.error("Erro no login social:", error);
      router.push("/auth/login?error=" + error);
      return;
    }

    if (token) {
      // 1. Salva o token
      setAuthToken(token);

      api.get("/users/me")
        .then((res) => {
          const user = res.data;
          
          saveSession({
            token: token,
            name: user.name,
            email: user.email,
            role: user.role,
          });

          // 3. Atualiza a sessão e redireciona
          window.dispatchEvent(new Event("auth:updated"));
          
          if (user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/account/orders");
          }
        })
        .catch((err) => {
          console.error("Falha ao recuperar dados do usuário:", err);
          router.push("/auth/login?error=social_fetch_failed");
        });
    } else {
      // Se não tem token nem erro, manda pro login
       router.push("/auth/login");
    }
  }, [token, error, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-rose-50 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
      <p className="text-rose-700 font-bold animate-pulse">Autenticando...</p>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SocialCallback />
    </Suspense>
  );
}