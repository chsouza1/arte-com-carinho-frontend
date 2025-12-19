import { Suspense } from "react";
import RegisterForm from "./register-form"; 

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-4">
      <Suspense fallback={<div>Carregando formulário...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}