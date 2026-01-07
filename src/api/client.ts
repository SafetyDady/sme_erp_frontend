const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.detail || errorBody.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      const requestId = response.headers.get("x-request-id");
      console.error(
        `API Error (Request ID: ${requestId || "unknown"}):`,
        `Status: ${response.status}, Message: ${errorMessage}`
      );
      throw new ApiError(response.status, errorMessage);
    }

    console.log(`API Success: ${response.status} ${response.statusText}`);

    // Handle different response types
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // If content-length is 0 or content-type indicates no content, return empty response
    if (contentLength === "0" || response.status === 204) {
      return {} as T;
    }

    // If content-type indicates JSON, try to parse JSON
    if (contentType?.includes("application/json")) {
      try {
        return await response.json();
      } catch (e) {
        console.warn(
          "Failed to parse JSON response, returning empty object:",
          e
        );
        return {} as T;
      }
    }

    // For other content types or when in doubt, try to parse as JSON but handle errors gracefully
    try {
      return await response.json();
    } catch (e) {
      console.warn("Response not JSON or empty, returning empty object");
      return {} as T;
    }
  }

  // Auth
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    return this.request<{ access_token: string; token_type: string }>(
      "/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );
  }

  async getMe() {
    return this.request<{
      id: number;
      email: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>("/auth/me");
  }

  // Items
  async getItems() {
    return this.request<
      Array<{
        id: number;
        name: string;
        description: string;
        sku: string;
        created_at: string;
      }>
    >("/inventory/items");
  }

  async getItem(id: number) {
    return this.request<{
      id: number;
      name: string;
      description: string;
      sku: string;
      created_at: string;
    }>(`/inventory/items/${id}`);
  }

  async createItem(data: { name: string; description: string; sku: string }) {
    return this.request("/inventory/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getLocation(id: number) {
    return this.request<{
      id: number;
      name: string;
      code: string;
      description: string;
      created_at: string;
    }>(`/inventory/locations/${id}`);
  }
  async getLocations() {
    return this.request<
      Array<{
        id: number;
        name: string;
        code: string;
        description: string;
        created_at: string;
      }>
    >("/inventory/locations");
  }

  async createLocation(data: {
    name: string;
    code: string;
    description: string;
  }) {
    return this.request("/inventory/locations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Stock
  async getCurrentStock() {
    return this.request<
      Array<{
        item_id: number;
        item_name: string;
        location_id: number;
        location_name: string;
        current_quantity: number;
        last_updated: string;
      }>
    >("/inventory/stock/current");
  }

  async stockIn(data: {
    item_id: number;
    location_id: number;
    quantity: number;
    notes: string;
  }) {
    return this.request("/inventory/stock/in", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async stockOut(data: {
    item_id: number;
    location_id: number;
    quantity: number;
    notes: string;
  }) {
    return this.request("/inventory/stock/out", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getInventorySummary() {
    return this.request<{
      total_items: number;
      total_locations: number;
      estimated_stock_value: number;
      low_stock_items_count: number;
      last_transaction_date: string;
    }>("/inventory/reports/summary");
  }

  // Users
  async getUsers() {
    return this.request<
      Array<{
        id: number;
        email: string;
        role: string;
        is_active: boolean;
        created_at: string;
      }>
    >("/users/users");
  }

  async createUser(userData: {
    email: string;
    password: string;
    role: string;
  }) {
    return this.request<{
      id: number;
      email: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>("/users/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    userId: number,
    userData: {
      email?: string;
      role?: string;
      is_active?: boolean;
    }
  ) {
    return this.request<{
      id: number;
      email: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>(`/users/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  }

  async disableUser(userId: number) {
    return this.request<{ message: string }>(`/users/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getRoles() {
    return this.request<
      Array<{
        name: string;
        description: string;
      }>
    >("/users/roles");
  }

  // Additional Transaction APIs
  async stockTransfer(data: {
    item_id: number;
    from_location_id: number;
    to_location_id: number;
    quantity: number;
    notes: string;
  }) {
    return this.request("/inventory/stock/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async stockAdjustment(data: {
    item_id: number;
    location_id: number;
    quantity: number;
    notes: string;
  }) {
    return this.request("/inventory/stock/adjustment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Stock and Movement APIs
  async getStockLedger(params?: {
    item_id?: number;
    location_id?: number;
    skip?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.item_id) searchParams.set("item_id", params.item_id.toString());
    if (params?.location_id)
      searchParams.set("location_id", params.location_id.toString());
    if (params?.skip) searchParams.set("skip", params.skip.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request<
      Array<{
        id: number;
        item_id: number;
        location_id: number;
        transaction_type: string;
        quantity: number;
        running_balance: number;
        notes: string;
        created_at: string;
        created_by: number;
      }>
    >(`/inventory/stock/ledger${query ? "?" + query : ""}`);
  }
}

export const apiClient = new ApiClient();
export { ApiError };
