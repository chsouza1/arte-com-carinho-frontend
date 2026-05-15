import axios from "axios";
import { getSession } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.artecomcarinhobysi.com.br/api",
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export const paymentsApi = {
  createCardPayment: async (paymentData: {
    orderId: number;
    token: string;
    paymentMethodId: string;
    installments: number;
    issuerId: string;
    email: string;
  }) => {
    const response = await api.post('/payments/card', paymentData);
    return response.data;
  }
};


api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    try {
      const sessionStr = localStorage.getItem("auth-session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      }
    } catch (error) {}
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      console.warn("Sessão inválida ou expirada. Redirecionando para login...");
      localStorage.removeItem("auth-session");
      setAuthToken(null);
      window.location.href = "/auth/login?timeout=1";
    }
    return Promise.reject(error);
  }
);

export function applyAuthFromStorage() {
  if (typeof window === "undefined") return;

  const session = getSession();
  if (session?.token) {
    setAuthToken(session.token);
  } else {
    setAuthToken(null);
  }
}