import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/global.css";
import HeaderNav from '../components/HeaderNav';
import Calendar from "../pages/programs/Calendar"; // Import the Calendar component
import { useAuth } from "../hooks/useAuth";  // Import useAuth to access hasPermission

import type { Program } from "../pages/programs/dashboard";  // Using type-only import

import { authFetch, orgFetch } from "../utils/api"; // Import the authFetch function

const baseURL = import.meta.env.VITE_BASE_URL;

interface KPI {
  totalMembers: number;
  weeklyAttendance: number;
  monthlyGiving: number;
  activeVolunteers: number;
}

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

interface AttendanceRecord {
  record_id: number;
  status: "Present" | "Absent";
  attendance_date: string;
  service_id: number;
  member_id: number | null;
  visitor_id: number | null;
}

interface ChartData {
  attendance: number[];
  donations: number[];
}

// Define Dropdown and link types
interface Dropdown {
  label: string;
  links: { name: string; href: string; permission: string }[]; // Add permission to each link
}

const dropdowns: Dropdown[] = [
  {
    label: "Congregation Management",
    links: [
      { name: "Dashboard", href: "/congregation/dashboard", permission: "View Congregation Dashboard" },
      { name: "Members", href: "/congregation/members", permission: "View Members Summary" },
      { name: "Attendance", href: "/congregation/attendance", permission: "Record Congregation Attendance" },
      { name: "Follow-ups", href: "/congregation/followups", permission: "View Congregation Follow-ups" },
      { name: "Visitors", href: "/congregation/visitors", permission: "View Visitor Dashboard" },
      { name: "New Converts", href: "/congregation/converts", permission: "View Converts Dashboard" },
    ],
  },
  {
    label: "Finance",
    links: [
      { name: "Dashboard", href: "/finance/dashboard", permission: "View Finance Dashboard" },
      { name: "Track Income", href: "/finance/incometracker", permission: "Track Income" },
      { name: "Track Expenses", href: "/finance/expensetracker", permission: "Track Expenses" },
      { name: "Budget", href: "/finance/budgets", permission: "Manage Budget" },
      { name: "Payroll", href: "/finance/payroll", permission: "Manage Payroll" },
      { name: "Finance Categories", href: "/finance/financeCategory", permission: "Manage Finance Categories" },
    ],
  },
  {
    label: "HR Management",
    links: [
      { name: "Dashboard", href: "/hr/dashboard", permission: "View HR Dashboard" },
      { name: "Staff Directory", href: "/hr/staffDirectory", permission: "View Staff Directory" },
      { name: "Payroll", href: "/hr/payroll", permission: "Manage HR Payroll" },
      { name: "Leave Management", href: "/hr/leave", permission: "Manage Leave" },
      { name: "Leave Applications", href: "/hr/leaveApplications", permission: "View Leave Applications"  },
      { name: "Departments", href: "/hr/departments" , permission: "View Departments"},
    ],
  },
  {
    label: "Asset Management",
    links: [
      { name: "Dashboard", href: "/assets/dashboard", permission: "View Asset Dashboard" },
      { name: "Assets", href: "/assets/assets", permission: "View All Assets" },
      { name: "Depreciation Info", href: "/assets/depreciation", permission: "View Asset Depreciation" },
      { name: "Maintenance", href: "/assets/maintenance", permission: "Manage Asset Maintenance" },
      { name: "Categories", href: "/assets/categories", permission: "View Categories" },
    ],
  },
  {
    label: "Program Event Management",
    links: [
      { name: "Dashboard", href: "/programs/dashboard", permission: "View Programs Dashboard"   },
      { name: "Registered Programs", href: "/programs/RegisteredPrograms", permission: "View Registered Programs"  },
      { name: "Attendance Management", href: "/programs/attendeeManagement", permission: "Manage Attendees" },
    ],
  },
  {
    label: "Donor Management",
    links: [
      { name: "Dashboard", href: "/donor/dashboard", permission: "View Donor Dashboard" },
      { name: "Donors", href: "/donor/donors", permission: "View All Donors" },
      { name: "Add Donor", href: "/donor/add-donor", permission: "Add Donor" },
      { name: "Donations", href: "/donor/donations", permission: "View All Donations" },
      { name: "Donor Categories", href: "/donor/donorCategories", permission: "View Donor Categories"  },
    ],
  },
  {
    label: "Governance & Documents Management",
    links: [
      { name: "Dashboard", href: "/governance/dashboard", permission: "View Governance Dashboard" },
      { name: "Policies", href: "/governance/policies", permission: "View Policies" },
      { name: "Audit Reports", href: "/governance/audit-reports", permission: "View Audit Reports" },
      { name: "Compliance Logs", href: "/governance/compliance-logs", permission: "View Compliance Logs" },
      { name: "Church Documentation", href: "/governance/documentation", permission: "View Documentation" },
      { name: "Certificates for Members", href: "/governance/certificates", permission: "View Certificates" },
    ],
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function from context

  const [members, setMembers] = useState<Member[]>([]);

  const [kpi, setKpi] = useState<KPI>({
    totalMembers: 0,
    weeklyAttendance: 0,
    monthlyGiving: 0,
    activeVolunteers: 0,
  });

  const [chartData, _setChartData] = useState<ChartData>({
    attendance: [0, 0, 0, 0],
    donations: [0, 0, 0, 0],
  });

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});

  const growthChartRef = useRef<Chart | null>(null);
  const attendanceChartRef = useRef<Chart | null>(null);
  const givingChartRef = useRef<Chart | null>(null);

  // Filter the links based on permissions
  const filteredDropdowns = dropdowns.map((dropdown) => ({
    ...dropdown,
    links: dropdown.links.filter(link => hasPermission(link.permission))  // Filter links based on permission
  }));

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

  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      return await orgFetch(url);
    }
  };

  // Fetch income data for Tithes (Monthly and Special) and Donations (Online, Cash)
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const data = await authFetch(`${baseURL}/api/finance/incomes`);

        // Filter for Tithes (Monthly Tithes - id: 3, Special Tithes - id: 4)
        // and Donations (Online Donations - id: 1, Cash Donations - id: 2)
        const relevantData = data.filter((income: any) =>
          [3, 4, 1, 2].includes(income.subcategory_id)
        );

        // Group the donations by month (YYYY-MM)
        const monthlyTotals: Record<string, number[]> = {}; // Store donations by month (year-month)

        relevantData.forEach((donation: any) => {
          const date = new Date(donation.date);
          const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
          
          if (!monthlyTotals[monthYear]) {
            monthlyTotals[monthYear] = [];
          }

          monthlyTotals[monthYear].push(parseFloat(donation.amount));
        });

        // Calculate the monthly average giving over the last 12 months
        const last12Months = Object.keys(monthlyTotals).slice(-12); // Get the last 12 months
        const averageGiving = last12Months.reduce((sum, month) => {
          const monthlySum = monthlyTotals[month].reduce((monthSum, amount) => monthSum + amount, 0);
          return sum + (monthlySum / monthlyTotals[month].length); // Average per month
        }, 0);

        const avgMonthlyGiving = averageGiving / last12Months.length;

        setKpi(prevKpi => ({
          ...prevKpi,
          monthlyGiving: avgMonthlyGiving, // Update the KPI with the average monthly giving
        }));

      } catch (error) {
        console.error("Error fetching income data:", error);
      }
    };
    fetchIncomeData();
  }, []); // Run once when component mounts


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await authFetch(`${baseURL}/api/members`);
        if (response && Array.isArray(response.data)) {
          setMembers(response.data);
        } else {
          console.error("Expected an array in 'data', received:", response);
          setMembers([]);
        }
      } catch (err) {
        console.error("Error fetching members with authFetch, falling back to orgFetch:", err);
        try {
          const response = await orgFetch(`${baseURL}/api/members`);
          if (response && Array.isArray(response.data)) {
            setMembers(response.data);
          } else {
            console.error("Expected an array in 'data', received:", response);
            setMembers([]);
          }
        } catch (error) {
          console.error("Error fetching members with orgFetch:", error);
          setMembers([]);
        }
      }
    };
    fetchMembers();
  }, []);

  // Fetch attendance data
    useEffect(() => {
      const fetchAttendanceData = async () => {
        try {
          const data = await authFetch(`${baseURL}/api/congregation/attendance`);
          setAttendanceData(data);
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      };
      fetchAttendanceData();
    }, []);
  

  // Update total members KPI dynamically
  useEffect(() => {
    if (members.length) {
      setKpi(prevKpi => ({
        ...prevKpi,
        totalMembers: members.length,  // Set total members to the length of the array
      }));
    }
  }, [members]);

  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    dropdowns.forEach((d) => (initialState[d.label] = false));
    setDropdownStates(initialState);
  }, []);

  useEffect(() => {
    attendanceChartRef.current?.destroy();
    givingChartRef.current?.destroy();

    const attendanceCtx = document.getElementById(
      "attendanceChart"
    ) as HTMLCanvasElement;
    if (attendanceCtx) {
      attendanceChartRef.current = new Chart(attendanceCtx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Weekly Attendance",
              data: chartData.attendance,
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26,61,124,0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [chartData]);

  useEffect(() => {
    if (!members.length) return;

    growthChartRef.current?.destroy();

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
  }, [members]);

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await fetchDataWithAuthFallback(`${baseURL}/api/programs`);
        const formattedEvents = data.map((program: Program) => ({
          id: program.id.toString(),
          name: program.name,
          description: program.description,
          date: program.date.slice(0, 10),
          start: program.time,
          end: "17:00",
          venue: program.venue,
          event_type: program.event_type,
          notes: program.notes,
          category_id: program.category_id,
          status: program.status || "Upcoming"
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const processAttendanceData = () => {
      // Get the last 4 weeks
      const weeks = [0, 1, 2, 3]; // Last 4 weeks
      const weeklyAttendance = weeks.map((weekOffset) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - weekOffset * 7); // Set start date of the week

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Set end date of the week

        const startOfWeek = startDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const endOfWeek = endDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Filter the attendance records for the current week
        const weekAttendance = attendanceData.filter((record) => {
          const attendanceDate = record.attendance_date.slice(0, 10); // Format: YYYY-MM-DD
          return attendanceDate >= startOfWeek && attendanceDate <= endOfWeek;
        });

        // Count the number of "Present" statuses for this week
        return weekAttendance.filter((record) => record.status === "Present").length;
      });

      // Set the chart data
      _setChartData((prevData) => ({
        ...prevData,
        attendance: weeklyAttendance,
      }));
    };

    if (attendanceData.length > 0) {
      processAttendanceData(); // Process attendance data after fetching
    }
  }, [attendanceData]);

  // Create the attendance chart
  useEffect(() => {
    attendanceChartRef.current?.destroy();

    const attendanceCtx = document.getElementById("attendanceChart") as HTMLCanvasElement;
    if (attendanceCtx) {
      attendanceChartRef.current = new Chart(attendanceCtx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Weekly Attendance",
              data: chartData.attendance,
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26,61,124,0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [chartData]);

  const toggleDropdown = (label: string) => {
    setDropdownStates((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        {/* Close Button */}
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

        <h2>CHURCH DASHBOARD</h2>
        <a href="#" className="active">Dashboard</a>

        {filteredDropdowns.map((dropdown) => (
          <div key={dropdown.label}>
            <button
              className={`dropdown-btn ${dropdownStates[dropdown.label] ? "active" : ""}`}
              onClick={() => toggleDropdown(dropdown.label)}
            >
              {dropdown.label}
            </button>
            <div
              className="dropdown-container"
              style={{ display: dropdownStates[dropdown.label] ? "block" : "none" }}
            >
              {dropdown.links.filter(link => hasPermission(link.permission))  // Filter links based on permission
                .map((link) => (
                  <a key={link.name} href={link.href}>
                    {link.name}
                  </a>
                ))
              }
            </div>
          </div>
        ))}


        <br />
        <br />

        <a
          href="#"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/"); // go to LandingPage
          }}
        >
          ➜] &nbsp; Logout
        </a>
      </div>

      {/* Main Dashboard */}
      <div className="dashboard-content">
        <HeaderNav />

        <br/>

        <h1>Church Overview</h1>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>{kpi.totalMembers}</p>
          </div>
          <div className="kpi-card">
            <h3>Weekly Attendance</h3>
            <p>{kpi.weeklyAttendance}</p>
            <h4>(Average)</h4>
          </div>
          <div className="kpi-card">
            <h3>Monthly Giving</h3>
            <h4>Tithes and Donations</h4>
            <p>ZMW {kpi.monthlyGiving.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <h4>(Average)</h4>
          </div>
          <div className="kpi-card">
            <h3>Active Volunteers</h3>
            <p>{kpi.activeVolunteers}</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Attendance Trends</h3>
            <canvas id="attendanceChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Church Growth (12 Months)</h3>
            <canvas id="growthChart"></canvas>
          </div>
        </div>

        <div className="chart-box">
          <h3>Event Calendar</h3>
          <Calendar events={events} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
