import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import OrganizationHeader from './OrganizationHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


const baseURL = import.meta.env.VITE_BASE_URL;

interface AuditLog {
  audit_id: number;
  user_id: number | null;
  action: string;
  module: string;
  record_id: number | null;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

const AuditTrailPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 default is ALL modules
  const [filterModule, setFilterModule] = useState<string | "all">("all");
  const [filterAction, setFilterAction] = useState<string | "all">("all");

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  const fetchData = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }
      return await orgFetch(url);
    }
  };

  // 🔥 fetch ALL audit logs (system-wide)
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetchData(`${baseURL}/api/audit`);
        setLogs(res.logs || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      }
    };

    loadLogs();
  }, []);

  // 🔥 dynamic filters from full dataset
  const uniqueModules = useMemo(
    () => [...new Set(logs.map((l) => l.module))],
    [logs]
  );

  const uniqueActions = useMemo(
    () => [...new Set(logs.map((l) => l.action))],
    [logs]
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterModule !== "all" && log.module !== filterModule) return false;
      if (filterAction !== "all" && log.action !== filterAction) return false;

      if (
        search &&
        !JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
      )
        return false;

      return true;
    });
  }, [logs, filterModule, filterAction, search]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString();

  const pretty = (data: any) => {
    if (!data) return "-";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ORG MANAGER</h2>
        {/*{hasPermission("Manage Organization Profile") && <a href="/Organization/edittableProfile" className="active">Profile</a>}*/}
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgAdminAccounts">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts">Manage Accounts</a>}
        {hasPermission("Manage Roles") && <a href="/Organization/roles">Roles</a>}
        {hasPermission("Manage Permissions") && <a href="/Organization/permissions">Permissions</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && (
          <a
            href="/dashboard"
            className="return-main"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            ← Back to Main Dashboard
          </a>)}
          <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/"); 
          }}
        >
          ➜ Logout
        </a>
        </div>

      {/* Main */}
      <div className="dashboard-content">
        <OrganizationHeader />
        <br />

        <h1>System Audit Trail</h1>

        {/* Search */}
        <div className="table-header">
          <input
            className="search-input"
            placeholder="Search across all modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filters" style={{ display: "flex", gap: "10px" }}>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            {uniqueModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* Table */}
        <div className="department-section">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Record</th>
                <th>IP</th>
                <th>Date</th>
                <th>Old Values</th>
                <th>New Values</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.audit_id}>
                  <td>{log.audit_id}</td>
                  <td>{log.user_id || "System"}</td>
                  <td>
                    <span className={`status ${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.module}</td>
                  <td>{log.record_id ?? "-"}</td>
                  <td>{log.ip_address || "-"}</td>
                  <td>{formatDate(log.created_at)}</td>
                  <td>
                    <pre style={{ fontSize: "11px", maxWidth: "220px" }}>
                      {pretty(log.old_values)}
                    </pre>
                  </td>
                  <td>
                    <pre style={{ fontSize: "11px", maxWidth: "220px" }}>
                      {pretty(log.new_values)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;