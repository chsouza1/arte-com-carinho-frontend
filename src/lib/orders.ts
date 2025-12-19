// src/lib/orders.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | string;

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  customizationNotes?: string | null;
};

export type OrderSummary = {
  id: number;
  orderNumber?: string;
  code?: string;
  status: OrderStatus;
  totalAmount: number;
  createdDate?: string;
  orderDate?: string;
  createdAt?: string;
};

export type OrderDetail = OrderSummary & {
  createdDate?: string;
  orderDate?: string;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  deliveryDate?: string | null;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  notes?: string | null;
  customerPhone?: string;
  user?: { name: string; phone: string };
  customer?: { name: string; phone: string };
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; 
};

export function useOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      try {
        const { data } = await api.get<OrderDetail>(`/public/orders/${orderId}`);
        return data;
      } catch (error) {
        const { data } = await api.get<OrderDetail>(`/orders/${orderId}`);
        return data;
      }
    },
    enabled: !!orderId,
    retry: 1,
  });
}


export function useMyOrders(page: number = 0) {
  return useQuery({
    queryKey: ["my-orders", page], 
    queryFn: async () => {
      const { data } = await api.get<PageResponse<OrderSummary>>(`/orders/my?page=${page}&size=10`);
      return data;
    },
    retry: false,
  });
}
