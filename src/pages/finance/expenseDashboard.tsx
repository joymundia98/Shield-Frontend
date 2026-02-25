import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // <-- added authFetch import
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

interface ExpenseCategory {
  id: number;
  name: string;
}

interface ExpenseSubcategory {
  id: number;
  category_id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  subcategory_id: number;
  department_id: number | null;
  amount: string; // string in DB
  date: string;
  approvedDate: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface Budget {
  id: number;
  title: string;
  amount: string;
  year: number;
  month: number;
  category_id: number;
  expense_subcategory_id: number;
  created_at: string;
}

const BACKEND_URL = `${baseURL}/api`;

const ExpenseDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // ------------------- Sidebar -------------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ------------------- Data State -------------------
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // ------------------- Auth Fetch Wrapper -------------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (err) {
      console.log("authFetch failed, falling back to orgFetch for", url);
      return await orgFetch(url);
    }
  };

  // ------------------- Fetch from Backend -------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, subData, deptData, expenseData, budgetData] = await Promise.all([
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_categories`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_subcategories`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/departments`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expenses`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/budgets`)
        ]);

        setCategories(catData);
        setSubcategories(subData);
        setDepartments(deptData);
        setExpenses(expenseData);
        setBudgets(budgetData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  // ------------------- Map Expenses to Categories & Departments -------------------
  const expensesWithCategory = useMemo(() => {
    const subMap = Object.fromEntries(subcategories.map(s => [s.id, s]));
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const deptMap = Object.fromEntries(departments.map(d => [d.id, d]));

    return expenses.map(e => {
      const sub = subMap[e.subcategory_id];
      const cat = sub ? catMap[sub.category_id] : null;
      const dept = e.department_id ? deptMap[e.department_id] : null;
      return {
        ...e,
        categoryName: cat ? cat.name : "Unknown",
        subcategoryName: sub ? sub.name : "Unknown",
        department: dept ? dept.name : "N/A",
        amountNum: parseFloat(e.amount)
      };
    });
  }, [expenses, subcategories, categories, departments]);

  // ------------------- Filter Expenses by Month and Year -------------------
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Months are 0-based in JS

  const filteredExpenses = useMemo(() => {
    return expensesWithCategory.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === selectedYear &&
        expenseDate.getMonth() + 1 === selectedMonth
      );
    });
  }, [expensesWithCategory, selectedYear, selectedMonth]);

  // ------------------- Filter Budgets by Month and Year -------------------
  const filteredBudgets = useMemo(() => {
    return budgets.filter(
      (budget) => budget.year === selectedYear && budget.month === selectedMonth
    );
  }, [budgets, selectedYear, selectedMonth]);

  // ------------------- Calculate Total Expenses and Budget -------------------
  
  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amountNum, 0),
    [filteredExpenses]
  );

  const totalBudget = useMemo(
    () => filteredBudgets.reduce((sum, b) => sum + parseFloat(b.amount), 0),
    [filteredBudgets]
  );

  // ------------------- Reserve Funds -------------------
  const reserveFunds = totalBudget - totalExpenses; // <-- dynamic based on budget


  const burnRate = (totalExpenses / new Date().getDate()).toFixed(2); // Example calculation for burn rate

  
  // ------------------- Charts -------------------
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      totals[e.categoryName] = (totals[e.categoryName] || 0) + e.amountNum;
    });
    return totals;
  }, [filteredExpenses]);

  const departmentTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      totals[e.department] = (totals[e.department] || 0) + e.amountNum;
    });

    // Convert to array and sort by amount descending, take top 5
    const sortedTop5 = Object.entries(totals)
      .sort(([, a], [, b]) => b - a) // sort descending
      .slice(0, 5); // top 5

    // Convert back to object for chart
    return Object.fromEntries(sortedTop5);
  }, [filteredExpenses]);


  const categoryChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Spend per Category",
        data: Object.values(categoryTotals),
        backgroundColor: "#1A3D7C",
      },
    ],
  };

  const departmentChartData = {
    labels: Object.keys(departmentTotals),
    datasets: [
      {
        label: "Top 5 Spend per Department",
        data: Object.values(departmentTotals),
        backgroundColor: [
          "#5C4736", "#817E7A", "#AF907A", "#20262C", "#858796"
        ],
      },
    ],
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

        <h2>FINANCE</h2>
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard" className="active">Track Expenses</a>}
        {hasPermission("Add Expense") && <a href="/finance/addExpense">Add Expense</a>}
        {hasPermission("View Budgets Summary") && <a href="/finance/budgets">Budget</a>}
        {hasPermission("Manage Payroll") && <a href="/finance/payroll">Payroll</a>}
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

        {/* HEADER */}
        <header className="page-header expense-header">
          <h1>Expense Dashboard</h1>
          <div>
            <br />
            <button
              className="add-btn"
              style={{ marginRight: "10px" }}
              onClick={() => navigate("/finance/expensetracker")}
            >
              View Expense Data
            </button>
            <button className="hamburger" onClick={toggleSidebar}>
              &#9776;
            </button>
          </div>
        </header>

        <br /><br />

        {/* Filter by Year and Month */}
        <div className="expense-filter-box">
          <h3>Filter by Date</h3>
          <div className="expense-filter-select">
            
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => (
                <option key={month} value={idx + 1}>{month}</option>
              ))}
            </select>&emsp;

            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Expenses vs Budget</h3>
            <p>ZMW {totalExpenses.toLocaleString()} / ZMW {totalBudget.toLocaleString()}</p>
          </div>
          <div className="kpi-card">
            <h3>Reserve Funds</h3>
            <p>ZMW {reserveFunds.toLocaleString()}</p>
            <h4>Total Budget -  Total Expenses</h4>
          </div>

          <div className="kpi-card">
            <h3>Monthly Burn Rate</h3>
            <p>ZMW {burnRate}/day</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Spend by Category</h3>
            <Bar data={categoryChartData} options={{ responsive: true }} />
          </div>
          <div className="chart-box">
            <h3>Spend by Department</h3>
            <Pie data={departmentChartData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboardPage;
