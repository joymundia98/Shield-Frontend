import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/global.css";
import HeaderNav from '../components/HeaderNav';
import Calendar from "../pages/programs/Calendar"; // Import the Calendar component

import type { Program } from "../pages/programs/dashboard";  // Using type-only import

const baseURL = import.meta.env.VITE_BASE_URL;

interface KPI {
  totalMembers: number;
  weeklyAttendance: number;
  monthlyGiving: number;
  activeVolunteers: number;
}

interface ChartData {
  attendance: number[];
  donations: number[];
}

interface Dropdown {
  label: string;
  links: { name: string; href: string }[];
}

const dropdowns: Dropdown[] = [
  {
    label: "Congregation Management",
    links: [
      { name: "Dashboard", href: "/congregation/dashboard" },
      { name: "Members", href: "/congregation/members" },
      { name: "Attendance", href: "/congregation/attendance" },
      { name: "Follow-ups", href: "/congregation/followups" },
      { name: "Visitors", href: "/congregation/visitors" },
      { name: "New Converts", href: "/congregation/converts" },
    ],

  },
  {
    label: "Finance",
    links: [
      { name: "Dashboard", href: "/finance/dashboard" },
      { name: "Track Income", href: "/finance/incometracker" },
      { name: "Track Expenses", href: "/finance/expensetracker" },
      { name: "Budget", href: "/finance/budgets" },
      { name: "Payroll", href: "/finance/payroll" },
      { name: "Finance Categories", href: "/finance/financeCategory" },
    ],
    
  },
  {
    label: "HR Management",
    links: [
      { name: "Dashboard", href: "/hr/dashboard" },
      { name: "Staff Directory", href: "/hr/staffDirectory" },
      { name: "Payroll", href: "/hr/payroll" },
      { name: "Leave Management", href: "/hr/leave" },
      { name: "Leave Applications", href: "/hr/leaveApplications" },
      { name: "Departments", href: "/hr/departments" },
    ],
  },
  {
    label: "Asset Management",
    links: [
      { name: "Dashboard", href: "/assets/dashboard" },
      { name: "Assets", href: "/assets/assets" },
      { name: "Depreciation Info", href: "/assets/depreciation" },
      { name: "Maintenance", href: "/assets/maintenance" },
      { name: "Categories", href: "/assets/categories" },
    ],
  },
  {
    label: "Program Event Management",
    links: [
      { name: "Dashboard", href: "/programs/dashboard" },
      { name: "Registered Programs", href: "/programs/RegisteredPrograms" },
      { name: "Attendance Management", href: "/programs/attendeeManagement" },
    ],
  },
  {
    label: "Donor Management",
    links: [
      { name: "Dashboard", href: "/donor/dashboard" },
      { name: "Donors", href: "/donor/donors" },
      { name: "Add Donor", href: "/donor/add-donor" },
      { name: "Donations", href: "/donor/donations" },
      { name: "Donor Categories", href: "/donor/donorCategories" },
    ],
  },
  {
    label: "Governance & Documents Management",
    links: [
      { name: "Dashboard", href: "/governance/dashboard" },
      { name: "Policies", href: "/governance/policies" },
      { name: "Audit Reports", href: "/governance/audit-reports" },
      { name: "Compliance Logs", href: "/governance/compliance-logs" },
      { name: "Church Documentation", href: "/governance/documentation" },
      { name: "Certificates for Members", href: "/governance/certificates" },
    ],
  },
  //{
    //label: "Class Management",
    //links: [
      //{ name: "Dashboard", href: "/class/dashboard" },
      //{ name: "Classes", href: "/class/classes" },
      //{ name: "Add Class", href: "/class/add-class" },
      //{ name: "Teachers", href: "/class/teachers" },
      //{ name: "Enrollments", href: "/class/enrollments" },
      //{ name: "Attendance", href: "/class/attendance" },
      //{ name: "Reports", href: "/class/reports" },
    //],
  //},
  //{
    //label: "Ministry Teams Management",
    //links: [
      //{ name: "Dashboard", href: "/ministry/dashboard" },
      //{ name: "Donors", href: "/ministry/donors" },
      //{ name: "Add Donor", href: "/ministry/add-donor" },
      //{ name: "Donations", href: "/ministry/donations" },
      //{ name: "Reports", href: "/ministry/reports" },
    //],
  //},
  //{
    //label: "Pastoral Care Counselling",
    //links: [
      //{ name: "Dashboard", href: "/pastoral/dashboard" },
      //{ name: "Donors", href: "/pastoral/donors" },
      //{ name: "Add Donor", href: "/pastoral/add-donor" },
      //{ name: "Donations", href: "/pastoral/donations" },
      //{ name: "Reports", href: "/pastoral/reports" },
    //],
  //},
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [kpi, _setKpi] = useState<KPI>({
    totalMembers: 1248,
    weeklyAttendance: 560,
    monthlyGiving: 34000,
    activeVolunteers: 75,
  });

  const [chartData, _setChartData] = useState<ChartData>({
    attendance: [520, 560, 580, 600],
    donations: [15000, 8000, 5000, 6000],
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});

  const attendanceChartRef = useRef<Chart | null>(null);
  const givingChartRef = useRef<Chart | null>(null);

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

    // Replaced it with calendar
    //const givingCtx = document.getElementById("givingChart") as HTMLCanvasElement;
    {/*if (givingCtx) {
      givingChartRef.current = new Chart(givingCtx, {
        type: "pie",
        data: {
          labels: ["General Fund", "Missions", "Building Fund", "Outreach"],
          datasets: [
            {
              data: chartData.donations,
              backgroundColor: ["#5C4736", "#817E7A", "#AF907A", "#20262C"],
            },
          ],
        },
        options: { responsive: true },
      });
    }*/}
  }, [chartData]);

  const [events, setEvents] = useState<Event[]>([]);

useEffect(() => {
  fetch(`${baseURL}/api/programs`)
    .then((response) => response.json())
    .then((data) => {
      const formattedEvents = data.map((program: Program) => ({
        id: program.id.toString(),
        name: program.name,
        description: program.description,
        date: program.date.slice(0, 10),
        start: program.time,
        end: "17:00",  // You can adjust this as needed
        venue: program.venue,
        event_type: program.event_type,
        notes: program.notes,
        category_id: program.category_id,
        status: program.status || "Upcoming",
      }));

      setEvents(formattedEvents);
    });
}, []);


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

        <h2>CHURCH DASHBOARD</h2>
        <a href="#" className="active">
          Dashboard
        </a>

        {dropdowns.map((dropdown) => (
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
              {dropdown.links.map((link) => (
                <a key={link.name} href={link.href}>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        ))}

         {/* Two break lines before logout */}
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

        <br/><br/>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>{kpi.totalMembers}</p>
          </div>
          <div className="kpi-card">
            <h3>Weekly Attendance</h3>
            <p>{kpi.weeklyAttendance}</p>
          </div>
          <div className="kpi-card">
            <h3>Monthly Giving</h3>
            <p>${kpi.monthlyGiving.toLocaleString()}</p>
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
            <h3>Event Calendar</h3>
            <Calendar events={events} />  {/* Pass events as prop */}
          </div>


        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
