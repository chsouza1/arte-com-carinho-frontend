"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trash2, Edit2, Loader2, Home, Truck, CheckCircle2 } from "lucide-react";
import { AddressFormDialog } from "./address-form-dialog";

export type Address = {
  id: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  default: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data);
    } catch (error) {
      console.error("Erro ao buscar endereços", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este endereço da sua agenda?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses(); 
    } catch (error) {
      alert("Erro ao excluir endereço.");
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
             <Truck className="h-6 w-6 text-[#E53935]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Meus Endereços</h1>
            <p className="text-[#8D6E63] italic">Gerencie os locais para envio das suas encomendas.</p>
          </div>
        </div>
        
        <Button 
          onClick={handleAddNew} 
          className="bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest px-6 py-6 rounded-sm shadow-md transition-all hover:-translate-y-1"
        >
          <Plus className="mr-2 h-5 w-5" /> Novo Endereço
        </Button>
      </div>

      {/* Conteúdo Principal */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8D6E63]">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#D7CCC8]" />
            <p className="text-sm font-bold uppercase tracking-widest">Consultando agenda...</p>
        </div>
      ) : addresses.length === 0 ? (
        // Empty State - Estilo "Folha em Branco"
        <div className="border-2 border-dashed border-[#D7CCC8] bg-[#FAF7F5] rounded-sm p-12 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6 inline-block border border-[#EFEBE9]">
                <MapPin className="h-8 w-8 text-[#D7CCC8]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#5D4037] mb-2">Nenhum endereço salvo</h3>
            <p className="text-[#8D6E63] mb-8 max-w-sm mx-auto">Cadastre seu endereço principal para agilizar a entrega dos seus mimos.</p>
            <Button variant="outline" onClick={handleAddNew} className="border-[#E53935] text-[#E53935] hover:bg-[#FFEBEE] font-bold uppercase tracking-widest">
                Cadastrar Agora
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`
                group relative bg-white border-2 rounded-sm transition-all duration-300 overflow-hidden hover:shadow-lg
                ${addr.default ? 'border-[#E53935] shadow-md' : 'border-[#EFEBE9] hover:border-[#D7CCC8]'}
              `}
            >
              {/* Faixa Decorativa Superior */}
              <div className={`h-1 w-full ${addr.default ? 'bg-[#E53935]' : 'bg-[#D7CCC8]'}`}></div>

              <div className="p-6">
                
                {/* Badge de Padrão */}
                {addr.default && (
                  <div className="absolute top-4 right-4 bg-[#FFEBEE] text-[#C62828] px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#FFCDD2]">
                    <CheckCircle2 size={12} /> Principal
                  </div>
                )}
                
                {/* Ícone e Rua */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-full border ${addr.default ? 'bg-[#FFEBEE] border-[#FFCDD2] text-[#E53935]' : 'bg-[#FAF7F5] border-[#EFEBE9] text-[#A1887F]'}`}>
                        <Home size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-[#5D4037] text-lg leading-tight mb-1">
                            {addr.street}, {addr.number}
                        </h4>
                        {addr.complement && (
                            <p className="text-xs text-[#8D6E63] italic mb-1">({addr.complement})</p>
                        )}
                    </div>
                </div>

                {/* Detalhes do Endereço */}
                <div className="space-y-1 pl-[3.25rem] border-l-2 border-dashed border-[#EFEBE9] ml-5">
                    <p className="text-sm text-[#8D6E63]">{addr.neighborhood}</p>
                    <p className="text-sm text-[#8D6E63] font-medium">{addr.city} - {addr.state}</p>
                    <p className="text-xs text-[#A1887F] font-mono mt-2 bg-[#FAF7F5] inline-block px-2 py-0.5 rounded-sm border border-[#EFEBE9]">
                        CEP: {addr.zipCode}
                    </p>
                </div>

                {/* Ações (Aparecem suavemente ou sempre visíveis em mobile) */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-[#EFEBE9]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 h-9 text-xs font-bold uppercase tracking-wider text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FAF7F5]" 
                    onClick={() => handleEdit(addr)}
                  >
                    <Edit2 className="mr-2 h-3 w-3" /> Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 text-[#E53935] hover:bg-[#FFEBEE] rounded-sm" 
                    onClick={() => handleDelete(addr.id)}
                    title="Excluir endereço"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário*/}
      <AddressFormDialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        addressToEdit={editingAddress} 
        onSuccess={fetchAddresses} 
      />
    </div>
  );
}