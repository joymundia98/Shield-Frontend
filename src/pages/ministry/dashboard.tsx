import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

interface Team {
  id: number;
  name: string;
}

interface Member {
  id: number;
  name: string;
  teamId: number;
}

const MinistryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const membersChartRef = useRef<Chart | null>(null);

  const teams: Team[] = useMemo(
    () => [
      { id: 1, name: "Youth Ministry" },
      { id: 2, name: "Choir" },
      { id: 3, name: "Outreach Team" },
    ],
    []
  );

  const members: Member[] = useMemo(
    () => [
      { id: 1, name: "Alice", teamId: 1 },
      { id: 2, name: "Bob", teamId: 1 },
      { id: 3, name: "Charlie", teamId: 2 },
      { id: 4, name: "Diana", teamId: 3 },
    ],
    []
  );

  // Sidebar toggle
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

  // KPI calculations
  const totalTeams = teams.length;
  const totalMembers = members.length;
  const activeTeams = teams.length; // as in original HTML

  useEffect(() => {
    // Destroy previous chart if exists
    membersChartRef.current?.destroy();

    const ctx = document.getElementById("membersChart") as HTMLCanvasElement;
    if (ctx) {
      const teamNames = teams.map((t) => t.name);
      const memberCounts = teams.map(
        (t) => members.filter((m) => m.teamId === t.id).length
      );

      membersChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: teamNames,
          datasets: [
            {
              label: "Members",
              data: memberCounts,
              backgroundColor: "#1A3D7C",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }, [teams, members]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
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

        <h2>MINISTRY TEAMS</h2>
        <a href="/ministry/dashboard" className="active">
          Dashboard
        </a>
        <a href="/ministry/pastors">Pastors &amp; Clergy</a>
        <a href="/ministry/teams">Teams</a>
        <a href="/ministry/members">Members</a>
        <a href="/ministry/reports">Reports</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>

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
        <h1>Ministry Dashboard Overview</h1>

        <br/><br/>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Teams</h3>
            <p>{totalTeams}</p>
          </div>
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>{totalMembers}</p>
          </div>
          <div className="kpi-card">
            <h3>Active Teams</h3>
            <p>{activeTeams}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Members per Ministry Team</h3>
            <canvas id="membersChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinistryDashboard;
