// src/components/session-activity-watcher.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, touchSessionActivity, isAdmin, clearSession } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";

const TEN_MIN = 10 * 60 * 1000;
const DAY_24H = 24 * 60 * 60 * 1000;

export function SessionActivityWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleActivity() {
      touchSessionActivity();
    }

    const events: (keyof WindowEventMap)[] = [
      "click",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    const interval = setInterval(() => {
      const session = getSession();
      if (!session) return;

      const now = Date.now();
      const last = session.ultimaAtividade ?? now;
      const diff = now - last;

      const isUserAdmin = isAdmin(session);
      const limit = isUserAdmin ? DAY_24H : TEN_MIN;

      if (diff > limit) {
        // expira sessão por inatividade
        clearSession?.(); // se tiver essa função
        setAuthToken(null);
        // redireciona para login com flag de timeout
        if (pathname !== "/auth/login") {
          router.push("/auth/login?timeout=1");
        }
      }
    }, 30 * 1000); // checa a cada 30s

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(interval);
    };
  }, [router, pathname]);

  return null;
}
