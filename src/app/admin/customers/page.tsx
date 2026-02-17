"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
             <Users className="h-6 w-6 text-[#5D4037]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Fichário de Clientes</h1>
            <p className="text-[#8D6E63] italic">Gerencie os contatos do ateliê.</p>
          </div>
        </div>
        
        {/* Barra de Busca */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="pl-9 bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-10"
            />
        </div>
      </div>

      {/* Lista de Clientes (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-sm bg-[#EFEBE9]" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-[#D7CCC8] bg-[#FAF7F5] p-16 text-center rounded-sm">
            <Users className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
            <p className="text-[#5D4037] font-bold">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              className="group relative overflow-hidden rounded-sm border border-[#D7CCC8] bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Faixa decorativa no topo */}
              <div className="h-1 w-full bg-[#E53935] absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                      <Avatar className="h-12 w-12 border border-[#D7CCC8]">
                          <AvatarFallback className="bg-[#FAF7F5] text-[#5D4037] font-serif font-bold text-lg">
                              {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                      
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm border flex items-center gap-1 ${
                          user.role === 'ADMIN' ? 'bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]' : 
                          user.role === 'CUSTOMER' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' : 
                          'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]'
                      }`}>
                          {user.role === 'ADMIN' ? <Shield size={10}/> : 
                           user.role === 'CUSTOMER' ? <ShoppingBag size={10}/> :
                           <UserIcon size={10}/>}
                          {ROLE_MAP[user.role] || user.role}
                      </span>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <h3 className="text-lg font-bold text-[#5D4037] truncate" title={user.name}>
                              {user.name}
                          </h3>
                      </div>

                      <div className="space-y-2 text-xs text-[#8D6E63]">
                          <div className="flex items-center gap-2 bg-[#FAF7F5] p-2 rounded-sm border border-[#EFEBE9]">
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate" title={user.email}>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-[#FAF7F5] p-2 rounded-sm border border-[#EFEBE9]">
                              <Phone size={12} className="shrink-0" />
                              <span>{user.phone || "Sem telefone"}</span>
                          </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-[#D7CCC8]">
                          {user.phone ? (
                              <Button 
                                  className="w-full rounded-sm bg-[#25D366] hover:bg-[#128C7E] text-white font-bold uppercase tracking-widest text-xs h-9 shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                                  onClick={() => window.open(getWhatsAppLink(user.phone) || '#', '_blank')}
                              >
                                  <MessageCircle size={14} /> WhatsApp
                              </Button>
                          ) : (
                              <Button variant="outline" disabled className="w-full rounded-sm border-[#D7CCC8] text-[#A1887F] bg-[#FAF7F5] text-xs uppercase tracking-widest h-9">
                                  Sem contato
                              </Button>
                          )}
                      </div>
                  </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}