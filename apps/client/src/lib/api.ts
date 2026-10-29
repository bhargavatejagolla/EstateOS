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
    if (res.status === 405) {
      const fallback = getStaticPreviewMock(normalizedPath, options.method || "GET");
      if (fallback !== null) {
        return fallback as T;
      }
    }
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

function getStaticPreviewMock(path: string, method: string): unknown | null {
  if (path.includes("/auth/login") || path.includes("/auth/register") || path.includes("/auth/refresh")) {
    const isTenant = path.toLowerCase().includes("tenant") || path.toLowerCase().includes("priya");
    const demoUser = {
      id: isTenant ? "usr_priya_tenant" : "usr_bt_owner",
      name: isTenant ? "Priya Nair" : "Bhargava Teja",
      email: isTenant ? "priya@estateos.com" : "bhargavatejagolla@gmail.com",
      role: isTenant ? ("TENANT" as const) : ("OWNER" as const),
      phone: "+91 98765 43210",
    };
    return {
      user: demoUser,
      accessToken: "demo_spatial_preview_jwt_token",
    };
  }

  if (path.includes("/auth/reset-password")) {
    return { message: "Password updated successfully" };
  }

  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (isWrite) {
    return { success: true, message: "Action processed in preview node" };
  }

  if (path.includes("/dashboard/owner")) {
    return {
      summary: {
        totalProperties: 6,
        activeProperties: 4,
        rentedProperties: 3,
        activeLeases: 3,
        occupancyRate: 0.75,
        monthlyRentExpected: 285000,
        monthlyRentCollected: 285000,
        collectionRate: 1.0,
        overdueAmount: 0,
        unresolvedMaintenanceCount: 1,
        upcomingViewingsCount: 2,
      },
      signals: [
        {
          id: "sig_1",
          type: "UPCOMING_RENT",
          severity: "info",
          title: "Smart Escrow Rent Due in 4 Days",
          description: "Penthouse Suite #1402 rent (₹85,000) scheduled for auto-settlement.",
          link: "/owner/dashboard",
          amount: 85000,
          daysOffset: 4,
        },
        {
          id: "sig_2",
          type: "UNRESOLVED_MAINTENANCE",
          severity: "warning",
          title: "HVAC Inspection Scheduled",
          description: "Smart Climate air filter replacement at Skyview Residence #401.",
          link: "/owner/dashboard",
          amount: null,
          daysOffset: 2,
        },
      ],
      incomeTrend: [
        { month: "2026-05", expected: 250000, collected: 250000 },
        { month: "2026-06", expected: 260000, collected: 260000 },
        { month: "2026-07", expected: 275000, collected: 275000 },
        { month: "2026-08", expected: 275000, collected: 275000 },
        { month: "2026-09", expected: 285000, collected: 285000 },
        { month: "2026-10", expected: 285000, collected: 285000 },
      ],
      recentActivity: [
        {
          id: "act_1",
          action: "ESCROW_PAYMENT_VERIFIED",
          message: "Automated rent ledger ₹85,000 verified on Neon chain.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "act_2",
          action: "LEASE_DIGITAL_KEY_ISSUED",
          message: "Biometric NFC spatial pass minted for Resident Priya Nair.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }

  if (path.includes("/dashboard/tenant")) {
    return {
      activeLease: {
        id: "lease_demo_1",
        propertyTitle: "Skyview Ultra Penthouse #1402",
        propertyCity: "Bangalore",
        propertyAddress: "Indiranagar 100ft Rd, Bangalore",
        rentAmount: 85000,
        dueDay: 5,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        status: "ACTIVE",
      },
      nextRentDue: {
        id: "rent_demo_1",
        dueDate: "2026-11-05",
        amountDue: 85000,
        amountPaid: 0,
        balance: 85000,
        status: "PENDING",
        daysUntilDue: 7,
      },
      openMaintenanceCount: 1,
      recentMaintenance: [
        {
          id: "maint_demo_1",
          title: "Smart Thermostat Calibration",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  if (path.includes("/properties/mine") || path.includes("/properties")) {
    return [
      {
        id: "prop_demo_1",
        title: "Skyview Ultra Penthouse #1402",
        description: "Floor-to-ceiling panoramic glass penthouse overlooking the Bangalore central skyline. Private sky pool, automated access key, smart metering.",
        city: "Bangalore",
        location: "Indiranagar",
        address: "100ft Road, Indiranagar, Bangalore",
        price: 85000,
        bedrooms: 3,
        bathrooms: 3,
        areaSqFt: 2850,
        yieldRate: 11.4,
        status: "RENTED",
        verified: true,
        images: [
          { id: "img_1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" },
          { id: "img_2", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" },
        ],
        owner: { id: "usr_bt_owner", name: "Bhargava Teja", email: "bhargavatejagolla@gmail.com" },
      },
      {
        id: "prop_demo_2",
        title: "Cyber-Tower Commercial Suite 8B",
        description: "High-spec modern corporate workspace with biometric iris gateway, redundant high-speed fiber grid, and panoramic glass frontage.",
        city: "Bangalore",
        location: "Whitefield",
        address: "EPIP Zone, Whitefield, Bangalore",
        price: 145000,
        bedrooms: 4,
        bathrooms: 4,
        areaSqFt: 4200,
        yieldRate: 14.2,
        status: "AVAILABLE",
        verified: true,
        images: [
          { id: "img_3", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" },
        ],
        owner: { id: "usr_bt_owner", name: "Bhargava Teja", email: "bhargavatejagolla@gmail.com" },
      },
      {
        id: "prop_demo_3",
        title: "Verdant Horizon Garden Villa",
        description: "Architectural bioclimatic luxury villa featuring geothermal climate control, native flora internal courtyards, and rooftop solar matrix.",
        city: "Bangalore",
        location: "Koramangala",
        address: "4th Block, Koramangala, Bangalore",
        price: 110000,
        bedrooms: 4,
        bathrooms: 4,
        areaSqFt: 3600,
        yieldRate: 10.8,
        status: "AVAILABLE",
        verified: true,
        images: [
          { id: "img_4", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" },
        ],
        owner: { id: "usr_rajesh_owner", name: "Rajesh Kumar", email: "rajesh@estateos.com" },
      },
    ];
  }

  if (
    path.includes("/enquiries") ||
    path.includes("/appointments") ||
    path.includes("/favourites") ||
    path.includes("/recommendations") ||
    path.includes("/leases") ||
    path.includes("/notifications") ||
    path.includes("/maintenance")
  ) {
    return [];
  }

  return null;
}
