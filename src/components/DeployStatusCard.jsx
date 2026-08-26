import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    description: "Waiting for the build to start...",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    animate: "animate-pulse-slow",
  },
  running: {
    icon: Loader2,
    label: "Deploying",
    description: "Building and deploying your app...",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    animate: "animate-spin",
  },
  success: {
    icon: CheckCircle2,
    label: "Deployed",
    description: "Your app is live!",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    animate: "",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    description: "Something went wrong during deployment.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    animate: "",
  },
};

const STEPS = [
  "Creating deployment",
  "Generating Docker config",
  "Cloning repository",
  "Building container",
  "Configuring proxy",
];

export default function DeployStatusCard({ deployment, onReset }) {
  if (!deployment) return null;

  const config = STATUS_CONFIG[deployment.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const activeStep =
    deployment.status === "pending"
      ? 0
      : deployment.status === "running"
      ? 2
      : STEPS.length;

  return (
    <div
      className={`rounded-2xl border ${config.border} ${config.bg} p-6 backdrop-blur-sm transition-all duration-500`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-full ${config.bg} p-2`}>
          <StatusIcon className={`h-5 w-5 ${config.color} ${config.animate}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${config.color}`}>
            {config.label}
          </h3>
          <p className="text-sm text-gray-400">{config.description}</p>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="mb-6 space-y-2 rounded-xl bg-black/30 p-4">
        <InfoRow label="Image" value={deployment.image_name} />
        <InfoRow label="Port" value={deployment.port} />
        <InfoRow label="Repo" value={deployment.repo_url} isUrl />
      </div>

      {/* Pipeline Steps */}
      {(deployment.status === "pending" || deployment.status === "running") && (
        <div className="mb-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Pipeline
          </p>
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all ${
                  i < activeStep
                    ? "bg-primary-500 text-white"
                    : i === activeStep
                    ? "bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/30"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {i < activeStep ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i <= activeStep ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {step}
              </span>
              {i === activeStep && (
                <Loader2 className="h-3 w-3 animate-spin text-primary-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Success: Live Domain */}
      {deployment.status === "success" && deployment.domain && (
        <a
          href={`https://${deployment.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-emerald-400 transition-colors hover:bg-emerald-500/20"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm font-medium">
            https://{deployment.domain}
          </span>
        </a>
      )}

      {/* Failed: Error Message */}
      {deployment.status === "failed" && deployment.error_message && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-red-400">
            Error Details
          </p>
          <p className="mt-1 text-sm text-red-300">
            {deployment.error_message}
          </p>
        </div>
      )}

      {/* Reset Button */}
      {(deployment.status === "success" || deployment.status === "failed") && (
        <button
          onClick={onReset}
          className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
        >
          Deploy Another
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value, isUrl }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[240px] truncate text-primary-400 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-300">{value}</span>
      )}
    </div>
  );
}
