import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import { User, Lock, Loader2, Rocket } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (username.length < 1) errors.username = "Username is required";
    if (password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(username, password);
      navigate("/login");
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-20 sm:pt-24 pb-12 px-4">
      {/* Decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-10 top-24 h-36 w-36 -rotate-12 rounded-2xl border-2 border-black bg-cyan-300 opacity-30" />
        <div className="absolute -left-5 top-48 h-24 w-24 rotate-6 rounded-full border-2 border-black bg-yellow-300 opacity-30" />
        <div className="absolute bottom-24 right-1/4 h-20 w-20 -rotate-45 rounded-xl border-2 border-black bg-pink-300 opacity-20" />
        <div className="absolute bottom-40 left-1/3 h-14 w-14 rounded-full border-2 border-black bg-yellow-300 opacity-25" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-3 sm:mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-[#172a45] bg-[#e63946] shadow-[4px_4px_0_#172a45]">
            <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Create your account
          </h1>
          <p className="mt-1 text-sm sm:text-base font-medium text-gray-600">
            Get started with deployCode
          </p>
        </div>

        {/* Card */}
        <div className="card-brutal p-5 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-xs sm:text-sm font-bold text-red-600 shadow-brutal-red">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <InputField
              label="Username"
              id="username"
              value={username}
              onChange={(e) => {
                clearError();
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
                setUsername(e.target.value);
              }}
              placeholder="Choose a username"
              icon={User}
              error={fieldErrors.username}
              required
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                clearError();
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
                setPassword(e.target.value);
              }}
              placeholder="Create a password"
              icon={Lock}
              error={fieldErrors.password}
              required
            />

            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
                setConfirmPassword(e.target.value);
              }}
              placeholder="Confirm your password"
              icon={Lock}
              error={fieldErrors.confirmPassword}
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
                  Creating account...
                </>
              ) : (
                "→ Create Account"
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 rounded-xl border-2 border-dashed border-gray-300 p-3 text-center">
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-black underline decoration-2 underline-offset-2 hover:decoration-pink-500"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
