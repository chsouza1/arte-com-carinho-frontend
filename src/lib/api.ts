// src/lib/api.ts
import axios from "axios";
import { getSession } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://divine-avis-arte-com-carinho-5a6aab3a.koyeb.app/",
});

export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function applyAuthFromStorage() {
  if (typeof window === "undefined") return;

  const session = getSession();
  if (session?.token) {
    setAuthToken(session.token);
  } else {
    setAuthToken(null);
  }
}
