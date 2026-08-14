const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText || `Request failed with status ${res.status}`;
    let code: string | undefined;
    try {
      const body = (await res.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
      code = body.error?.code;
    } catch {
      // response had no JSON body; keep default message
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};
