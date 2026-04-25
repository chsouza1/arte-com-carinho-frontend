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
import { Loader2, User, Phone, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  phone: z.string().min(10, "Informe um telefone válido (apenas números)"), 
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;


const getPasswordStrength = (pass: string) => {
  if (!pass) return { label: "", color: "bg-[#EFEBE9]", w: "w-0", textColor: "text-transparent" };
  
  let score = 0;
  if (pass.length >= 8) score += 1; 
  if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1; 
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  if (pass.length >= 10) score += 1;

  if (score <= 1) return { label: "Fraca", color: "bg-[#E53935]", w: "w-1/3", textColor: "text-[#E53935]" };
  if (score === 2) return { label: "Média", color: "bg-yellow-500", w: "w-2/3", textColor: "text-yellow-600" };
  return { label: "Forte", color: "bg-green-500", w: "w-full", textColor: "text-green-600" };
};

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

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
        setError("Ocorreu um erro ao criar a conta. Tente novamente.");
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
    <div className="w-full max-w-md bg-white border border-[#D7CCC8] shadow-xl rounded-sm relative overflow-hidden">
        
        <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>

        <div className="p-8">
            <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF7F5] border border-[#EFEBE9]">
                    <Sparkles className="h-6 w-6 text-[#E53935]" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#5D4037]">
                    Bem-vindo(a)!
                </h1>
                <p className="text-sm text-[#8D6E63] mt-2">
                    Crie sua conta para encomendar peças exclusivas e acompanhar seus pedidos.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Nome Completo</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="name"
                            placeholder="Seu nome"
                            {...register("name")}
                            className={`pl-10 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-11 ${errors.name ? "border-[#E53935]" : ""}`}
                        />
                    </div>
                    {errors.name && <p className="text-[10px] text-[#E53935] font-bold">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">E-mail</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            {...register("email")}
                            className={`pl-10 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-11 ${errors.email ? "border-[#E53935]" : ""}`}
                        />
                    </div>
                    {errors.email && <p className="text-[10px] text-[#E53935] font-bold">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">WhatsApp / Celular</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="11999999999 (Apenas números)"
                            {...register("phone")}
                            onChange={(e) => {
                                register("phone").onChange(e);
                                handlePhoneChange(e);
                            }}
                            className={`pl-10 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-11 ${errors.phone ? "border-[#E53935]" : ""}`}
                        />
                    </div>
                    {errors.phone && <p className="text-[10px] text-[#E53935] font-bold">{errors.phone.message}</p>}
                </div>

                {/* SENHA */}
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Senha</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            {...register("password")}
                            className={`pl-10 pr-10 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-11 ${errors.password ? "border-[#E53935]" : ""}`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-[#A1887F] hover:text-[#5D4037] focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    
                    {/* Barra de Força da Senha */}
                    {passwordValue.length > 0 && (
                        <div className="flex items-center gap-3 mt-2 animate-in fade-in">
                            <div className="h-1.5 w-full bg-[#EFEBE9] rounded-full overflow-hidden">
                                <div className={`h-full ${strength.w} ${strength.color} transition-all duration-300`}></div>
                            </div>
                            <span className={`text-[10px] font-bold w-10 text-right ${strength.textColor}`}>{strength.label}</span>
                        </div>
                    )}
                    
                    {errors.password && <p className="text-[10px] text-[#E53935] font-bold">{errors.password.message}</p>}
                </div>

                {/* CONFIRMAR SENHA */}
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Confirmar Senha</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repita a sua senha"
                            {...register("confirmPassword")}
                            className={`pl-10 pr-10 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-11 ${errors.confirmPassword ? "border-[#E53935]" : ""}`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3.5 text-[#A1887F] hover:text-[#5D4037] focus:outline-none"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[10px] text-[#E53935] font-bold">{errors.confirmPassword.message}</p>}
                </div>

                {error && (
                    <div className="rounded-sm bg-[#FFEBEE] p-3 text-xs font-bold text-[#C62828] border border-[#FFCDD2] flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest h-12 rounded-sm shadow-md transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Costurando cadastro...
                        </>
                    ) : (
                        "Criar minha conta"
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-dashed border-[#D7CCC8] text-center text-sm">
                <p className="text-[#8D6E63] mb-2">Já faz parte do nosso ateliê?</p>
                <Link href="/auth/login" className="font-bold text-[#5D4037] hover:text-[#E53935] uppercase text-xs tracking-widest border-b-2 border-[#E53935] pb-0.5 transition-colors">
                    Fazer Login
                </Link>
            </div>
        </div>
    </div>
  );
}