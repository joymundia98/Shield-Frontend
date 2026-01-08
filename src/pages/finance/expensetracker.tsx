import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import both authFetch and orgFetch


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface ExpenseItem {
  id: number;
  date: string;
  department_id: number | null;
  department?: string;
  description: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  attachments?: { url: string; type: string }[];
  extraFields?: Record<string, string>;
  category_name: string;
  subcategory_name: string;
}

interface ExpenseGroup {
  name: string;
  items: ExpenseItem[];
}

interface ExpenseCategories {
  [category: string]: ExpenseGroup[] | undefined;  // Can be an array or undefined
}


interface Department {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

const BACKEND_URL = `${baseURL}/api`;

const ExpenseTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Data from backend
  const [_categories, setCategories] = useState<ExpenseCategories>({});
  const [_categoryList, setCategoryList] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Helper function to decide which fetch function to use
    const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
      try {
        // Try to use authFetch first
        return await authFetch(url, options);
      } catch (error) {
        console.log("authFetch failed, falling back to orgFetch");
        return await orgFetch(url, options); // Fallback to orgFetch
      }
    };


  // ------------------- FETCH CATEGORY TABLE -------------------
  const fetchExpenseCategories = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/Expense_categories`);
      setExpenseCategories(data);
      setCategoryList(["All", ...data.map((c: any) => c.name)]);
    } catch (error) {
      console.error("Failed to fetch Expense categories", error);
    }
  };

  // ------------------- FETCH SUBCATEGORY TABLE -------------------
  const fetchSubcategories = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/Expense_subcategories`);
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to fetch subcategories", error);
    }
  };

  // ------------------- FETCH DEPARTMENTS -------------------
  // ------------------- FETCH DEPARTMENTS -------------------
const fetchDepartments = async () => {
  try {
    const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/departments`);
    setDepartments(data); // Update the departments state with the fetched data
  } catch (err) {
    console.error("Error fetching departments:", err);
  }
};

// Load categories, subcategories, and departments first
useEffect(() => {
  (async () => {
    await fetchExpenseCategories();
    await fetchSubcategories();
    await fetchDepartments(); // Make sure departments are fetched here
  })();
}, []);

  // ------------------- FETCH EXPENSE TABLE -------------------
  const fetchExpenseData = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/Expenses`);

      const mappedExpenses = data.map((item: any) => {
        const sub = subcategories.find((s) => s.id === item.subcategory_id);
        const cat = expenseCategories.find((c) => c.id === sub?.category_id);

        return {
          ...item,
          amount: Number(item.amount),
          subcategory_name: sub?.name || "Unknown",
          category_name: cat?.name || "Uncategorized",
          status: item.status || "Pending", // status fetched from backend
        };
      });

      // Group Expenses
      const grouped: ExpenseCategories = {};
      mappedExpenses.forEach((item: ExpenseItem) => {
        if (!grouped[item.category_name]) grouped[item.category_name] = [];

        let group = grouped[item.category_name]?.find(
          (g) => g.name === item.subcategory_name
        );

        if (!group) {
          group = { name: item.subcategory_name, items: [] };
          if (grouped[item.category_name]) {
            grouped[item.category_name]?.push(group);
          } else {
            grouped[item.category_name] = [group];
          }
        }

        group.items.push(item);

      });

      setCategories(grouped);
    } catch (error) {
      console.error("Failed to fetch Expense data", error);
    }
  };

  // Load categories, subcategories, and departments first
  useEffect(() => {
    (async () => {
      await fetchExpenseCategories();
      await fetchSubcategories();
      await fetchDepartments();
    })();
  }, []);

  // Load actual expenses once cats + subs + depts are ready
  useEffect(() => {
    if (
      subcategories.length &&
      expenseCategories.length &&
      departments.length
    ) {
      fetchExpenseData();
    }
  }, [subcategories, expenseCategories, departments]);

  // ------------------- FILTER -------------------
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Months are 0-based

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // Last 5 years and next 5 years
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (expense) =>
        new Date(expense.date).getFullYear() === selectedYear &&
        new Date(expense.date).getMonth() + 1 === selectedMonth
    );
  }, [expenses, selectedYear, selectedMonth]);

  // ------------------- GROUPING EXPENSES BY DEPARTMENT -------------------
  const groupedExpenses = useMemo(() => {
  const grouped: { [key: string]: ExpenseGroup[] } = {};  // Initialize the type as an array, no 'undefined'

  filteredExpenses.forEach((expense) => {
    const deptName = expense.department;
    
    // Ensure deptName exists, and initialize the array if not already
    if (deptName && !grouped[deptName]) {
      grouped[deptName] = [];  // Initialize an empty array for this department
    }

    let group = deptName && grouped[deptName] 
    ? grouped[deptName].find((g: ExpenseGroup) => g.name === expense.subcategory_name) 
    : undefined; // or use `[]` if you want group to be an empty array by default

    if (!group) {
      // Create a new group if it doesn't exist
      group = { name: expense.subcategory_name, items: [] };

      // Check if deptName is defined before using it to index `grouped`
      if (deptName !== undefined && grouped[deptName]) {
        grouped[deptName].push(group); // Add the group to the department's array
      } else if (deptName !== undefined) {
        // Initialize grouped[deptName] as an empty array if it doesn't exist
        grouped[deptName] = [group];
      }
    }

    group.items.push(expense); // Add the expense to the group
  });

  return grouped;
}, [filteredExpenses]);


  // ------------------- APPROVE/REJECT LOGIC -------------------
  const updateStatus = async (
    deptName: string,
    groupName: string,
    index: number,
    status: "Approved" | "Rejected"
  ) => {
    const item = groupedExpenses[deptName]
      ?.find((g) => g.name === groupName)
      ?.items[index];

    if (!item) return;

    await fetch(`${BACKEND_URL}/finance/expenses/${item.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    // Update state locally
    setExpenses((prevExpenses) => {
      const updated = prevExpenses.map((expense) =>
        expense.id === item.id ? { ...expense, status } : expense
      );
      return updated;
    });
  };

  // ------------------- MODALS -------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"approve" | "reject">("approve");
  const [modalAction, setModalAction] = useState<() => void>(() => {});

  const openModal = (action: () => void, type: "approve" | "reject") => {
    setModalType(type);
    setModalAction(() => action);
    setModalOpen(true);
  };

  const confirmModal = () => {
    modalAction();
    setModalOpen(false);
  };

  // ------------------- KPI TOTALS -------------------
  const { totalApproved, totalPending, totalRejected } = useMemo(() => {
    let approved = 0,
      pending = 0,
      rejected = 0;

    filteredExpenses.forEach((item) => {
      if (item.status === "Approved") approved += item.amount;
      if (item.status === "Pending") pending += item.amount;
      if (item.status === "Rejected") rejected += item.amount;
    });

    return { totalApproved: approved, totalPending: pending, totalRejected: rejected };
  }, [filteredExpenses]);

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>FINANCE</h2>
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incometracker">Track Income</a>
        <a href="/finance/expensetracker" className="active">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
        <a href="/finance/payroll">Payroll</a>
        <a href="/finance/financeCategory">Finance Categories</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>
          ➜ Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <FinanceHeader />

        <br/>

        <header className="page-header expense-header">
          <h1>Expense Tracker</h1>
          <br/>
          <div>
            <button className="add-btn" onClick={() => navigate("/finance/expenseDashboard")}>
              View Summary
            </button>
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="kpi-container">
          <div className="kpi-card kpi-approved">
            <h3>Total Approved Expenses</h3>
            <p>${totalApproved.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-pending">
            <h3>Total Pending Expenses</h3>
            <p>${totalPending.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-rejected">
            <h3>Total Rejected Expenses</h3>
            <p>${totalRejected.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Expense */}
        <button
          className="add-btn"
          onClick={() => navigate("/finance/addExpense")}
          style={{ margin: "10px 0" }}
        >
          + Add Expense
        </button>

        {/* Filter by Year and Month */}
        <div className="expense-filter-box">
          <h3>Filter by Date</h3>
          <div className="expense-filter-select">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            &emsp;

            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {months.map((month, idx) => (
                <option key={month} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GROUPED EXPENSES TABLE */}
        {Object.entries(groupedExpenses).map(([deptName, groups]) => (
          <div key={deptName}>
            <h2>{deptName}</h2>

            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.name}>
                  <h3>{group.name}</h3>

                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Department</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {group.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.department}</td>
                          <td>{item.description}</td>
                          <td>${item.amount.toLocaleString()}</td>
                          <td>
                            <span className={`status ${item.status}`}>{item.status}</span>
                          </td>

                          <td>
                            <button
                              className="add-btn"
                              onClick={() => window.open(`${baseURL}/api/finance/viewExpense/${item.id}`, "_blank")}
                            >
                              View
                            </button>


                            &nbsp;&nbsp;

                            {item.status === "Pending" && (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() => openModal(() => updateStatus(deptName, group.name, idx, "Approved"), "approve")}
                                >
                                  Approve
                                </button>
                                &nbsp;&nbsp;

                                <button
                                  className="reject-btn"
                                  onClick={() => openModal(() => updateStatus(deptName, group.name, idx, "Rejected"), "reject")}
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
              ))
            ) : (
              <p>No items</p>
            )}
          </div>
        ))}

        {/* Confirm Modal */}
        {modalOpen && (
          <div className="expenseModal" style={{ display: "flex" }}>
            <div className="expenseModal-content">
              <h2>{modalType === "approve" ? "Approve Expense?" : "Reject Expense?"}</h2>
              <p>This action cannot be undone.</p>
              <div className="expenseModal-buttons">
                <button className="expenseModal-cancel" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className={`expenseModal-confirm ${modalType === "reject" ? "reject" : ""}`}
                  onClick={confirmModal}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
