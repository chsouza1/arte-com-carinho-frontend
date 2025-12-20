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
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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

  const form = useForm({
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

  const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = form;

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{addressToEdit ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para entrega.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <div className="relative">
                <Input id="zipCode" {...register("zipCode")} placeholder="00000-000" maxLength={9} />
                {isLoadingCEP && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-500" />}
              </div>
              {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input id="state" {...register("state")} maxLength={2} placeholder="SP" />
                {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua / Avenida</Label>
            <Input id="street" {...register("street")} />
            {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register("number")} />
              {errors.number && <p className="text-xs text-red-500">{errors.number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register("complement")} placeholder="Apto, Bloco..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register("neighborhood")} />
              {errors.neighborhood && <p className="text-xs text-red-500">{errors.neighborhood.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
                id="default" 
                checked={watch("default")}
                onCheckedChange={(checked) => setValue("default", checked === true)}
            />
            <Label htmlFor="default" className="font-normal cursor-pointer">
                Usar como endereço padrão
            </Label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">Cancelar</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 font-bold" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Endereço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}