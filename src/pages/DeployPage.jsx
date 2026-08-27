import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import DeployStatusCard from "../components/DeployStatusCard";
import {
  deleteDeployment,
  getMyProjects,
  startDeploy,
  watchDeploy,
} from "../api/deploy";
import {
  Box,
  Code2,
  ExternalLink,
  GitBranch,
  Loader2,
  Rocket,
  Server,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

const DEPLOYMENT_LIMIT = 2;
const INACTIVE_STATUSES = ["failed", "deleted"];
const COMING_SOON_STACKS = [
  { name: "Next.js", type: "Frontend", icon: Code2, color: "bg-blue-200" },
  { name: "Vue.js", type: "Frontend", icon: Code2, color: "bg-emerald-200" },
  { name: "Node.js", type: "Backend", icon: Server, color: "bg-lime-300" },
  { name: "Express.js", type: "Backend", icon: Server, color: "bg-yellow-300" },
  { name: "FastAPI", type: "Backend", icon: Server, color: "bg-cyan-300" },
  { name: "More stacks", type: "Frontend & backend", icon: Sparkles, color: "bg-pink-200" },
];

export default function DeployPage() {
  const [imageName, setImageName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      setProjects(await getMyProjects());
    } catch (err) {
      if (err.status === 401) {
        handleAuthError();
        return;
      }
      setDeployError(err.detail || "Could not load your projects");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const activeProjects = useMemo(
    () => projects.filter((project) => !INACTIVE_STATUSES.includes(project.status)),
    [projects]
  );
  const hasReachedLimit = activeProjects.length >= DEPLOYMENT_LIMIT;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeployError(null);

    try {
      if (hasReachedLimit) {
        setDeployError("You already have 2 active projects. Delete one to deploy another.");
        return;
      }

      const result = await startDeploy(imageName, repoUrl);

      setDeployment({
        deployment_id: result.deployment_id,
        image_name: imageName,
        repo_url: repoUrl,
        status: "pending",
      });
      setProjects((currentProjects) => [
        {
          id: result.deployment_id,
          image_name: imageName,
          repo_url: repoUrl,
          status: "pending",
        },
        ...currentProjects,
      ]);

      // Start polling
      await watchDeploy(result.deployment_id, (status) => {
        setDeployment((prev) => ({ ...prev, ...status }));
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === result.deployment_id ? { ...project, ...status } : project
          )
        );
      });
    } catch (err) {
      if (err.status === 401) {
        handleAuthError();
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
    setRepoUrl("");
  };

  const handleDelete = async (project) => {
    setDeletingId(project.id);
    setDeployError(null);
    try {
      await deleteDeployment(project.id);
      setProjects((currentProjects) =>
        currentProjects.map((item) =>
          item.id === project.id ? { ...item, status: "deleting" } : item
        )
      );
      await watchDeploy(
        project.id,
        (status) => {
          setProjects((currentProjects) =>
            currentProjects.map((item) =>
              item.id === project.id ? { ...item, ...status } : item
            )
          );
        },
        3000,
        ["deleted", "failed"]
      );
      await loadProjects();
    } catch (err) {
      if (err.status === 401) {
        handleAuthError();
        return;
      }
      setDeployError(err.detail || "Could not delete this project");
      await loadProjects();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-16 top-28 h-44 w-44 rotate-12 rounded-3xl border-2 border-black bg-lime-300 opacity-20" />
        <div className="absolute -left-8 bottom-20 h-28 w-28 -rotate-12 rounded-full border-2 border-black bg-cyan-300 opacity-20" />
        <div className="absolute right-1/4 bottom-12 h-20 w-20 rotate-45 rounded-xl border-2 border-black bg-yellow-300 opacity-15" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-bold uppercase tracking-widest shadow-brutal-sm mb-4">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
            Deploy Panel
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Deploy your app
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-600">
            Deploy a Vite + React app from a GitHub repository in seconds.
          </p>
          <div className="mt-4 flex w-fit items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-2 shadow-brutal-sm">
            <span className="text-sm font-bold">Project slots</span>
            <span className={`rounded-md px-2 py-0.5 text-sm font-black ${hasReachedLimit ? "bg-red-200 text-red-700" : "bg-lime-300 text-black"}`}>
              {activeProjects.length} / {DEPLOYMENT_LIMIT}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {hasReachedLimit ? "Delete a project to free a slot" : `${DEPLOYMENT_LIMIT - activeProjects.length} available`}
            </span>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Deploy Form */}
          <div className="card-brutal p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-black">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-blue-300">
                <Rocket className="h-4 w-4" strokeWidth={2.5} />
              </div>
              Configuration
            </h2>

            {deployError && (
              <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-sm font-bold text-red-600 shadow-brutal-red">
                ⚠ {deployError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="App Name"
                id="imageName"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="my-react-app"
                icon={Box}
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
                  disabled={isDeploying || hasReachedLimit || (deployment && deployment.status !== "success" && deployment.status !== "failed")}
                  className="btn-brutal w-full bg-lime-400 text-black hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      Starting deployment...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" strokeWidth={2.5} />
                      Deploy
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help text */}
            <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                ⓘ Requirements
              </p>
              <ul className="space-y-1.5 text-xs font-medium text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 rounded border-2 border-black bg-lime-400 text-center text-[10px] font-bold leading-3">✓</span>
                  GitHub repo must contain a Vite + React project
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 rounded border-2 border-black bg-lime-400 text-center text-[10px] font-bold leading-3">✓</span>
                  App name must be unique across all deployments
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 rounded border-2 border-black bg-lime-400 text-center text-[10px] font-bold leading-3">✓</span>
                  Your port is assigned automatically when deployment starts
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 rounded border-2 border-black bg-yellow-300 text-center text-[10px] font-bold leading-3">★</span>
                  <span>Your app will be live at <code className="rounded border border-black bg-white px-1 py-0.5 font-mono text-[10px] font-bold">&lt;name&gt;.dev-saurabh-k.xyz</code></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Status Card */}
          <div className="min-w-0 space-y-5">
            {deployment ? (
              <DeployStatusCard
                deployment={deployment}
                onReset={handleReset}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300">
                    <Rocket className="h-8 w-8 text-gray-300" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                    Deployment status
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-400">
                    Will appear here after you deploy
                  </p>
                </div>
              </div>
            )}

            <div className="card-brutal overflow-hidden p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-black">Your projects</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {isLoadingProjects ? "Loading" : `${activeProjects.length} active`}
                </span>
              </div>
              {projects.length === 0 && !isLoadingProjects ? (
                <p className="text-sm font-medium text-gray-500">No projects yet. Your first deployment will appear here.</p>
              ) : (
                <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`relative flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white p-3 shadow-brutal-sm ${
                        project.domain ? "transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none" : ""
                      }`}
                    >
                      {project.domain && (
                        <a
                          href={`https://${project.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.image_name}`}
                          className="absolute inset-0 z-0"
                        />
                      )}
                      <div className="relative z-10 min-w-0 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-bold text-black">{project.image_name}</p>
                          {project.domain && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-700" strokeWidth={2.5} />}
                        </div>
                        <p className="truncate text-xs font-medium capitalize text-gray-500">
                          {project.domain ? project.domain : project.status}
                        </p>
                      </div>
                      {!INACTIVE_STATUSES.includes(project.status) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          disabled={deletingId === project.id}
                          className="btn-brutal relative z-10 shrink-0 bg-red-300 px-3 py-2 text-xs text-black hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="relative z-0 mt-8 clear-both w-full card-brutal p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border-2 border-black bg-pink-200 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                Coming soon
              </div>
              <h2 className="text-xl font-bold text-black">More ways to deploy</h2>
              <p className="mt-1 text-sm font-medium text-gray-600">
                We’re expanding deployCode beyond Vite + React.
              </p>
            </div>
            <span className="w-fit rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
              Not available yet
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON_STACKS.map((stack) => {
              const StackIcon = stack.icon;
              return (
                <div
                  key={stack.name}
                  className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 p-3 opacity-75"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black ${stack.color}`}>
                    <StackIcon className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-black">{stack.name}</p>
                    <p className="text-xs font-medium text-gray-500">{stack.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
