import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import { User, Lock, Loader2, Rocket } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/deploy");
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-10 top-20 h-32 w-32 rotate-12 rounded-2xl border-2 border-black bg-yellow-300 opacity-30" />
        <div className="absolute -right-5 top-40 h-24 w-24 -rotate-6 rounded-full border-2 border-black bg-red-400 opacity-30" />
        <div className="absolute bottom-20 left-1/4 h-20 w-20 rotate-45 rounded-xl border-2 border-black bg-blue-300 opacity-20" />
        <div className="absolute bottom-32 right-1/3 h-16 w-16 rounded-full border-2 border-black bg-yellow-300 opacity-25" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#172a45] bg-[#1d5fa7] shadow-[4px_4px_0_#172a45]">
            <Rocket className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Welcome back!
          </h1>
          <p className="mt-1 text-base font-medium text-gray-600">
            Sign in to your deployCode account
          </p>
        </div>

        {/* Card */}
        <div className="card-brutal p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-sm font-bold text-red-600 shadow-brutal-red">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Username"
              id="username"
              value={username}
              onChange={(e) => {
                clearError();
                setUsername(e.target.value);
              }}
              placeholder="Enter your username"
              icon={User}
              required
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              icon={Lock}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-brutal w-full bg-[#1d5fa7] text-white hover:bg-[#174f8c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Signing in...
                </>
              ) : (
                "→ Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 p-3 text-center">
            <p className="text-sm font-medium text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-black underline decoration-2 underline-offset-2 hover:decoration-lime-500"
              >
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
