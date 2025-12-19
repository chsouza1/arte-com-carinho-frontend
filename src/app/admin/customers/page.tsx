"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Shield, 
  User as UserIcon,
  MessageCircle,
  ShoppingBag
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER" | "USER";
  active: boolean;
  createdAt?: string;
};

// Mapeamento de Tradução
const ROLE_MAP = {
  ADMIN: "Administrador",
  CUSTOMER: "Cliente",
  USER: "Usuário"
};

async function fetchUsers(): Promise<User[]> {
  try {
    const res = await api.get("/users", {
      params: { size: 100, sort: "id,desc" }
    });
    return res.data.content ?? res.data ?? [];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchUsers,
  });

  const filteredUsers = useMemo(() => {
    const list = users ?? [];
    if (!search) return list;
    
    const lowerSearch = search.toLowerCase();
    return list.filter((u) => 
      u.name.toLowerCase().includes(lowerSearch) || 
      u.email.toLowerCase().includes(lowerSearch) ||
      (u.phone && u.phone.includes(lowerSearch))
    );
  }, [users, search]);

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return null;
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${fullPhone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Cabeçalho */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <Users size={24} className="text-rose-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Base de Usuários
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Gerencie os administradores, clientes e usuários do sistema.
            </p>
          </div>
        </section>

        {/* Barra de Busca */}
        <section className="rounded-[2rem] bg-white/80 backdrop-blur-sm p-6 shadow-lg border-2 border-rose-200">
          <Label htmlFor="search" className="text-xs font-bold text-slate-700 mb-2 block">
             Buscar Usuário
          </Label>
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-rose-400" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, email ou telefone..."
              className="h-12 pl-12 rounded-2xl border-2 border-rose-200 text-sm font-medium focus:border-rose-400 transition-colors"
            />
          </div>
        </section>

        {/* Lista de Clientes (Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-3xl bg-rose-100/50" />
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full rounded-[2rem] bg-white/50 p-16 text-center border-2 border-dashed border-rose-200">
              <Users className="mx-auto h-12 w-12 text-rose-300 mb-4" />
              <p className="text-slate-600 font-bold">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className="group relative overflow-hidden rounded-3xl border-2 border-rose-100 bg-white/90 hover:border-rose-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-4">
                    {/* Badge Traduzida */}
                    <Badge variant="outline" className={
                        user.role === 'ADMIN' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : user.role === 'CUSTOMER'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                        {user.role === 'ADMIN' ? <Shield size={10} className="mr-1"/> : 
                         user.role === 'CUSTOMER' ? <ShoppingBag size={10} className="mr-1"/> :
                         <UserIcon size={10} className="mr-1"/>}
                        {ROLE_MAP[user.role] || user.role}
                    </Badge>
                </div>

                <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-20 w-20 border-4 border-rose-50 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-rose-200 to-pink-200 text-rose-600 font-black text-xl">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                                {user.name}
                            </h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 py-1.5 px-3 rounded-full">
                                    <Mail size={12} />
                                    <span className="truncate max-w-[200px]">{user.email}</span>
                                </div>
                                {user.phone ? (
                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 py-1.5 px-3 rounded-full">
                                        <Phone size={12} />
                                        <span>{user.phone}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Sem telefone</span>
                                )}
                            </div>
                        </div>

                        <div className="w-full pt-4 border-t border-rose-50 mt-2">
                            {user.phone ? (
                                <Button 
                                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-emerald-200 shadow-lg"
                                    onClick={() => window.open(getWhatsAppLink(user.phone) || '#', '_blank')}
                                >
                                    <MessageCircle size={16} className="mr-2" />
                                    WhatsApp
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="w-full rounded-xl border-slate-200 text-slate-400">
                                    Sem contato
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

      </div>
    </div>
  );
}