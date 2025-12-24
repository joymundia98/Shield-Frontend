import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

interface Asset {
  id: number;
  name: string;
  category: string;
  condition: string;
  value: number;
}

interface Activity {
  assetName: string;
  activity: string;
  date: string;
  performedBy: string;
}

interface Maintenance {
  assetName: string;
  nextService: string;
  type: string;
  status: string;
}

const AssetDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const categoryChartRef = useRef<Chart | null>(null);
  const conditionChartRef = useRef<Chart | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add/remove sidebar-open class on body for CSS to show close button
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Dynamic data examples
  const assets: Asset[] = useMemo(() => [
    { id: 1, name: "Laptop Dell XPS", category: "Electronics", condition: "Good", value: 1200 },
    { id: 2, name: "Office Chair", category: "Furniture", condition: "New", value: 300 },
    { id: 3, name: "Projector HD400", category: "Electronics", condition: "Needs Repair", value: 800 },
    { id: 4, name: "Generator GX200", category: "IT Equipment", condition: "Good", value: 5000 },
    { id: 5, name: "Office AC Unit", category: "Others", condition: "Damaged", value: 1200 },
  ], []);

  const activities: Activity[] = useMemo(() => [
    { assetName: "Laptop Dell XPS", activity: "Assigned", date: "2025-11-18", performedBy: "IT Admin" },
    { assetName: "Projector HD400", activity: "Maintenance Completed", date: "2025-11-17", performedBy: "Technician" },
  ], []);

  const maintenanceList: Maintenance[] = useMemo(() => [
    { assetName: "Generator GX200", nextService: "2025-12-01", type: "Full Service", status: "Scheduled" },
    { assetName: "Office AC Unit", nextService: "2025-12-04", type: "Filter Replacement", status: "Pending" },
  ], []);

  // KPI Calculations
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const underMaintenance = assets.filter(a => a.condition === "Needs Repair" || a.condition === "Damaged").length;
  const pendingRequests = maintenanceList.filter(m => m.status === "Pending").length;

  // Category Chart
  useEffect(() => {
    categoryChartRef.current?.destroy();
    const ctx = document.getElementById("categoryChart") as HTMLCanvasElement;
    if (ctx) {
      const categories = Array.from(new Set(assets.map(a => a.category)));
      const counts = categories.map(cat => assets.filter(a => a.category === cat).length);

      categoryChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: categories,
          datasets: [{ label: "Assets", data: counts, backgroundColor: "#1A3D7C" }],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }
  }, [assets]);

  // Condition Pie Chart
  useEffect(() => {
    conditionChartRef.current?.destroy();
    const ctx = document.getElementById("conditionChart") as HTMLCanvasElement;
    if (ctx) {
      const conditions = Array.from(new Set(assets.map(a => a.condition)));
      const counts = conditions.map(cond => assets.filter(a => a.condition === cond).length);

      conditionChartRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: conditions,
          datasets: [{ data: counts, backgroundColor: ["#5C4736", "#817E7A", "#AF907A", "#20262C"] }],
        },
      });
    }
  }, [assets]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
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

        <h2>ASSET MANAGER</h2>
    
        <Link to="/assets/dashboard" className="active">Dashboard</Link>
        <Link to="/assets/assets">Asset Inventory</Link>
        <Link to="/assets/depreciation">Depreciation Info</Link>
        <Link to="/assets/maintenance">Maintenance</Link>
        <Link to="/assets/categories">Categories</Link>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          ➜] Logout
        </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">

        <AssetsHeader/><br/>

        <h1>Asset Management Overview</h1>

        <br/><br/>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Assets</h3>
            <p>{totalAssets}</p>
          </div>
          <div className="kpi-card">
            <h3>Asset Value</h3>
            <p>${(totalValue / 1000).toFixed(1)}k</p>
          </div>
          <div className="kpi-card">
            <h3>Under Maintenance</h3>
            <p>{underMaintenance}</p>
          </div>
          <div className="kpi-card">
            <h3>Pending Requests</h3>
            <p>{pendingRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Assets by Category</h3>
            <canvas id="categoryChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Condition Overview</h3>
            <canvas id="conditionChart"></canvas>
          </div>
        </div>

        {/* Recent Activity */}
        <h3>Recent Activity</h3>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act, idx) => (
              <tr key={idx}>
                <th>{act.assetName}</th>
                <td>{act.activity}</td>
                <td>{act.date}</td>
                <td>{act.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Maintenance Summary */}
        <h3>Upcoming Maintenance</h3>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Next Service</th>
              <th>Maintenance Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceList.map((m, idx) => (
              <tr key={idx}>
                <th>{m.assetName}</th>
                <td>{m.nextService}</td>
                <td>{m.type}</td>
                <td>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetDashboard;
