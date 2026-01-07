import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Define the interface for Payroll record
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
  staff_name?: string; // Adding staff_name to the payroll data
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HrPayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffNames, setStaffNames] = useState<any[]>([]); // State for staff names
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterDepartment, setFilterDepartment] = useState<string | "all">("all");

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ------------------- Helper Function to Fetch Data -------------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url); // Try fetching using authFetch
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      return await orgFetch(url); // Fallback to orgFetch
    }
  };

  // ------------------- Fetch Departments -------------------
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data: Department[] = await fetchDataWithAuthFallback(`${baseURL}/api/departments`);
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // ------------------- Fetch Roles -------------------
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data: Role[] = await fetchDataWithAuthFallback(`${baseURL}/api/roles`);
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // ------------------- Fetch Staff Names -------------------
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

  // ------------------- Fetch Payroll Data -------------------
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (departments.length === 0 || roles.length === 0 || staffNames.length === 0) return;

      try {
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

  // ------------------- Filtered Payroll -------------------
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

  // ------------------- Group by Department -------------------
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

  // ------------------- Date Formatter -------------------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // ------------------- Delete Payroll -------------------
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

  // ------------------- KPI Calculations -------------------
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
        <a href="/hr/dashboard">Dashboard</a>
        <a href="/hr/staffDirectory">Staff Directory</a>
        <a href="/hr/payroll" className="active">Payroll</a>
        <a href="/hr/leave">Leave Management</a>
        <a href="/hr/leaveApplications">Leave Applications</a>
        <a href="/hr/departments">Departments</a>
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
