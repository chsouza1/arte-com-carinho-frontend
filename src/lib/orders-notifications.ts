// src/lib/orders-notifications.ts
"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNotifications } from "@/components/ui/notifications";
import type { OrderSummary } from "./orders";

export function useOrderStatusNotifications(enabled: boolean) {
  const { notify } = useNotifications();
  const previousRef = useRef<OrderSummary[] | null>(null);

  const { data } = useQuery<OrderSummary[]>({
    queryKey: ["orders", "my", "notifications"],
    enabled,
    refetchInterval: 30_000, // a cada 30s (ajuste se quiser)
    queryFn: async () => {
      const res = await api.get("/orders/my");
      return res.data.content ?? res.data;
    },
  });

  useEffect(() => {
    if (!data) return;

    const prev = previousRef.current;
    previousRef.current = data;

    if (!prev) return;

    data.forEach((order) => {
      const old = prev.find((o) => o.id === order.id);
      if (!old) return;

      if (old.status !== order.status) {
        if (order.status === "IN_PRODUCTION") {
          notify(`Seu pedido #${order.id} entrou em produção.`);
        }
        if (order.status === "SHIPPED") {
          notify(`Seu pedido #${order.id} saiu para envio.`);
        }
      }
    });
  }, [data, notify]);
}
