import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center text-xs text-slate-500">
          Carregando página de cadastro...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
