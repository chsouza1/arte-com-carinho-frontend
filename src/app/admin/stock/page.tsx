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
  Package, Search, Plus, Minus, Loader2, Save, 
  Archive, AlertTriangle, Store, EyeOff, Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  active?: boolean;
  featured?: boolean;
  customizable?: boolean;
  images?: string[];
  [key: string]: any;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
};

async function fetchInventory(): Promise<Product[]> {
  const res = await api.get<PageResponse<Product>>("/products", {
    params: { page: 0, size: 500, sort: "name,asc" },
  });
  return res.data.content ?? [];
}

export default function AdminStockPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "STORE" | "INTERNAL" | "CRITICAL">("ALL");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    stockQuantity: "",
    costPrice: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stock"],
    queryFn: fetchInventory,
  });

  const inventory = useMemo(() => data ?? [], [data]);

  const filteredInventory = useMemo(() => {
    let list = inventory;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(lower));
    }

    if (filterType === "STORE") {
      list = list.filter((item) => item.active === true);
    } else if (filterType === "INTERNAL") {
      list = list.filter((item) => item.active === false);
    } else if (filterType === "CRITICAL") {
      list = list.filter((item) => (item.stock ?? 0) <= 3);
    }

    return list;
  }, [inventory, searchTerm, filterType]);

  const updateStockMutation = useMutation({
    mutationFn: async ({ product, newStock }: { product: Product; newStock: number }) => {
      setProcessingId(product.id);
      
      const payload = {
        name: product.name,
        description: product.description || null,
        price: product.price || 0,
        stock: newStock,
        category: product.category || "OUTROS",
        active: product.active ?? false,
        featured: product.featured ?? false,
        customizable: product.customizable ?? false,
        images: product.images ?? [],
        sizes: [],
        colors: [],
      };

      await api.put(`/products/${product.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stock"] });
    },
    onSettled: () => {
      setProcessingId(null);
    }
  });

  const createMaterialMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      
      const payload = {
        name: form.name,
        description: "Material/Insumo de uso interno",
        price: form.costPrice ? Number(form.costPrice) : 0,
        stock: form.stockQuantity ? Number(form.stockQuantity) : 0,
        category: "OUTROS",
        active: false,
        featured: false,
        customizable: false,
        images: [],
        sizes: [],
        colors: [],
      };

      await api.post("/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stock"] });
      setIsSheetOpen(false);
      setForm({ name: "", stockQuantity: "", costPrice: "" });
    },
    onError: () => {
      setErrorMsg("Erro ao cadastrar material. Verifique as informações.");
    }
  });

  const handleQuickStockUpdate = (product: Product, change: number) => {
    const currentStock = product.stock ?? 0;
    const newStock = currentStock + change;
    if (newStock < 0) return; // Não permite estoque negativo
    
    updateStockMutation.mutate({ product, newStock });
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.stockQuantity) {
      setErrorMsg("Nome e quantidade inicial são obrigatórios.");
      return;
    }
    createMaterialMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- BARRA SUPERIOR --- */}
      <div className="bg-white border border-[#D7CCC8] p-5 rounded-sm shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F5] rounded-full border border-[#D7CCC8]">
            <Archive size={24} className="text-[#5D4037]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#5D4037]">Inventário e Insumos</h2>
            <p className="text-xs text-[#8D6E63] mt-1">Gerencie produtos da loja e materiais do ateliê (linhas, tecidos, etc).</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
            <Input 
              placeholder="Buscar item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#FAF7F5] border-[#D7CCC8] focus:border-[#E53935] rounded-sm text-sm w-full h-11"
            />
          </div>
          <Button 
            onClick={() => setIsSheetOpen(true)}
            className="w-full sm:w-auto bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs h-11 rounded-sm shadow-sm transition-all"
          >
            <Plus size={16} className="mr-2" /> Novo Insumo/Material
          </Button>
        </div>
      </div>

      {/* --- FILTROS RÁPIDOS --- */}
      <div className="flex flex-wrap gap-2">
        <FilterButton 
            active={filterType === "ALL"} 
            onClick={() => setFilterType("ALL")} 
            label="Todos os Itens" 
            icon={<Package size={14} />} 
        />
        <FilterButton 
            active={filterType === "STORE"} 
            onClick={() => setFilterType("STORE")} 
            label="Peças na Loja" 
            icon={<Store size={14} />} 
        />
        <FilterButton 
            active={filterType === "INTERNAL"} 
            onClick={() => setFilterType("INTERNAL")} 
            label="Insumos (Interno)" 
            icon={<Scissors size={14} />} 
        />
        <FilterButton 
            active={filterType === "CRITICAL"} 
            onClick={() => setFilterType("CRITICAL")} 
            label="Estoque Baixo (≤3)" 
            icon={<AlertTriangle size={14} />} 
            isWarning
        />
      </div>

      {/* --- TABELA DE INVENTÁRIO --- */}
      <div className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 bg-[#EFEBE9] w-full rounded-sm" />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-16 text-center bg-[#FAF7F5]">
            <Archive className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
            <p className="text-lg font-serif text-[#5D4037]">Nenhum item encontrado</p>
            <p className="text-sm text-[#8D6E63] mt-1">O seu inventário para esta categoria está vazio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF7F5] border-b border-[#D7CCC8] text-xs uppercase tracking-wider text-[#8D6E63]">
                <tr>
                  <th className="px-6 py-4 font-bold">Nome do Item</th>
                  <th className="px-6 py-4 font-bold">Tipo / Visibilidade</th>
                  <th className="px-6 py-4 font-bold text-center">Quantidade Atual</th>
                  <th className="px-6 py-4 font-bold text-center">Ajuste Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE9]">
                {filteredInventory.map((item) => {
                  const isMaterial = item.active === false;
                  const isCritical = (item.stock ?? 0) <= 3;
                  const isProcessing = processingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF7F5] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white border border-[#D7CCC8] rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {item.images && item.images.length > 0 ? (
                                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    isMaterial ? <Scissors size={18} className="text-[#A1887F]" /> : <Package size={18} className="text-[#A1887F]" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-[#5D4037]">{item.name}</p>
                                <p className="text-[10px] text-[#8D6E63] uppercase tracking-wider mt-0.5">{item.category}</p>
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {isMaterial ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm border bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] uppercase">
                                <EyeOff size={12} /> Uso Interno
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm border bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] uppercase">
                                <Store size={12} /> Loja Online
                            </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className={cn(
                            "inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-sm border font-bold text-base",
                            isCritical 
                                ? "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]" 
                                : "bg-white text-[#5D4037] border-[#D7CCC8]"
                        )}>
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : (item.stock ?? 0)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => handleQuickStockUpdate(item, -1)}
                                disabled={isProcessing || (item.stock ?? 0) <= 0}
                                className="h-8 w-8 rounded-sm bg-white border border-[#D7CCC8] text-[#5D4037] flex items-center justify-center hover:bg-[#FFEBEE] hover:text-[#C62828] hover:border-[#FFCDD2] disabled:opacity-50 transition-colors"
                                title="Diminuir 1"
                            >
                                <Minus size={16} />
                            </button>
                            <button 
                                onClick={() => handleQuickStockUpdate(item, 1)}
                                disabled={isProcessing}
                                className="h-8 w-8 rounded-sm bg-white border border-[#D7CCC8] text-[#5D4037] flex items-center justify-center hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#C8E6C9] disabled:opacity-50 transition-colors"
                                title="Aumentar 1"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- GAVETA: ADICIONAR MATERIAL INTERNO --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#FAF7F5] border-l-4 border-l-[#E53935] p-0 flex flex-col h-full">
          
          <div className="p-6 bg-white border-b border-[#D7CCC8] shadow-sm sticky top-0 z-10">
            <h2 className="text-lg font-serif font-bold text-[#5D4037] flex items-center gap-2">
              <Scissors size={20} className="text-[#E53935]" />
              Cadastrar Material/Insumo
            </h2>
            <p className="text-xs text-[#8D6E63] mt-1 leading-relaxed">
              Itens cadastrados aqui ficam <strong>ocultos na loja</strong> e servem apenas para o seu controle de ateliê.
            </p>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <form id="material-form" onSubmit={handleCreateMaterial} className="space-y-5">
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Nome do Material</Label>
                <Input 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                  placeholder="Ex: Linha de Costura Branca, Tecido Algodão 1m..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Quantidade Inicial (Estoque)</Label>
                <Input 
                  type="number"
                  value={form.stockQuantity} 
                  onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))} 
                  className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Custo / Valor Unitário (Opcional)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={form.costPrice} 
                  onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} 
                  className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-11 rounded-sm shadow-sm"
                  placeholder="R$ 0,00"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-[#C62828] bg-[#FFEBEE] p-3 rounded-sm border border-[#FFCDD2] flex items-start gap-2 font-bold shadow-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}
            </form>
          </div>

          <div className="p-6 bg-white border-t border-[#D7CCC8] sticky bottom-0 z-10">
            <Button 
              type="submit" 
              form="material-form"
              disabled={createMaterialMutation.isPending} 
              className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest rounded-sm shadow-md h-12 transition-all text-xs"
            >
              {createMaterialMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <><Save size={18} className="mr-2"/> Adicionar ao Inventário</>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterButton({ active, onClick, label, icon, isWarning = false }: any) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all shadow-sm",
          active
            ? (isWarning ? "bg-[#FFEBEE] text-[#C62828] border-[#E53935]" : "bg-[#E53935] text-white border-[#E53935]")
            : "bg-white text-[#8D6E63] border-[#D7CCC8] hover:border-[#A1887F] hover:text-[#5D4037]"
        )}
      >
        {icon} {label}
      </button>
    );
}