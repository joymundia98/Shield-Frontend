import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../../styles/global.css";

interface Counsellor {
  id: number;
  name: string;
}

interface Session {
  id: number;
  member: string;
  gender: string;
  counsellorId: number;
  status: "Pending" | "Completed";
}

interface FollowUp {
  id: number;
  sessionId: number;
  date: string;
}

interface PrayerRequest {
  id: number;
  member: string;
  priority: "Normal" | "High" | "Urgent";
}

const PastoralDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Charts refs
  const followUpChartRef = useRef<Chart | null>(null);
  const prayerChartRef = useRef<Chart | null>(null);
  const genderChartRef = useRef<Chart | null>(null);

  // Memoized data to prevent useEffect warnings
  const counsellors: Counsellor[] = useMemo(() => [
    { id: 1, name: "Pastor John" },
    { id: 2, name: "Counsellor Mary" },
    { id: 3, name: "Counsellor James" }
  ], []);

  const sessions: Session[] = useMemo(() => [
    { id: 1, member: "Alice", gender: "Female", counsellorId: 1, status: "Completed" },
    { id: 2, member: "Bob", gender: "Male", counsellorId: 2, status: "Pending" },
    { id: 3, member: "Clara", gender: "Female", counsellorId: 3, status: "Completed" },
    { id: 4, member: "David", gender: "Male", counsellorId: 1, status: "Pending" }
  ], []);

  const followUps: FollowUp[] = useMemo(() => [
    { id: 1, sessionId: 1, date: "2025-11-01" },
    { id: 2, sessionId: 1, date: "2025-11-15" },
    { id: 3, sessionId: 2, date: "2025-11-10" },
    { id: 4, sessionId: 3, date: "2025-11-12" }
  ], []);

  const prayerRequests: PrayerRequest[] = useMemo(() => [
    { id: 1, member: "Alice", priority: "High" },
    { id: 2, member: "Bob", priority: "Normal" },
    { id: 3, member: "Clara", priority: "Urgent" },
    { id: 4, member: "David", priority: "Normal" }
  ], []);

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

  // Calculate KPI
  const totalCounsellors = counsellors.length;
  const totalSessions = sessions.length;
  const pendingSessions = sessions.filter(s => s.status === "Pending").length;
  const completedSessions = sessions.filter(s => s.status === "Completed").length;
  const totalPrayerRequests = prayerRequests.length;

  // Initialize charts
  useEffect(() => {
    // Destroy previous charts if exist
    followUpChartRef.current?.destroy();
    prayerChartRef.current?.destroy();
    genderChartRef.current?.destroy();

    // Follow-Ups per session
    const followUpCtx = document.getElementById("followUpChart") as HTMLCanvasElement;
    if (followUpCtx) {
      followUpChartRef.current = new Chart(followUpCtx, {
        type: "bar",
        data: {
          labels: sessions.map(s => s.member),
          datasets: [
            {
              label: "Number of Follow-Ups",
              data: sessions.map(s => followUps.filter(f => f.sessionId === s.id).length),
              backgroundColor: "#1A3D7C",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
        },
      });
    }

    // Prayer Requests by priority
    const priorityCounts = { Normal: 0, High: 0, Urgent: 0 };
    prayerRequests.forEach(p => priorityCounts[p.priority]++);
    const prayerCtx = document.getElementById("prayerPriorityChart") as HTMLCanvasElement;
    if (prayerCtx) {
      prayerChartRef.current = new Chart(prayerCtx, {
        type: "pie",
        data: {
          labels: ["Normal", "High", "Urgent"],
          datasets: [
            {
              data: [priorityCounts.Normal, priorityCounts.High, priorityCounts.Urgent],
              backgroundColor: ["#1A3D7C", "#AF907A", "#e74c3c"],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // Gender distribution
    type Gender = "Male" | "Female" | "Other";

    const genderCounts: Record<Gender, number> = { Male: 0, Female: 0, Other: 0 };

    sessions.forEach(s => {
      const gender = s.gender as Gender;
      if (Object.prototype.hasOwnProperty.call(genderCounts, gender)) {
        genderCounts[gender] += 1;
      } else {
        console.warn(`Unknown gender: ${s.gender}`);
      }
    });

    const genderCtx = document.getElementById("genderChart") as HTMLCanvasElement;
    if (genderCtx) {
      genderChartRef.current = new Chart(genderCtx, {
        type: "doughnut",
        data: {
          labels: ["Male", "Female"],
          datasets: [
            {
              data: [genderCounts.Male, genderCounts.Female],
              backgroundColor: ["#1A3D7C", "#AF907A"],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [sessions, followUps, prayerRequests]);

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

        <h2>PASTORAL CARE & COUNSELLING</h2>
        <br/><br/> 
        <a href="#" className="active">
          Dashboard
        </a>

        <h3 className="sidebar-section-title">Counselling Management</h3>
        <a href="/counsellors">Counsellors</a>
        <a href="/counselling-sessions">Counselling Sessions</a>
        <a href="/follow-up-sessions">Follow-Ups</a>
        <a href="/prayer-requests">Prayer Requests</a>

        <h3 className="sidebar-section-title">Administration</h3>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>

        {/* Two break lines before logout */}
        <br />
        <br />
        <a
          href="#"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          ➜] &nbsp; Logout
        </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <h1>Pastoral Care & Counselling Overview</h1>

        <br />
        <br />

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Counsellors</h3>
            <p>{totalCounsellors}</p>
          </div>
          <div className="kpi-card">
            <h3>Total Sessions</h3>
            <p>{totalSessions}</p>
          </div>
          <div className="kpi-card">
            <h3>Pending Sessions</h3>
            <p>{pendingSessions}</p>
          </div>
          <div className="kpi-card">
            <h3>Completed Sessions</h3>
            <p>{completedSessions}</p>
          </div>
          <div className="kpi-card">
            <h3>Prayer Requests</h3>
            <p>{totalPrayerRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Follow-Ups per Session</h3>
            <canvas id="followUpChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Prayer Requests by Priority</h3>
            <canvas id="prayerPriorityChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Gender Distribution of Counselling Seekers</h3>
            <canvas id="genderChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastoralDashboard;
