"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Truck, Home, Building2, CheckCircle2 } from "lucide-react";
// Assumindo que a interface Address esteja disponível
import { Address } from "./page"; 

const addressSchema = z.object({
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado (UF) deve ter 2 letras"),
  default: z.boolean(), 
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit: Address | null;
  onSuccess: () => void;
}

export function AddressFormDialog({ isOpen, onClose, addressToEdit, onSuccess }: AddressFormDialogProps) {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      default: false, 
    }
  });

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = form;

  // Reset do formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        reset({
            zipCode: addressToEdit.zipCode,
            street: addressToEdit.street,
            number: addressToEdit.number,
            complement: addressToEdit.complement || "",
            neighborhood: addressToEdit.neighborhood,
            city: addressToEdit.city,
            state: addressToEdit.state,
            default: addressToEdit.default
        });
      } else {
        reset({
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            default: false
        });
      }
    }
  }, [isOpen, addressToEdit, reset]);

  // Busca CEP automático
  const zipCodeValue = watch("zipCode");
  useEffect(() => {
    const cleanCep = zipCodeValue?.replace(/\D/g, "") || "";
    if (cleanCep.length === 8 && !addressToEdit) {
      setIsLoadingCEP(true);
      axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then((res) => {
          if (!res.data.erro) {
            setValue("street", res.data.logradouro);
            setValue("neighborhood", res.data.bairro);
            setValue("city", res.data.localidade);
            setValue("state", res.data.uf);
            document.getElementById("number")?.focus();
          }
        })
        .finally(() => setIsLoadingCEP(false));
    }
  }, [zipCodeValue, setValue, addressToEdit]);

  const onSubmit = async (data: AddressFormValues) => {
    setIsSaving(true);
    try {
      if (addressToEdit) {
        // Se sua API espera um PUT para editar
        await api.put(`/addresses/${addressToEdit.id}`, data);
      } else {
        await api.post("/addresses", data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar endereço.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-[#FAF7F5] border-2 border-dashed border-[#D7CCC8] p-0 overflow-hidden shadow-2xl rounded-sm">
        
        {/* Cabeçalho Estilo Etiqueta */}
        <DialogHeader className="bg-[#FFF8E1] border-b border-[#FFE0B2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full border border-[#FFE0B2] shadow-sm">
                <Truck className="h-5 w-5 text-[#F57F17]" />
            </div>
            <div>
                <DialogTitle className="text-xl font-serif font-bold text-[#5D4037]">
                    {addressToEdit ? "Editar Endereço de Entrega" : "Novo Destino de Entrega"}
                </DialogTitle>
                <p className="text-xs text-[#8D6E63]">
                    Preencha os dados com atenção para garantir que sua encomenda chegue certinho.
                </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          
          {/* Linha 1: CEP e Estado */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="zipCode" className="text-xs font-bold text-[#8D6E63] uppercase">CEP</Label>
              <div className="relative">
                <Input 
                    id="zipCode" 
                    {...register("zipCode")} 
                    placeholder="00000-000" 
                    maxLength={9} 
                    className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm pl-9"
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#A1887F]" />
                {isLoadingCEP && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-[#E53935]" />}
              </div>
              {errors.zipCode && <p className="text-[10px] text-[#C62828] font-bold">{errors.zipCode.message}</p>}
            </div>
            
            <div className="col-span-1 space-y-1.5">
                <Label htmlFor="state" className="text-xs font-bold text-[#8D6E63] uppercase">Estado (UF)</Label>
                <Input 
                    id="state" 
                    {...register("state")} 
                    maxLength={2} 
                    placeholder="SP" 
                    className="bg-[#EFEBE9] border-[#D7CCC8] text-[#5D4037] rounded-sm text-center font-bold"
                />
                {errors.state && <p className="text-[10px] text-[#C62828] font-bold">{errors.state.message}</p>}
            </div>
          </div>

          {/* Linha 2: Rua */}
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-xs font-bold text-[#8D6E63] uppercase">Rua / Avenida</Label>
            <Input 
                id="street" 
                {...register("street")} 
                className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm"
            />
            {errors.street && <p className="text-[10px] text-[#C62828] font-bold">{errors.street.message}</p>}
          </div>

          {/* Linha 3: Número e Complemento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="number" className="text-xs font-bold text-[#8D6E63] uppercase">Número</Label>
              <div className="relative">
                <Input 
                    id="number" 
                    {...register("number")} 
                    className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm pl-9"
                />
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-[#A1887F]" />
              </div>
              {errors.number && <p className="text-[10px] text-[#C62828] font-bold">{errors.number.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="complement" className="text-xs font-bold text-[#8D6E63] uppercase">Complemento</Label>
              <Input 
                id="complement" 
                {...register("complement")} 
                placeholder="Apto, Bloco..." 
                className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm"
              />
            </div>
          </div>

          {/* Linha 4: Bairro e Cidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-xs font-bold text-[#8D6E63] uppercase">Bairro</Label>
              <Input 
                id="neighborhood" 
                {...register("neighborhood")} 
                className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm"
              />
              {errors.neighborhood && <p className="text-[10px] text-[#C62828] font-bold">{errors.neighborhood.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-bold text-[#8D6E63] uppercase">Cidade</Label>
              <div className="relative">
                <Input 
                    id="city" 
                    {...register("city")} 
                    className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm pl-9"
                />
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-[#A1887F]" />
              </div>
              {errors.city && <p className="text-[10px] text-[#C62828] font-bold">{errors.city.message}</p>}
            </div>
          </div>

          {/* Checkbox Padrão */}
          <div className="flex items-center space-x-2 pt-2 bg-[#FFF8E1] p-3 rounded-sm border border-[#FFE0B2]">
            <Checkbox 
                id="default" 
                checked={watch("default")}
                onCheckedChange={(checked) => setValue("default", checked === true)}
                className="border-[#F57F17] data-[state=checked]:bg-[#F57F17] data-[state=checked]:text-white"
            />
            <Label htmlFor="default" className="text-sm font-bold text-[#F57F17] cursor-pointer flex items-center gap-1">
                <CheckCircle2 size={14} /> Definir como endereço principal
            </Label>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end pt-4 gap-3 border-t border-dashed border-[#D7CCC8]">
            <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#EFEBE9] font-bold uppercase tracking-widest text-xs"
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                className="bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs px-6 rounded-sm shadow-md" 
                disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Endereço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}