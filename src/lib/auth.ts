// src/lib/auth.ts
export type AuthRole = "ADMIN" | "CUSTOMER";

export type AuthSession = {
  token: string;
  name: string;
  email: string;
  role: AuthRole;
};

const STORAGE_KEY = "arte_auth";

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdmin(session: AuthSession | null) {
  return session?.role === "ADMIN";
}
