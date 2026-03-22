import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HRHeader from './HRHeader';
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { authFetch, orgFetch } from "../../utils/api";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ViewStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { id } = useParams();

  const [staffData, setStaffData] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------- Auth Fetch Fallback ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }

      return await orgFetch(url);
    }
  };

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Fetch Staff ----------------
  useEffect(() => {
    if (!id) return;

    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/staff/${id}`
        );

        console.log("STAFF DATA:", data);

        setStaffData(data);

        // ✅ Fetch department ONLY (role is already a string)
        if (data?.department_id) {
          fetchDepartmentData(data.department_id);
        }

      } catch (error: any) {
        console.error("Error fetching staff data:", error);
        setError(error.message || "Failed to load staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  // ---------------- Fetch Department ----------------
  const fetchDepartmentData = async (departmentId: number) => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/departments/${departmentId}`
      );

      console.log("DEPARTMENT:", data);
      setDepartmentData(data);
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  // ---------------- Loading / Error ----------------
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!staffData) return <div>No staff data found</div>;

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
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

        <h2>HR MANAGER</h2>
        {hasPermission("View HR Dashboard") &&  <a href="/hr/dashboard">Dashboard</a>}
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory" className="active">Staff Directory</a>}
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
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <HRHeader/>
        <br/>

        <h1>Staff Details</h1>

        <br />
        {/* Back to Staff List Button */}
        <button className="add-btn" onClick={() => navigate("/hr/staffDirectory")}>
          ← &nbsp; Back to Staff Directory
        </button>
        <br /><br/>

        {/* Employee Information Table */}
        <h3>Employee Information</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Staff Name</strong></td>
              <td>{staffData.name}</td>
            </tr>
            <tr>
              <td><strong>Gender</strong></td>
              <td>{staffData.gender}</td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td>{staffData.email}</td>
            </tr>
            <tr>
              <td><strong>Phone</strong></td>
              <td>{staffData.phone}</td>
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>{staffData.address}</td>
            </tr>
            <tr>
              <td><strong>Department</strong></td>
              <td>{departmentData?.name ?? "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Position</strong></td>
              <td>{staffData.position}</td>
            </tr>
            <tr>
              <td><strong>Role</strong></td>
              <td>{staffData.role ?? "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>{staffData.status}</td>
            </tr>
            <tr>
              <td><strong>Contract Type</strong></td>
              <td>{staffData.contract_type}</td>
            </tr>
            <tr>
              <td><strong>Start Date</strong></td>
              <td>{staffData.start_date ? new Date(staffData.start_date).toLocaleDateString() : "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Join Date</strong></td>
              <td>{staffData.join_date ? new Date(staffData.join_date).toLocaleDateString() : "N/A"}</td>
            </tr>
            <tr>
              <td><strong>NRC</strong></td>
              <td>{staffData.nrc}</td>
            </tr>
            <tr>
              <td><strong>Paid</strong></td>
              <td>{staffData.paid ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>

        {/* Contact Information Table */}
        <h3>Contact Information</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Email</strong></td>
              <td>{staffData.email}</td>
            </tr>
            <tr>
              <td><strong>Phone</strong></td>
              <td>{staffData.phone}</td>
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>{staffData.address}</td>
            </tr>
          </tbody>
        </table>

        {/* Emergency Contact Table */}
        <h3>Emergency Contact</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Emergency Name</strong></td>
              <td>{staffData.emergencyContact?.name ?? "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Emergency Phone</strong></td>
              <td>{staffData.emergencyContact?.phone ?? "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewStaffPage;