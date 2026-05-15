"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function SocialCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Lendo token...");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("Erro no login social:", error);
      router.push("/auth/login?error=" + error);
      return;
    }

    if (token) {
      setStatus("Autenticando...");
      
      window.history.replaceState(null, '', window.location.pathname);

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
       const searchParams = new URLSearchParams(window.location.search);
       if (searchParams.has("error")) {
          router.push("/auth/login?error=" + searchParams.get("error"));
       } else if (!window.location.hash) {
          router.push("/auth/login");
       }
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAF7F5] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#E53935]" />
      <p className="text-[#5D4037] font-bold animate-pulse">{status}</p>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#FAF7F5] text-[#5D4037] font-bold">Carregando...</div>}>
      <SocialCallback />
    </Suspense>
  );
}