import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 z-50 w-full border-b-3 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-lime-400 shadow-brutal-sm transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
            <Rocket className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-black">
            cploy
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="btn-brutal border-red-500 bg-red-100 text-red-600 shadow-brutal-red hover:bg-red-200 py-2 px-4"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-xl border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
                  location.pathname === "/login"
                    ? "bg-yellow-300 shadow-brutal-sm"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-brutal bg-lime-400 text-black hover:bg-lime-300 py-2 px-4"
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
