import React, { useEffect, useRef, useState } from "react";
import "../../styles/global.css";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Import axios for API calls
import HRHeader from './HRHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Staff {
  id: number;
  name: string;
  department_id: number;  // Make sure this matches the actual property name from your API response
  paid: boolean;
}

interface LeaveRequest {
  status: string; // You can refine this type later if needed, e.g., "approved" | "pending"
  start_date: string; // Assuming it's a string, but could be Date if needed
  // Any other fields that are part of the leave request data
}


const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // New state variables for API data
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  // Chart refs
  const deptChartRef = useRef<Chart | null>(null);
  const leaveChartRef = useRef<Chart | null>(null);
  const joinLeaveChartRef = useRef<Chart | null>(null);

  const blue = "#1A3D7C";
  const brown1 = "#5C4736";
  const gray = "#817E7A";

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

  // Helper function to fetch data with fallback
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url); // Try fetching using authFetch
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      // Narrow the error to AxiosError to safely access `response`
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/login"); // Redirect to login page
      }

      // Fallback to orgFetch if authFetch fails
      return await orgFetch(url);
    }
  };

  // Fetching staff, departments, and leave requests
  useEffect(() => {
    // Fetch staff data
    const fetchStaffData = async () => {
      try {
        const response = await fetchDataWithAuthFallback(`${baseURL}/api/staff`);
        setStaffData(response);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    // Fetch department data
    const fetchDepartments = async () => {
      try {
        const response = await fetchDataWithAuthFallback(`${baseURL}/api/departments`);
        setDepartments(response);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    // Fetch leave requests data
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetchDataWithAuthFallback(`${baseURL}/api/leave_requests`);
        setLeaveRequests(response);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    // Call all fetch functions
    fetchStaffData();
    fetchDepartments();
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    deptChartRef.current?.destroy();
    leaveChartRef.current?.destroy();
    joinLeaveChartRef.current?.destroy();

    // Calculate staff counts per department and sort in descending order
    const deptStaffCounts = departments.map((dept: { id: number; name: string }) => ({
      name: dept.name,
      staffCount: staffData.filter(staff => staff.department_id === dept.id).length,
    }));

    // Sort departments by staff count in descending order
    const sortedDeptStaffCounts = deptStaffCounts.sort((a, b) => b.staffCount - a.staffCount);

    // Department Breakdown Chart (Upright Bar Chart)
    const deptCtx = document.getElementById("deptChart") as HTMLCanvasElement;
    if (deptCtx) {
      deptChartRef.current = new Chart(deptCtx, {
        type: "bar", // Keep the chart type as 'bar'
        data: {
          labels: sortedDeptStaffCounts.map(dept => dept.name), // Sorted department names
          datasets: [
            {
              label: "Staff Count",
              data: sortedDeptStaffCounts.map(dept => dept.staffCount), // Sorted staff counts
              backgroundColor: blue,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Leave Overview Chart remains unchanged
    const leaveCtx = document.getElementById("leaveChart") as HTMLCanvasElement;
    if (leaveCtx) {
      leaveChartRef.current = new Chart(leaveCtx, {
        type: "doughnut",
        data: {
          labels: ["On Leave Today", "Pending Approvals", "Next 30 Days"],
          datasets: [
            {
              data: [
                leaveRequests.filter(leave => leave.status === "approved" && new Date(leave.start_date) <= new Date()).length,
                leaveRequests.filter(leave => leave.status === "pending").length,
                leaveRequests.filter(leave => new Date(leave.start_date) > new Date()).length,
              ],
              backgroundColor: [blue, brown1, gray],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [staffData, departments, leaveRequests]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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

        <h2>HR MANAGER</h2>
        {hasPermission("View HR Dashboard") &&  <a href="/hr/dashboard" className="active">Dashboard</a>}
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") &&  <a href="/hr/payroll">Payroll</a>}
        {hasPermission("Manage Leave") &&  <a href="/hr/leave">Leave Management</a>}
        {hasPermission("View Leave Applications") &&  <a href="/hr/leaveApplications">Leave Applications</a>}
        {hasPermission("View Departments") && <a href="/hr/departments">Departments</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">

        <HRHeader/><br/>

        <h1>HR Dashboard Overview</h1>
        <br /><br />
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Staff</h3><p>{staffData.length}</p></div>
          <div className="kpi-card"><h3>Paid Staff</h3><p>{staffData.filter(staff => staff.paid).length}</p></div>
          <div className="kpi-card"><h3>Unpaid Staff</h3><p>{staffData.filter(staff => !staff.paid).length}</p></div>
          <div className="kpi-card"><h3>Departments</h3><p>{departments.length}</p></div>
          <div className="kpi-card"><h3>Active Leave</h3><p>{leaveRequests.filter(leave => leave.status === 'approved').length}</p></div>
        </div>

        <div className="chart-grid">
          <div className="chart-box"><h3>Department Breakdown</h3><canvas id="deptChart"></canvas></div>
          <div className="chart-box"><h3>Leave Management Overview</h3><canvas id="leaveChart"></canvas></div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
