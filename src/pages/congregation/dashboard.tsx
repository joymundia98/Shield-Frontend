import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

const CongregationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Chart refs
  const growthChartRef = useRef<Chart | null>(null);
  const statusChartRef = useRef<Chart | null>(null);
  const attendanceChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);

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

  /* ------------------------------------
     CREATE ALL CHARTS
  --------------------------------------*/
  useEffect(() => {
    growthChartRef.current?.destroy();
    statusChartRef.current?.destroy();
    attendanceChartRef.current?.destroy();
    ageChartRef.current?.destroy();

    /* ---- Growth Chart (Line) ---- */
    const growthCtx = document.getElementById("growthChart") as HTMLCanvasElement;
    if (growthCtx) {
      growthChartRef.current = new Chart(growthCtx, {
        type: "line",
        data: {
          labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          datasets: [
            {
              label: "Total Members",
              data: [260,270,275,280,290,300,305,310,315,318,319,320],
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26, 61, 124, 0.25)",
              borderWidth: 3,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    }

    /* ---- Members By Status (Pie) ---- */
    const statusCtx = document.getElementById("statusChart") as HTMLCanvasElement;
    if (statusCtx) {
      statusChartRef.current = new Chart(statusCtx, {
        type: "pie",
        data: {
          labels: ["Active", "Visitor", "New Convert", "Inactive", "Transferred"],
          datasets: [
            {
              data: [200, 45, 30, 30, 15],
              backgroundColor: [
                "#1A3D7C",
                "#5C4736",
                "#AF907A",
                "#817E7A",
                "#20262C",
              ],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    /* ---- Attendance (Bar) ---- */
    const attendanceCtx = document.getElementById("attendanceChart") as HTMLCanvasElement;
    if (attendanceCtx) {
      attendanceChartRef.current = new Chart(attendanceCtx, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Attendance",
              data: [220, 240, 210, 230],
              backgroundColor: "#1A3D7C",
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    /* ---- Age Distribution (Doughnut) ---- */
    const ageCtx = document.getElementById("ageChart") as HTMLCanvasElement;
    if (ageCtx) {
      ageChartRef.current = new Chart(ageCtx, {
        type: "doughnut",
        data: {
          labels: ["0-12", "13-18", "19-35", "36-60", "60+"],
          datasets: [
            {
              data: [50, 40, 120, 80, 30],
              backgroundColor: [
                "#5C4736",
                "#817E7A",
                "#AF907A",
                "#1A3D7C",
                "#20262C",
              ],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, []);

  return (
    <div className="dashboard-wrapper">

      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">

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

        <h2>CONGREGATION</h2>

        <a href="/congregation/dashboard" className="active">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
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
          ➜] Logout
        </a>
      </div>


      {/* MAIN DASHBOARD CONTENT */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        <h1>Congregation Overview</h1>

        <br/><br/>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>320</p>
          </div>
          <div className="kpi-card">
            <h3>Visitors This Month</h3>
            <p>45</p>
          </div>
          <div className="kpi-card">
            <h3>New Converts</h3>
            <p>30</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Church Growth (Last 12 Months)</h3>
            <canvas id="growthChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Members by Status</h3>
            <canvas id="statusChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Attendance Last 4 Weeks</h3>
            <canvas id="attendanceChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Age Group Distribution</h3>
            <canvas id="ageChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongregationDashboard;
