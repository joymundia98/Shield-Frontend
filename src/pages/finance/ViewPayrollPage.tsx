import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const FinanceViewPayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const { payrollId } = useParams();

  const [payrollRecord, setPayrollRecord] = useState<any>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); // 👈 NEW
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ------------------- Auth Fetch with Fallback -------------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/login");
      }

      return await orgFetch(url);
    }
  };

  // ------------------- Fetch Payroll Data -------------------
  useEffect(() => {
    if (!payrollId) return;

    const fetchPayrollData = async () => {
      try {
        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/payroll/${payrollId}`
        );

        setPayrollRecord(data);

        // Fetch related data
        fetchStaffData(data.staff_id);
        fetchDepartmentData(data.department_id);
        fetchRoleData(data.role_id);

      } catch (error) {
        console.error("Error fetching payroll data:", error);
      }
    };

    fetchPayrollData();
  }, [payrollId]);

  // ------------------- Fetch Staff Data -------------------
  const fetchStaffData = async (staffId: number) => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/staff/${staffId}`
      );

      setStaffData(data);

      // 👇 Fetch user using user_id
      if (data?.user_id) {
        fetchUserData(data.user_id);
      }

    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  // ------------------- Fetch User Data -------------------
  const fetchUserData = async (userId: number) => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/users/${userId}`
      );
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // ------------------- Fetch Department Data -------------------
  const fetchDepartmentData = async (departmentId: number) => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/departments/${departmentId}`
      );
      setDepartmentData(data);
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  // ------------------- Fetch Role Data -------------------
  const fetchRoleData = async (roleId: number) => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/roles/${roleId}`
      );
      setRoleData(data);
    } catch (error) {
      console.error("Error fetching role data:", error);
    }
  };

  // Ensure that all data is available before rendering the page
  if (
    !payrollRecord ||
    !staffData ||
    !userData ||
    !departmentData ||
    !roleData
  ) {
    return <div>Loading...</div>;
  }

  // Function to convert month number to month name
  const getMonthName = (monthNumber: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
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

        <h2>FINANCE</h2>
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incomeDashboard">Track Income</a>
        <a href="/finance/expenseDashboard">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
        <a href="/finance/payroll" className="active">Payroll</a>
        <a href="/finance/financeCategory">Finance Categories</a>

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

      {/* Main Content */}
      <div className="dashboard-content">

        <FinanceHeader />
                        
        <br/>

        <h1>Payroll Details</h1>

        <br />
        <button className="add-btn" onClick={() => navigate("/finance/payroll")}>
          ← &nbsp; Back to Payroll List
        </button>
        <br /><br/>
        
        {/* Employee Information Table */}
        <h3>Employee Information</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Staff Name</strong></td>
              <td>{userData.first_name} {userData.last_name}</td>
            </tr>
            <tr>
              <td><strong>Department</strong></td>
              <td>{departmentData.name}</td>
            </tr>
            <tr>
              <td><strong>Role</strong></td>
              <td>{roleData.name}</td>
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
              <td>{paymentDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceViewPayrollPage;
