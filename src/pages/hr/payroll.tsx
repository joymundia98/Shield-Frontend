import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch
import axios from 'axios';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions



const baseURL = import.meta.env.VITE_BASE_URL;

interface PayrollRecord {
  payroll_id: number;
  staff_id: number;
  department_id: number;
  department: string;
  role_id: number;
  year: number;
  month: number;
  salary: string;
  housing_allowance: string;
  transport_allowance: string;
  medical_allowance: string;
  overtime: string;
  bonus: string;
  total_gross: string;
  paye_tax_percentage: string;
  paye_tax_amount: string;
  napsa_contribution_percentage: string;
  napsa_contribution_amount: string;
  loan_deduction: string;
  union_dues: string;
  health_insurance: string;
  nhima_contribution_percentage: string | null;
  nhima_contribution_amount: string | null;
  wcif: string;
  total_deductions: string;
  net_salary: string;
  gratuity_percentage: string | null;
  gratuity_amount: string | null;
  status: "Paid" | "Pending" | "Overdue";
  created_at: string;
  updated_at: string;
  role?: string;
  staff_name?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  department_id: number; // Link roles to department
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HrPayrollPage: React.FC = () => {
  console.log("HrPayrollPage Component Rendering");
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffNames, setStaffNames] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterDepartment, setFilterDepartment] = useState<string | "all">("all");

  // Sidebar toggle function
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
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


  // Fetch departments and roles
  useEffect(() => {
    console.log("useEffect for fetching departments and roles is running!"); 
    const fetchDepartmentsAndRoles = async () => {
      try {

        // Log the token to see if it is available
        const token = localStorage.getItem("token");
        console.log("Token for request:", token);

        // Log the request headers to see if token is being passed correctly
        console.log("Request Headers:", {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        });

        const [deptData, roleData]: [Department[], Role[]] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/departments`), // Ensure authFetch is used here
          fetchDataWithAuthFallback(`${baseURL}/api/roles`), // Ensure authFetch is used here
        ]);

        // Assign roles to corresponding departments
        const departmentsWithRoles = deptData.map((dept) => {
          const departmentRoles = roleData.filter((role) => role.department_id === dept.id);
          return { ...dept, roles: departmentRoles };
        });

        setDepartments(departmentsWithRoles);
        setRoles(roleData); // Save all roles (for payroll mapping)
      } catch (error) {
        console.error("Error fetching departments and roles:", error);
      }
    };

    fetchDepartmentsAndRoles();
  }, []);

  // Fetch staff names
  useEffect(() => {
    const fetchStaffNames = async () => {
      try {
        const data = await fetchDataWithAuthFallback(`${baseURL}/api/staff`);
        setStaffNames(data);
      } catch (error) {
        console.error("Error fetching staff names:", error);
      }
    };

    fetchStaffNames();
  }, []);

  // Fetch payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (departments.length === 0 || roles.length === 0 || staffNames.length === 0) return;

      try {

        // Log the Authorization header to check if the token is being sent
      console.log("Request Headers:", {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      });

        const data: PayrollRecord[] = await fetchDataWithAuthFallback(`${baseURL}/api/payroll`);
        
        // Map payroll data to include department names, roles, and staff names
        const payrollWithDetails = data.map((payroll) => {
          const department = departments.find((dep) => dep.id === payroll.department_id);
          const role = roles.find((role) => role.id === payroll.role_id);
          const staff = staffNames.find((staff) => staff.id === payroll.staff_id);

          return {
            ...payroll,
            department: department ? department.name : "Unknown",
            role: role ? role.name : "Unknown",
            staff_name: staff ? staff.name : "Unknown",  // Map staff_id to staff_name
          };
        });

        setPayrollData(payrollWithDetails);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      }
    };

    fetchPayrollData();
  }, [departments, roles, staffNames]);

  // Filter payroll data
  const filteredPayroll = useMemo(() => {
    return payrollData.filter((rec) => {
      const dateObj = new Date(rec.created_at);
      if (filterMonth !== "all" && monthNames[dateObj.getMonth()] !== filterMonth) return false;
      if (filterYear !== "all" && dateObj.getFullYear() !== filterYear) return false;
      if (filterDepartment !== "all" && rec.department !== filterDepartment) return false;
      if (search && !JSON.stringify(rec).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [payrollData, filterMonth, filterYear, filterDepartment, search]);

  // Group payroll data by department
  const groupByDepartment = (data: PayrollRecord[]) => {
    return data.reduce((acc, payroll) => {
      if (!acc[payroll.department]) {
        acc[payroll.department] = [];
      }
      acc[payroll.department].push(payroll);
      return acc;
    }, {} as Record<string, PayrollRecord[]>);
  };

  const groupedPayrollData = groupByDepartment(filteredPayroll);

  // Date formatter
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Delete payroll record
  const deletePayroll = async (index: number) => {
    if (window.confirm("Are you sure you want to delete this payroll record?")) {
      const payrollRecord = filteredPayroll[index];
      try {
        await fetch(`${baseURL}/api/payroll/${payrollRecord.payroll_id}`, {
          method: "DELETE",
        });
        // Remove the deleted payroll record from the state
        setPayrollData((prevData) =>
          prevData.filter((record) => record.payroll_id !== payrollRecord.payroll_id)
        );
      } catch (error) {
        console.error("Error deleting payroll record:", error);
      }
    }
  };

  // KPI calculations
  const selectedMonthIndex = filterMonth === "all" ? new Date().getMonth() : monthNames.indexOf(filterMonth);
  const selectedYearValue = filterYear === "all" ? new Date().getFullYear() : filterYear;

  const payrollThisMonth = payrollData.filter((p) => {
    const recordMonth = p.month - 1;
    const recordYear = p.year;

    const isValidMonth = recordMonth === selectedMonthIndex;
    const isValidYear = recordYear === selectedYearValue;

    return isValidMonth && isValidYear;
  });

  const kpiTotalPaid = payrollThisMonth.reduce((total, p) => {
    return p.status === "Paid" ? total + parseFloat(p.net_salary) : total;
  }, 0);

  const kpiTotalDue = payrollThisMonth.reduce((total, p) => {
    return p.status === "Pending" || p.status === "Overdue" ? total + parseFloat(p.net_salary) : total;
  }, 0);

  const kpiPaidCount = payrollThisMonth.filter((p) => p.status === "Paid").length;
  const kpiUnpaidCount = payrollThisMonth.filter((p) => p.status === "Pending" || p.status === "Overdue").length;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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
        <HRHeader /><br />

        <h1>Payroll</h1>

        <div className="table-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search payroll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="add-btn"
            onClick={() => navigate("/hr/addPayroll")}
          >
            Add Payroll
          </button>
        </div>
        <br />

        {/* Filters */}
        <div className="filters" style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
          <label>Filter by Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">All</option>
            {monthNames.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>

          <label>Filter by Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
          >
            <option value="all">All</option>
            {new Array(10).fill(0).map((_, i) => (
              <option key={i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </select>

          <label>Filter by Department</label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.name}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
        <br />

        {/* KPI Container */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Paid (This Month)</h3>
            <p>{kpiTotalPaid.toLocaleString()}</p>
          </div>
          <div className="kpi-card">
            <h3>Total Due (This Month)</h3>
            <p>{kpiTotalDue.toLocaleString()}</p>
          </div>
          <div className="kpi-card">
            <h3>Employees Paid</h3>
            <p>{kpiPaidCount}</p>
          </div>
          <div className="kpi-card">
            <h3>Employees Unpaid</h3>
            <p>{kpiUnpaidCount}</p>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="department-sections">
          {Object.entries(groupedPayrollData).map(([departmentName, records]) => (
            <div key={departmentName} className="department-section">
              <h2>{departmentName}</h2>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((p, i) => (
                    <tr key={i}>
                      <td>{p.staff_name}</td>
                      <td>{p.role}</td>
                      <td>{parseFloat(p.net_salary).toLocaleString()}</td>
                      <td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td>
                      <td>{formatDate(p.created_at)}</td>
                      <td>
                        <button
                          className="add-btn"
                          onClick={() => navigate(`/hr/ViewPayroll/${p.payroll_id}`)}
                        >
                          View
                        </button>&emsp;
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/hr/EditPayrollPage/${p.payroll_id}`)}
                        >
                          Edit
                        </button>&emsp;
                        <button className="delete-btn" onClick={() => deletePayroll(i)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HrPayrollPage;
