import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Organization {
  id: number;
  name: string;
  orgType: string;
  region: string;
  createdAt: Date;
  trialEnd: Date;
  email: string;
  hasPaid: boolean; // for conversion simulation
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversionData, setConversionData] = useState({
    inTrial: 0,
    completedPaid: 0,
    completedNoPay: 0,
    conversionRate: 0,
  });

  const growthChartRef = useRef<Chart | null>(null);
  const trialChartRef = useRef<Chart | null>(null);
  const typeChartRef = useRef<Chart | null>(null);
  const regionChartRef = useRef<Chart | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgTypes = await authFetch(`${baseURL}/api/organization_type`);
        const orgs = await authFetch(`${baseURL}/api/organizations`);

        const mapped = orgs.map((org: any) => {
          const created = new Date(org.created_at);
          const trialEnd = new Date(created);
          trialEnd.setDate(trialEnd.getDate() + 21);

          const type =
            orgTypes.find((t: any) => t.org_type_id === org.org_type_id)
              ?.name || "Unknown";

          return {
            id: org.id,
            name: org.name,
            orgType: type,
            region: org.region,
            createdAt: created,
            trialEnd,
            email: org.organization_email,
            hasPaid: org.has_paid || false,
          };
        });

        setOrganizations(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // FILTER OUT TEST DATA
  const validOrgs = useMemo(() => {
    return organizations.filter(
      (org) => !org.email?.toLowerCase().includes("test.com")
    );
  }, [organizations]);

  // ✅ STATUS HELPER (ADDED)
  const getStatus = (org: Organization) => {
    const today = new Date();
    if (org.trialEnd > today) return "inTrial";
    if (org.hasPaid) return "converted";
    return "churned";
  };

  // KPI CALCULATIONS
  const kpis = useMemo(() => {
    const today = new Date();

    let active = 0;
    let completed = 0;

    validOrgs.forEach((org) => {
      if (org.trialEnd > today) active++;
      else completed++;
    });

    return {
      total: validOrgs.length,
      active,
      completed,
      monthlyGrowth: 12, // %
      revenue: 12500, // $
    };
  }, [validOrgs]);

  // CHART DATA
  useEffect(() => {
    growthChartRef.current?.destroy();
    trialChartRef.current?.destroy();
    typeChartRef.current?.destroy();
    regionChartRef.current?.destroy();

    // 📈 Growth Chart (with conversions curve)
        const growthCounts = new Array(12).fill(0);
        const conversionCounts = new Array(12).fill(0); // NEW
        const monthLabels: string[] = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthLabels.push(d.toLocaleString("default", { month: "short" }));
        }

        validOrgs.forEach((org) => {
        const createdDate = new Date(org.createdAt);
        const monthsAgo =
            (today.getFullYear() - createdDate.getFullYear()) * 12 +
            (today.getMonth() - createdDate.getMonth());

        if (monthsAgo >= 0 && monthsAgo < 12) {
            const index = 11 - monthsAgo;
            growthCounts[index] += 1;

            // Count conversions for the curve
            if (org.hasPaid) conversionCounts[index] += 1;
        }
        });

        const growthCtx = document.getElementById("growthChart") as HTMLCanvasElement;
        if (growthCtx) {
        growthChartRef.current = new Chart(growthCtx, {
            type: "line",
            data: {
            labels: monthLabels,
            datasets: [
                {
                label: "Total Sign-Ups",
                data: growthCounts,
                borderColor: "#1A3D7C",
                backgroundColor: "rgba(26, 61, 124, 0.25)",
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                },
                {
                label: "Conversions (Paid)",
                data: conversionCounts,
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.15)",
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                },
            ],
            },
            options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            },
            scales: {
                y: { beginAtZero: true },
            },
            },
        });
        }

    // 🥧 Donut / Conversion Chart (UNCHANGED)
    const trialCtx = document.getElementById("trialChart") as HTMLCanvasElement;
    if (trialCtx) {
      const total = validOrgs.length || 120;
      const inTrial = 35;
      const completedPaid = 55;
      const completedNoPay = total - inTrial - completedPaid;
      const conversionRate = Math.round((completedPaid / total) * 100);

      setConversionData({ inTrial, completedPaid, completedNoPay, conversionRate });

      const centerTextPlugin = {
        id: "centerText",
        beforeDraw(chart: any) {
          const { ctx, chartArea: { left, top, right, bottom } } = chart;
          ctx.save();

          const meta = chart.getDatasetMeta(0);
          const innerRadius = (meta.data[0] && meta.data[0].innerRadius) || 0;

          const centerX = (left + right) / 2;
          const centerY = (top + bottom) / 2;

          const mainText = `${conversionRate}%`;
          const subText = "Conversion";

          const mainFontSize = innerRadius / 2.5;
          const subFontSize = mainFontSize / 2.2;
          const gap = 4;

          const totalHeight = mainFontSize + gap + subFontSize;

          ctx.font = `bold ${mainFontSize}px sans-serif`;
          ctx.fillStyle = "#1A3D7C";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(mainText, centerX, centerY - totalHeight / 2);

          ctx.font = `${subFontSize}px sans-serif`;
          ctx.fillStyle = "#555";
          ctx.fillText(subText, centerX, centerY - totalHeight / 2 + mainFontSize + gap);

          ctx.restore();
        },
      };

      trialChartRef.current = new Chart(trialCtx, {
        type: "doughnut",
        data: {
          labels: ["In Trial", "Converted (Paid)", "Churned (No Payment)"],
          datasets: [
            {
              data: [inTrial, completedPaid, completedNoPay],
              backgroundColor: ["#1A3D7C", "#4CAF50", "#AF907A"],
              borderWidth: 0,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          cutout: "50%",
          plugins: {
            legend: { position: "bottom" },
            tooltip: { enabled: true },
          },
        },
        plugins: [centerTextPlugin],
      });
    }

    // ✅ STACKED TYPE CHART (UPDATED)
    const typeMap: any = {};
    validOrgs.forEach((org) => {
      const status = getStatus(org);
      if (!typeMap[org.orgType]) {
        typeMap[org.orgType] = { inTrial: 0, converted: 0, churned: 0 };
      }
      typeMap[org.orgType][status]++;
    });

    const typeLabels = Object.keys(typeMap);

    const typeCtx = document.getElementById("typeChart") as HTMLCanvasElement;
    if (typeCtx) {
      typeChartRef.current = new Chart(typeCtx, {
        type: "bar",
        data: {
          labels: typeLabels,
          datasets: [
            {
              label: "In Trial",
              data: typeLabels.map((l) => typeMap[l].inTrial),
              backgroundColor: "#1A3D7C",
            },
            {
              label: "Converted",
              data: typeLabels.map((l) => typeMap[l].converted),
              backgroundColor: "#4CAF50",
            },
            {
              label: "Churned",
              data: typeLabels.map((l) => typeMap[l].churned),
              backgroundColor: "#AF907A",
            },
          ],
        },
        options: {
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
          },
        },
      });
    }

    // ✅ STACKED REGION CHART (UPDATED)
    const regionMap: any = {};
    validOrgs.forEach((org) => {
      const status = getStatus(org);
      if (!regionMap[org.region]) {
        regionMap[org.region] = { inTrial: 0, converted: 0, churned: 0 };
      }
      regionMap[org.region][status]++;
    });

    const regionLabels = Object.keys(regionMap);

    const regionCtx = document.getElementById("regionChart") as HTMLCanvasElement;
    if (regionCtx) {
      regionChartRef.current = new Chart(regionCtx, {
        type: "bar",
        data: {
          labels: regionLabels,
          datasets: [
            {
              label: "In Trial",
              data: regionLabels.map((l) => regionMap[l].inTrial),
              backgroundColor: "#1A3D7C",
            },
            {
              label: "Converted",
              data: regionLabels.map((l) => regionMap[l].converted),
              backgroundColor: "#4CAF50",
            },
            {
              label: "Churned",
              data: regionLabels.map((l) => regionMap[l].churned),
              backgroundColor: "#AF907A",
            },
          ],
        },
        options: {
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
          },
        },
      });
    }
  }, [validOrgs, kpis]);

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>SUPER ADMIN</h2>

        <a href="/SuperAdmin/dashboard" className="active">Dashboard</a>
        <a href="/SuperAdmin/RegisteredOrganizations">Registered Organizations</a>
        <a href="/SuperAdmin/RegisteredAdmins">System Admin Accounts</a>

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
        <h1>SCI-ELD Overview</h1>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Organizations</h3>
            <p>{kpis.total}</p>
            <h4>(Sign-Ups)</h4>
          </div>

          <div className="kpi-card">
            <h3>Revenue (Est.)</h3>
            <p>ZMW {kpis.revenue}</p>
          </div>

          <div className="kpi-card">
            <h3>Monthly Growth</h3>
            <p>{kpis.monthlyGrowth}%</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Total Sign-Ups (Last 12 Months)</h3>
            <canvas id="growthChart"></canvas>
          </div>

          <div
            className="chart-box"
            style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 250 }}>
              <h3>Trial / Conversion</h3>
              <canvas id="trialChart"></canvas>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 180,
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
                justifyContent: "center",
              }}
            >
              <div className="conversion-card" style={{ background: "#F5F5F5", padding: "0.8rem 1rem", borderRadius: "8px" }}>
                <strong>In Trial:</strong> {conversionData.inTrial}
              </div>
              <div className="conversion-card" style={{ background: "#E8F5E9", padding: "0.8rem 1rem", borderRadius: "8px" }}>
                <strong>Converted (Paid):</strong> {conversionData.completedPaid}
              </div>
              <div className="conversion-card" style={{ background: "#FFF3E0", padding: "0.8rem 1rem", borderRadius: "8px" }}>
                <strong>Churned (No Payment):</strong> {conversionData.completedNoPay}
              </div>
            </div>
          </div>

          <div className="chart-box">
            <h3>Organization Types</h3>
            <canvas id="typeChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Regions</h3>
            <canvas id="regionChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;