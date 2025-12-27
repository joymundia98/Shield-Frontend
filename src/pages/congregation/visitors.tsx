import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Set up the base URL for API requests
const baseURL = import.meta.env.VITE_BASE_URL; // Assuming you're using environment variables for the API URL

interface Visitor {
  id: number;
  name: string;
  gender: string;
  age: number;
  visit_date: string;
  address: string;
  phone: string;
  email: string;
  invited_by: string;
  photo_url: string | null;
  first_time: boolean;
  needs_follow_up: boolean;
}

const VisitorsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // Initialize chart refs
  const referralChartRef = useRef<Chart | null>(null);
  const trendChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);
  const followUpChartRef = useRef<Chart | null>(null);

  // Sidebar toggle function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sidebar effect
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch visitors from the backend API
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/visitor`);
        setVisitors(res.data); // Set the visitors data from the API response
      } catch (err) {
        console.error("Error fetching visitors:", err);
      }
    };
    fetchVisitors();
  }, []);

  // Get the current month and year (e.g., "December 2025")
  const getCurrentMonthYear = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);  // Format as "Month Year"
  };

  const currentMonthYear = getCurrentMonthYear();

  // Initialize charts with dynamic data
  useEffect(() => {
    // Destroy previous charts before rendering new ones
    referralChartRef.current?.destroy();
    trendChartRef.current?.destroy();
    ageChartRef.current?.destroy();
    followUpChartRef.current?.destroy();

    // ➤ How Visitors Found the Church (Static Data)
    const referralCtx = document.getElementById("referralChart") as HTMLCanvasElement;
    if (referralCtx) {
      referralChartRef.current = new Chart(referralCtx, {
        type: "pie",
        data: {
          labels: ["Friend/Family", "Online Search", "Social Media", "Church Event", "Walk-in"],
          datasets: [
            {
              data: [40, 25, 20, 15, 20], // Static data
              backgroundColor: ["#1A3D7C", "#AF907A", "#5C4736", "#817E7A", "#20262C"],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // ➤ Visitor Trend (12 Months) - Dynamic Data (With Gender Breakdown)
    const trendCtx = document.getElementById("visitorTrendChart") as HTMLCanvasElement;
    if (trendCtx) {
      const monthlyCountsMale = new Array(12).fill(0); // Count for Males
      const monthlyCountsFemale = new Array(12).fill(0); // Count for Females

      visitors.forEach(visitor => {
        const visitDate = new Date(visitor.visit_date);
        if (!isNaN(visitDate.getTime())) {
          const monthIndex = visitDate.getMonth();
          if (visitor.gender === "Male") {
            monthlyCountsMale[monthIndex] += 1;
          } else if (visitor.gender === "Female") {
            monthlyCountsFemale[monthIndex] += 1;
          }
        }
      });

      trendChartRef.current = new Chart(trendCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Male Visitors",
              data: monthlyCountsMale,
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26,61,124,0.25)",
              borderWidth: 3,
              fill: true,
              tension: 0.3,
            },
            {
              label: "Female Visitors",
              data: monthlyCountsFemale,
              borderColor: "#AF907A",
              backgroundColor: "rgba(175,144,122,0.25)",
              borderWidth: 3,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const month = tooltipItems[0].label;
                  return `${month}: ${monthlyCountsMale[tooltipItems[0].dataIndex]} Male, ${monthlyCountsFemale[tooltipItems[0].dataIndex]} Female`;
                },
              },
            },
          },
        },
      });
    }
    // ➤ Visitor Age Group Distribution - Dynamic Data (Single Donut with Tooltip)

  // ➤ Visitor Age Group Distribution - Dynamic Data (Single Donut Chart with Descriptive Tooltip)
  const ageCtx = document.getElementById("visitorAgeChart") as HTMLCanvasElement;
  if (ageCtx) {
    const ageGroups = [0, 0, 0, 0, 0]; // 0-12, 13-18, 19-35, 36-60, 60+
    const genderCounts = {
      male: [0, 0, 0, 0, 0],
      female: [0, 0, 0, 0, 0],
    };

    visitors.forEach(visitor => {
      // Age Group Categorization
      let ageGroupIndex = -1;
      if (visitor.age <= 12) ageGroupIndex = 0;
      else if (visitor.age <= 18) ageGroupIndex = 1;
      else if (visitor.age <= 35) ageGroupIndex = 2;
      else if (visitor.age <= 60) ageGroupIndex = 3;
      else ageGroupIndex = 4;

      if (ageGroupIndex !== -1) {
        ageGroups[ageGroupIndex]++; // Count for overall age group
        if (visitor.gender === "Male") {
          genderCounts.male[ageGroupIndex]++;
        } else if (visitor.gender === "Female") {
          genderCounts.female[ageGroupIndex]++;
        }
      }
    });

    ageChartRef.current = new Chart(ageCtx, {
      type: "doughnut",
      data: {
        labels: ["0-12", "13-18", "19-35", "36-60", "60+"],
        datasets: [
          {
            data: ageGroups,
            backgroundColor: ["#1A3D7C", "#AF907A", "#5C4736", "#20262C", "#5C4736"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const ageGroupIndex = tooltipItems[0].dataIndex;
                const ageGroup = tooltipItems[0].label;
                const maleCount = genderCounts.male[ageGroupIndex];
                const femaleCount = genderCounts.female[ageGroupIndex];
                return `${ageGroup}: 
  Total ${ageGroups[ageGroupIndex]}, 
  Male ${maleCount}, 
  Female ${femaleCount}`;
              },
              label: (tooltipItem) => {
                // Optional: Display percentage of total if needed
                const total = ageGroups.reduce((acc, count) => acc + count, 0);
                const percentage = ((ageGroups[tooltipItem.dataIndex] / total) * 100).toFixed(2);
                return `${percentage}%`;
              },
            },
          },
        },
      },
    });
  }



    // ➤ Service Attended Breakdown (Static Data)
    const serviceCtx = document.getElementById("serviceBreakdownChart") as HTMLCanvasElement;
    if (serviceCtx) {
      followUpChartRef.current = new Chart(serviceCtx, {
        type: "doughnut",
        data: {
          labels: ["Sunday Service", "Midweek Service", "Youth Service", "Special Program"],
          datasets: [
            {
              data: [50, 25, 15, 10], // Static data
              backgroundColor: ["#1A3D7C", "#AF907A", "#5C4736", "#817E7A"],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [visitors]); // Re-run when visitors data changes

  return (
    <div className="dashboard-wrapper visitors-wrapper">
      {/* Sidebar and Main Content */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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

      {/* Main Content */}
      <div className="dashboard-content">
        <CongregationHeader /><br />

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

        {/* KPI Cards */}
        <br /><br />
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Visitors</h3><p>{visitors.length}</p></div>
          <div className="kpi-card"><h3>First-Time Visitors</h3><p>{visitors.filter(visitor => visitor.first_time).length}</p>Current Month: {currentMonthYear}</div>
          <div className="kpi-card"><h3>Follow-ups Completed</h3><p>60</p></div>
        </div>

        {/* Charts */}
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
