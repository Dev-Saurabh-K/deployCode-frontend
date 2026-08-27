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
    color: "text-yellow-700",
    bg: "bg-yellow-200",
    border: "border-yellow-500",
    shadowClass: "shadow-brutal-yellow",
    animate: "animate-bounce-slow",
    cardBg: "bg-yellow-100",
  },
  running: {
    icon: Loader2,
    label: "Deploying",
    description: "Building and deploying your app...",
    color: "text-blue-700",
    bg: "bg-blue-200",
    border: "border-blue-500",
    shadowClass: "shadow-brutal-blue",
    animate: "animate-spin",
    cardBg: "bg-blue-50",
  },
  success: {
    icon: CheckCircle2,
    label: "Deployed!",
    description: "Your app is live!",
    color: "text-emerald-700",
    bg: "bg-emerald-200",
    border: "border-emerald-500",
    shadowClass: "shadow-brutal-emerald",
    animate: "",
    cardBg: "bg-emerald-50",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    description: "Something went wrong during deployment.",
    color: "text-red-700",
    bg: "bg-red-200",
    border: "border-red-500",
    shadowClass: "shadow-brutal-red",
    animate: "",
    cardBg: "bg-red-50",
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
      className={`rounded-2xl border-2 border-black ${config.cardBg} ${config.shadowClass} p-6 transition-all duration-300`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`rounded-xl border-2 border-black ${config.bg} p-2.5`}
        >
          <StatusIcon
            className={`h-5 w-5 ${config.color} ${config.animate}`}
            strokeWidth={2.5}
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">{config.label}</h3>
          <p className="text-sm font-medium text-gray-600">
            {config.description}
          </p>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="mb-6 space-y-2 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
        <InfoRow label="Image" value={deployment.image_name} />
        <InfoRow label="Port" value={deployment.port} />
        <InfoRow label="Repo" value={deployment.repo_url} isUrl />
      </div>

      {/* Pipeline Steps */}
      {(deployment.status === "pending" || deployment.status === "running") && (
        <div className="mb-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Pipeline
          </p>
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black text-xs font-bold transition-all ${
                  i < activeStep
                    ? "bg-lime-400 text-black"
                    : i === activeStep
                    ? "bg-yellow-300 text-black animate-wiggle"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < activeStep ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  i <= activeStep ? "text-black" : "text-gray-400"
                }`}
              >
                {step}
              </span>
              {i === activeStep && (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-black"
                  strokeWidth={2.5}
                />
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
          className="mb-4 flex items-center gap-2 rounded-xl border-2 border-black bg-lime-400 p-4 font-bold text-black shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-sm">
            https://{deployment.domain}
          </span>
        </a>
      )}

      {/* Failed: Error Message */}
      {deployment.status === "failed" && deployment.error_message && (
        <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-100 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Error Details
          </p>
          <p className="mt-1 text-sm font-medium text-red-700">
            {deployment.error_message}
          </p>
        </div>
      )}

      {/* Reset Button */}
      {(deployment.status === "success" || deployment.status === "failed") && (
        <button
          onClick={onReset}
          className="btn-brutal w-full bg-white text-black hover:bg-gray-100 mt-2"
        >
          ↻ Deploy Another
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value, isUrl }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[240px] truncate font-mono text-blue-600 underline decoration-2 underline-offset-2 hover:text-blue-800"
        >
          {value}
        </a>
      ) : (
        <span className="font-mono font-bold text-black">{value}</span>
      )}
    </div>
  );
}
