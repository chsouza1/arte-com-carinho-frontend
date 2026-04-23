"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
   
    const consent = localStorage.getItem("lgpd_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
  
    localStorage.setItem("lgpd_cookie_consent", "true");
    setIsVisible(false);
  };


  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none">
      <div className="mx-auto max-w-5xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 pointer-events-auto transition-all animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        <div className="hidden sm:flex bg-rose-50 p-3 rounded-full border border-rose-100 flex-shrink-0">
          <Cookie className="w-8 h-8 text-rose-400" />
        </div>


        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-neutral-800 mb-1 flex items-center justify-center sm:justify-start gap-2">
            <Cookie className="w-4 h-4 text-rose-400 sm:hidden" />
            Valorizamos a sua privacidade
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Utilizamos cookies para melhorar a sua experiência na nossa loja, personalizar conteúdos e entender como interage com o nosso site. Ao clicar em "Aceitar", concorda com o uso de cookies de acordo com a nossa Política de Privacidade e a LGPD.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-5 text-sm font-bold rounded-xl shadow-md shadow-rose-500/20 hover:scale-105 transition-all"
          >
            Aceitar e Continuar
          </Button>
        </div>

      </div>
    </div>
  );
}