import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';
import { useAuth } from "../../hooks/useAuth";
import { authFetch } from "../../utils/api";

const baseURL = import.meta.env.VITE_BASE_URL;

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
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // ✅ NEW

  const categoryChartRef = useRef<Chart | null>(null);
  const conditionChartRef = useRef<Chart | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sidebar effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // ================= FETCH ASSETS + CATEGORIES =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, categoriesData] = await Promise.all([
          authFetch(`${baseURL}/api/assets`),
          authFetch(`${baseURL}/api/assets/categories`)
        ]);

        setAssets(assetsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  // ================= CATEGORY MAP =================
  const categoryMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((cat) => {
      map[cat.category_id] = cat.name;
    });
    return map;
  }, [categories]);

  // ================= KPI CALCULATIONS =================
  const totalAssets = assets.length;

  const totalValue = assets.reduce(
    (sum, a) => sum + parseFloat(a.current_value || 0),
    0
  );

  const underMaintenance = assets.filter(
    (a) =>
      a.condition_status === "Needs Repair" ||
      a.condition_status === "Damaged"
  ).length;

  const avgDepreciation =
    assets.length > 0
      ? (
          assets.reduce((sum, a) => {
            const purchase = parseFloat(a.purchase_cost || 0);
            const current = parseFloat(a.current_value || 0);
            if (purchase === 0) return sum;
            return sum + ((purchase - current) / purchase) * 100;
          }, 0) / assets.length
        ).toFixed(2)
      : "0";

  // ================= CHART: CATEGORY (FIXED) =================
  useEffect(() => {
    categoryChartRef.current?.destroy();

    const ctx = document.getElementById("categoryChart") as HTMLCanvasElement;

    if (!ctx || !assets.length || !categories.length) return;

    const categoryCounts: Record<string, number> = {};

    assets.forEach((asset) => {
      const categoryName =
        categoryMap[asset.category_id] || "Unknown";

      categoryCounts[categoryName] =
        (categoryCounts[categoryName] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    categoryChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Assets",
            data,
            backgroundColor: "#1A3D7C",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  }, [assets, categories, categoryMap]);

  // ================= CHART: CONDITION =================
  useEffect(() => {
    conditionChartRef.current?.destroy();

    const ctx = document.getElementById("conditionChart") as HTMLCanvasElement;

    if (ctx && assets.length > 0) {
      const conditions = Array.from(
        new Set(assets.map((a) => a.condition_status))
      );

      const counts = conditions.map((cond) =>
        assets.filter((a) => a.condition_status === cond).length
      );

      conditionChartRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: conditions,
          datasets: [
            {
              data: counts,
              backgroundColor: ["#5C4736", "#817E7A", "#AF907A", "#20262C"],
            },
          ],
        },
      });
    }
  }, [assets]);

  // ================= RECENT ACTIVITY =================
  const activities: Activity[] = useMemo(() => {
    if (!assets.length) return [];

    const result: Activity[] = [];

    assets.forEach((asset) => {
      const purchase = parseFloat(asset.purchase_cost || 0);
      const current = parseFloat(asset.current_value || 0);

      if (!purchase) return;

      const depreciation = ((purchase - current) / purchase) * 100;

      const createdDate = new Date(asset.created_at);
      const now = new Date();

      const diffDays =
        (now.getTime() - createdDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        result.push({
          assetName: asset.name,
          activity: "New Asset Added",
          date: createdDate.toISOString().split("T")[0],
          performedBy: "System",
        });
      }

      if (depreciation > 30) {
        result.push({
          assetName: asset.name,
          activity: "High Depreciation",
          date: new Date().toISOString().split("T")[0],
          performedBy: "System Alert",
        });
      }

      if (asset.condition_status === "Damaged") {
        result.push({
          assetName: asset.name,
          activity: "Asset Damaged",
          date: new Date().toISOString().split("T")[0],
          performedBy: "System Alert",
        });
      }
    });

    return result
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 10);
  }, [assets]);

  // ================= MOCK MAINTENANCE =================
  const maintenanceList: Maintenance[] = useMemo(() => [
    {
      assetName: "Generator GX200",
      nextService: "2025-12-01",
      type: "Full Service",
      status: "Scheduled",
    },
    {
      assetName: "Office AC Unit",
      nextService: "2025-12-04",
      type: "Filter Replacement",
      status: "Pending",
    },
  ], []);

  /*================Asset value Format Helper function==============*/
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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
        {hasPermission("View Asset Dashboard") && (
          <a href="/assets/dashboard" className="active">Dashboard</a>
        )}
        {hasPermission("View All Assets") && (
          <a href="/assets/assets">Asset Inventory</a>
        )}
        {hasPermission("View Asset Depreciation") && (
          <a href="/assets/depreciation">Depreciation Info</a>
        )}
        {hasPermission("Manage Asset Maintenance") && (
          <a href="/assets/maintenance">Maintenance</a>
        )}

        <a href="/assets/locations">Asset Locations</a>

        {hasPermission("View Categories") && (
          <a href="/assets/categories">Categories</a>
        )}

        <hr className="sidebar-separator" />

        {hasPermission("View Main Dashboard") && (
          <a href="/dashboard" className="return-main">
            ← Back to Main Dashboard
          </a>
        )}

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

      <div className="dashboard-content">
        <div className="do-not-print">
          <AssetsHeader />
        </div>

        <div className="do-not-print print-button-container">
          <button className="print-button" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
        </div>

        <br />
        <h1>Asset Management Overview</h1>
        <br /><br />

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Assets</h3>
            <p>{totalAssets}</p>
          </div>

          <div className="kpi-card">
            <h3>Asset Value</h3>
            <p>{formatCurrency(totalValue)}</p>
          </div>

          <div className="kpi-card">
            <h3>Under Maintenance</h3>
            <p>{underMaintenance}</p>
          </div>

          <div className="kpi-card">
            <h3>Average Depreciation Rate</h3>
            <p>{avgDepreciation}%</p>
          </div>
        </div>

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
                <td>{act.assetName}</td>
                <td>{act.activity}</td>
                <td>{act.date}</td>
                <td>{act.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
                <td>{m.assetName}</td>
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