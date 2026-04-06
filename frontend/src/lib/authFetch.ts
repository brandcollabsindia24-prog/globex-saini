import {
  AppRole,
  clearAuthSession,
  getValidAccessToken,
  refreshAuthSession,
} from "./authStorage";

type AuthFetchInit = RequestInit & {
  retryOnUnauthorized?: boolean;
};

type ApiError = Error & {
  status?: number;
  code?: string;
};

function withAuthHeader(init: RequestInit, token: string): RequestInit {
  const headers = new Headers(init.headers || undefined);
  headers.set("Authorization", `Bearer ${token}`);

  return {
    ...init,
    headers,
    credentials: init.credentials || "include",
  };
}

async function tryParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildApiError(fallbackMessage: string, response: Response, payload: unknown): ApiError {
  const details = (payload || {}) as { message?: string; code?: string };
  const error = new Error(details.message || fallbackMessage) as ApiError;
  error.status = response.status;
  error.code = details.code;
  return error;
}

export async function authFetch(role: AppRole, input: RequestInfo | URL, init: AuthFetchInit = {}): Promise<Response> {
  const token = await getValidAccessToken(role);
  if (!token) {
    clearAuthSession(role);
    const error = new Error("Missing authenticated session") as ApiError;
    error.code = "SESSION_MISSING";
    throw error;
  }

  const requestInit = withAuthHeader(init, token);
  const response = await fetch(input, requestInit);

  const shouldRetry = init.retryOnUnauthorized !== false;
  if (response.status !== 401 || !shouldRetry) {
    return response;
  }

  const refreshed = await refreshAuthSession(role);
  if (!refreshed?.token) {
    clearAuthSession(role);
    return response;
  }

  return fetch(input, withAuthHeader(init, refreshed.token));
}

export async function authFetchJson<T>(role: AppRole, input: RequestInfo | URL, init: AuthFetchInit = {}): Promise<T> {
  const response = await authFetch(role, input, init);
  const payload = await tryParseJson(response);

  if (!response.ok) {
    throw buildApiError("Request failed", response, payload);
  }

  return payload as T;
}
