import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

const VisitorsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const referralChartRef = useRef<Chart | null>(null);
  const trendChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);
  const followUpChartRef = useRef<Chart | null>(null); // reused for service chart

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Initialize charts
  useEffect(() => {
    referralChartRef.current?.destroy();
    trendChartRef.current?.destroy();
    ageChartRef.current?.destroy();
    followUpChartRef.current?.destroy();

    // ➤ How Visitors Found the Church
    const referralCtx = document.getElementById("referralChart") as HTMLCanvasElement;
    if (referralCtx) {
      referralChartRef.current = new Chart(referralCtx, {
        type: "pie",
        data: {
          labels: ["Friend/Family", "Online Search", "Social Media", "Church Event", "Walk-in"],
          datasets: [
            {
              data: [40, 25, 20, 15, 20],
              backgroundColor: ["#1A3D7C", "#AF907A", "#5C4736", "#817E7A", "#20262C"],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // ➤ Visitor Trend (12 Months)
    const trendCtx = document.getElementById("visitorTrendChart") as HTMLCanvasElement;
    if (trendCtx) {
      trendChartRef.current = new Chart(trendCtx, {
        type: "line",
        data: {
          labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          datasets: [
            {
              label: "First-Time Visitors",
              data: [5, 8, 7, 10, 12, 15, 13, 14, 9, 11, 8, 12],
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26,61,124,0.25)",
              borderWidth: 3,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // ➤ Visitor Age Group Distribution
    const ageCtx = document.getElementById("visitorAgeChart") as HTMLCanvasElement;
    if (ageCtx) {
      ageChartRef.current = new Chart(ageCtx, {
        type: "doughnut",
        data: {
          labels: ["0-12", "13-18", "19-35", "36-60", "60+"],
          datasets: [
            {
              data: [10, 15, 60, 25, 10],
              backgroundColor: ["#5C4736", "#817E7A", "#AF907A", "#1A3D7C", "#20262C"],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // ➤ Service Attended Breakdown (REPLACED LAST CHART)
    const serviceCtx = document.getElementById("serviceBreakdownChart") as HTMLCanvasElement;
    if (serviceCtx) {
      followUpChartRef.current = new Chart(serviceCtx, {
        type: "doughnut",
        data: {
          labels: ["Sunday Service", "Midweek Service", "Youth Service", "Special Program"],
          datasets: [
            {
              data: [50, 25, 15, 10], // example values
              backgroundColor: ["#1A3D7C", "#AF907A", "#5C4736", "#817E7A"],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, []);

  return (
    <div className="dashboard-wrapper visitors-wrapper">
      {/* HAMBURGER */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>CONGREGATION</h2>
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors" className="active">Visitors</a>
        <a href="/congregation/converts">New Converts</a>

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
          ➜ Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>

        <header>
          <h1>Church Visitors Overview</h1>
          <br />
          <div className="header-buttons">
            <button className="add-btn" onClick={() => navigate("/congregation/addVisitors")}>
              + &nbsp; Add Visitor
            </button>
            &nbsp;&nbsp;
            <button className="add-btn" onClick={() => navigate("/congregation/visitorRecords")}>
              View Visitors
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <br /><br />
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Visitors</h3><p>120</p></div>
          <div className="kpi-card"><h3>First-Time Visitors</h3><p>85</p></div>
          <div className="kpi-card"><h3>Follow-ups Completed</h3><p>60</p></div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>How Visitors Found the Church</h3>
            <canvas id="referralChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Visitor Trend (12 Months)</h3>
            <canvas id="visitorTrendChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Visitor Age Group Distribution</h3>
            <canvas id="visitorAgeChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Service Attended Breakdown</h3>
            <canvas id="serviceBreakdownChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsDashboard;
