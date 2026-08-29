import { authHeaders } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function getMyProjects() {
  const res = await fetch(`${API_BASE}/deploy/my-projects`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }
  return data;
}

export async function startNodeDeploy(imageName, repoUrl, port, environmentVariables = {}) {
  const payload = {
    image_name: imageName,
    repo_url: repoUrl,
    port: Number(port),
    environment_variables: environmentVariables,
  };

  const routes = [`${API_BASE}/deploy/node`, `${API_BASE}/deploy/node/javascript`];

  let lastError = null;
  for (const url of routes) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        return data;
      }

      lastError = { status: res.status, ...data };
      if (res.status !== 404) {
        throw lastError;
      }
    } catch (error) {
      if (error && error.status !== 404) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || { status: 500, detail: "Node deployment failed" };
}

export async function startViteDeploy(imageName, repoUrl, environmentVariables = {}) {
  const res = await fetch(`${API_BASE}/deploy/vite/react`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      image_name: imageName,
      repo_url: repoUrl,
      environment_variables: environmentVariables,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }
  return data;
}

export async function startDeploy(imageName, repoUrl, environmentVariables = {}, options = {}) {
  const { deploymentType = "vite", port } = options;

  if (deploymentType === "node") {
    return startNodeDeploy(imageName, repoUrl, port, environmentVariables);
  }

  return startViteDeploy(imageName, repoUrl, environmentVariables);
}

export async function deleteDeployment(deploymentId) {
  const res = await fetch(`${API_BASE}/deploy/${deploymentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }
  return data;
}

export async function getDeployStatus(deploymentId) {
  const res = await fetch(`${API_BASE}/deploy/${deploymentId}/status`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, ...data };
  }
  return data;
}

export function watchDeploy(
  deploymentId,
  onUpdate,
  intervalMs = 3000,
  terminalStatuses = ["success", "failed", "deleted"]
) {
  return new Promise((resolve, reject) => {
    const poll = setInterval(async () => {
      try {
        const status = await getDeployStatus(deploymentId);
        onUpdate(status);

        if (terminalStatuses.includes(status.status)) {
          clearInterval(poll);
          resolve(status);
        }
      } catch (err) {
        clearInterval(poll);
        reject(err);
      }
    }, intervalMs);
  });
}
