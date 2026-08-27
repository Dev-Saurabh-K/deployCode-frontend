import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Rocket, LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 z-50 w-full border-b-2 border-[#172a45] bg-[#fffdf7]">
      <div className="border-b-2 border-[#172a45] bg-[#e63946] px-4 py-1.5 text-center text-xs font-bold uppercase tracking-[0.08em] text-white">
        Support the developer · Contact for donations: {" "}
        <a href="tel:6203321011" className="underline decoration-2 underline-offset-2 hover:text-[#f6c445]">
          6203321011
        </a>
      </div>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#172a45] bg-[#e63946] shadow-[2px_2px_0_#172a45] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
            <Rocket className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-[#172a45]">
            deployCode
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="btn-brutal border-[#172a45] bg-[#e63946] py-2 px-4 text-white hover:bg-[#c92f3b]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`border-2 border-[#172a45] px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
                  location.pathname === "/login"
                    ? "bg-[#f6c445] shadow-[2px_2px_0_#172a45]"
                    : "bg-[#fffdf7] hover:bg-[#f6c445]"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-brutal bg-[#1d5fa7] py-2 px-4 text-white hover:bg-[#174f8c]"
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
