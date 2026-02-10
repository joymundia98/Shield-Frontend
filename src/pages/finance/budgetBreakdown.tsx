import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";

const baseURL = import.meta.env.VITE_BASE_URL;

// ---------- Helper: Fetch with auth fallback ----------
const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch", err);
    return await orgFetch(url, options);
  }
};

interface BudgetItem {
  id: number;
  title: string;
  amount: number;
  month: number;
  year: number;
  category_id: number;
  expense_subcategory_id: number;
  organization_id: number;
  created_at: string;
  category?: { id: number; name: string }; // optional for grouping
  expense_subcategory?: { id: number; name: string }; // optional
}

interface GroupedBudgets {
  [category: string]: {
    title: string;
    subcategories: {
      [subCategory: string]: number;
    };
  };
}

const ViewBudgetsPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------- Sidebar ----------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------- Filters ----------
  const [selectedMonth, setSelectedMonth] = useState<string>(
    ("0" + (new Date().getMonth() + 1)).slice(-2)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // ---------- Data ----------
  const [allBudgets, setAllBudgets] = useState<BudgetItem[]>([]);
  const [budgets, setBudgets] = useState<GroupedBudgets>({});
  const [loading, setLoading] = useState(false);

  // ---------- Fetch All Budgets Once ----------
  const fetchAllBudgets = async () => {
    try {
      setLoading(true);
      const res: BudgetItem[] = await fetchDataWithAuthFallback(
        `${baseURL}/api/finance/budgets`
      );
      setAllBudgets(res);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
      alert("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBudgets();
  }, []);

  // ---------- Filter & Group Budgets on Frontend ----------
  useEffect(() => {
    const filtered = allBudgets.filter(
      (b) =>
        b.month === parseInt(selectedMonth, 10) &&
        b.year === parseInt(selectedYear, 10)
    );

    const grouped: GroupedBudgets = {};

    filtered.forEach((item) => {
      const categoryName = item.category?.name || `Category ${item.category_id}`;
      const subName = item.expense_subcategory?.name || `Subcategory ${item.expense_subcategory_id}`;

      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          title: item.title,
          subcategories: {}
        };
      }

      grouped[categoryName].subcategories[subName] = Number(item.amount);
    });

    setBudgets(grouped);
  }, [allBudgets, selectedMonth, selectedYear]);

  
 // ---------- Year Options ----------
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  };


  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incomeDashboard">Track Income</a>
        <a href="/finance/expenseDashboard">Track Expenses</a>
        <a href="/finance/budgets" className="active">Budget</a>
        <a href="/finance/payroll">Payroll</a>
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
      <div className="dashboard-content container">
        <FinanceHeader />

        <br />

        <header>
          <h1>Budget Summary</h1>
        </header>

        <br />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <button className="add-btn" onClick={() => navigate("/finance/setBudgets")}>
            Edit Budgets
          </button>

          <div>
            <label>Select Month: </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ marginRight: "10px" }}
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((name, idx) => {
                const val = ("0" + (idx + 1)).slice(-2);
                return (
                  <option key={val} value={val}>
                    {name}
                  </option>
                );
              })}
            </select>

            <label>Select Year: </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p>Loading budgets...</p>}

        {!loading && Object.keys(budgets).length === 0 && (
          <p>No budgets found for this period.</p>
        )}

        {/* Budget Cards */}
        {Object.entries(budgets).map(([category, data]) => (
          <div className="budget-card" key={category}>
            <h3 className="budget-card-title">{category}</h3>
            <p style={{ fontStyle: "italic", marginBottom: "10px" }}>
              {data.title}
            </p>

            {Object.entries(data.subcategories).map(([sub, amount]) => (
              <div className="budget-input-row" key={sub}>
                <label>{sub}</label>
                <span>${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBudgetsPage;
