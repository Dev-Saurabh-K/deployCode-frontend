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

  localStorage.setItem("deployCode_token", data.access_token);
  return data;
}

export function getToken() {
  const token = localStorage.getItem("deployCode_token");
  if (token) return token;

  // Preserve existing signed-in sessions after the product rename.
  const legacyToken = localStorage.getItem("cploy_token");
  if (legacyToken) {
    localStorage.setItem("deployCode_token", legacyToken);
    localStorage.removeItem("cploy_token");
  }
  return legacyToken;
}

export function removeToken() {
  localStorage.removeItem("deployCode_token");
  localStorage.removeItem("cploy_token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
