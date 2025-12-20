"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, User, Lock, Phone } from "lucide-react";
import { useNotifications } from "@/components/ui/notifications";

// Schema de validação
const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email().readonly(),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  
  const { notify } = useNotifications(); 

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    api.get("/users/me")
      .then((res) => {
        const user = res.data;
        setUserId(user.id);
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("phone", user.phone || "");
      })
      .catch((err) => {
        console.error("Erro ao carregar perfil", err);
        notify("Não foi possível carregar seus dados.", "error");
      })
      .finally(() => setIsLoading(false));
  }, [setValue, notify]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;
    setIsSaving(true);

    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "CUSTOMER",
      };

      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      await api.put(`/users/${userId}`, payload);
      
      notify("Perfil atualizado com sucesso!", "success");
      
      setValue("password", "");
      setValue("confirmPassword", "");
      
    } catch (error) {
      console.error(error);
      notify("Erro ao atualizar perfil. Verifique os dados e tente novamente.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    setValue("phone", value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-800">Meus Dados</h1>
        <p className="text-slate-500">Gerencie suas informações pessoais e de acesso.</p>
      </div>

      <Card className="border-rose-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-rose-500" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>Atualize seu nome e telefone de contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email (Leitura) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Não pode ser alterado)</Label>
              <Input id="email" {...register("email")} disabled className="bg-slate-50 text-slate-500" />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp / Celular</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="phone" 
                  {...register("phone")} 
                  onChange={(e) => {
                    register("phone").onChange(e);
                    handlePhoneChange(e);
                  }}
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`} 
                  placeholder="11999999999"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="my-6 border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Lock className="h-4 w-4 text-rose-500" />
                    Alterar Senha
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="Deixe em branco para manter"
                            {...register("password")} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input 
                            id="confirmPassword" 
                            type="password" 
                            placeholder="Repita a nova senha"
                            {...register("confirmPassword")} 
                            className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full md:w-auto font-bold" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}