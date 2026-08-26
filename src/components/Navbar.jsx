import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
            <Rocket className="h-4 w-4 text-primary-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            c<span className="text-primary-400">ploy</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  location.pathname === "/login"
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
