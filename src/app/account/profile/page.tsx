"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User, Lock, Phone, Mail, Sparkles, Scissors } from "lucide-react";
import { useNotifications } from "@/components/ui/notifications"; // Supondo que você tenha esse hook ou similar

// Schema de validação (Mantido igual)
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
  
  // Ajuste conforme seu sistema de notificação
  const { notify } = useNotifications ? useNotifications() : { notify: (msg: string, type: string) => alert(msg) }; 

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
        role: "CUSTOMER", // Garante que o usuário não muda a role
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
      notify("Erro ao atualizar perfil.", "error");
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
      <div className="flex flex-col justify-center items-center h-64 text-[#D7CCC8]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Buscando sua ficha...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Cabeçalho da Página */}
      <div className="flex items-center gap-4 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
            <User className="h-6 w-6 text-[#E53935]" />
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Meus Dados</h1>
            <p className="text-[#8D6E63] italic">Mantenha suas informações sempre atualizadas para facilitar a entrega.</p>
        </div>
      </div>

      {/* Cartão do Formulário - Estilo Papel de Carta */}
      <div className="bg-white border border-[#D7CCC8] shadow-sm rounded-sm relative overflow-hidden">
        {/* Detalhe decorativo no topo */}
        <div className="h-1 bg-[#E53935] w-full opacity-80"></div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-5">
                <h3 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2 border-b border-[#EFEBE9] pb-2">
                    <Sparkles size={14} className="text-[#E53935]" /> Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-[#8D6E63] uppercase">Nome Completo</Label>
                        <Input 
                            id="name" 
                            {...register("name")} 
                            className={`bg-[#FAF7F5] border-[#D7CCC8] focus:border-[#E53935] text-[#5D4037] h-11 rounded-sm ${errors.name ? "border-[#E53935]" : ""}`} 
                        />
                        {errors.name && <p className="text-xs text-[#E53935] font-bold">{errors.name.message}</p>}
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold text-[#8D6E63] uppercase">WhatsApp / Celular</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                            <Input 
                            id="phone" 
                            {...register("phone")} 
                            onChange={(e) => {
                                register("phone").onChange(e);
                                handlePhoneChange(e);
                            }}
                            className={`pl-10 bg-[#FAF7F5] border-[#D7CCC8] focus:border-[#E53935] text-[#5D4037] h-11 rounded-sm ${errors.phone ? "border-[#E53935]" : ""}`} 
                            placeholder="(XX) 99999-9999"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-[#E53935] font-bold">{errors.phone.message}</p>}
                    </div>

                    {/* Email (Leitura) */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="text-xs font-bold text-[#8D6E63] uppercase">E-mail de Acesso</Label>
                        <div className="relative opacity-70">
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                            <Input 
                                id="email" 
                                {...register("email")} 
                                disabled 
                                className="pl-10 bg-[#EFEBE9] border-[#D7CCC8] text-[#8D6E63] h-11 rounded-sm cursor-not-allowed font-mono text-sm" 
                            />
                        </div>
                        <p className="text-[10px] text-[#A1887F] italic">* O e-mail não pode ser alterado por segurança.</p>
                    </div>
                </div>
            </div>

            {/* Seção 2: Segurança */}
            <div className="pt-2 space-y-5">
                <h3 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2 border-b border-[#EFEBE9] pb-2">
                    <Lock size={14} className="text-[#E53935]" /> Segurança
                </h3>
                
                <div className="bg-[#FAF7F5] p-5 rounded-sm border border-dashed border-[#D7CCC8]">
                    <p className="text-xs text-[#8D6E63] mb-4 font-medium">
                        Preencha apenas se desejar alterar sua senha atual.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold text-[#8D6E63] uppercase">Nova Senha</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••"
                                {...register("password")} 
                                className="bg-white border-[#D7CCC8] focus:border-[#E53935] text-[#5D4037] rounded-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#8D6E63] uppercase">Confirmar Nova Senha</Label>
                            <Input 
                                id="confirmPassword" 
                                type="password" 
                                placeholder="••••••••"
                                {...register("confirmPassword")} 
                                className={`bg-white border-[#D7CCC8] focus:border-[#E53935] text-[#5D4037] rounded-sm ${errors.confirmPassword ? "border-[#E53935]" : ""}`}
                            />
                            {errors.confirmPassword && <p className="text-xs text-[#E53935] font-bold">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-end border-t border-dashed border-[#D7CCC8]">
              <Button 
                type="submit" 
                className="bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest px-8 py-6 rounded-sm shadow-md transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0" 
                disabled={isSaving}
              >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Costurando dados...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}