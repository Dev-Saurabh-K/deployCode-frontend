const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  localStorage.setItem("cploy_token", data.access_token);
  return data;
}

export function getToken() {
  return localStorage.getItem("cploy_token");
}

export function removeToken() {
  localStorage.removeItem("cploy_token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
