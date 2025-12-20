// src/components/ui/notifications.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"; // Adicionando ícones

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
  id: number;
  message: string;
  type: NotificationType;
};

type NotificationsContextType = {
  notify: (message: string, type?: NotificationType) => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);


  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message, type }]);
    

    setTimeout(() => {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };


  const styles = {
    success: "bg-emerald-500 border-emerald-600 text-white",
    error: "bg-rose-600 border-rose-700 text-white",
    warning: "bg-amber-500 border-amber-600 text-white",
    info: "bg-blue-500 border-blue-600 text-white",
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    warning: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-right-full fade-in duration-300
              ${styles[item.type]}
            `}
          >
            <div className="flex-shrink-0">{icons[item.type]}</div>
            <p className="text-sm font-medium flex-1">{item.message}</p>
            <button
              onClick={() => removeNotification(item.id)}
              className="ml-2 rounded-full p-1 opacity-70 hover:bg-black/10 hover:opacity-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}