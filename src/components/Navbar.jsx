import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import ThemeToggle from "./ThemeToggle";
import { Rocket, LogOut, Shield } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, username } = useAuth();
  const { isAdminAuthenticated } = useAdmin();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <nav className="fixed top-0 z-50 w-full border-b-2 border-[#172a45] bg-[#fffdf7]">
      {/* Top support banner */}
      <div className="border-b-2 border-[#172a45] bg-[#e63946] px-2 sm:px-4 py-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.05em] sm:tracking-[0.08em] text-white">
        Support the developer · Contact for donations:{" "}
        <a href="tel:6203321011" className="underline decoration-2 underline-offset-2 hover:text-[#f6c445] inline-block whitespace-nowrap">
          6203321011
        </a>
      </div>

      {/* Main navigation container */}
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-[#172a45] bg-[#e63946] shadow-[2px_2px_0_#172a45] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
            <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="brand-name text-lg sm:text-xl font-black tracking-tight text-[#172a45]">
            deployCode
          </span>
          {isAdminRoute && (
            <span className="hidden xs:inline-flex items-center gap-1 rounded-md border border-[#172a45] bg-[#f6c445] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#172a45]">
              <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
              Admin
            </span>
          )}
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />

          {/* Quick link to Admin Portal if authenticated or on admin pages */}
          {isAdminAuthenticated ? (
            <Link
              to="/admin"
              className={`border-2 border-[#172a45] px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                isAdminRoute
                  ? "bg-[#e63946] text-white shadow-[2px_2px_0_#172a45]"
                  : "bg-[#f6c445] text-[#172a45] hover:bg-yellow-300"
              }`}
            >
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          ) : (
            !isAdminRoute && (
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-1 border-2 border-[#172a45] bg-gray-100 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-700 hover:bg-[#f6c445] hover:text-[#172a45] transition-colors"
                title="Administrator Access"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
            )
          )}

          {/* Regular User Auth Buttons */}
          {isAuthenticated ? (
            <>
              <span
                title={username || "Signed-in user"}
                className="hidden md:inline max-w-32 truncate border-2 border-[#172a45] bg-[#f6c445] px-2.5 py-1.5 text-xs font-bold text-[#172a45]"
              >
                {username || "Account"}
              </span>
              <button
                onClick={logout}
                className="btn-brutal border-[#172a45] bg-[#e63946] py-1.5 sm:py-2 px-2.5 sm:px-4 text-white hover:bg-[#c92f3b] text-xs sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            !isAdminRoute && (
              <>
                <Link
                  to="/login"
                  className={`border-2 border-[#172a45] px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wide transition-all ${
                    location.pathname === "/login"
                      ? "bg-[#f6c445] shadow-[2px_2px_0_#172a45]"
                      : "bg-[#fffdf7] hover:bg-[#f6c445]"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-brutal bg-[#1d5fa7] py-1.5 sm:py-2 px-2.5 sm:px-4 text-white hover:bg-[#174f8c] text-xs sm:text-sm"
                >
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
