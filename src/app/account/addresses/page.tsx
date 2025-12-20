"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Trash2, Edit, CheckCircle2, Loader2 } from "lucide-react";
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
    if (!confirm("Tem certeza que deseja excluir este endereço?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses(); // Recarrega lista
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Endereços</h1>
          <p className="text-slate-500">Gerencie seus locais de entrega.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-rose-600 hover:bg-rose-700 font-bold shadow-lg shadow-rose-200">
          <Plus className="mr-2 h-5 w-5" /> Adicionar Endereço
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <MapPin className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Nenhum endereço cadastrado</h3>
            <p className="text-slate-500 mb-6 max-w-xs mx-auto">Cadastre um endereço para agilizar suas compras futuras.</p>
            <Button variant="outline" onClick={handleAddNew}>Cadastrar Agora</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className={`relative group overflow-hidden border-2 transition-all hover:shadow-lg ${addr.default ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 hover:border-rose-100'}`}>
              <CardContent className="p-5">
                {addr.default && (
                  <div className="absolute top-0 right-0 bg-rose-100 text-rose-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Padrão
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-3">
                    <MapPin className={`h-5 w-5 mt-0.5 ${addr.default ? 'text-rose-500' : 'text-slate-400'}`} />
                    <div>
                        <h4 className="font-bold text-slate-800">{addr.street}, {addr.number}</h4>
                        <p className="text-sm text-slate-600">{addr.neighborhood}</p>
                        <p className="text-sm text-slate-600">{addr.city} - {addr.state}</p>
                        <p className="text-xs text-slate-400 mt-1">CEP: {addr.zipCode}</p>
                        {addr.complement && <p className="text-xs text-slate-500 italic mt-1">{addr.complement}</p>}
                    </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleEdit(addr)}>
                    <Edit className="mr-1.5 h-3 w-3" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(addr.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <AddressFormDialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        addressToEdit={editingAddress} 
        onSuccess={fetchAddresses} 
      />
    </div>
  );
}