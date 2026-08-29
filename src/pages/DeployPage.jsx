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
  Globe2,
  LockKeyhole,
  Loader2,
  Plus,
  Rocket,
  Server,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

const DEPLOYMENT_LIMIT = 2;
const MAX_ENVIRONMENT_VARIABLES = 100;
const INACTIVE_STATUSES = ["failed", "deleted"];
const ENVIRONMENT_VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const APP_NAME_PATTERN = /^(?=.{1,63}$)[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function getAppNameError(appName) {
  if (!appName) return "Enter an app name.";
  if (appName.length > 63) return "App names can be at most 63 characters.";
  if (!APP_NAME_PATTERN.test(appName)) {
    return "Use lowercase letters, numbers, and hyphens only. Start with a letter and do not end with a hyphen.";
  }
  return "";
}

function getRepoUrlError(repoUrl) {
  if (!repoUrl) return "Enter a GitHub repository URL.";

  try {
    const url = new URL(repoUrl);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
      return "Use an https://github.com/owner/repository URL.";
    }
    if (url.pathname.split("/").filter(Boolean).length < 2) {
      return "Include both the GitHub owner and repository name.";
    }
  } catch {
    return "Enter a valid GitHub repository URL.";
  }

  return "";
}

function getNodePortError(portValue) {
  if (!portValue || !String(portValue).trim()) {
    return "Enter a port for your Node app.";
  }

  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return "Use a valid port between 1 and 65535.";
  }

  return "";
}

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
  const [appNameError, setAppNameError] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoUrlError, setRepoUrlError] = useState("");
  const [deploymentType, setDeploymentType] = useState("vite");
  const [nodePort, setNodePort] = useState("3000");
  const [nodePortError, setNodePortError] = useState("");
  const [repoVisibility, setRepoVisibility] = useState(null);
  const [environmentVariables, setEnvironmentVariables] = useState([]);
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
      const data = await getMyProjects();
      setProjects(data || []);
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

  const addEnvironmentVariable = () => {
    if (environmentVariables.length < MAX_ENVIRONMENT_VARIABLES) {
      setEnvironmentVariables((variables) => [...variables, { key: "", value: "" }]);
    }
  };

  const updateEnvironmentVariable = (index, field, value) => {
    setEnvironmentVariables((variables) =>
      variables.map((variable, variableIndex) =>
        variableIndex === index ? { ...variable, [field]: value } : variable
      )
    );
  };

  const removeEnvironmentVariable = (index) => {
    setEnvironmentVariables((variables) =>
      variables.filter((_, variableIndex) => variableIndex !== index)
    );
  };

  const getEnvironmentVariablesPayload = () => {
    const values = {};

    for (const variable of environmentVariables) {
      const name = variable.key.trim();
      const value = variable.value;

      if (!name && !value) continue;
      if (!ENVIRONMENT_VARIABLE_NAME.test(name)) {
        throw new Error("Variable names must start with a letter or underscore and only use letters, numbers, and underscores.");
      }
      if (Object.prototype.hasOwnProperty.call(values, name)) {
        throw new Error(`The variable name ${name} is used more than once.`);
      }
      if (/\r|\n/.test(value)) {
        throw new Error(`The value for ${name} cannot contain line breaks.`);
      }
      values[name] = value;
    }

    return values;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeployError(null);

    try {
      if (hasReachedLimit) {
        setDeployError("You already have 2 active projects. Delete one to deploy another.");
        return;
      }

      const appName = imageName.trim();
      const validationError = getAppNameError(appName);
      if (validationError) {
        setAppNameError(validationError);
        return;
      }
      if (activeProjects.some((project) => project.image_name === appName)) {
        setAppNameError("You already have an active project using this app name.");
        return;
      }

      const normalizedRepoUrl = repoUrl.trim();
      const repositoryError = getRepoUrlError(normalizedRepoUrl);
      if (repositoryError) {
        setRepoUrlError(repositoryError);
        return;
      }
      setRepoUrlError("");

      if (deploymentType === "node") {
        const portError = getNodePortError(nodePort);
        if (portError) {
          setNodePortError(portError);
          return;
        }
        setNodePortError("");
      }

      const result = await startDeploy(
        appName,
        normalizedRepoUrl,
        getEnvironmentVariablesPayload(),
        {
          deploymentType,
          port: deploymentType === "node" ? Number(nodePort) : undefined,
        }
      );

      const visibility = result.repo_visibility || "public";
      setRepoVisibility(visibility);

      setDeployment({
        deployment_id: result.deployment_id,
        image_name: appName,
        repo_url: normalizedRepoUrl,
        repo_visibility: visibility,
        port: result.port || (deploymentType === "node" ? Number(nodePort) : undefined),
        deployment_type: deploymentType,
        status: "pending",
      });
      setProjects((currentProjects) => [
        {
          id: result.deployment_id,
          image_name: appName,
          repo_url: normalizedRepoUrl,
          repo_visibility: visibility,
          port: result.port || (deploymentType === "node" ? Number(nodePort) : undefined),
          deployment_type: deploymentType,
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
      if (err.status === 400) {
        setRepoVisibility("private");
        setDeployError("This repository is private or unavailable. The API accepts public GitHub repositories only.");
      } else {
        setDeployError(err.detail || err.message || "Failed to start deployment");
      }
    } finally {
      setIsDeploying(false);
    }
  };

  const handleReset = () => {
    setDeployment(null);
    setDeployError(null);
    setImageName("");
    setAppNameError("");
    setRepoUrl("");
    setRepoUrlError("");
    setDeploymentType("vite");
    setNodePort("3000");
    setNodePortError("");
    setRepoVisibility(null);
    setEnvironmentVariables([]);
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
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 px-3 sm:px-6">
      {/* Decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-16 top-28 h-44 w-44 rotate-12 rounded-3xl border-2 border-black bg-lime-300 opacity-20" />
        <div className="absolute -left-8 bottom-20 h-28 w-28 -rotate-12 rounded-full border-2 border-black bg-cyan-300 opacity-20" />
        <div className="absolute right-1/4 bottom-12 h-20 w-20 rotate-45 rounded-xl border-2 border-black bg-yellow-300 opacity-15" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border-2 border-black bg-yellow-300 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-brutal-sm mb-3 sm:mb-4">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
            Deploy Panel
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
            Deploy your app
          </h1>
          <p className="mt-1 text-sm sm:text-base md:text-lg font-medium text-gray-600">
            Deploy a Vite + React app from a GitHub repository in seconds.
          </p>
          <div className="mt-3 sm:mt-4 flex flex-wrap w-fit items-center gap-2 sm:gap-3 rounded-xl border-2 border-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 shadow-brutal-sm">
            <span className="text-xs sm:text-sm font-bold">Project slots</span>
            <span className={`rounded-md px-2 py-0.5 text-xs sm:text-sm font-black ${hasReachedLimit ? "bg-red-200 text-red-700" : "bg-lime-300 text-black"}`}>
              {activeProjects.length} / {DEPLOYMENT_LIMIT}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-gray-500">
              {hasReachedLimit ? "Delete a project to free a slot" : `${DEPLOYMENT_LIMIT - activeProjects.length} available`}
            </span>
          </div>
        </div>

        <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Deploy Form */}
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg font-bold text-black">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border-2 border-black bg-blue-300">
                <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
              </div>
              Configuration
            </h2>

            {deployError && (
              <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-xs sm:text-sm font-bold text-red-600 shadow-brutal-red">
                ⚠ {deployError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 p-3 sm:p-4">
                <h3 className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-wide text-black">
                  Deployment Type
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDeploymentType("vite")}
                    className={`btn-brutal w-full px-3 py-2.5 text-xs sm:text-sm font-bold ${
                      deploymentType === "vite"
                        ? "bg-lime-300 text-black"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    Vite + React
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeploymentType("node")}
                    className={`btn-brutal w-full px-3 py-2.5 text-xs sm:text-sm font-bold ${
                      deploymentType === "node"
                        ? "bg-lime-300 text-black"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    Node.js
                  </button>
                </div>
              </div>

              <InputField
                label="App Name"
                id="imageName"
                value={imageName}
                onChange={(e) => {
                  const value = e.target.value;
                  setImageName(value);
                  if (appNameError) setAppNameError(getAppNameError(value.trim()));
                }}
                onBlur={() => setAppNameError(getAppNameError(imageName.trim()))}
                placeholder={deploymentType === "node" ? "my-node-api" : "my-react-app"}
                icon={Box}
                error={appNameError}
                helperText="Lowercase, 1–63 characters. Use letters, numbers, and internal hyphens."
                required
              />

              <InputField
                label="GitHub Repository URL"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (repoUrlError) setRepoUrlError(getRepoUrlError(e.target.value.trim()));
                  if (repoVisibility === "private") setRepoVisibility(null);
                }}
                onBlur={() => setRepoUrlError(getRepoUrlError(repoUrl.trim()))}
                placeholder="https://github.com/user/repo.git"
                icon={GitBranch}
                error={repoUrlError}
                helperText="Public GitHub repositories are supported. Private or unavailable repositories are rejected by the API."
                required
              />

              {deploymentType === "node" && (
                <InputField
                  label="Node Port"
                  id="nodePort"
                  type="number"
                  min="1"
                  max="65535"
                  value={nodePort}
                  onChange={(e) => {
                    setNodePort(e.target.value);
                    if (nodePortError) setNodePortError(getNodePortError(e.target.value));
                  }}
                  onBlur={() => setNodePortError(getNodePortError(nodePort))}
                  placeholder="3000"
                  icon={Server}
                  error={nodePortError}
                  helperText="Choose an available port that your Node app listens on."
                  required
                />
              )}

              {repoVisibility && (
                <div className={`flex items-start gap-3 rounded-xl border-2 p-3 text-xs font-bold ${repoVisibility === "public" ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-red-500 bg-red-100 text-red-700"}`}>
                  {repoVisibility === "public" ? <Globe2 className="mt-0.5 h-4 w-4 shrink-0" /> : <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>
                    {repoVisibility === "public" ? "Public repository confirmed. Ready to deploy." : "Private or unavailable repository. Use a public GitHub repository URL."}
                  </span>
                </div>
              )}

              {/* Environment Variables Editor */}
              <div className="rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-black">
                      Environment variables
                    </h3>
                    <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-gray-600">
                      Add build or runtime config. Keys are passed to your deployment.
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 shrink-0">
                    {environmentVariables.length} / {MAX_ENVIRONMENT_VARIABLES}
                  </span>
                </div>

                {environmentVariables.length > 0 && (
                  <div className="space-y-2.5">
                    {environmentVariables.map((variable, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-600">
                          Name
                          <input
                            type="text"
                            value={variable.key}
                            onChange={(event) => updateEnvironmentVariable(index, "key", event.target.value)}
                            placeholder="VITE_API_URL"
                            autoComplete="off"
                            className="input-brutal mt-1 py-1.5 sm:py-2 text-xs sm:text-sm"
                          />
                        </label>
                        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-600">
                          Value
                          <input
                            type="text"
                            value={variable.value}
                            onChange={(event) => updateEnvironmentVariable(index, "value", event.target.value)}
                            placeholder="https://api.example.com"
                            autoComplete="off"
                            className="input-brutal mt-1 py-1.5 sm:py-2 text-xs sm:text-sm"
                          />
                        </label>
                        <div className="flex justify-end sm:block">
                          <button
                            type="button"
                            onClick={() => removeEnvironmentVariable(index)}
                            aria-label={`Remove variable ${index + 1}`}
                            className="btn-brutal h-8 sm:h-10 border-red-500 bg-red-100 px-2.5 sm:px-3 py-1 text-red-700 hover:bg-red-200 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                            <span className="sm:hidden ml-1">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addEnvironmentVariable}
                  disabled={environmentVariables.length >= MAX_ENVIRONMENT_VARIABLES}
                  className="btn-brutal mt-3 border-[#172a45] bg-[#f6c445] px-3 py-1.5 text-xs text-[#172a45] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Add variable
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDeploying || hasReachedLimit || (deployment && deployment.status !== "success" && deployment.status !== "failed" && deployment.status !== "deleted")}
                  className="btn-brutal w-full bg-lime-400 text-black hover:bg-lime-300 py-3 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      Starting deployment...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" strokeWidth={2.5} />
                      {deploymentType === "node" ? "Deploy Node App" : "Deploy App"}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help text */}
            <div className="mt-5 sm:mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3.5 sm:p-4">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 sm:mb-3">
                ⓘ Requirements & Details
              </p>
              <ul className="space-y-1.5 text-[11px] sm:text-xs font-medium text-gray-600">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-black bg-lime-400 text-center text-[9px] font-bold leading-3">✓</span>
                  GitHub repo must contain a Vite + React project (root or subfolder supported)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-black bg-lime-400 text-center text-[9px] font-bold leading-3">✓</span>
                  App name must be unique across all active deployments
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-black bg-lime-400 text-center text-[9px] font-bold leading-3">✓</span>
                  {deploymentType === "node"
                    ? "Choose a free host port for your Node.js service."
                    : "Port is automatically assigned in range 10000–40000"}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-black bg-lime-400 text-center text-[9px] font-bold leading-3">✓</span>
                  Add up to 100 environment variables when needed
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-black bg-yellow-300 text-center text-[9px] font-bold leading-3">★</span>
                  <span>Live URL: <code className="rounded border border-black bg-white px-1 py-0.5 font-mono text-[10px] font-bold">&lt;name&gt;.dev-saurabh-k.xyz</code></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Status Card & Projects List */}
          <div className="min-w-0 space-y-5">
            {deployment ? (
              <DeployStatusCard
                deployment={deployment}
                onReset={handleReset}
              />
            ) : (
              <div className="flex h-full min-h-[220px] sm:min-h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12">
                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300">
                    <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-gray-300" strokeWidth={2} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-400">
                    Deployment status
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium text-gray-400">
                    Live build logs and URL will appear here
                  </p>
                </div>
              </div>
            )}

            {/* My Projects */}
            <div className="card-brutal overflow-hidden p-4 sm:p-5">
              <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-bold text-black">Your projects</h2>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">
                  {isLoadingProjects ? "Loading" : `${activeProjects.length} active`}
                </span>
              </div>
              {projects.length === 0 && !isLoadingProjects ? (
                <p className="text-xs sm:text-sm font-medium text-gray-500">No projects yet. Your first deployment will appear here.</p>
              ) : (
                <div className="max-h-[26rem] space-y-2.5 sm:space-y-3 overflow-y-auto pr-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="relative flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl border-2 border-black bg-white p-2.5 sm:p-3 shadow-brutal-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-bold text-xs sm:text-sm text-black">{project.image_name}</p>
                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${project.repo_visibility === "private" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                            {project.repo_visibility === "private" ? <LockKeyhole className="h-3 w-3" /> : <Globe2 className="h-3 w-3" />}
                            {project.repo_visibility === "private" ? "Private" : "Public"}
                          </span>
                          {project.domain && (
                            <a
                              href={`https://${project.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open ${project.image_name}`}
                              className="text-blue-700 hover:text-blue-900 shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </a>
                          )}
                        </div>
                        <p className="truncate text-[10px] sm:text-xs font-medium capitalize text-gray-500 mt-0.5">
                          {project.domain || project.status}
                        </p>
                      </div>
                      {!INACTIVE_STATUSES.includes(project.status) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          disabled={deletingId === project.id}
                          className="btn-brutal shrink-0 bg-red-200 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-black hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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

        {/* Coming Soon Section */}
        <section className="relative z-0 mt-8 clear-both w-full card-brutal p-4 sm:p-6">
          <div className="mb-4 sm:mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 sm:mb-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-pink-200 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                Coming soon
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-black">More ways to deploy</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-gray-600">
                We’re expanding deployCode beyond Vite + React.
              </p>
            </div>
            <span className="w-fit rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-gray-600">
              In Development
            </span>
          </div>

          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-3">
            {COMING_SOON_STACKS.map((stack) => {
              const StackIcon = stack.icon;
              return (
                <div
                  key={stack.name}
                  className="flex items-center gap-2.5 sm:gap-3 rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 p-2.5 sm:p-3 opacity-80"
                >
                  <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black ${stack.color}`}>
                    <StackIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-black truncate">{stack.name}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">{stack.type}</p>
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
