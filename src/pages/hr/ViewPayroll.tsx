import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HRHeader from './HRHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ViewPayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { payrollId } = useParams(); // Extract payrollId from the URL

  const [payrollRecord, setPayrollRecord] = useState<any>(null); // Store the payroll record
  const [staffData, setStaffData] = useState<any>(null); // Store the staff data
  const [departmentData, setDepartmentData] = useState<any>(null); // Store department data
  const [roleData, setRoleData] = useState<any>(null); // Store role data

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch payroll data when the component mounts or payrollId changes
  useEffect(() => {
    if (!payrollId) return; // If there's no payrollId, don't fetch data

    const fetchPayrollData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/payroll/${payrollId}`);
        const data = await response.json();
        setPayrollRecord(data); // Store the payroll record data

        // Fetch staff, department, and role data based on payroll record
        fetchStaffData(data.staff_id); // Fetch staff data here
        fetchDepartmentData(data.department_id);
        fetchRoleData(data.role_id);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      }
    };

    fetchPayrollData();
  }, [payrollId]);

  // Fetch staff data using staff_id from payroll record
  const fetchStaffData = async (staffId: number) => {
    try {
      const response = await fetch(`${baseURL}/api/staff/${staffId}`);
      const data = await response.json();
      setStaffData(data); // Store the staff data
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  // Fetch department data using department_id from payroll record
  const fetchDepartmentData = async (departmentId: number) => {
    try {
      const response = await fetch(`${baseURL}/api/departments/${departmentId}`);
      const data = await response.json();
      setDepartmentData(data); // Store department data
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  // Fetch role data using role_id from payroll record
  const fetchRoleData = async (roleId: number) => {
    try {
      const response = await fetch(`${baseURL}/api/roles/${roleId}`);
      const data = await response.json();
      setRoleData(data); // Store role data
    } catch (error) {
      console.error("Error fetching role data:", error);
    }
  };

  // Ensure that all data is available before rendering the page
  if (!payrollRecord || !staffData || !departmentData || !roleData) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  // Function to convert month number to month name
  const getMonthName = (monthNumber: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1]; // months array is 0-based, so subtract 1 from month number
  };

  // Format the payment date using the month and year
  const paymentDate = `${getMonthName(payrollRecord.month)} ${payrollRecord.year}`;

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
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") &&  <a href="/hr/payroll" className="active">Payroll</a>}
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

        <h1>Payroll Details</h1>

        <br />
        {/* Back to Payroll List Button */}
        <button className="add-btn" onClick={() => navigate("/hr/payroll")}>← &nbsp; Back to Payroll List</button>
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
              <td><strong>Department</strong></td>
              <td>{departmentData.name}</td> {/* Display department name */}
            </tr>
            <tr>
              <td><strong>Role</strong></td>
              <td>{roleData.name}</td> {/* Display role name */}
            </tr>
          </tbody>
        </table>

        {/* Allowances Table */}
        <h3>Allowances</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Basic Salary (ZMW)</strong></td>
              <td>{payrollRecord.salary}</td>
            </tr>
            <tr>
              <td><strong>Housing Allowance (ZMW)</strong></td>
              <td>{payrollRecord.housing_allowance}</td>
            </tr>
            <tr>
              <td><strong>Transport Allowance (ZMW)</strong></td>
              <td>{payrollRecord.transport_allowance}</td>
            </tr>
            <tr>
              <td><strong>Medical Allowance (ZMW)</strong></td>
              <td>{payrollRecord.medical_allowance}</td>
            </tr>
            <tr>
              <td><strong>Overtime (ZMW)</strong></td>
              <td>{payrollRecord.overtime}</td>
            </tr>
            <tr>
              <td><strong>Bonus (ZMW)</strong></td>
              <td>{payrollRecord.bonus}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax and Deductions Table */}
        <h3>Tax and Deductions</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>PAYE Tax Rate (%)</strong></td>
              <td>{payrollRecord.paye_tax_percentage}</td>
            </tr>
            <tr>
              <td><strong>PAYE Tax Amount (ZMW)</strong></td>
              <td>{payrollRecord.paye_tax_amount}</td>
            </tr>
            <tr>
              <td><strong>NAPSA Contribution Rate (%)</strong></td>
              <td>{payrollRecord.napsa_contribution_percentage}</td>
            </tr>
            <tr>
              <td><strong>NAPSA Contribution Amount (ZMW)</strong></td>
              <td>{payrollRecord.napsa_contribution_amount}</td>
            </tr>
            <tr>
              <td><strong>Loan Deduction (ZMW)</strong></td>
              <td>{payrollRecord.loan_deduction}</td>
            </tr>
            <tr>
              <td><strong>Union Dues (ZMW)</strong></td>
              <td>{payrollRecord.union_dues}</td>
            </tr>
            <tr>
              <td><strong>Health Insurance (ZMW)</strong></td>
              <td>{payrollRecord.health_insurance}</td>
            </tr>
            <tr>
              <td><strong>NHIMA Contribution (ZMW)</strong></td>
              <td>{payrollRecord.nhima_contribution_amount ?? "N/A"}</td>
            </tr>
            <tr>
              <td><strong>WCIF (ZMW)</strong></td>
              <td>{payrollRecord.wcif}</td>
            </tr>
          </tbody>
        </table>

        {/* Net Salary Table */}
        <h3>Net Salary</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Total Gross Salary (ZMW)</strong></td>
              <td>{payrollRecord.total_gross}</td>
            </tr>
            <tr>
              <td><strong>Net Salary (ZMW)</strong></td>
              <td>{payrollRecord.net_salary}</td>
            </tr>
            <tr>
              <td><strong>Payment Date</strong></td>
              <td>{paymentDate}</td> {/* Display month and year */}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewPayrollPage;
