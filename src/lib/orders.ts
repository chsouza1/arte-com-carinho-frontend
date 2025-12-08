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
  notes?: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; 
};

export function useMyOrders(page = 0) {
  return useQuery<PageResponse<OrderSummary>>({
    queryKey: ["my-orders", page],
    queryFn: async () => {
      const response = await api.get("/orders/my", { 
        params: {
          page,
          size: 10,
        },
      });
      
      return response.data;
    },
  });
}
export function useOrderDetail(orderId: string | number | null) {
  return useQuery<OrderDetail>({
    queryKey: ["order-detail", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await api.get<OrderDetail>(`/orders/${orderId}`);
      return res.data;
    },
  });
}
