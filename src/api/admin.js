const API_BASE = import.meta.env.VITE_API_BASE || "";
const ADMIN_TOKEN_KEY = "deployCode_admin_token";
const ADMIN_USERNAME_KEY = "deployCode_admin_username";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(token, username) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (username) localStorage.setItem(ADMIN_USERNAME_KEY, username);
}

export function removeAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USERNAME_KEY);
}

export function getAdminUsername() {
  return localStorage.getItem(ADMIN_USERNAME_KEY) || "";
}

export function adminAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Administrator Login: POST /auth/admin/login
 * Form URL encoded payload: username, password
 */
export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Admin authentication failed";
    if (res.status === 401) {
      message = "Username or password is incorrect.";
    } else if (res.status === 403) {
      message = "Credentials are valid, but this account is not an administrator.";
    }
    throw { status: res.status, detail: message, ...data };
  }

  setAdminSession(data.access_token, username);
  return data;
}

/**
 * Get all deployments: GET /admin/deployments
 */
export async function getAdminDeployments() {
  const res = await fetch(`${API_BASE}/admin/deployments`, {
    headers: adminAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Failed to load deployments";
    if (res.status === 401) message = "Session expired or invalid token. Please log in again.";
    if (res.status === 403) message = "Access forbidden. Administrator privileges required.";
    throw { status: res.status, detail: message, ...data };
  }

  return data;
}

/**
 * Delete a deployment: DELETE /admin/deployments/{deployment_id}
 */
export async function deleteAdminDeployment(deploymentId) {
  const res = await fetch(`${API_BASE}/admin/deployments/${deploymentId}`, {
    method: "DELETE",
    headers: adminAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Failed to delete deployment";
    if (res.status === 404) message = "No deployment found with this ID.";
    if (res.status === 409) message = "The deployment is already being deleted.";
    if (res.status === 410) message = "The deployment was already deleted.";
    throw { status: res.status, detail: message, ...data };
  }

  return data;
}

/**
 * Get all users: GET /admin/users
 */
export async function getAdminUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: adminAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Failed to load users";
    if (res.status === 401) message = "Session expired or invalid token. Please log in again.";
    if (res.status === 403) message = "Access forbidden. Administrator privileges required.";
    throw { status: res.status, detail: message, ...data };
  }

  return data;
}

/**
 * Update user: PATCH /admin/users/{user_id}
 * Optional fields: username (1-50 chars), password (min 8 chars), is_admin (boolean)
 */
export async function updateAdminUser(userId, changes) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...adminAuthHeaders(),
    },
    body: JSON.stringify(changes),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Failed to update user";
    if (res.status === 400) message = "The request did not include any change.";
    if (res.status === 403) message = "You cannot change your own administrator role.";
    if (res.status === 404) message = "No user found with the supplied ID.";
    if (res.status === 409) message = "The username is already in use or the change would remove the final administrator.";
    if (res.status === 422) message = "One or more fields do not meet validation requirements.";
    throw { status: res.status, detail: message, ...data };
  }

  return data;
}

/**
 * Delete user: DELETE /admin/users/{user_id}
 * Returns 204 No Content on success
 */
export async function deleteAdminUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminAuthHeaders(),
  });

  if (res.status === 204) {
    return { success: true };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.detail || "Failed to delete user";
    if (res.status === 403) message = "You cannot delete your own administrator account.";
    if (res.status === 404) message = "No user found with the supplied ID.";
    if (res.status === 409) message = "This user has active deployments or is the final remaining administrator.";
    throw { status: res.status, detail: message, ...data };
  }

  return data;
}
