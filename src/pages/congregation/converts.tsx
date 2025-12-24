import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ConvertsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // State for the data to be fetched from backend
  const [totalConverts, setTotalConverts] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [genderData, setGenderData] = useState([0, 0]); // Male, Female
  const [ageGroupData, setAgeGroupData] = useState([0, 0, 0, 0, 0]); // Age ranges: 0-12, 13-18, 19-35, 36-60, 60+
  const [growthData, setGrowthData] = useState<number[]>([]); // Converts growth over 12 months

  // Chart references (Chart.js instances)
  const growthChartRef = useRef<Chart | null>(null);
  const genderChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);

  /* ---------------- SIDEBAR LOGIC ---------------- */
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  /* ---------------- FETCH DATA FROM BACKEND ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch members data
        const membersResponse = await fetch(`${baseURL}/api/members`);
        const membersData = await membersResponse.json();

        // Fetch visitors data
        const visitorsResponse = await fetch(`${baseURL}/api/visitor`);
        const visitorsData = await visitorsResponse.json();

        // Fetch converts data
        const convertsResponse = await fetch(`${baseURL}/api/converts`);
        const convertsData = await convertsResponse.json();

        // Process gender distribution
        const genderCount = { male: 0, female: 0 };
        convertsData.forEach((convert: any) => {
          if (convert.convert_type === "member") {
            const member = membersData.find((m: any) => m.member_id === convert.member_id);
            if (member) {
              member.gender === "Male" ? genderCount.male++ : genderCount.female++;
            }
          } else if (convert.convert_type === "visitor") {
            const visitor = visitorsData.find((v: any) => v.id === convert.visitor_id);
            if (visitor) {
              visitor.gender === "Male" ? genderCount.male++ : genderCount.female++;
            }
          }
        });
        setGenderData([genderCount.male, genderCount.female]);

        // Process age distribution based only on converts
        const ageGroups = [0, 0, 0, 0, 0]; // 0-12, 13-18, 19-35, 36-60, 60+
        convertsData.forEach((convert: any) => {
          let age = null;

          if (convert.convert_type === "member") {
            const member = membersData.find((m: any) => m.member_id === convert.member_id);
            if (member) {
              age = member.age;
            }
          } else if (convert.convert_type === "visitor") {
            const visitor = visitorsData.find((v: any) => v.id === convert.visitor_id);
            if (visitor) {
              age = visitor.age;
            }
          }

          if (age !== null) {
            if (age <= 12) ageGroups[0]++;
            else if (age <= 18) ageGroups[1]++;
            else if (age <= 35) ageGroups[2]++;
            else if (age <= 60) ageGroups[3]++;
            else ageGroups[4]++;
          }
        });
        setAgeGroupData(ageGroups);

        // Process growth data (new converts per month)
        const growthByMonth: number[] = new Array(12).fill(0);
        convertsData.forEach((convert: any) => {
          const date = new Date(convert.convert_date);
          const month = date.getMonth(); // 0-based month
          growthByMonth[month]++;
        });
        setGrowthData(growthByMonth);

        // Calculate total converts and new converts this month
        const totalConvertsCount = convertsData.length;
        const newThisMonthCount = convertsData.filter((convert: any) => {
          const date = new Date(convert.convert_date);
          const currentMonth = new Date().getMonth();
          return date.getMonth() === currentMonth;
        }).length;

        setTotalConverts(totalConvertsCount);
        setNewThisMonth(newThisMonthCount);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to only fetch data once

  /* ---------------- INITIALIZE CHARTS ---------------- */
  useEffect(() => {
    // Destroy existing charts if they exist
    growthChartRef.current?.destroy();
    genderChartRef.current?.destroy();
    ageChartRef.current?.destroy();

    /* --- Converts Growth Chart --- */
    const growthCtx = document.getElementById("convertGrowthChart") as HTMLCanvasElement;
    if (growthCtx) {
      growthChartRef.current = new Chart(growthCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "New Converts",
              data: growthData,
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

    /* --- Gender Distribution Chart --- */
    const genderCtx = document.getElementById("convertGenderChart") as HTMLCanvasElement;
    if (genderCtx) {
      genderChartRef.current = new Chart(genderCtx, {
        type: "doughnut",
        data: {
          labels: ["Male", "Female"],
          datasets: [
            {
              data: genderData,
              backgroundColor: ["#1A3D7C", "#AF907A"],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    /* --- Age Group Chart --- */
    const ageCtx = document.getElementById("convertAgeChart") as HTMLCanvasElement;
    if (ageCtx) {
      ageChartRef.current = new Chart(ageCtx, {
        type: "doughnut",
        data: {
          labels: ["0-12", "13-18", "19-35", "36-60", "60+"],
          datasets: [
            {
              data: ageGroupData,
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
  }, [growthData, genderData, ageGroupData]); // Dependencies to re-render the charts when data changes

  return (
    <div className="dashboard-wrapper converts-wrapper">
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
          ➜ Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        {/* HEADER */}
        <header>
          <h1>New Converts Overview</h1>
          <br />
          <div className="header-buttons">
            <button className="add-btn" onClick={() => navigate("/congregation/addConvert")}>
              + &nbsp; Add Convert
            </button>
            &nbsp;&nbsp;
            <button className="add-btn" onClick={() => navigate("/congregation/convertRecords")}>
              View Converts
            </button>
          </div>
        </header>

        <br /><br />

        {/* KPI CARDS */}
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Converts</h3><p>{totalConverts}</p></div>
          <div className="kpi-card"><h3>New This Month</h3><p>{newThisMonth}</p></div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Converts Growth (12 Months)</h3>
            <canvas id="convertGrowthChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Gender Distribution</h3>
            <canvas id="convertGenderChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Age Group Distribution</h3>
            <canvas id="convertAgeChart"></canvas>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConvertsDashboard;
