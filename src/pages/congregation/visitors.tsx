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
  service_id: number,
  church_find_out: string; // Added church_find_out to the interface
}

interface Service {
  id: number;
  name: string;
  organization_id: number;
}

const VisitorsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

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

  // Fetch visitors and services from the backend API
  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found.");

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const orgFetch = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchVisitorsAndServices = async () => {
      try {
        const visitorsRes = await authFetch(`${baseURL}/api/visitor`);
        setVisitors(visitorsRes); // Set the visitors data

        const servicesRes = await authFetch(`${baseURL}/api/services`);
        setServices(servicesRes); // Set the services data
      } catch (err) {
        console.error("Error fetching visitors or services with authFetch:", err);
        try {
          const visitorsRes = await orgFetch(`${baseURL}/api/visitor`);
          setVisitors(visitorsRes); // Fallback to orgFetch

          const servicesRes = await orgFetch(`${baseURL}/api/services`);
          setServices(servicesRes); // Fallback to orgFetch for services
        } catch (fallbackErr) {
          console.error("Error fetching data with orgFetch:", fallbackErr);
        }
      }
    };

    fetchVisitorsAndServices();
  }, []);

  // Get the current month and year (e.g., "December 2025")
  const getCurrentMonthYear = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);  // Format as "Month Year"
  };

  const currentMonthYear = getCurrentMonthYear();

  // Calculate first-time visitors for the current month
  const firstTimeVisitorsThisMonth = visitors.filter((visitor) => {
    // Get the month and year from the visitor's visit_date
    const visitDate = new Date(visitor.visit_date);
    const visitorMonthYear = visitDate.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long'
    });

    // Check if visitor is a first-time visitor and if their visit is in the current month/year
    return visitor.first_time && visitorMonthYear === currentMonthYear;
  });

  // Initialize charts with dynamic data
  useEffect(() => {
    // Destroy previous charts before rendering new ones
    referralChartRef.current?.destroy();
    trendChartRef.current?.destroy();
    ageChartRef.current?.destroy();
    followUpChartRef.current?.destroy();

    // ➤ How Visitors Found the Church (Dynamic Data)
    const referralCtx = document.getElementById("referralChart") as HTMLCanvasElement;
    if (referralCtx) {
      // Define the referralCounts keys as a union type
      type ReferralMethod = "Friend/Family" | "Online Search" | "Social Media" | "Church Event" | "Walk-in";

      const referralCounts: Record<ReferralMethod, number> = {
        "Friend/Family": 0,
        "Online Search": 0,
        "Social Media": 0,
        "Church Event": 0,
        "Walk-in": 0,
      };

      visitors.forEach(visitor => {
        const referralMethod = visitor.church_find_out as ReferralMethod; // Cast church_find_out to ReferralMethod type
        if (referralCounts[referralMethod] !== undefined) {
          referralCounts[referralMethod]++;
        }
      });

      const referralData = Object.values(referralCounts);
      const referralLabels = Object.keys(referralCounts);

      referralChartRef.current = new Chart(referralCtx, {
        type: "pie",
        data: {
          labels: referralLabels,
          datasets: [
            {
              data: referralData,
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
    const ageCtx = document.getElementById("visitorAgeChart") as HTMLCanvasElement;
    if (ageCtx) {
      const ageGroups = [0, 0, 0, 0, 0]; // 0-12, 13-18, 19-35, 36-60, 60+
      const genderCounts = {
        male: [0, 0, 0, 0, 0],
        female: [0, 0, 0, 0, 0],
      };

      visitors.forEach(visitor => {
        let ageGroupIndex = -1;
        if (visitor.age <= 12) ageGroupIndex = 0;
        else if (visitor.age <= 18) ageGroupIndex = 1;
        else if (visitor.age <= 35) ageGroupIndex = 2;
        else if (visitor.age <= 60) ageGroupIndex = 3;
        else ageGroupIndex = 4;

        if (ageGroupIndex !== -1) {
          ageGroups[ageGroupIndex]++;
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

    // ➤ Service Attended Breakdown (Dynamic Data)
    const serviceCtx = document.getElementById("serviceBreakdownChart") as HTMLCanvasElement;
    if (serviceCtx && services.length > 0) {
      const serviceCounts = new Array(services.length).fill(0);

      visitors.forEach(visitor => {
        const serviceIndex = services.findIndex(service => service.id === visitor.service_id);
        if (serviceIndex !== -1) {
          serviceCounts[serviceIndex]++;
        }
      });

      followUpChartRef.current = new Chart(serviceCtx, {
        type: "doughnut",
        data: {
          labels: services.map(service => service.name),
          datasets: [
            {
              data: serviceCounts,
              backgroundColor: services.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`), // Random color for each service
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [visitors, services]); // Re-run when visitors or services data changes

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
          <div className="kpi-card"><h3>First-Time Visitors</h3><p>{firstTimeVisitorsThisMonth.length}</p>Current Month: {currentMonthYear}</div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>How Visitors Found the Church</h3>
            <canvas id="referralChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Visitor Trend (Last 12 Months)</h3>
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
