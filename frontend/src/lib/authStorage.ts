export type AppRole = "admin" | "brand" | "influencer";

type StoredUser = {
  role?: string;
  [key: string]: unknown;
};

type AuthSession<TUser extends StoredUser = StoredUser> = {
  token: string;
  user: TUser;
};

const LEGACY_TOKEN_KEY = "token";
const LEGACY_USER_KEY = "user";
const EXPIRY_BUFFER_SECONDS = 60;

const refreshInFlight: Partial<Record<AppRole, Promise<AuthSession | null>>> = {};

function tokenKey(role: AppRole): string {
  return `${role}:token`;
}

function userKey(role: AppRole): string {
  return `${role}:user`;
}

function parseUser<TUser extends StoredUser>(raw: string | null): TUser | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TUser;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const rawPayload = atob(padded);
    return JSON.parse(rawPayload) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string, bufferSeconds = EXPIRY_BUFFER_SECONDS): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  const expiryMs = payload.exp * 1000;
  return Date.now() >= expiryMs - bufferSeconds * 1000;
}

export function resolveApiBaseUrl(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;
}

export function saveAuthSession<TUser extends StoredUser>(role: AppRole, token: string, user: TUser): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(tokenKey(role), token);
  localStorage.setItem(userKey(role), JSON.stringify(user));

  // Keep legacy keys for backward compatibility with untouched pages.
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
}

export function getAuthSession<TUser extends StoredUser>(role: AppRole): AuthSession<TUser> | null {
  if (typeof window === "undefined") return null;

  const scopedToken = localStorage.getItem(tokenKey(role));
  const scopedUser = parseUser<TUser>(localStorage.getItem(userKey(role)));

  if (scopedToken && scopedUser && scopedUser.role === role) {
    return { token: scopedToken, user: scopedUser };
  }

  // Fallback for users logged in before role-scoped keys existed.
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = parseUser<TUser>(localStorage.getItem(LEGACY_USER_KEY));

  if (legacyToken && legacyUser && legacyUser.role === role) {
    localStorage.setItem(tokenKey(role), legacyToken);
    localStorage.setItem(userKey(role), JSON.stringify(legacyUser));
    return { token: legacyToken, user: legacyUser };
  }

  return null;
}

export function clearAuthSession(role: AppRole): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(tokenKey(role));
  localStorage.removeItem(userKey(role));

  const legacyUser = parseUser<StoredUser>(localStorage.getItem(LEGACY_USER_KEY));
  if (legacyUser?.role === role) {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  }
}

export async function refreshAuthSession<TUser extends StoredUser>(role: AppRole): Promise<AuthSession<TUser> | null> {
  if (typeof window === "undefined") return null;

  const existingRequest = refreshInFlight[role];
  if (existingRequest) {
    return existingRequest as Promise<AuthSession<TUser> | null>;
  }

  const request = (async () => {
    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/${role}/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        clearAuthSession(role);
        return null;
      }

      const data = (await response.json()) as { token?: string; user?: TUser };
      if (!data.token || !data.user) {
        clearAuthSession(role);
        return null;
      }

      saveAuthSession(role, data.token, data.user);
      return { token: data.token, user: data.user };
    } catch {
      return null;
    } finally {
      delete refreshInFlight[role];
    }
  })();

  refreshInFlight[role] = request as Promise<AuthSession>;
  return request;
}

export async function getValidAccessToken(role: AppRole): Promise<string | null> {
  const session = getAuthSession(role);
  if (!session) return null;

  if (!isTokenExpiringSoon(session.token)) {
    return session.token;
  }

  const refreshed = await refreshAuthSession(role);
  return refreshed?.token || null;
}

export function getRoleFromToken(token: string): AppRole | null {
  const payload = decodeJwtPayload(token);
  const role = payload && "role" in payload ? (payload as { role?: string }).role : undefined;
  if (role === "admin" || role === "brand" || role === "influencer") {
    return role;
  }
  return null;
}
