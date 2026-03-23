import React, { useEffect, useRef, useMemo, useState } from "react";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import { useNavigate } from "react-router-dom";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api`;

interface IncomeCategory {
  id: number;
  name: string;
}

interface IncomeSubcategory {
  id: number;
  category_id: number;
  name: string;
}

interface Income {
  id: number;
  subcategory_id: number;
  giver: string | null;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string; // YYYY-MM-DD
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const IncomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // ---------------- SIDEBAR ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- MONTH / YEAR FILTER ----------------
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // ---------------- Charts ----------------
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const sourceChartRef = useRef<HTMLCanvasElement>(null);

  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [subcategories, setSubcategories] = useState<IncomeSubcategory[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  // ---------------- Auth Fetch Helper ----------------
  const fetchDataWithAuthFallback = async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      return await authFetch(url, options);
    } catch (error) {
      console.warn("authFetch failed, falling back to orgFetch");
      return await orgFetch(url, options);
    }
  };

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, subData, incomeData] = await Promise.all([
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_categories`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_subcategories`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes`)
        ]);

        setCategories(catData);
        setSubcategories(subData);
        setIncomes(incomeData);
      } catch (err) {
        console.error("Failed to fetch income data", err);
      }
    };

    fetchData();
  }, []);

  // ---------------- JOIN + MONTH/YEAR FILTER ----------------
  const incomesWithCategory = useMemo(() => {
    const subMap = Object.fromEntries(subcategories.map(s => [s.id, s]));
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    return incomes
      .filter(i => {
        const d = new Date(i.date);
        return (
          d.getMonth() === selectedMonth &&
          d.getFullYear() === selectedYear
        );
      })
      .map(i => {
        const sub = subMap[i.subcategory_id];
        const cat = sub ? catMap[sub.category_id] : null;

        return {
          ...i,
          categoryName: cat ? cat.name : "Unknown",
          subcategoryName: sub ? sub.name : "Unknown",
          amountNum: parseFloat(i.amount)
        };
      });
  }, [incomes, subcategories, categories, selectedMonth, selectedYear]);

  // ---------------- KPI TOTALS ----------------
  const { totalApproved, totalPending, totalRejected } = useMemo(() => {
    return {
      totalApproved: incomesWithCategory
        .filter(i => i.status === "Approved")
        .reduce((sum, i) => sum + i.amountNum, 0),

      totalPending: incomesWithCategory
        .filter(i => i.status === "Pending")
        .reduce((sum, i) => sum + i.amountNum, 0),

      totalRejected: incomesWithCategory
        .filter(i => i.status === "Rejected")
        .reduce((sum, i) => sum + i.amountNum, 0)
    };
  }, [incomesWithCategory]);

  // ---------------- CATEGORY TOTALS BY STATUS ----------------
  const categoryTotalsByStatus = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};

    incomesWithCategory.forEach(i => {
      const cat = i.categoryName;
      if (!result[cat]) result[cat] = { Approved: 0, Pending: 0, Rejected: 0 };
      result[cat][i.status] += i.amountNum;
    });

    return result;
  }, [incomesWithCategory]);

  // ---------------- SOURCE TOTALS BY STATUS ----------------
  const sourceTotalsByStatus = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    incomesWithCategory.forEach(i => {
      const giver = i.giver || "Anonymous";
      if (!result[giver]) result[giver] = { Approved: 0, Pending: 0, Rejected: 0 };
      result[giver][i.status] += i.amountNum;
    });
    return result;
  }, [incomesWithCategory]);

  // ---------------- Charts ----------------
  useEffect(() => {
    let categoryChart: Chart | null = null;
    let sourceChart: Chart | null = null;

    // ---- Stacked Bar Chart ----
    if (categoryChartRef.current) {
      const labels = Object.keys(categoryTotalsByStatus);
      const approvedData = labels.map(l => categoryTotalsByStatus[l].Approved);
      const pendingData = labels.map(l => categoryTotalsByStatus[l].Pending);
      const rejectedData = labels.map(l => categoryTotalsByStatus[l].Rejected);

      categoryChart = new Chart(categoryChartRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Approved", data: approvedData, backgroundColor: "#1A3D7C" },
            { label: "Pending", data: pendingData, backgroundColor: "#E0A800" },
            { label: "Rejected", data: rejectedData, backgroundColor: "#C0392B" },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }
      });
    }

    // ---- Pie Chart with Status Breakdown Tooltips ----
    if (sourceChartRef.current) {
      const labels = Object.keys(sourceTotalsByStatus);
      const totals = labels.map(
        l => sourceTotalsByStatus[l].Approved + sourceTotalsByStatus[l].Pending + sourceTotalsByStatus[l].Rejected
      );

      sourceChart = new Chart(sourceChartRef.current, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data: totals,
              backgroundColor: [
                "#5C4736", "#817E7A", "#AF907A", "#20262C", "#858796", "#C9B29B"
              ],
            }
          ]
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const giver = context.label!;
                  const breakdown = sourceTotalsByStatus[giver];
                  return `${giver}: ${breakdown.Approved.toLocaleString()} Approved, ${breakdown.Pending.toLocaleString()} Pending, ${breakdown.Rejected.toLocaleString()} Rejected`;
                }
              }
            },
            legend: { position: "right" }
          }
        }
      });
    }

    return () => {
      categoryChart?.destroy();
      sourceChart?.destroy();
    };
  }, [categoryTotalsByStatus, sourceTotalsByStatus]);

  return (
    <div className="dashboard-wrapper">
      {/* ---------------- SIDEBAR ---------------- */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard" className="active">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard">Track Expenses</a>}
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

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="dashboard-content">
        <div className="do-not-print">
          
            <FinanceHeader />

        </div>

        {/* PRINT BUTTON */}
        <div className="do-not-print print-button-container" style={{ margin: "10px 0" }}>
          <button
            className="print-button"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
        </div>

        <br />

        <header className="page-header income-header">
          <h1>Income Dashboard</h1>

          <div>
            <br />
            <button
              className="add-btn"
              onClick={() => navigate("/finance/incometracker")}
            >
              View Incomes Data
            </button>

            &nbsp;
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
          </div>
        </header>

        <br />
        <br />

        {/* KPIs */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Filter by Month</h3>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>&emsp;

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 11 }).map((_, i) => {
                const year = now.getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="kpi-card kpi-approved">
            <h3>Total Approved Income</h3>
            <p>ZMW {totalApproved.toLocaleString()}</p>
          </div>

          <div className="kpi-card kpi-pending">
            <h3>Pending Income</h3>
            <p>ZMW {totalPending.toLocaleString()}</p>
          </div>

          <div className="kpi-card kpi-rejected">
            <h3>Rejected Income</h3>
            <p>ZMW {totalRejected.toLocaleString()}</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Income by Category</h3>
            <canvas ref={categoryChartRef}></canvas>
          </div>

          <div className="chart-box">
            <h3>Income by Source (Top 5)</h3>
            <canvas ref={sourceChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeDashboard;