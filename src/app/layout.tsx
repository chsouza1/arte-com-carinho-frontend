import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/queryClient";
import { MainNav } from "@/components/ui/layout/main-nav";
import { SiteFooter } from "@/components/ui/layout/site-footer";
import { SessionActivityWatcher } from "@/components/ui/session-activity-watcher";
import { NotificationsProvider } from "@/components/ui/notifications";
import { OrderStatusWatcher } from "@/components/ui/order-status-watcher";
import { CookieConsent } from "@/components/ui/cookie-consent";

export const metadata: Metadata = {
  title: "Arte com Carinho | Moda e Conjuntos Infantis",
  description: "Ateliê de costura peças feita sob medida e com muito amor. Atendimento em Mandirituba e envios para todo o país.",
  keywords: ["roupa infantil", "ateliê de costura", "conjuntos infantis", "moda infantil", "Curitiba", "São José dos Pinhais", "Brasil", "FRG", "Fazenda Rio Grande", "artesanato", "Toalhas", "Maternidade", "Hoffmann", "Areia Branca Dos Assis", "Mandirituba", "Fashion Kids"],
  openGraph: {
    title: "Arte com Carinho",
    description: "Peças exclusivas e feitas sob medida.",
    type: "website",
    locale: "pt_BR",
  }
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#FBF7FF] text-gray-900">
        <ReactQueryProvider>
          <NotificationsProvider>
            <SessionActivityWatcher />
            <OrderStatusWatcher />
            <div className="flex min-h-screen flex-col">
              <MainNav />
              <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
                  {children}
                  <CookieConsent />
                </div>
              </main>
              <SiteFooter />
            </div>
          </NotificationsProvider>
        </ReactQueryProvider>
      </body>
      <script src="https://sdk.mercadopago.com/js/v2"></script>
    </html>
  );
}
