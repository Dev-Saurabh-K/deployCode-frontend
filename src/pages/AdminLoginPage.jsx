import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import InputField from "../components/InputField";
import { Shield, Lock, User, Loader2, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin, isLoading, error, clearError } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(username, password);
      navigate("/admin");
    } catch {
      // Error handled in AdminContext
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:py-20">
      {/* Decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-12 top-24 h-40 w-40 rotate-12 rounded-3xl border-2 border-[#172a45] bg-[#f6c445] opacity-20" />
        <div className="absolute -right-8 top-44 h-32 w-32 -rotate-12 rounded-full border-2 border-[#172a45] bg-[#e63946] opacity-25" />
        <div className="absolute bottom-16 left-1/4 h-24 w-24 rotate-45 rounded-2xl border-2 border-[#172a45] bg-[#1d5fa7] opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Badge & Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-2.5 sm:mb-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border-2 border-[#172a45] bg-[#e63946] px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#172a45]">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
            Restricted Area
          </div>
          <div className="mt-2 flex justify-center">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 border-[#172a45] bg-[#f6c445] shadow-[4px_4px_0_#172a45]">
              <KeyRound className="h-7 w-7 sm:h-8 sm:w-8 text-[#172a45]" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black tracking-tight text-[#172a45]">
            Admin Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-bold text-gray-600 px-2">
            Sign in with administrator credentials to manage all users and deployments
          </p>
        </div>

        {/* Card */}
        <div className="card-brutal p-5 sm:p-8">
          {error && (
            <div className="mb-4 sm:mb-5 flex items-start gap-2.5 rounded-xl border-2 border-[#e63946] bg-red-100 p-3 sm:p-3.5 text-xs sm:text-sm font-bold text-[#e63946] shadow-[2px_2px_0_#e63946]">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" strokeWidth={2.5} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <InputField
              label="Admin Username"
              id="admin-username"
              value={username}
              onChange={(e) => {
                clearError();
                setUsername(e.target.value);
              }}
              placeholder="e.g. admin"
              icon={User}
              required
            />

            <InputField
              label="Admin Password"
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="Enter admin password"
              icon={Lock}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-brutal w-full bg-[#e63946] text-white hover:bg-[#c92f3b] py-2.5 sm:py-3 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Verifying Admin Access...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" strokeWidth={2.5} />
                  Authenticate Administrator
                </>
              )}
            </button>
          </form>

          {/* Helper details */}
          <div className="mt-5 sm:mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3.5 sm:p-4 text-[11px] sm:text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[#172a45]">
              <Shield className="h-3.5 w-3.5 text-[#e63946]" strokeWidth={2.5} />
              Bootstrap Credentials
            </div>
            <p className="mt-1 leading-relaxed">
              The primary administrator is configured via the host environment variables <code className="rounded border border-[#172a45] bg-white px-1 py-0.5 font-mono text-[10px] font-bold">CPLOY_ADMIN_USERNAME</code> and <code className="rounded border border-[#172a45] bg-white px-1 py-0.5 font-mono text-[10px] font-bold">CPLOY_ADMIN_PASSWORD</code>.
            </p>
          </div>

          {/* Return link */}
          <div className="mt-5 sm:mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#172a45] hover:text-[#1d5fa7]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Return to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
