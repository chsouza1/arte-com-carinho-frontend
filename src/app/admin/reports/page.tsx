import { Suspense } from "react";
import { AdminReportsPageClient } from "./reports-client";

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs text-slate-500">
          Carregando relatórios...
        </div>
      }
    >
      <AdminReportsPageClient />
    </Suspense>
  );
}
