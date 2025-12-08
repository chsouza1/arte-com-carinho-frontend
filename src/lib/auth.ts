// src/lib/auth.ts

export type AuthSession = {
  token: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER" | string;
  ultimaAtividade?: number;
};

// chave “nova”
const STORAGE_KEY = "arte-com-carinho:auth-session";
// chave “antiga”
const LEGACY_STORAGE_KEY = "artecomcarinho_auth";

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(session);
  localStorage.setItem(STORAGE_KEY, payload);
  localStorage.setItem(LEGACY_STORAGE_KEY, payload);
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  // tenta chave nova
  let raw = localStorage.getItem(STORAGE_KEY);

  // se não tiver, tenta antiga
  if (!raw) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;

    try {
      const parsed = JSON.parse(legacy) as AuthSession;
      // migra pra nova
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      raw = JSON.stringify(parsed);
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

// compat
export function saveAuthSession(session: AuthSession) {
  saveSession(session);
}

export function getAuthSession(): AuthSession | null {
  return getSession();
}

export function clearAuthSession() {
  clearSession();
}

// 🔐 Helper: considera ADMIN ou EMPLOYEE de forma mais flexível
export function isAdmin(session: AuthSession | null | undefined) {
  if (!session || !session.role) return false;

  const role = String(session.role).toUpperCase();

  // cobre ADMIN, ROLE_ADMIN, etc
  if (role.includes("ADMIN")) return true;
  if (role.includes("EMPLOYEE")) return true;

  return false;
}


export function touchSessionActivity() {
  if (typeof window === "undefined") return;

  const session = getSession();
  if (!session) return;

  const updated: AuthSession = {
    ...session,
    ultimaAtividade: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
