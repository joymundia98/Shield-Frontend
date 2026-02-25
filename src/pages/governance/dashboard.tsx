import React, { useEffect, useRef, useState } from "react";
import "../../styles/global.css";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import GovernanceHeader from './GovernanceHeader';
import { useAuth } from "../../hooks/useAuth";

const GovernanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Chart refs
  const complianceChartRef = useRef<Chart | null>(null);
  const auditChartRef = useRef<Chart | null>(null);

  // Sample data
  const policies = [{ name: "HR Policy" }, { name: "Financial Policy" }, { name: "Safety Policy" }, { name: "IT Policy" }];
  const complianceTasks = [
    { name: "Annual Financial Audit", status: "Completed" },
    { name: "Safety Inspection", status: "Pending" },
    { name: "HR Review", status: "Completed" },
    { name: "IT Security Audit", status: "Pending" },
  ];
  const audits = [
    { name: "Financial Audit", status: "Completed" },
    { name: "Safety Audit", status: "Pending" },
    { name: "Operational Audit", status: "Completed" },
  ];
  const meetings = [{ name: "Board Meeting" }, { name: "Audit Committee" }, { name: "Governance Committee" }];

  // Colors
  const blue = "#1A3D7C";
  const brown2 = "#AF907A";
  const charcoal = "#20262C";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add/remove sidebar-open class on body for proper animation
    useEffect(() => {
      const body = document.body;
      if (sidebarOpen) {
        body.classList.add("sidebar-open");
      } else {
        body.classList.remove("sidebar-open");
      }
      // Clean up on unmount
      return () => body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

  useEffect(() => {
    // Destroy previous charts if they exist
    complianceChartRef.current?.destroy();
    auditChartRef.current?.destroy();

    // Compliance Status Chart
    const complianceCompleted = complianceTasks.filter(c => c.status === "Completed").length;
    const compliancePending = complianceTasks.filter(c => c.status === "Pending").length;
    const complianceCtx = document.getElementById("complianceStatusChart") as HTMLCanvasElement;
    if (complianceCtx) {
      complianceChartRef.current = new Chart(complianceCtx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [{ data: [complianceCompleted, compliancePending], backgroundColor: [blue, brown2] }],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      });
    }

    // Audit Status Chart
    const auditCompleted = audits.filter(a => a.status === "Completed").length;
    const auditPending = audits.filter(a => a.status === "Pending").length;
    const auditCtx = document.getElementById("auditStatusChart") as HTMLCanvasElement;
    if (auditCtx) {
      auditChartRef.current = new Chart(auditCtx, {
        type: "pie",
        data: { labels: ["Completed", "Pending"], datasets: [{ data: [auditCompleted, auditPending], backgroundColor: [blue, charcoal] }] },
        options: { plugins: { legend: { position: "bottom" } } },
      });
    }
  }, [complianceTasks, audits]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Close Button (Styled like ClassDashboard) */}
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              id="closeSidebarButton"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>GOVERNANCE</h2>
        <a href="/governance/dashboard" className="active">Dashboard</a>
        <a href="/governance/policies">Policies</a>
        <a href="/governance/compliance-logs">Compliance Logs</a>
        <a href="/governance/audit-reports">Audit Reports</a>
        <a href="/governance/meetings">Meetings</a>

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <GovernanceHeader/>
        <br/>

        <h1>Governance Overview</h1>

        <br/><br/>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Policies</h3><p>{policies.length}</p></div>
          <div className="kpi-card"><h3>Compliance Tasks</h3><p>{complianceTasks.length}</p></div>
          <div className="kpi-card"><h3>Audit Reports</h3><p>{audits.length}</p></div>
          <div className="kpi-card"><h3>Governance Meetings</h3><p>{meetings.length}</p></div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box"><h3>Compliance Task Status</h3><canvas id="complianceStatusChart"></canvas></div>
          <div className="chart-box"><h3>Audit Report Status</h3><canvas id="auditStatusChart"></canvas></div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
