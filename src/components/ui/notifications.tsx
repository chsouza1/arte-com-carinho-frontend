// src/components/notifications.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Notification = {
  id: number;
  message: string;
};

type NotificationsContextType = {
  notify: (message: string) => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);

  function notify(message: string) {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }, 8000);
  }

  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="max-w-xs rounded-md bg-rose-600 px-3 py-2 text-xs text-white shadow-lg"
          >
            {item.message}
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}
