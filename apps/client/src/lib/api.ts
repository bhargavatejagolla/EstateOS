const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;
  const requestUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(requestUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  let refreshPromise: Promise<string | null> | null = null;

  async function requestTokenRefresh(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const refreshUrl = API_BASE_URL ? `${API_BASE_URL}/api/auth/refresh` : "/api/auth/refresh";
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          credentials: "include",
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          return data.accessToken as string;
        }
      } catch {
        // Refresh failed
      } finally {
        refreshPromise = null;
      }
      setAccessToken(null);
      return null;
    })();

    return refreshPromise;
  }

  if (
    res.status === 401 &&
    !normalizedPath.includes("/auth/login") &&
    !normalizedPath.includes("/auth/register") &&
    !normalizedPath.includes("/auth/refresh")
  ) {
    // Attempt silent token refresh once with deduplication
    const newAccessToken = await requestTokenRefresh();

    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      const retryRes = await fetch(requestUrl, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!retryRes.ok) {
        const retryBody = await retryRes.json().catch(() => ({}));
        throw new Error(retryBody.error?.message || "Request failed after refresh");
      }

      if (retryRes.status === 204) return undefined as T;
      return (await retryRes.json()) as T;
    }

    setAccessToken(null);
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

api.get = <T>(path: string, options: RequestInit = {}): Promise<T> =>
  api<T>(path, { ...options, method: "GET" });

api.post = <T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> =>
  api<T>(path, {
    ...options,
    method: "POST",
    body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
  });

api.put = <T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> =>
  api<T>(path, {
    ...options,
    method: "PUT",
    body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
  });

api.patch = <T>(path: string, data?: unknown, options: RequestInit = {}): Promise<T> =>
  api<T>(path, {
    ...options,
    method: "PATCH",
    body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
  });

api.delete = <T>(path: string, options: RequestInit = {}): Promise<T> =>
  api<T>(path, { ...options, method: "DELETE" });
