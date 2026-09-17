const API_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export const api = {
  register: (data) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTasks: () => request("/tasks"),

  getMyTasks: () => request("/my-tasks"),

  getTask: (id) => request(`/tasks/${id}`),

  createTask: (data) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTask: (id, data) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),

  dashboard: () => request("/dashboard"),
};