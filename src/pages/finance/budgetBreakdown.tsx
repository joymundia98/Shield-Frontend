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
  category?: { id: number; name: string };
  expense_subcategory?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
  organization_id: number;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  organization_id: number;
}

interface GroupedBudgets {
  [category: string]: {
    title: string;
    subcategories: {
      [subCategory: string]: number;
    };
  };
}

const BudgetBreakdownPage: React.FC = () => {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [budgets, setBudgets] = useState<GroupedBudgets>({});
  const [loading, setLoading] = useState(false);

  // ---------- Fetch categories & subcategories ----------
  const fetchCategoriesAndSubcategories = async () => {
    try {
      const [cats, subs]: [Category[], Subcategory[]] = await Promise.all([
        fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_categories`),
        fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_subcategories`)
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (err) {
      console.error("Failed to fetch categories/subcategories", err);
      alert("Failed to load categories/subcategories.");
    }
  };

  // ---------- Fetch all budgets ----------
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
    fetchCategoriesAndSubcategories();
    fetchAllBudgets();
  }, []);

  // ---------- Map IDs to names ----------
  const mapBudgetNames = (budget: BudgetItem): BudgetItem => {
    const cat = categories.find((c) => c.id === budget.category_id);
    const sub = subcategories.find((s) => s.id === budget.expense_subcategory_id);
    return { ...budget, category: cat, expense_subcategory: sub };
  };

  // ---------- Filter & group budgets ----------
  useEffect(() => {
    if (!categories.length || !subcategories.length) return;

    const mappedBudgets = allBudgets.map(mapBudgetNames);

    const filtered = mappedBudgets.filter(
      (b) =>
        b.month === parseInt(selectedMonth, 10) &&
        b.year === parseInt(selectedYear, 10)
    );

    const grouped: GroupedBudgets = {};
    filtered.forEach((item) => {
      const categoryName = item.category?.name || `Category ${item.category_id}`;
      const subName = item.expense_subcategory?.name || `Subcategory ${item.expense_subcategory_id}`;

      if (!grouped[categoryName]) {
        grouped[categoryName] = { title: item.title, subcategories: {} };
      }

      grouped[categoryName].subcategories[subName] = Number(item.amount);
    });

    setBudgets(grouped);
  }, [allBudgets, categories, subcategories, selectedMonth, selectedYear]);

  // ---------- Total Calculation ----------
  const calculateTotal = () => {
    return Object.values(budgets).reduce((sum, cat) => {
      return sum + Object.values(cat.subcategories).reduce((s, amt) => s + amt, 0);
    }, 0);
  };

  // ---------- Number formatting ----------
  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ---------- Year Options ----------
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

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
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content container">
        <FinanceHeader />
        <br />
        <header>
          <h1>Budget Breakdown</h1>
          <button className="add-btn" onClick={() => navigate("/finance/setBudget")}>
            Set Budget
          </button>&emsp;
          <button className="add-btn" onClick={() => navigate("/finance/setBudgets")}>✏️ &nbsp; Edit Budgets</button>&emsp;
          <button className="add-btn" onClick={() => navigate("/finance/Budgets")}>Budget Summary</button>
        </header>
        <br />

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <label>Select Month: </label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ marginRight: "10px" }}>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((name, idx) => {
                const val = ("0" + (idx + 1)).slice(-2);
                return <option key={val} value={val}>{name}</option>;
              })}
            </select>
            <label>Select Year: </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {generateYearOptions().map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        {loading && <p>Loading budgets...</p>}
        {!loading && Object.keys(budgets).length === 0 && <p>No budgets found for this period.</p>}

        {/* Total Card - Top */}
        {!loading && Object.keys(budgets).length > 0 && (
          <div className="budget-card total-card">
            <h3>Total</h3>
            <p style={{ fontStyle: "italic", marginBottom: "10px", fontWeight: "800", fontSize: "1.5rem" }}>
              ${formatAmount(calculateTotal())}
            </p>
          </div>
        )}

        {/* Budget Cards */}
        {Object.entries(budgets).map(([category, data]) => (
          <div className="budget-card" key={category}>
            <h3 className="budget-card-title">{category}</h3>
            <p style={{ fontStyle: "italic", marginBottom: "10px" }}>{data.title}</p>
            {Object.entries(data.subcategories).map(([sub, amount]) => (
              <div className="budget-input-row" key={sub}>
                <label>{sub}</label>
                <span>${formatAmount(amount)}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Total Card - Bottom */}
        {!loading && Object.keys(budgets).length > 0 && (
          <div className="budget-card total-card">
            <h3>Total</h3>
            <p style={{ fontStyle: "italic", marginBottom: "10px", fontWeight: "800", fontSize: "1.5rem" }}>
              ${formatAmount(calculateTotal())}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetBreakdownPage;
