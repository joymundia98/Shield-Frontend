import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HRHeader from './HRHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ViewStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { id } = useParams(); // Extract id from the URL

  const [staffData, setStaffData] = useState<any>(null); // Store staff data
  const [departmentData, setDepartmentData] = useState<any>(null); // Store department data
  const [roleData, setRoleData] = useState<any>(null); // Store role data
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch staff data when the component mounts or id changes
  useEffect(() => {
    if (!id) return; // If there's no id, don't fetch data

    const fetchStaffData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/staff/${id}`);
        const data = await response.json();
        setStaffData(data); // Store the staff data

        // Fetch department and role data based on staff data
        fetchDepartmentData(data.department_id);
        fetchRoleData(data.role);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData();
  }, [id]);

  // Fetch department data using department_id from staff data
  const fetchDepartmentData = async (departmentId: number) => {
    try {
      const response = await fetch(`${baseURL}/api/departments/${departmentId}`);
      const data = await response.json();
      setDepartmentData(data); // Store department data
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  // Fetch role data (if needed) based on staff's role field
  const fetchRoleData = async (role: string) => {
    try {
      const response = await fetch(`${baseURL}/api/roles/${role}`);
      const data = await response.json();
      setRoleData(data); // Store role data
    } catch (error) {
      console.error("Error fetching role data:", error);
    }
  };

  // Ensure that all data is available before rendering the page
  if (!staffData || !departmentData || !roleData) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

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
            navigate("/"); // logout
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
        <button className="add-btn" onClick={() => navigate("/hr/staffDirectory")}>← &nbsp; Back to Staff Directory</button>
        <br /><br/>

        {/* Employee Information Table */}
        <h3>Employee Information</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Staff Name</strong></td>
              <td>{staffData.name}</td>  {/* Display staff name */}
            </tr>
            <tr>
              <td><strong>Gender</strong></td>
              <td>{staffData.gender}</td>  {/* Display staff gender */}
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td>{staffData.email}</td>  {/* Display staff email */}
            </tr>
            <tr>
              <td><strong>Phone</strong></td>
              <td>{staffData.phone}</td>  {/* Display staff phone */}
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>{staffData.address}</td>  {/* Display staff address */}
            </tr>
            <tr>
              <td><strong>Department</strong></td>
              <td>{departmentData?.name ?? "N/A"}</td> {/* Display department name */}
            </tr>
            <tr>
              <td><strong>Position</strong></td>
              <td>{staffData.position}</td> {/* Display position */}
            </tr>
            <tr>
              <td><strong>Role</strong></td>
              <td>{roleData?.name ?? staffData.role}</td> {/* Display role name */}
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>{staffData.status}</td> {/* Display status */}
            </tr>
            <tr>
              <td><strong>Contract Type</strong></td>
              <td>{staffData.contract_type}</td> {/* Display contract type */}
            </tr>
            <tr>
              <td><strong>Start Date</strong></td>
              <td>{new Date(staffData.start_date).toLocaleDateString()}</td> {/* Display start date */}
            </tr>
            <tr>
              <td><strong>Join Date</strong></td>
              <td>{new Date(staffData.join_date).toLocaleDateString()}</td> {/* Display join date */}
            </tr>
            <tr>
              <td><strong>NRC</strong></td>
              <td>{staffData.nrc}</td> {/* Display NRC */}
            </tr>
            <tr>
              <td><strong>Paid</strong></td>
              <td>{staffData.paid ? "Yes" : "No"}</td> {/* Display if paid */}
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
