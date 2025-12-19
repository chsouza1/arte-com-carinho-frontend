"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Phone } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  phone: z.string().min(10, "Informe um telefone válido (Ex: 11999999999)"), 
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// --- ATENÇÃO AQUI: export default function ---
export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "CUSTOMER",
      });
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Este e-mail já está cadastrado.");
      } else {
        setError("Ocorreu um erro ao criar a conta.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    setValue("phone", value);
  };

  return (
    <Card className="w-full max-w-md border-2 border-rose-100 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <UserPlus className="h-6 w-6 text-rose-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Crie sua conta
          </CardTitle>
          <p className="text-sm text-slate-500">
            Preencha os dados abaixo para começar a comprar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp / Celular</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 11999999999 (Apenas números)"
                  {...register("phone")}
                  onChange={(e) => {
                      register("phone").onChange(e);
                      handlePhoneChange(e);
                  }}
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 font-bold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold text-rose-600 hover:underline">
              Fazer Login
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}