import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Leave {
  id: number;
  staff_id: number;
  dept_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: "pending" | "approved" | "rejected";
}

interface Staff {
  id: number;
  name: string;
  department_id: number | null;
}

interface Department {
  id: number;
  name: string;
}

const LeaveApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Get the user object from localStorage
  const loggedInUser = localStorage.getItem("user");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  // If the user is not logged in, redirect to the landing page
  useEffect(() => {
    if (!user) {
      navigate("/");  // Redirect to the landing page if user is not logged in
    }
  }, [user, navigate]);

  // If the logged-in user is not found, do not render anything
  if (!user) {
    return null;  // This ensures the rest of the page isn't rendered while redirecting
  }

  // Fetch leave requests for the logged-in user
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await authFetch(`${baseURL}/api/leave_requests/staff/${user.id}`);
        setLeaves(response); // Directly set the response as it's already structured
      } catch (err: any) {
        console.error(err);
        alert("Error fetching leave requests. Falling back to public fetch.");
        
        // Fallback to orgFetch if authFetch fails
        const response = await orgFetch(`${baseURL}/api/leave_requests/staff/${user.id}`);
        setLeaves(response); // Directly set the response as it's already structured
      }
    };
    fetchLeaveRequests();
  }, [user.id]);

  // Fetch staff members and departments
  useEffect(() => {
    const fetchStaffAndDepartments = async () => {
      try {
        const staffResponse = await authFetch(`${baseURL}/api/staff`);
        setStaffMembers(staffResponse); // Directly set the response as it's already structured

        const deptResponse = await authFetch(`${baseURL}/api/departments`);
        setDepartments(deptResponse); // Directly set the response as it's already structured
      } catch (err: any) {
        console.error(err);
        alert("Error fetching staff or departments. Falling back to public fetch.");
        
        // Fallback to orgFetch if authFetch fails
        const staffResponse = await orgFetch(`${baseURL}/api/staff`);
        setStaffMembers(staffResponse); // Directly set the response as it's already structured

        const deptResponse = await orgFetch(`${baseURL}/api/departments`);
        setDepartments(deptResponse); // Directly set the response as it's already structured
      }
    };

    fetchStaffAndDepartments();
  }, []);

  // KPI calculations
  const totalRequests = leaves.length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  // Search filter logic
  const filteredLeaves = useMemo(() => {
    const lower = search.toLowerCase();
    return leaves.filter(l => {
      const staff = staffMembers.find(s => s.id === l.staff_id);
      const staffName = staff ? staff.name : "Unknown Staff";
      const department = departments.find(d => d.id === staff?.department_id);
      const deptName = department ? department.name : "Unknown Department";
      const leaveType = l.leave_type ? l.leave_type.toLowerCase() : "";

      return (
        (staffName && staffName.toLowerCase().includes(lower)) ||
        (deptName && deptName.toLowerCase().includes(lower)) ||
        (leaveType && leaveType.includes(lower))
      );
    });
  }, [leaves, search, staffMembers, departments]);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger button for toggling sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>HR MANAGER</h2>
        <a href="/hr/dashboard">Dashboard</a>
        <a href="/hr/staffDirectory">Staff Directory</a>
        <a href="/hr/payroll">Payroll</a>
        <a href="/hr/leave">Leave Management</a>
        <a href="/hr/leaveApplications" className="active">Leave Applications</a>
        <a href="/hr/departments">Departments</a>

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

      {/* Main Content */}
      <div className="dashboard-content">
        <HRHeader/><br/>

        <h1>Your Leave Applications</h1>

        <br />
        {/* Apply for Leave Button */}
        <button className="add-btn" onClick={() => navigate("/hr/addLeave")}>
          Apply for Leave
        </button>

        <br />
        <br />
        {/* Search */}
        <div
          className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Search leave requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Requests</h3>
            <p>{totalRequests}</p>
          </div>
          <div className="kpi-card">
            <h3>Approved</h3>
            <p>{approvedCount}</p>
          </div>
          <div className="kpi-card">
            <h3>Pending</h3>
            <p>{pendingCount}</p>
          </div>
          <div className="kpi-card">
            <h3>Rejected</h3>
            <p>{rejectedCount}</p>
          </div>
        </div>

        {/* Leave Table */}
        <div id="leaveTableWrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leave_type}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>{leave.days}</td>
                    <td>
                      <span className={`status ${leave.status}`}>{leave.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No leave records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationsPage;
