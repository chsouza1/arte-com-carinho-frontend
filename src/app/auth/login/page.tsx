import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center text-xs text-slate-500">
          Carregando página de login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
