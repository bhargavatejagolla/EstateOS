let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !path.startsWith("/auth/login") && !path.startsWith("/auth/register")) {
    // Attempt silent token refresh
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);
        headers.set("Authorization", `Bearer ${data.accessToken}`);

        const retryRes = await fetch(`/api${path}`, {
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
    } catch {
      // Refresh failed
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
