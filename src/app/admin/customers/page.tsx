"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, UserPlus, Search, Mail, Phone, ShieldAlert, 
  Loader2, Save, UserCheck, Smartphone 
} from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  role?: string;
};

type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

async function fetchCustomers(): Promise<Customer[]> {
  // Chamando o UserController (/api/users) que devolve a lista direta (List<UserDTO>) com as Roles
  const res = await api.get<Customer[]>("/users");
  return res.data;
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchCustomers,
  });

  // Como agora é uma lista direta, usamos data direto ou array vazio
  const customers = useMemo(() => data ?? [], [data]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const lower = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        (c.phone ?? "").includes(lower)
    );
  }, [customers, searchTerm]);

  const createCustomerMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };
      await api.post("/auth/register", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      setIsSheetOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error(error);
      if (error.response?.status === 409) {
        setErrorMsg("Este e-mail já está cadastrado no sistema.");
      } else {
        setErrorMsg("Erro ao cadastrar o cliente. Verifique as informações.");
      }
    },
  });

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    setErrorMsg(null);
  }

  function handleFormChange(field: keyof CustomerFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOpenSheet() {
    resetForm();
    setIsSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    createCustomerMutation.mutate();
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- BARRA SUPERIOR --- */}
      <div className="bg-white border border-[#D7CCC8] p-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FAF7F5] rounded-full border border-[#D7CCC8]">
            <Users size={20} className="text-[#5D4037]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#5D4037]">Lista de Clientes</h2>
            <p className="text-xs text-[#8D6E63]">Consulte ou adicione compradores ao sistema.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
            <Input 
              placeholder="Buscar por nome, e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#FAF7F5] border-[#D7CCC8] focus:border-[#E53935] rounded-sm text-sm w-full h-10"
            />
          </div>
          <Button 
            onClick={handleOpenSheet}
            className="w-full sm:w-auto bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs h-10 rounded-sm shadow-sm transition-all"
          >
            <UserPlus size={16} className="mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* --- TABELA DE CLIENTES --- */}
      <div className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 bg-[#EFEBE9] w-full rounded-sm" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center bg-[#FAF7F5]">
            <Users className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
            <p className="text-base font-serif text-[#5D4037]">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF7F5] border-b border-[#D7CCC8] text-xs uppercase tracking-wider text-[#8D6E63]">
                <tr>
                  <th className="px-6 py-4 font-bold">Nome</th>
                  <th className="px-6 py-4 font-bold">E-mail</th>
                  <th className="px-6 py-4 font-bold">Telefone</th>
                  <th className="px-6 py-4 font-bold text-center">Permissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE9]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FAF7F5] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#5D4037]">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-[#8D6E63] font-mono text-xs">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-[#5D4037] font-medium">
                      {customer.phone ? customer.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border uppercase ${customer.role === 'ADMIN' ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]' : 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]'}`}>
                        {customer.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- GAVETA DE CADASTRO (SHEET) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#FAF7F5] border-l-4 border-l-[#E53935] p-0 flex flex-col h-full">
          
          <div className="p-6 bg-white border-b border-[#D7CCC8] shadow-sm sticky top-0 z-10">
            <h2 className="text-lg font-serif font-bold text-[#5D4037] flex items-center gap-2">
              <UserPlus size={20} className="text-[#E53935]" />
              Cadastrar Novo Cliente
            </h2>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Nome Completo</Label>
                <Input 
                  value={form.name} 
                  onChange={e => handleFormChange("name", e.target.value)} 
                  className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">E-mail de Acesso</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={e => handleFormChange("email", e.target.value)} 
                    className="pl-10 bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">WhatsApp / Celular</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-[#A1887F]" />
                  <Input 
                    type="tel"
                    value={form.phone} 
                    onChange={e => handleFormChange("phone", e.target.value.replace(/\D/g, ""))} 
                    className="pl-10 bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                    placeholder="41999999999 (Apenas números)"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Senha Provisória</Label>
                <Input 
                  type="password"
                  value={form.password} 
                  onChange={e => handleFormChange("password", e.target.value)} 
                  className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div className="bg-[#E3F2FD] border border-[#BBDEFB] p-3 rounded-sm flex items-start gap-2 text-xs text-[#1565C0] font-medium leading-relaxed">
                <UserCheck size={16} className="shrink-0 mt-0.5" />
                <span>
                  Contas criadas por esta tela recebem a função de <strong>Cliente</strong> por segurança.
                </span>
              </div>

              {errorMsg && (
                <div className="text-xs text-[#C62828] bg-[#FFEBEE] p-3 rounded-sm border border-[#FFCDD2] flex items-start gap-2 font-bold shadow-sm">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}
            </form>
          </div>

          <div className="p-6 bg-white border-t border-[#D7CCC8] sticky bottom-0 z-10">
            <Button 
              type="submit" 
              form="customer-form"
              disabled={createCustomerMutation.isPending} 
              className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest rounded-sm shadow-md h-12 transition-all text-xs"
            >
              {createCustomerMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <><Save size={18} className="mr-2"/> Salvar Cliente</>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}