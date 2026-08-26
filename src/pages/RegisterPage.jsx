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
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10">
            <Rocket className="h-6 w-6 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Get started with cploy
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-400 hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
