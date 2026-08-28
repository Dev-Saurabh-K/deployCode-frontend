import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  adminLogin as apiAdminLogin,
  getAdminToken,
  getAdminUsername,
  removeAdminSession,
} from "../api/admin";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminToken, setAdminToken] = useState(getAdminToken());
  const [adminUsername, setAdminUsername] = useState(getAdminUsername());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdminAuthenticated = !!adminToken;

  const adminLogin = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiAdminLogin(username, password);
      setAdminToken(data.access_token);
      setAdminUsername(username);
      return data;
    } catch (err) {
      const msg = err.detail || "Admin login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = useCallback(() => {
    removeAdminSession();
    setAdminToken(null);
    setAdminUsername("");
    setError(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <AdminContext.Provider
      value={{
        adminToken,
        adminUsername,
        isAdminAuthenticated,
        isLoading,
        error,
        adminLogin,
        adminLogout,
        clearError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
