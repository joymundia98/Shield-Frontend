import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Member {
  member_id: number;
  full_name: string;
  age: number;
  gender: "Male" | "Female";
  date_joined: string;
  widowed: boolean;
  orphan: boolean;
  disabled: boolean;
  status: "Active" | "Visitor" | "New Convert" | "Inactive" | "Transferred";
}

const ChurchMembersDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const growthChartRef = useRef<Chart | null>(null);
  const genderChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);
  const statusChartRef = useRef<Chart | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  // Render charts dynamically based on fetched members
  useEffect(() => {
    if (!members.length) return;

    // Destroy old charts if they exist
    growthChartRef.current?.destroy();
    genderChartRef.current?.destroy();
    ageChartRef.current?.destroy();
    statusChartRef.current?.destroy();

    // Growth chart (members per month)
    const growthCtx = document.getElementById("growthChart") as HTMLCanvasElement;
    if (growthCtx) {
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(i);
        return d.toLocaleString("default", { month: "short" });
      });

      const monthlyCounts = Array(12).fill(0);
      members.forEach(m => {
        const joinDate = new Date(m.date_joined);
        if (!isNaN(joinDate.getTime())) {
          monthlyCounts[joinDate.getMonth()] += 1;
        }
      });

      growthChartRef.current = new Chart(growthCtx, {
        type: "line",
        data: {
          labels: months,
          datasets: [{
            label: "New Members",
            data: monthlyCounts,
            borderColor: "#1A3D7C",
            backgroundColor: "rgba(26,61,124,0.25)",
            fill: true,
            borderWidth: 3,
            tension: 0.3
          }]
        },
        options: { responsive: true }
      });
    }

    // Gender chart
    const genderCtx = document.getElementById("genderChart") as HTMLCanvasElement;
    if (genderCtx) {
      const maleCount = members.filter(m => m.gender === "Male").length;
      const femaleCount = members.filter(m => m.gender === "Female").length;
      genderChartRef.current = new Chart(genderCtx, {
        type: "doughnut",
        data: {
          labels: ["Male", "Female"],
          datasets: [{ data: [maleCount, femaleCount], backgroundColor: ["#1A3D7C","#AF907A"] }]
        },
        options: { responsive: true }
      });
    }

    // Age group chart
    const ageCtx = document.getElementById("ageChart") as HTMLCanvasElement;
    if (ageCtx) {
      const ageGroups = [0, 0, 0, 0, 0]; // 0-12, 13-18, 19-35, 36-60, 60+
      members.forEach(m => {
        if (m.age <= 12) ageGroups[0]++;
        else if (m.age <= 18) ageGroups[1]++;
        else if (m.age <= 35) ageGroups[2]++;
        else if (m.age <= 60) ageGroups[3]++;
        else ageGroups[4]++;
      });

      ageChartRef.current = new Chart(ageCtx, {
        type: "doughnut",
        data: {
          labels: ["0-12","13-18","19-35","36-60","60+"],
          datasets: [{ data: ageGroups, backgroundColor: ["#5C4736","#817E7A","#AF907A","#1A3D7C","#20262C"] }]
        },
        options: { responsive: true }
      });
    }

    // Status chart
    const statusCtx = document.getElementById("statusChart") as HTMLCanvasElement;
    if (statusCtx) {
      const statusCounts: Record<string, number> = { Active: 0, Visitor: 0, "New Convert": 0, Inactive: 0, Transferred: 0 };
      members.forEach(m => {
        if (statusCounts[m.status] !== undefined) statusCounts[m.status]++;
      });

      statusChartRef.current = new Chart(statusCtx, {
        type: "pie",
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{ data: Object.values(statusCounts), backgroundColor: ["#1A3D7C","#5C4736","#AF907A","#817E7A","#20262C"] }]
        },
        options: { responsive: true }
      });
    }
  }, [members]);

  return (
    <div className="dashboard-wrapper members-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

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
        <a href="/congregation/members" className="active">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts">New Converts</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
        <a
          href="/"
          className="logout-link"
          onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}
        >
          ➜ Logout
        </a>
      </div>

      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        <header>
          <h1>Church Members Overview</h1>
          <br/>
          <div className="header-buttons">
            <button className="add-btn" onClick={() => navigate("/congregation/addMember")}>+ &nbsp; Add Member</button>&nbsp;&nbsp;
            <button className="add-btn" onClick={() => navigate("/congregation/memberRecords")}>View Members</button>
          </div>
        </header>

        <br/><br/>
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Members</h3><p>{members.length}</p></div>
          <div className="kpi-card"><h3>Widows</h3><p>{members.filter(m => m.widowed).length}</p></div>
          <div className="kpi-card"><h3>Orphans</h3><p>{members.filter(m => m.orphan).length}</p></div>
          <div className="kpi-card"><h3>Disabled Members</h3><p>{members.filter(m => m.disabled).length}</p></div>
        </div>

        <div className="chart-grid">
          <div className="chart-box"><h3>Church Growth (12 Months)</h3><canvas id="growthChart"></canvas></div>
          <div className="chart-box"><h3>Gender Distribution</h3><canvas id="genderChart"></canvas></div>
          <div className="chart-box"><h3>Age Group Distribution</h3><canvas id="ageChart"></canvas></div>
          <div className="chart-box"><h3>Members by Status</h3><canvas id="statusChart"></canvas></div>
        </div>
      </div>
    </div>
  );
};

export default ChurchMembersDashboard;
