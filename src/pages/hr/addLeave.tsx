import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Leave {
  id: number;
  staff_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  created_at: string;
  days: number;
  status: string;
}

const AddLeave: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaveTypes] = useState([
    { name: "Vacation Leave (PTO)", isPTO: true },
    { name: "Personal Leave", isPTO: false },
    { name: "Sick Leave", isPTO: false },
    { name: "Unpaid Leave", isPTO: false },
    { name: "Family Leave", isPTO: false },
    { name: "Maternity/Paternity Leave", isPTO: false },
    { name: "Bereavement Leave", isPTO: false },
    { name: "Public Holiday Leave", isPTO: false },
    { name: "Jury Duty Leave", isPTO: false },
    { name: "Military Leave", isPTO: false },
    { name: "Study Leave", isPTO: false },
    { name: "Compassionate Leave", isPTO: false },
    { name: "Religious Leave", isPTO: false },
    { name: "Sabbatical Leave", isPTO: false },
  ]);

  const [form, setForm] = useState<Leave>({
    id: 0,
    staff_id: 0, // This will be set to the logged-in user's ID
    leave_type: "",
    start_date: "",
    end_date: "",
    created_at: new Date().toISOString(),
    days: 0,
    status: "pending",  // Default status (corrected to match the DB constraint)
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    // Get logged-in user data from localStorage
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setForm((prevForm) => ({
        ...prevForm,
        staff_id: user.id,  // Set the logged-in user's ID as the staff_id
      }));
    } else {
      navigate("/"); // Redirect to login page if no user is found
    }
  }, [navigate]);

  // Calculate days whenever start_date or end_date changes
  useEffect(() => {
    if (form.start_date && form.end_date) {
      const days = calculateDays(form.start_date, form.end_date);
      setForm((prevForm) => ({ ...prevForm, days }));
    }
  }, [form.start_date, form.end_date]);

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    return dayDiff + 1;  // Including the start date
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.leave_type || !form.start_date || !form.end_date) {
    alert("Please fill in all required fields.");
    return;
  }

  // Validate the status field before submitting
  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(form.status)) {
    alert("Invalid status value. Please select a valid status.");
    return;
  }

  // Create the payload with only the required fields
  const payload = {
    staff_id: form.staff_id,
    leave_type: form.leave_type,
    start_date: form.start_date,
    end_date: form.end_date,
    days: form.days,
  };

  try {
    const response = await authFetch(`${baseURL}/api/leave_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // Send only the payload
    });

    if (!response.ok) {
      throw new Error("Failed to submit leave request.");
    }

    alert("Leave request submitted successfully!");
    navigate("/hr/leaveApplications");  // Redirect to leave management page
  } catch (err: any) {
    alert("Error: " + err.message);

    // Fallback to orgFetch if authFetch fails
    try {
      const fallbackResponse = await orgFetch(`${baseURL}/api/leave_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Send only the payload
      });

      if (!fallbackResponse.ok) {
        throw new Error("Failed to submit leave request (fallback).");
      }

      alert("Leave request submitted successfully (via fallback)!");
      navigate("/hr/leaveApplications");
    } catch (fallbackErr: any) {
      alert("Error with fallback submission: " + fallbackErr.message);
    }
  }
};

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>HR MANAGER</h2>
        {hasPermission("View HR Dashboard") &&  <a href="/hr/dashboard">Dashboard</a>}
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") &&  <a href="/hr/payroll">Payroll</a>}
        {hasPermission("Manage Leave") &&  <a href="/hr/leave">Leave Management</a>}
        {hasPermission("View Leave Applications") &&  <a href="/hr/leaveApplications" className="active">Leave Applications</a>}
        {hasPermission("View Departments") && <a href="/hr/departments">Departments</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}
        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");  // Redirect to login page
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* Page Content */}
      <div className="dashboard-content">

        <HRHeader/>
        <br/>
        
        <header className="page-header">
          <h1>Request Leave</h1>
          <div>
            <button className="add-btn" onClick={() => navigate("/hr/leaveApplications")}>← Back</button>
            <button className="hamburger" onClick={toggleSidebar}>☰</button>
          </div>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {/* Staff Member (Hidden) */}
            <input type="hidden" value={form.staff_id} />

            {/* LEAVE TYPE */}
            <label>Leave Type</label>
            <select
              required
              value={form.leave_type}
              onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
            >
              <option value="">-- Select Leave Type --</option>
              {leaveTypes.map((leave) => (
                <option key={leave.name} value={leave.name}>
                  {leave.name}
                </option>
              ))}
            </select>

            {/* DATES */}
            <label>Start Date</label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
            <label>End Date</label>
            <input
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />

            {/* DAYS */}
            <label>Days</label>
            <input
              type="number"
              value={form.days || 0}
              readOnly
              style={{ backgroundColor: "#f0f0f0" }}
            />

            {/* Status (Hidden) */}
            <input type="hidden" value={form.status} />

            {/* Submit */}
            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
              Submit Leave Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLeave;
