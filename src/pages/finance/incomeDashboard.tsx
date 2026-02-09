import React, { useEffect, useRef, useMemo, useState } from "react";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import { useNavigate } from "react-router-dom";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";

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

  // ---------------- CATEGORY TOTALS + TOP 5 SOURCES ----------------
  const { categoryTotals, sourceTotals } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const sourceMap: Record<string, number> = {};

    incomesWithCategory.forEach(i => {
      categoryTotals[i.categoryName] =
        (categoryTotals[i.categoryName] || 0) + i.amountNum;

      const giver = i.giver || "Anonymous";
      sourceMap[giver] = (sourceMap[giver] || 0) + i.amountNum;
    });

    const sortedSources = Object.entries(sourceMap).sort(
      (a, b) => b[1] - a[1]
    );

    const top5 = sortedSources.slice(0, 5);
    const others = sortedSources.slice(5);

    const sourceTotals: Record<string, number> = {};
    top5.forEach(([giver, total]) => (sourceTotals[giver] = total));

    if (others.length) {
      sourceTotals["Others"] = others.reduce((s, [, v]) => s + v, 0);
    }

    return { categoryTotals, sourceTotals };
  }, [incomesWithCategory]);

  // ---------------- Charts ----------------
  useEffect(() => {
    let categoryChart: Chart | null = null;
    let sourceChart: Chart | null = null;

    if (categoryChartRef.current) {
      categoryChart = new Chart(categoryChartRef.current, {
        type: "bar",
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [
            {
              label: "Income",
              data: Object.values(categoryTotals),
              backgroundColor: "#1A3D7C"
            }
          ]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }

    if (sourceChartRef.current) {
      sourceChart = new Chart(sourceChartRef.current, {
        type: "pie",
        data: {
          labels: Object.keys(sourceTotals),
          datasets: [
            {
              data: Object.values(sourceTotals),
              backgroundColor: [
                "#5C4736",
                "#817E7A",
                "#AF907A",
                "#20262C",
                "#858796",
                "#C9B29B"
              ]
            }
          ]
        }
      });
    }

    return () => {
      categoryChart?.destroy();
      sourceChart?.destroy();
    };
  }, [categoryTotals, sourceTotals]);

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
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incomeDashboard" className="active">
          Track Income
        </a>
        <a href="/finance/expenseDashboard">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
        <a href="/finance/payroll">Payroll</a>
        <a href="/finance/financeCategory">Finance Categories</a>

        <hr className="sidebar-separator" />

        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>

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
        <FinanceHeader />

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
