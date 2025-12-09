import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/queryClient";
import { MainNav } from "@/components/ui/layout/main-nav";
import { SiteFooter } from "@/components/ui/layout/site-footer";
import { SessionActivityWatcher } from "@/components/ui/session-activity-watcher";
import { NotificationsProvider } from "@/components/ui/notifications";
import { OrderStatusWatcher } from "@/components/ui/order-status-watcher";

export const metadata: Metadata = {
  title: "Arte com Carinho",
  description: "Adicionar a descricao depois...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-[#FFF7F2] to-[#FFE4DC] text-slate-800">
        <ReactQueryProvider>
          <NotificationsProvider>
            <SessionActivityWatcher />
            <OrderStatusWatcher />
            <div className="flex min-h-screen flex-col">
              <MainNav />
              <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
                  {children}
                </div>
              </main>
              <SiteFooter />
            </div>
          </NotificationsProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
