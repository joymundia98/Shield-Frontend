import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
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
  status: "Paid" | "Pending" | "Overdue" | "Rejected";
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
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FinancePayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffNames, setStaffNames] = useState<any[]>([]); // State for staff names
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterDepartment, setFilterDepartment] = useState<string | "all">("all");

  // confirmationModal state for Approve/Reject
  const [confirmationModalOpen, setconfirmationModalOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"approve" | "reject" | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ------------------- Helper function to fetch data with fallback -------------------

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

  // ------------------- Approve/Reject Handlers -------------------
  const updatePayrollStatus = async (payrollId: number, status: "Paid" | "Rejected") => {
  try {
    console.log(`Updating status for payroll ID ${payrollId} to ${status}`); // Log the request

    // Use authFetch for the PATCH request
    const response = await authFetch(`${baseURL}/api/payroll/${payrollId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    // If the request is successful, update the local state with the new status
    if (response.ok) {
      setPayrollData((prevData) =>
        prevData.map((payroll) =>
          payroll.payroll_id === payrollId ? { ...payroll, status } : payroll
        )
      );
    } else {
      // Handle error if the response is not successful
      console.error("Failed to update payroll status");
    }
  } catch (error) {
    console.error("Error updating payroll status:", error);

    // Fallback to orgFetch if authFetch fails
    try {
      const response = await orgFetch(`${baseURL}/api/payroll/${payrollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      // If the fallback request is successful, update the local state with the new status
      if (response.ok) {
        setPayrollData((prevData) =>
          prevData.map((payroll) =>
            payroll.payroll_id === payrollId ? { ...payroll, status } : payroll
          )
        );
      } else {
        console.error("Failed to update payroll status via fallback");
      }
    } catch (fallbackError) {
      console.error("Fallback error while updating payroll status:", fallbackError);
    }
  }
};

  const openconfirmationModal = (
    type: "approve" | "reject",
    record: PayrollRecord
  ) => {
    setSelectedRecord(record);
    setConfirmationType(type);
    setconfirmationModalOpen(true);
  };

  const closeconfirmationModal = () => {
    setconfirmationModalOpen(false);
    setSelectedRecord(null);
  };

  const confirmAction = () => {
    if (!selectedRecord || !confirmationType) return;

    if (confirmationType === "approve") {
      updatePayrollStatus(selectedRecord.payroll_id, "Paid");
    } else if (confirmationType === "reject") {
      updatePayrollStatus(selectedRecord.payroll_id, "Rejected");
    }

    closeconfirmationModal();
  };

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

  const kpiTotalPaid = payrollThisMonth
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + parseFloat(p.net_salary), 0);

  const kpiTotalDue = payrollThisMonth
    .filter((p) => p.status === "Pending" || p.status === "Overdue")
    .reduce((sum, p) => sum + parseFloat(p.net_salary), 0);

  const kpiPaidCount = payrollThisMonth.filter((p) => p.status === "Paid").length;
  const kpiUnpaidCount = payrollThisMonth.filter((p) => p.status === "Pending" || p.status === "Overdue").length;

  //*-------------------------Download Reports
  const downloadFile = async (type: "pdf" | "excel" | "csv") => {
      try {
        const response = await axios.get(
          `${baseURL}/api/reports/payroll/${type}`,
          {
            responseType: "blob", // VERY important
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            params: {
              organization_id: localStorage.getItem("organization_id"),
              // status can be added later if needed
            }
          }
        );
    
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        link.href = url;
    
        const extensionMap = {
          pdf: "pdf",
          excel: "xlsx",
          csv: "csv"
        };
    
        link.download = `payroll_data.${extensionMap[type]}`;
        document.body.appendChild(link);
        link.click();
    
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("File download failed:", error);
      }
    };

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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard">Track Expenses</a>}
        {hasPermission("Add Expense") && <a href="/finance/addExpense">Add Expense</a>}
        {hasPermission("View Budgets Summary") && <a href="/finance/budgets">Budget</a>}
        {hasPermission("Manage Payroll") && <a href="/finance/payroll" className="active">Payroll</a>}
        {hasPermission("View Finance Categories") && <a href="/finance/financeCategory">Finance Categories</a>}


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

        <FinanceHeader />
                        
        <br/>

        <h1>Payroll</h1>

          <div style={{ display: "flex", gap: "10px"}}>
            <button className="add-btn" onClick={() => downloadFile("pdf")}>
              📄 Export PDF
            </button>

            <button className="add-btn" onClick={() => downloadFile("excel")}>
              📊 Export Excel
            </button>

            {/*<button className="add-btn" onClick={() => downloadFile("csv")}>
              ⬇️ Export CSV
            </button>*/}
          </div>

          <br/>

        {/* Search */}
        <div className="table-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search payroll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                          onClick={() => navigate(`/finance/ViewPayrollPage/${p.payroll_id}`)}
                        >
                          View
                        </button>&emsp;
                        {p.status === "Pending" && (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() => openconfirmationModal("approve", p)}
                            >
                              Approve
                            </button>&emsp;

                            <button
                              className="reject-btn"
                              onClick={() => openconfirmationModal("reject", p)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation confirmationModal */}
      {confirmationModalOpen && (
        <div className="confirmationModal" style={{ display: "flex" }}>
          <div className="confirmationModal-content">
            <h2>Confirm Action</h2>
            <p>Are you sure you want to {selectedRecord?.status === "Pending" ? "approve or reject" : ""} this payroll?</p>
            <div className="confirmationModal-buttons">
              <button className="confirmationModal-cancel" onClick={closeconfirmationModal}>
                Cancel
              </button>&emsp;
              <button
                className="confirmationModal-confirm"
                onClick={confirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePayrollPage;
