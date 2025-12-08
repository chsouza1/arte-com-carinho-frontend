"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { useOrderStatusNotifications } from "@/lib/orders-notifications";

export function OrderStatusWatcher() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const session = getSession();
    setHasSession(!!session);
  }, []);

  useOrderStatusNotifications(hasSession);

  return null;
}