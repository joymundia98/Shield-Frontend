import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

// ---------- Fetch Helper ----------
const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch {
    return await orgFetch(url, options);
  }
};

interface Budgets {
  [category: string]: { [subCategory: string]: number };
}

const EditBudgetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // ---------- Sidebar ----------
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
    useEffect(() => {
      if (sidebarOpen) document.body.classList.add("sidebar-open");
      else document.body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

  const { year, month } = useParams();

  // ---------- State ----------
  const [budgetCategories, setBudgetCategories] = useState<{ [key: string]: string[] }>({});
  const [categoryIds, setCategoryIds] = useState<{ [key: string]: number }>({});
  const [subcategoryIds, setSubcategoryIds] = useState<{ [key: string]: number }>({});
  const [budgets, setBudgets] = useState<Budgets>({});
  const [budgetIds, setBudgetIds] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    month || ("0" + (new Date().getMonth() + 1)).slice(-2)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    year || new Date().getFullYear().toString()
  );

  const [budgetTitle, setBudgetTitle] = useState("");

  // ---------- Fetch Categories ----------
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_categories`);
      const subs = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_subcategories`);

      const cats: any = {};
      const catIds: any = {};
      const subIds: any = {};

      res.forEach((c: any) => {
        cats[c.name] = [];
        catIds[c.name] = c.id;
      });

      subs.forEach((s: any) => {
        const cat = res.find((c: any) => c.id === s.category_id);
        if (cat) {
          cats[cat.name].push(s.name);
          subIds[s.name] = s.id;
        }
      });

      setBudgetCategories(cats);
      setCategoryIds(catIds);
      setSubcategoryIds(subIds);
    };

    fetchCategories();
  }, []);

  // ---------- Fetch Existing Budgets ----------
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!Object.keys(categoryIds).length) return;

      setLoading(true);

      const res = await fetchDataWithAuthFallback(`${baseURL}/api/finance/budgets`);

      const filtered = res.filter(
        (b: any) =>
          b.month === parseInt(selectedMonth, 10) &&
          b.year === parseInt(selectedYear, 10)
      );

      const newBudgets: Budgets = {};
      const idsMap: any = {};

      filtered.forEach((item: any) => {
        const categoryName = Object.keys(categoryIds).find(
          key => categoryIds[key] === item.category_id
        );
        const subName = Object.keys(subcategoryIds).find(
          key => subcategoryIds[key] === item.expense_subcategory_id
        );

        if (!categoryName || !subName) return;

        if (!newBudgets[categoryName]) newBudgets[categoryName] = {};
        if (!idsMap[categoryName]) idsMap[categoryName] = {};

        newBudgets[categoryName][subName] = item.amount;
        idsMap[categoryName][subName] = item.id;
      });

      setBudgets(newBudgets);
      setBudgetIds(idsMap);

      if (filtered.length > 0) {
        setBudgetTitle(filtered[0].title);
      }

      setLoading(false);
    };

    fetchBudgets();
  }, [categoryIds, subcategoryIds, selectedMonth, selectedYear]);

  // ---------- Handle Input ----------
  const handleChange = (category: string, sub: string, value: string) => {
    setBudgets(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [sub]: parseFloat(value) || 0
      }
    }));
  };

  // ---------- Save ----------
  const saveBudgets = async () => {
    try {
      const requests: Promise<any>[] = [];

      for (const category in budgets) {
        for (const sub in budgets[category]) {
          const amount = budgets[category][sub];
          if (!amount) continue;

          const categoryId = categoryIds[category];
          const subId = subcategoryIds[sub];
          const budgetId = budgetIds?.[category]?.[sub];

          if (budgetId) {
            requests.push(
              fetchDataWithAuthFallback(`${baseURL}/api/finance/budgets/${budgetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: budgetTitle,
                  amount,
                  month: parseInt(selectedMonth),
                  year: parseInt(selectedYear),
                  category_id: categoryId,
                  expense_subcategory_id: subId
                })
              })
            );
          } else {
            requests.push(
              fetchDataWithAuthFallback(`${baseURL}/api/finance/budgets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: budgetTitle,
                  amount,
                  month: parseInt(selectedMonth),
                  year: parseInt(selectedYear),
                  category_id: categoryId,
                  expense_subcategory_id: subId
                })
              })
            );
          }
        }
      }

      await Promise.all(requests);
      alert("Budgets updated successfully!");
      navigate("/finance/budgets");

    } catch (err) {
      console.error(err);
      alert("Failed to update budgets");
    }
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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard">Track Expenses</a>}
        {hasPermission("Add Expense") && <a href="/finance/addExpense">Add Expense</a>}
        {hasPermission("View Budgets Summary") && <a href="/finance/budgets" className="active">Budget</a>}
        {hasPermission("Manage Payroll") && <a href="/finance/payroll">Payroll</a>}
        {hasPermission("View Finance Categories") && <a href="/finance/financeCategory">Finance Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      <div className="dashboard-content container">
        <FinanceHeader />
        <br/>

        <header>
        <h1>Edit Budget</h1>
        </header>

        <br />

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button className="add-btn" onClick={() => navigate("/finance/budgets")}>
            Budget Summary
        </button>
        </div>

        <h2>Edit Budget for Categories</h2>

        {/* Budget Title Input */}
        <div style={{ marginBottom: "20px" }}>
        <br />
        <label className="neumorphic-label">Please enter a Budget Title</label>
        <input
            className="neumorphic-input"
            type="text"
            placeholder="Enter budget title"
            value={budgetTitle}
            onChange={(e) => setBudgetTitle(e.target.value)}
        />
        </div>

        {/* Month and Year Dropdowns */}
        <div style={{ marginBottom: "20px" }}>
        <label>Select Month: </label>
        <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ marginRight: "10px" }}
        >
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>

        <label>Select Year: </label>
        <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
        >
            {Array.from({ length: 6 }, (_, i) => {
            const y = new Date().getFullYear() + i;
            return <option key={y} value={y}>{y}</option>;
            })}
        </select>
        </div>

        {/* Loading */}
        {loading && <p>Loading budgets...</p>}

        {/* Empty */}
        {!loading && Object.keys(budgets).length === 0 && (
          <p>No budgets found for this period. You can create new ones.</p>
        )}

        {/* Form */}
        {Object.entries(budgetCategories).map(([cat, subs]) => (
          <div key={cat} className="budget-card">
            <h3>{cat}</h3>

            {subs.map(sub => (
              <div key={sub} className="budget-input-row">
                <label>{sub}</label>
                <input
                  type="number"
                  value={budgets[cat]?.[sub] || ""}
                  onChange={(e) => handleChange(cat, sub, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button onClick={saveBudgets} className="add-btn">
          Update Budgets
        </button>
      </div>
    </div>
  );
};

export default EditBudgetsPage;