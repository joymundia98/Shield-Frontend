import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { authFetch, orgFetch } from "../../utils/api";  // Import authFetch and orgFetch

// Base API URL
const baseURL = import.meta.env.VITE_BASE_URL;

// Helper function to fetch data with authFetch and fallback to orgFetch if needed
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    // Attempt to fetch using authFetch first
    return await authFetch(url);  // Return the response directly if it's already structured
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");
    return await orgFetch(url);  // Fallback to orgFetch and return the response directly
  }
};

const CongregationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for KPI cards and charts data
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [visitors, setVisitors] = useState<number>(0);
  const [newConverts, setNewConverts] = useState<number>(0);
  const [growthData, setGrowthData] = useState<number[]>([]);
  const [statusData, setStatusData] = useState<number[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ week: string, members: number, visitors: number }[]>([]);

  const [ageGroupData, setAgeGroupData] = useState<{ [key: string]: { members: number; visitors: number } }>({
    "0-12": { members: 0, visitors: 0 },
    "13-18": { members: 0, visitors: 0 },
    "19-35": { members: 0, visitors: 0 },
    "36-60": { members: 0, visitors: 0 },
    "60+": { members: 0, visitors: 0 },
  });

  // Chart refs
  const growthChartRef = useRef<Chart | null>(null);
  const statusChartRef = useRef<Chart | null>(null);
  const attendanceChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch data from multiple APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data using authFetch and orgFetch fallback
        const [membersRes, visitorsRes, convertsRes, _statisticsRes, attendanceRes] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/members`),
          fetchDataWithAuthFallback(`${baseURL}/api/visitor`),
          fetchDataWithAuthFallback(`${baseURL}/api/converts`),
          fetchDataWithAuthFallback(`${baseURL}/api/congregation/member_statistics`),
          fetchDataWithAuthFallback(`${baseURL}/api/congregation/attendance`),
        ]);

        const members = membersRes.data;
        console.log(members);
        const visitors = visitorsRes;

        // 1. Calculate Church Growth Data (Number of members joined in each of the last 12 months)
        const growthCounts = new Array(12).fill(0);  // Array to hold member counts for each month of the last 12 months
        
        const today = new Date();

        // Calculate how many members joined in each of the last 12 months
        members.forEach((member: any) => {
          const joinedDate = new Date(member.date_joined);
          const monthsAgo = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 3600 * 24 * 30)); // Approx. months difference

          if (monthsAgo >= 0 && monthsAgo < 12) {
            growthCounts[monthsAgo] += 1;
          }
        });

        // Set growth data (reverse so most recent month is last)
        setGrowthData(growthCounts.reverse());

        // Initialize counters for the different statuses
        const statusCounts = {
          active: 0,
          visitor: 0,
          newConvert: 0,
          inactive: 0,
          transferred: 0,
        };

        // Aggregate data by member status
        members.forEach((member: any) => {
          switch (member.status) {
            case "Active":
              statusCounts.active += 1;
              break;
            case "Inactive":
              statusCounts.inactive += 1;
              break;
            case "Transferred":
              statusCounts.transferred += 1;
              break;
            default:
              break;
          }
        });

        // Set the counts for visitors and converts
        setVisitors(visitorsRes.length);       // Count the number of visitors
        setNewConverts(convertsRes.length);    // Count the number of new converts

        // Update statusData for the pie chart
        setStatusData([
          statusCounts.active,       // Active members
          visitorsRes.length,   // Visitors
          convertsRes.length,   // New Converts
          statusCounts.inactive,     // Inactive members
          statusCounts.transferred,  // Transferred members
        ]);

        // Attendance Data (From /api/congregation/attendance)
        const attendanceRecords = attendanceRes;
        const getLast4Weeks = () => {
          const weeks = [];
          const today = new Date();
          for (let i = 0; i < 4; i++) {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() - 7 * i); // Start of the week (Sunday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
            weeks.push({ start: startOfWeek, end: endOfWeek });
          }
          return weeks;
        };

        const last4Weeks = getLast4Weeks();

        const attendanceCount = last4Weeks.map(week => {
          const weekStart = new Date(week.start);
          const weekEnd = new Date(week.end);

          const weekMembersCount = attendanceRecords.filter((record: any) => {
            const attendanceDate = new Date(record.attendance_date);
            return (attendanceDate >= weekStart && attendanceDate <= weekEnd) && record.member_id !== null;
          }).length;

          const weekVisitorsCount = attendanceRecords.filter((record: any) => {
            const attendanceDate = new Date(record.attendance_date);
            return (attendanceDate >= weekStart && attendanceDate <= weekEnd) && record.visitor_id !== null;
          }).length;

          return {
            week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
            members: weekMembersCount,
            visitors: weekVisitorsCount,
          };
        });

        // Sort attendance data by the start date of the week (oldest to newest)
        const sortedAttendanceData = attendanceCount.sort((a, b) => {
          const dateA = new Date(a.week.split(" - ")[0]);
          const dateB = new Date(b.week.split(" - ")[0]);
          return dateA.getTime() - dateB.getTime(); // Oldest first
        });

        // Reverse the array to make sure the latest week is on the right
        const reversedAttendanceData = sortedAttendanceData.reverse();

        setAttendanceData(reversedAttendanceData);  // Set the reversed attendance data

        // Total Members
        setTotalMembers(members.length);  // Total number of members

        // Aggregating Age Data for Age Group Distribution (with separate counts for members and visitors)
        const ageGroups = {
          "0-12": { members: 0, visitors: 0 },
          "13-18": { members: 0, visitors: 0 },
          "19-35": { members: 0, visitors: 0 },
          "36-60": { members: 0, visitors: 0 },
          "60+": { members: 0, visitors: 0 },
        };

        // Helper function to classify age
        const classifyAge = (age: number) => {
          if (age >= 0 && age <= 12) return "0-12";
          if (age >= 13 && age <= 18) return "13-18";
          if (age >= 19 && age <= 35) return "19-35";
          if (age >= 36 && age <= 60) return "36-60";
          return "60+"; // For ages 60 and above
        };

        // Classify members' ages into the appropriate group
        members.forEach((member: any) => {
          const ageGroup = classifyAge(member.age);
          ageGroups[ageGroup].members += 1;
        });

        // Classify visitors' ages into the appropriate group
        visitors.forEach((visitor: any) => {
          const ageGroup = classifyAge(visitor.age);
          ageGroups[ageGroup].visitors += 1;
        });

        // Set the age group data for the pie chart
        setAgeGroupData(ageGroups);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Render charts dynamically based on fetched data
  useEffect(() => {
    growthChartRef.current?.destroy();
    statusChartRef.current?.destroy();
    attendanceChartRef.current?.destroy();
    ageChartRef.current?.destroy();

    // Growth chart (line)
    const growthCtx = document.getElementById("growthChart") as HTMLCanvasElement;
    if (growthCtx) {
      growthChartRef.current = new Chart(growthCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "New Members (Monthly Growth)",
              data: growthData,
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

    // Members by Status (Pie)
    const statusCtx = document.getElementById("statusChart") as HTMLCanvasElement;
    if (statusCtx) {
      statusChartRef.current = new Chart(statusCtx, {
        type: "pie",
        data: {
          labels: ["Active", "Visitor", "New Convert", "Inactive", "Transferred"],
          datasets: [
            {
              data: statusData,
              backgroundColor: [
                "#1A3D7C", "#5C4736", "#AF907A", "#817E7A", "#20262C",
              ],
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // Attendance (Bar)
    const attendanceCtx = document.getElementById("attendanceChart") as HTMLCanvasElement;
    if (attendanceCtx) {
      attendanceChartRef.current = new Chart(attendanceCtx, {
        type: "bar",
        data: {
          labels: attendanceData.map((item) => item.week),
          datasets: [
            {
              label: "Members",
              data: attendanceData.map((item) => item.members),
              backgroundColor: "#5C4736",
            },
            {
              label: "Visitors",
              data: attendanceData.map((item) => item.visitors),
              backgroundColor: "#1A3D7C",
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // Age Group Distribution (Doughnut)
    const ageCtx = document.getElementById("ageChart") as HTMLCanvasElement;
    if (ageCtx) {
      ageChartRef.current = new Chart(ageCtx, {
        type: "doughnut",
        data: {
          labels: ["0-12", "13-18", "19-35", "36-60", "60+"],
          datasets: [
            {
              data: [
                ageGroupData["0-12"].members + ageGroupData["0-12"].visitors,
                ageGroupData["13-18"].members + ageGroupData["13-18"].visitors,
                ageGroupData["19-35"].members + ageGroupData["19-35"].visitors,
                ageGroupData["36-60"].members + ageGroupData["36-60"].visitors,
                ageGroupData["60+"].members + ageGroupData["60+"].visitors,
              ],
              backgroundColor: [
                "#5C4736", "#817E7A", "#AF907A", "#1A3D7C", "#20262C",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const label = tooltipItem.label || '';
                  const group = label.trim();
                  const membersCount = ageGroupData[group]?.members || 0;
                  const visitorsCount = ageGroupData[group]?.visitors || 0;
                  return `${label}: Members - ${membersCount}, Visitors - ${visitorsCount}`;
                }
              }
            }
          }
        }
      });
    }
  }, [growthData, statusData, attendanceData, ageGroupData]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
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

      {/* MAIN DASHBOARD CONTENT */}
      <div className="dashboard-content">
        <CongregationHeader /><br />
                
        <h1>Congregation Overview</h1>
        <br /><br />

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>{totalMembers}</p>
          </div>
          <div className="kpi-card">
            <h3>Visitors This Month</h3>
            <p>{visitors}</p>
          </div>
          <div className="kpi-card">
            <h3>New Converts</h3>
            <p>{newConverts}</p>
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
