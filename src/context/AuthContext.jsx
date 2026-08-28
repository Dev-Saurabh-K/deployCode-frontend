import { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getToken,
  removeToken,
} from "../api/auth";

const AuthContext = createContext(null);
const USERNAME_KEY = "deployCode_username";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiLogin(username, password);
      setToken(data.access_token);
      localStorage.setItem(USERNAME_KEY, username);
      setUsername(username);
      return data;
    } catch (err) {
      setError(err.detail || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRegister(username, password);
      return data;
    } catch (err) {
      setError(err.detail || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername("");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
