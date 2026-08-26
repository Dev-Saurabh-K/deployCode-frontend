import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import DeployStatusCard from "../components/DeployStatusCard";
import { startDeploy, watchDeploy } from "../api/deploy";
import {
  Box,
  Globe,
  GitBranch,
  Loader2,
  Rocket,
} from "lucide-react";

export default function DeployPage() {
  const [imageName, setImageName] = useState("");
  const [port, setPort] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeployError(null);

    try {
      const result = await startDeploy(imageName, port, repoUrl);

      setDeployment({
        deployment_id: result.deployment_id,
        image_name: imageName,
        port,
        repo_url: repoUrl,
        status: "pending",
      });

      // Start polling
      await watchDeploy(result.deployment_id, (status) => {
        setDeployment((prev) => ({ ...prev, ...status }));
      });
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setDeployError(err.detail || "Failed to start deployment");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleReset = () => {
    setDeployment(null);
    setDeployError(null);
    setImageName("");
    setPort("");
    setRepoUrl("");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Deploy your app
          </h1>
          <p className="mt-2 text-gray-400">
            Deploy a Vite + React app from a GitHub repository in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Deploy Form */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Deployment Configuration
            </h2>

            {deployError && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {deployError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Image Name"
                id="imageName"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="my-react-app"
                icon={Box}
                required
              />

              <InputField
                label="Port"
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="10005"
                icon={Globe}
                required
              />

              <InputField
                label="GitHub Repository URL"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                icon={GitBranch}
                required
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDeploying || (deployment && deployment.status !== "success" && deployment.status !== "failed")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white transition-all hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting deployment...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Deploy
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help text */}
            <div className="mt-6 rounded-xl bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                Requirements
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• GitHub repo must contain a Vite + React project</li>
                <li>• Image name must be unique across all deployments</li>
                <li>• Port must not be in use by another service</li>
                <li>
                  • Your app will be available at{" "}
                  <code className="text-primary-400">
                    &lt;image_name&gt;.dev-saurabh-k.xyz
                  </code>
                </li>
              </ul>
            </div>
          </div>

          {/* Status Card */}
          <div>
            {deployment ? (
              <DeployStatusCard
                deployment={deployment}
                onReset={handleReset}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 p-12">
                <div className="text-center">
                  <Rocket className="mx-auto h-10 w-10 text-gray-700" />
                  <p className="mt-3 text-sm text-gray-600">
                    Your deployment status will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
