import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

interface BudgetCategory {
  id: number;
  title: string;
  amount: number;
  year: number;
  month: number;
  category_id: number;
}

interface Expense {
  id: number;
  subcategory_id: number;
  amount: number;
  description: string;
  date: string;
}

interface ExpenseSubcategory {
  id: number;
  name: string;
  category_id: number;
}

interface ExpenseCategory {
  id: number;
  name: string;
}

const BudgetsPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- Sidebar State ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ---------------- Sidebar Effect ----------------
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- State for Budget, Expenses, and Categories ----------------
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [expenseData, setExpenseData] = useState<Expense[]>([]);
  const [categoryData, setCategoryData] = useState<ExpenseCategory[]>([]);
  const [subcategoryData, setSubcategoryData] = useState<ExpenseSubcategory[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Months are 0-based

  // ---------------- Helper function to fetch data using authFetch and orgFetch ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      // Attempt to fetch using authFetch first
      return await authFetch(url);  // Return the response directly if it's already structured
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      return await orgFetch(url);  // Fallback to orgFetch and return the response directly
    }
  };

  // ---------------- Fetch Budget, Expense, Category, and Subcategory Data ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data using the helper function
        const budgetData = await fetchDataWithAuthFallback(`${baseURL}/api/finance/budgets`);
        setBudgetData(budgetData);

        const expenseData = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expenses`);
        setExpenseData(expenseData);

        const categoryData = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_categories`);
        setCategoryData(categoryData);

        const subcategoryData = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_subcategories`);
        setSubcategoryData(subcategoryData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, []);

  // ---------------- Filter Data Based on Year and Month ----------------
  const filteredBudgetData = useMemo(() => {
    return budgetData.filter(
      (b) => b.year === selectedYear && b.month === selectedMonth
    );
  }, [budgetData, selectedYear, selectedMonth]);

  const filteredExpenseData = useMemo(() => {
    return expenseData.filter(
      (e) => new Date(e.date).getFullYear() === selectedYear && new Date(e.date).getMonth() + 1 === selectedMonth
    );
  }, [expenseData, selectedYear, selectedMonth]);

  // ---------------- Map Category Data ----------------
  const categoryMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    categoryData.forEach((category) => {
      map[category.id] = category.name;
    });
    return map;
  }, [categoryData]);

  // ---------------- Budget Allocation by Category ----------------
  const budgetAllocationByCategory = useMemo(() => {
    // Group budget data by category
    const categoryBudgets: { [key: number]: number } = {}; // Ensuring it's a number

    filteredBudgetData.forEach((budget) => {
      const amount = parseFloat(budget.amount.toString()); // Ensure it's a number, in case it's a string
      if (categoryBudgets[budget.category_id]) {
        categoryBudgets[budget.category_id] += amount; // Add to the existing amount
      } else {
        categoryBudgets[budget.category_id] = amount; // Set initial amount
      }
    });

    // Create data for the Pie Chart
    const categoryChartData = categoryData.map((category) => {
      const budget = categoryBudgets[category.id] || 0;
      return {
        name: category.name,
        budget,
      };
    });

    return categoryChartData;
  }, [filteredBudgetData, categoryData]);

  // ---------------- Top 5 Expense Subcategories ----------------
  const top5ExpenseData = useMemo(() => {
    // Group expenses by subcategory
    const subcategoryExpenses: { [key: number]: number } = {};

    filteredExpenseData.forEach((expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount; // Ensure amount is a number
    
      if (subcategoryExpenses[expense.subcategory_id]) {
        subcategoryExpenses[expense.subcategory_id] += amount; // Add to existing value
      } else {
        subcategoryExpenses[expense.subcategory_id] = amount; // Initialize if not present
      }
    });

    // Get the top 5 subcategories with the highest expense
    const top5Subcategories = Object.entries(subcategoryExpenses)
      .map(([subcategory_id, amount]) => ({
        subcategory_id: parseInt(subcategory_id),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Fetch names and budgets for the top 5 subcategories
    return top5Subcategories.map((item) => {
      const subcategory = subcategoryData.find((sub) => sub.id === item.subcategory_id);
      const category = categoryMap[subcategory?.category_id || 0];
      const budget = filteredBudgetData.find((b) => b.category_id === subcategory?.category_id)?.amount;

      return {
        subcategory_name: subcategory?.name || "",
        category_name: category || "",
        expense: item.amount,
        budget: budget || 0,
      };
    });
  }, [filteredExpenseData, subcategoryData, categoryMap, filteredBudgetData]);

  // ---------------- KPIs ----------------
  const totalBudget = filteredBudgetData.reduce((sum, b) => sum + (typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount), 0);
  const totalSpent = filteredExpenseData.reduce((sum, e) => sum + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount), 0);
  const remainingBudget = totalBudget - totalSpent;

  const overspentCategories = filteredBudgetData.filter((b) =>
    filteredExpenseData.some((e) =>
      e.subcategory_id === b.category_id &&
      (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount) > (typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount)
    )
  ).length;

  // ---------------- Chart Data ----------------
  const categoryChartData = useMemo(() => ({
    labels: budgetAllocationByCategory.map((category) => category.name),
    datasets: [
      {
        label: "Budget Allocation",
        data: budgetAllocationByCategory.map((category) => category.budget),
        backgroundColor: [
          "#ff7f50",
          "#2E3B55",
          "#5C4736",
          "#AF907A",
          "#817E7A",
          "#6B8E23",
          "#4682B4",
        ],
      },
    ],
  }), [budgetAllocationByCategory]);

  const top5ExpenseChartData = useMemo(() => ({
    labels: top5ExpenseData.map((data) => data.subcategory_name),
    datasets: [
      {
        label: "Expense",
        data: top5ExpenseData.map((data) => data.expense),
        backgroundColor: "#ff7f50",
      },
      {
        label: "Budget",
        data: top5ExpenseData.map((data) => data.budget),
        backgroundColor: "#2E3B55",
      },
    ],
  }), [top5ExpenseData]);

  // ---------------- Dropdown Handlers ----------------
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(event.target.value));
  };

  // ---------------- Generate Year and Month Options ----------------
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // Last 5 years and next 5 years
  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
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
        <a href="/finance/budgets" className="active">Budget</a>
        <a href="/finance/payroll">Payroll</a>
        <a href="/finance/financeCategory">Finance Categories</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <FinanceHeader />
                        
        <br />

        {/* Header */}
        <header className="page-header">
          <h1>Budget Overview</h1>
          <button className="add-btn" onClick={() => navigate("/finance/budgetBreakdown")}>Budget Breakdown</button>
          <button className="hamburger" onClick={toggleSidebar}>
            &#9776;
          </button>
        </header>

        <br />
        <button className="add-btn" onClick={() => navigate("/finance/setBudget")}>
          Set Budget
        </button>

        <br /><br />

        {/* Year and Month Filters */}
        <div className="filter-container">
          <select value={selectedYear} onChange={handleYearChange}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>&emsp;
          <select value={selectedMonth} onChange={handleMonthChange}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <br /><br />

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Budget Allocated</h3>
            <p>${totalBudget.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Total Spent</h3>
            <p>${totalSpent.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Remaining Budget</h3>
            <p>${remainingBudget.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Overspent Categories</h3>
            <p>{overspentCategories}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Budget Allocation by Category</h3>
            <Doughnut data={categoryChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>

          <div className="chart-box">
            <h3>Top 5 Expenses vs Budget</h3>
            <Bar data={top5ExpenseChartData} options={{ responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
