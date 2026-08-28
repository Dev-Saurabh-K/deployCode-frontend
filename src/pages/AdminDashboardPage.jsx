import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  getAdminDeployments,
  deleteAdminDeployment,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
} from "../api/admin";
import InputField from "../components/InputField";
import {
  Shield,
  Layers,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  ExternalLink,
  GitBranch,
  Loader2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X,
  Server,
  Key,
  Globe,
  Clock,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
  Hash,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-yellow-300", text: "text-black", border: "border-yellow-500" },
  running: { label: "Running", bg: "bg-blue-300", text: "text-black", border: "border-blue-500" },
  success: { label: "Success", bg: "bg-lime-400", text: "text-black", border: "border-lime-600" },
  failed: { label: "Failed", bg: "bg-red-400", text: "text-white", border: "border-red-600" },
  deleting: { label: "Deleting", bg: "bg-purple-300", text: "text-black", border: "border-purple-500" },
};

export default function AdminDashboardPage() {
  const { adminUsername, adminLogout } = useAdmin();
  const navigate = useNavigate();

  // Active Tab: 'deployments' | 'users'
  const [activeTab, setActiveTab] = useState("deployments");

  // Data state
  const [deployments, setDeployments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters
  const [deploySearch, setDeploySearch] = useState("");
  const [deployStatusFilter, setDeployStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Feedback notifications
  const [notification, setNotification] = useState(null);

  // Modals state
  const [deleteDeployModal, setDeleteDeployModal] = useState(null);
  const [isDeletingDeploy, setIsDeletingDeploy] = useState(false);

  const [editUserModal, setEditUserModal] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [deleteUserError, setDeleteUserError] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((current) => (current?.message === message ? null : current));
    }, 6000);
  };

  const handleAuthError = useCallback(() => {
    adminLogout();
    navigate("/admin/login");
  }, [adminLogout, navigate]);

  // Load all admin data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [deploymentsData, usersData] = await Promise.all([
        getAdminDeployments(),
        getAdminUsers(),
      ]);
      setDeployments(deploymentsData);
      setUsers(usersData);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleAuthError();
        return;
      }
      showNotification("error", err.detail || "Failed to load administrative data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Deployment Deletion
  const confirmDeleteDeployment = async () => {
    if (!deleteDeployModal) return;
    setIsDeletingDeploy(true);
    try {
      const result = await deleteAdminDeployment(deleteDeployModal.id);
      showNotification(
        "success",
        `Deployment #${deleteDeployModal.id} (${deleteDeployModal.image_name}) deletion initiated.`
      );
      // Mark as deleting in local state immediately
      setDeployments((current) =>
        current.map((d) =>
          d.id === deleteDeployModal.id ? { ...d, status: "deleting" } : d
        )
      );
      setDeleteDeployModal(null);
      // Refresh shortly after
      setTimeout(() => loadData(true), 2000);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleAuthError();
        return;
      }
      showNotification("error", err.detail || "Could not delete deployment.");
    } finally {
      setIsDeletingDeploy(false);
    }
  };

  // Handle Edit User
  const openEditUser = (user) => {
    setEditUserModal(user);
    setEditUsername(user.username);
    setEditPassword("");
    setEditIsAdmin(user.is_admin);
    setEditUserError("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    setEditUserError("");

    const changes = {};
    if (editUsername.trim() && editUsername.trim() !== editUserModal.username) {
      changes.username = editUsername.trim();
    }
    if (editPassword) {
      if (editPassword.length < 8) {
        setEditUserError("Password must be at least 8 characters.");
        return;
      }
      changes.password = editPassword;
    }
    if (editIsAdmin !== editUserModal.is_admin) {
      changes.is_admin = editIsAdmin;
    }

    if (Object.keys(changes).length === 0) {
      setEditUserError("No changes were made.");
      return;
    }

    setIsUpdatingUser(true);
    try {
      await updateAdminUser(editUserModal.id, changes);
      showNotification("success", `User "${editUserModal.username}" updated successfully.`);
      setEditUserModal(null);
      await loadData(true);
    } catch (err) {
      if (err.status === 401 || err.status === 403 && err.detail?.includes("session")) {
        handleAuthError();
        return;
      }
      setEditUserError(err.detail || "Failed to update user.");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Handle Delete User
  const confirmDeleteUser = async () => {
    if (!deleteUserModal) return;
    setDeleteUserError("");
    setIsDeletingUser(true);
    try {
      await deleteAdminUser(deleteUserModal.id);
      showNotification(
        "success",
        `User "${deleteUserModal.username}" and historical inactive records were deleted.`
      );
      setDeleteUserModal(null);
      await loadData(true);
    } catch (err) {
      if (err.status === 401) {
        handleAuthError();
        return;
      }
      setDeleteUserError(err.detail || "Failed to delete user.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Filtered Deployments
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchSearch =
        d.image_name?.toLowerCase().includes(deploySearch.toLowerCase()) ||
        d.username?.toLowerCase().includes(deploySearch.toLowerCase()) ||
        d.port?.toString().includes(deploySearch) ||
        d.repo_url?.toLowerCase().includes(deploySearch.toLowerCase()) ||
        d.domain?.toLowerCase().includes(deploySearch.toLowerCase());

      const matchStatus =
        deployStatusFilter === "all" || d.status === deployStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [deployments, deploySearch, deployStatusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id?.toString().includes(userSearch);

      const matchRole =
        userRoleFilter === "all" ||
        (userRoleFilter === "admin" && u.is_admin) ||
        (userRoleFilter === "user" && !u.is_admin);

      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Summary Metrics
  const activeDeploymentsCount = deployments.filter(
    (d) => d.status === "success" || d.status === "running" || d.status === "pending"
  ).length;
  const failedDeploymentsCount = deployments.filter((d) => d.status === "failed").length;
  const totalAdminsCount = users.filter((u) => u.is_admin).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      {/* Decorative background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-16 top-28 h-44 w-44 rotate-12 rounded-3xl border-2 border-[#172a45] bg-[#e63946] opacity-10" />
        <div className="absolute -left-10 bottom-24 h-36 w-36 -rotate-12 rounded-full border-2 border-[#172a45] bg-[#f6c445] opacity-15" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Top Notification Toast */}
        {notification && (
          <div
            className={`mb-6 flex items-center justify-between gap-3 rounded-xl border-2 border-[#172a45] p-4 font-bold shadow-[4px_4px_0_#172a45] ${
              notification.type === "success"
                ? "bg-lime-300 text-black"
                : "bg-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="rounded p-1 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#172a45] bg-[#e63946] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#172a45] mb-3">
              <Shield className="h-4 w-4" strokeWidth={2.5} />
              System Administration
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#172a45]">
              Administrator Console
            </h1>
            <p className="mt-1 text-sm font-bold text-gray-600">
              Manage platform deployments, users, and credentials across all projects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing || isLoading}
              className="btn-brutal bg-[#f6c445] text-[#172a45] hover:bg-yellow-300 py-2.5 px-4"
              title="Refresh administrative data"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                strokeWidth={2.5}
              />
              Sync Data
            </button>

            <button
              onClick={() => {
                adminLogout();
                navigate("/admin/login");
              }}
              className="btn-brutal bg-[#e63946] text-white hover:bg-[#c92f3b] py-2.5 px-4"
              title="Logout from Admin Portal"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.5} />
              Admin Exit
            </button>
          </div>
        </div>

        {/* System Metric Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card-brutal p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-black uppercase tracking-wider">Total Deploys</span>
              <Layers className="h-4 w-4 text-[#1d5fa7]" strokeWidth={2.5} />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#172a45]">
              {deployments.length}
            </div>
            <div className="mt-1 text-[11px] font-bold text-gray-500">
              {activeDeploymentsCount} active on host
            </div>
          </div>

          <div className="card-brutal p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-black uppercase tracking-wider">Failed</span>
              <AlertCircle className="h-4 w-4 text-[#e63946]" strokeWidth={2.5} />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#e63946]">
              {failedDeploymentsCount}
            </div>
            <div className="mt-1 text-[11px] font-bold text-gray-500">
              Errored build tasks
            </div>
          </div>

          <div className="card-brutal p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-black uppercase tracking-wider">Total Users</span>
              <Users className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#172a45]">
              {users.length}
            </div>
            <div className="mt-1 text-[11px] font-bold text-gray-500">
              Registered accounts
            </div>
          </div>

          <div className="card-brutal p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-black uppercase tracking-wider">Administrators</span>
              <Shield className="h-4 w-4 text-[#f6c445]" strokeWidth={2.5} />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#172a45]">
              {totalAdminsCount}
            </div>
            <div className="mt-1 text-[11px] font-bold text-gray-500">
              Full admin privileges
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-3 border-b-2 border-[#172a45] pb-4">
          <button
            onClick={() => setActiveTab("deployments")}
            className={`btn-brutal py-2.5 px-5 text-sm ${
              activeTab === "deployments"
                ? "bg-[#1d5fa7] text-white shadow-[2px_2px_0_#172a45]"
                : "bg-white text-[#172a45] hover:bg-gray-100"
            }`}
          >
            <Layers className="h-4 w-4" strokeWidth={2.5} />
            All Deployments ({deployments.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`btn-brutal py-2.5 px-5 text-sm ${
              activeTab === "users"
                ? "bg-[#e63946] text-white shadow-[2px_2px_0_#172a45]"
                : "bg-white text-[#172a45] hover:bg-gray-100"
            }`}
          >
            <Users className="h-4 w-4" strokeWidth={2.5} />
            User Accounts ({users.length})
          </button>
        </div>

        {/* Tab 1: Deployments Management */}
        {activeTab === "deployments" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="card-brutal p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={deploySearch}
                    onChange={(e) => setDeploySearch(e.target.value)}
                    placeholder="Search by app name, owner, port, repo, or domain..."
                    className="input-brutal pl-10 py-2.5 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Status:</span>
                  {["all", "success", "running", "pending", "failed", "deleting"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setDeployStatusFilter(status)}
                      className={`rounded-lg border-2 border-[#172a45] px-3 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                        deployStatusFilter === status
                          ? "bg-[#172a45] text-white shadow-[2px_2px_0_#e63946]"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deployments Table / Cards */}
            {isLoading ? (
              <div className="card-brutal flex min-h-[300px] items-center justify-center p-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#172a45]" strokeWidth={2.5} />
                  <p className="mt-3 text-sm font-bold uppercase tracking-wider text-gray-600">
                    Loading deployment records...
                  </p>
                </div>
              </div>
            ) : filteredDeployments.length === 0 ? (
              <div className="card-brutal p-12 text-center">
                <Layers className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1.5} />
                <h3 className="mt-3 text-lg font-bold text-[#172a45]">No deployments found</h3>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {deploySearch || deployStatusFilter !== "all"
                    ? "Try adjusting your search terms or status filter."
                    : "No deployments have been recorded on this server yet."}
                </p>
              </div>
            ) : (
              <div className="card-brutal overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b-2 border-[#172a45] bg-[#172a45] text-xs font-black uppercase tracking-wider text-white">
                      <tr>
                        <th className="px-4 py-3.5">ID / App Name</th>
                        <th className="px-4 py-3.5">Owner</th>
                        <th className="px-4 py-3.5">Port & Domain</th>
                        <th className="px-4 py-3.5">Repository</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Created</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#172a45]/10">
                      {filteredDeployments.map((d) => {
                        const statusConfig = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                            {/* App & ID */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="rounded border border-[#172a45] bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-bold text-[#172a45]">
                                  #{d.id}
                                </span>
                                <span className="font-bold text-black text-base">{d.image_name}</span>
                              </div>
                            </td>

                            {/* Owner */}
                            <td className="px-4 py-4">
                              <div className="font-bold text-[#172a45]">
                                {d.username || `User #${d.user_id}`}
                              </div>
                              <div className="text-xs font-medium text-gray-500">
                                UID: {d.user_id}
                              </div>
                            </td>

                            {/* Port & Domain */}
                            <td className="px-4 py-4">
                              <div className="font-mono text-xs font-bold text-gray-700">
                                Port: {d.port || "N/A"}
                              </div>
                              {d.domain ? (
                                <a
                                  href={`https://${d.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#1d5fa7] underline decoration-2 underline-offset-2 hover:text-blue-800"
                                >
                                  {d.domain}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-xs font-medium text-gray-400">No domain active</span>
                              )}
                            </td>

                            {/* Repository */}
                            <td className="px-4 py-4">
                              {d.repo_url ? (
                                <a
                                  href={d.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-[160px] truncate items-center gap-1 font-mono text-xs text-gray-700 hover:text-black hover:underline"
                                  title={d.repo_url}
                                >
                                  <GitBranch className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{d.repo_url.replace("https://github.com/", "")}</span>
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-[#172a45] px-2.5 py-1 text-xs font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}
                              >
                                {d.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                                {statusConfig.label}
                              </span>
                              {d.error_message && (
                                <div
                                  className="mt-1 max-w-[180px] truncate text-[11px] font-medium text-red-600"
                                  title={d.error_message}
                                >
                                  ⚠ {d.error_message}
                                </div>
                              )}
                            </td>

                            {/* Created */}
                            <td className="px-4 py-4 font-mono text-xs text-gray-600">
                              {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                              <div className="text-[10px] text-gray-400">
                                {d.created_at ? new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => setDeleteDeployModal(d)}
                                disabled={d.status === "deleting"}
                                className="btn-brutal bg-red-100 text-[#e63946] border-[#e63946] hover:bg-red-200 py-1.5 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Delete this deployment and remove server resources"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Accounts Management */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="card-brutal p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by username or ID..."
                    className="input-brutal pl-10 py-2.5 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Role:</span>
                  {["all", "admin", "user"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`rounded-lg border-2 border-[#172a45] px-3 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                        userRoleFilter === role
                          ? "bg-[#172a45] text-white shadow-[2px_2px_0_#e63946]"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {role === "all" ? "All Users" : role === "admin" ? "Admins" : "Standard Users"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="card-brutal flex min-h-[300px] items-center justify-center p-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#172a45]" strokeWidth={2.5} />
                  <p className="mt-3 text-sm font-bold uppercase tracking-wider text-gray-600">
                    Loading user records...
                  </p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="card-brutal p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1.5} />
                <h3 className="mt-3 text-lg font-bold text-[#172a45]">No users found</h3>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {userSearch || userRoleFilter !== "all"
                    ? "Try adjusting your search terms or role filter."
                    : "No users exist in the database."}
                </p>
              </div>
            ) : (
              <div className="card-brutal overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b-2 border-[#172a45] bg-[#172a45] text-xs font-black uppercase tracking-wider text-white">
                      <tr>
                        <th className="px-4 py-3.5">User ID</th>
                        <th className="px-4 py-3.5">Username</th>
                        <th className="px-4 py-3.5">Role</th>
                        <th className="px-4 py-3.5">Created At</th>
                        <th className="px-4 py-3.5">Deployments</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#172a45]/10">
                      {filteredUsers.map((u) => {
                        const isCurrentAdmin = u.username === adminUsername;
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            {/* ID */}
                            <td className="px-4 py-4 font-mono font-bold text-gray-700">
                              #{u.id}
                            </td>

                            {/* Username */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-black text-base">{u.username}</span>
                                {isCurrentAdmin && (
                                  <span className="rounded bg-[#f6c445] border border-[#172a45] px-1.5 py-0.5 text-[10px] font-black uppercase text-[#172a45]">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-4">
                              {u.is_admin ? (
                                <span className="inline-flex items-center gap-1 rounded-lg border-2 border-[#172a45] bg-[#e63946] px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white">
                                  <Shield className="h-3 w-3" strokeWidth={3} />
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-lg border-2 border-[#172a45] bg-gray-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-800">
                                  User
                                </span>
                              )}
                            </td>

                            {/* Created At */}
                            <td className="px-4 py-4 font-mono text-xs text-gray-600">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                              <div className="text-[10px] text-gray-400">
                                {u.created_at ? new Date(u.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </div>
                            </td>

                            {/* Deployment Count */}
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center justify-center rounded-md border border-[#172a45] bg-white px-2 py-0.5 font-mono text-xs font-bold text-[#172a45]">
                                {u.deployment_count ?? 0}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditUser(u)}
                                  className="btn-brutal bg-[#f6c445] text-[#172a45] hover:bg-yellow-300 py-1.5 px-3 text-xs"
                                  title="Edit user details or reset password"
                                >
                                  <Edit className="h-3.5 w-3.5" strokeWidth={2.5} />
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteUserModal(u);
                                    setDeleteUserError("");
                                  }}
                                  disabled={isCurrentAdmin}
                                  className="btn-brutal bg-red-100 text-[#e63946] border-[#e63946] hover:bg-red-200 py-1.5 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                  title={isCurrentAdmin ? "You cannot delete your own account" : "Delete user"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Delete Deployment Confirmation */}
      {deleteDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card-brutal w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b-2 border-[#172a45] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#172a45] bg-[#e63946]">
                  <Trash2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-[#172a45]">Delete Deployment</h3>
              </div>
              <button
                onClick={() => setDeleteDeployModal(null)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <p className="text-sm font-bold text-gray-700">
              Are you sure you want to delete deployment <span className="font-mono text-[#e63946]">#{deleteDeployModal.id} ({deleteDeployModal.image_name})</span>?
            </p>

            <div className="mt-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3.5 text-xs font-medium text-gray-600">
              <p className="font-bold text-[#172a45] uppercase mb-1">Permanent Removal Actions:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Stops and removes Docker container and image</li>
                <li>Cleans up Nginx reverse proxy configuration</li>
                <li>Removes deployment workspace directory on host</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDeployModal(null)}
                className="btn-brutal bg-white text-gray-700 hover:bg-gray-100 py-2.5 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDeployment}
                disabled={isDeletingDeploy}
                className="btn-brutal bg-[#e63946] text-white hover:bg-[#c92f3b] py-2.5 px-4 disabled:opacity-50"
              >
                {isDeletingDeploy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Deletion"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit User */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card-brutal w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b-2 border-[#172a45] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#172a45] bg-[#f6c445]">
                  <Edit className="h-5 w-5 text-[#172a45]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#172a45]">
                    Edit User #{editUserModal.id}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">
                    Account: {editUserModal.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditUserModal(null)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {editUserError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#e63946] bg-red-100 p-3 text-xs font-bold text-[#e63946]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{editUserError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <InputField
                label="Username"
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="1–50 characters"
                helperText="Must be unique across all user accounts."
                required
              />

              <InputField
                label="Reset Password (Optional)"
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                helperText="Minimum 8 characters. Only update if you want to set a new password."
              />

              {/* Administrator Toggle */}
              <div className="rounded-xl border-2 border-[#172a45] bg-gray-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(e) => setEditIsAdmin(e.target.checked)}
                    disabled={editUserModal.username === adminUsername}
                    className="mt-1 h-5 w-5 rounded border-2 border-[#172a45] text-[#e63946] focus:ring-0"
                  />
                  <div>
                    <span className="text-sm font-black uppercase tracking-wide text-[#172a45]">
                      Grant Administrator Privileges
                    </span>
                    <p className="text-xs font-medium text-gray-600 mt-0.5">
                      Allows this user to access the admin portal and manage all platform data.
                      {editUserModal.username === adminUsername && (
                        <span className="block mt-1 font-bold text-[#e63946]">
                          (You cannot change your own administrator status)
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="btn-brutal bg-white text-gray-700 hover:bg-gray-100 py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="btn-brutal bg-[#1d5fa7] text-white hover:bg-[#174f8c] py-2.5 px-5 disabled:opacity-50"
                >
                  {isUpdatingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {deleteUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card-brutal w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b-2 border-[#172a45] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#172a45] bg-[#e63946]">
                  <Trash2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-[#172a45]">Delete User Account</h3>
              </div>
              <button
                onClick={() => setDeleteUserModal(null)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {deleteUserError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#e63946] bg-red-100 p-3 text-xs font-bold text-[#e63946]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{deleteUserError}</span>
              </div>
            )}

            <p className="text-sm font-bold text-gray-700">
              Are you sure you want to permanently delete user account{" "}
              <span className="font-mono text-[#e63946]">"{deleteUserModal.username}"</span> (UID #{deleteUserModal.id})?
            </p>

            <div className="mt-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3.5 text-xs font-medium text-gray-600">
              <p className="font-bold text-[#172a45] uppercase mb-1">Prerequisites & Rules:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>The user must have no active deployments. Delete active deployments first.</li>
                <li>Historical inactive deployment records will be cleared.</li>
                <li>The final remaining administrator cannot be deleted.</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteUserModal(null)}
                className="btn-brutal bg-white text-gray-700 hover:bg-gray-100 py-2.5 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeletingUser}
                className="btn-brutal bg-[#e63946] text-white hover:bg-[#c92f3b] py-2.5 px-4 disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting User...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
