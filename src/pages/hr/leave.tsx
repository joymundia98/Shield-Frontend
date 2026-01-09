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

const LeaveManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal state for confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<() => void>(() => {});
  const [modalMessage, setModalMessage] = useState("");

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch leave requests from the backend
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await authFetch(`${baseURL}/api/leave_requests`);
        setLeaves(response); // Directly set the response as it's already structured
      } catch (err: any) {
        console.error(err);
        alert("Error fetching leave requests. Falling back to public fetch.");
        
        // Fallback to orgFetch if authFetch fails
        const response = await orgFetch(`${baseURL}/api/leave_requests`);
        setLeaves(response); // Directly set the response as it's already structured
      }
    };
    fetchLeaveRequests();
  }, []);

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

  // Update Leave Status (Approve/Reject)
  const updateLeaveStatus = async (leaveId: number, status: "approved" | "rejected") => {
    try {
      const response = await authFetch(`${baseURL}/api/leave_requests/${leaveId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update leave status");
      }

      // Update status locally
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === leaveId ? { ...leave, status } : leave
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Error updating leave status. Falling back to public fetch.");

      // Fallback to orgFetch if authFetch fails
      const response = await orgFetch(`${baseURL}/api/leave_requests/${leaveId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        alert("Failed to update leave status");
      } else {
        // Update status locally
        setLeaves((prevLeaves) =>
          prevLeaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status } : leave
          )
        );
      }
    }
  };

  // Handle approve/reject actions
  const handleStatusChange = (leaveId: number, status: "approved" | "rejected") => {
    setModalMessage(
      `Are you sure you want to ${status} this leave request? This action cannot be undone.`
    );
    setModalAction(() => () => updateLeaveStatus(leaveId, status));
    setModalOpen(true);
  };

  // Confirm action
  const confirmModal = () => {
    modalAction();
    setModalOpen(false);
  };

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
        <a href="/hr/leave" className="active">Leave Management</a>
        <a href="/hr/leaveApplications">Leave Applications</a>
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

        <h1>Leave Management</h1>

        {/* Search */}
        <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search leave requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Requests</h3><p>{totalRequests}</p></div>
          <div className="kpi-card"><h3>Approved</h3><p>{approvedCount}</p></div>
          <div className="kpi-card"><h3>Pending</h3><p>{pendingCount}</p></div>
          <div className="kpi-card"><h3>Rejected</h3><p>{rejectedCount}</p></div>
        </div>

        {/* Leave Table */}
                {/* Leave Table */}
        <div id="leaveTableWrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => {
                  const staff = staffMembers.find(s => s.id === leave.staff_id);
                  const department = departments.find(d => d.id === staff?.department_id);

                  return (
                    <tr key={leave.id}>
                      <td>{staff ? staff.name : "Unknown"}</td>
                      <td>{department ? department.name : "Unknown"}</td>
                      <td>{leave.leave_type}</td>
                      <td>{new Date(leave.start_date).toLocaleDateString()} → {new Date(leave.end_date).toLocaleDateString()}</td>
                      <td>{leave.days}</td>
                      <td><span className={`status ${leave.status}`}>{leave.status}</span></td>
                      <td className="actions">
                        {/* Only show actions if the leave status is 'pending' */}
                        {leave.status === "pending" && (
                          <>
                            <button className="approve-btn" onClick={() => handleStatusChange(leave.id, "approved")}>
                              Approve
                            </button>
                            <button className="reject-btn" onClick={() => handleStatusChange(leave.id, "rejected")}>
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7}>No leave records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="expenseModal" style={{ display: "flex" }}>
          <div className="expenseModal-content">
            <h2>Confirm Action</h2>
            <p>{modalMessage}</p>

            <div className="expenseModal-buttons">
              <button className="expenseModal-cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="expenseModal-confirm" onClick={confirmModal}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage;

          