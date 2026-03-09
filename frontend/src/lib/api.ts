export type Student = {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      try {
        const payload = await response.json();
        if (typeof payload?.message === "string") {
          message = payload.message;
        } else if (Array.isArray(payload?.message) && payload.message.length) {
          message = payload.message.join(", ");
        } else if (typeof payload?.error === "string") {
          message = payload.error;
        }
      } catch {
        message = "Request failed";
      }
    } else {
      const text = await response.text();
      if (text.trim()) {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const studentsApi = {
  list: () => request<Student[]>("/students"),
  create: (payload: Omit<Student, "id" | "createdAt" | "updatedAt">) =>
    request<Student>("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (
    id: string,
    payload: Partial<Omit<Student, "id" | "createdAt" | "updatedAt">>,
  ) =>
    request<Student>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    request<{ deleted: boolean }>(`/students/${id}`, {
      method: "DELETE",
    }),
};
