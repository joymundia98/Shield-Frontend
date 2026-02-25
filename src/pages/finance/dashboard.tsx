import React, { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Base URL
const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api`;

interface Income {
  id: number;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
}

interface Expense {
  id: number;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
}

interface PayrollRecord {
  payroll_id: number;
  year: number;
  month: number;
  net_salary: string;
  status: "Paid" | "Pending" | "Overdue" | "Rejected";
}

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const barChartRef = useRef<Chart | null>(null);
  const gaugeChartRef = useRef<Chart | null>(null);

  // ---------------- SIDEBAR ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- MONTH / YEAR FILTER ----------------
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // ---------------- DATA ----------------
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  // ---------------- AUTH FETCH ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch {
      return await orgFetch(url);
    }
  };

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeData, expenseData, payrollData] = await Promise.all([
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expenses`),
          fetchDataWithAuthFallback(`${BACKEND_URL}/payroll`)
        ]);

        setIncomes(incomeData);
        setExpenses(expenseData);
        setPayroll(payrollData);
      } catch (err) {
        console.error("Failed to fetch finance dashboard data", err);
      }
    };

    fetchData();
  }, []);

  // ---------------- FILTERED DATA ----------------
  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      if (i.status !== "Approved") return false;
      const d = new Date(i.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [incomes, selectedYear, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.status !== "Approved") return false;
      const d = new Date(e.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [expenses, selectedYear, selectedMonth]);

  // ---------------- KPIs ----------------
  const totalIncome = useMemo(
    () => filteredIncomes.reduce((s, i) => s + parseFloat(i.amount), 0),
    [filteredIncomes]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0),
    [filteredExpenses]
  );

  const netBalance = totalIncome - totalExpenses;

  const pendingPayroll = useMemo(() => {
    return payroll
      .filter(p =>
        p.year === selectedYear &&
        p.month === selectedMonth &&
        (p.status === "Pending" || p.status === "Overdue")
      )
      .reduce((s, p) => s + parseFloat(p.net_salary), 0);
  }, [payroll, selectedYear, selectedMonth]);

  // ---------------- INCOME CONSUMPTION % ----------------
  const incomeConsumptionPercent = useMemo(() => {
    if (totalIncome === 0) return 0;
    return Math.min((totalExpenses / totalIncome) * 100, 100);
  }, [totalIncome, totalExpenses]);

  // ---------------- MONTHLY TOTALS (BAR CHART) ----------------
  const monthlyIncome = useMemo(() => {
    const totals = Array(12).fill(0);
    incomes.forEach(i => {
      if (i.status !== "Approved") return;
      const d = new Date(i.date);
      if (d.getFullYear() === selectedYear) {
        totals[d.getMonth()] += parseFloat(i.amount);
      }
    });
    return totals;
  }, [incomes, selectedYear]);

  const monthlyExpenses = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (e.status !== "Approved") return;
      const d = new Date(e.date);
      if (d.getFullYear() === selectedYear) {
        totals[d.getMonth()] += parseFloat(e.amount);
      }
    });
    return totals;
  }, [expenses, selectedYear]);

  // ---------------- BAR CHART ----------------
  useEffect(() => {
    barChartRef.current?.destroy();

    const ctx = document.getElementById("incomeExpenseChart") as HTMLCanvasElement;
    if (!ctx) return;

    barChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: MONTH_LABELS,
        datasets: [
          { label: "Income", data: monthlyIncome, backgroundColor: "#1A3D7C" },
          { label: "Expenses", data: monthlyExpenses, backgroundColor: "#AF907A" }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } }
      }
    });

    return () => barChartRef.current?.destroy();
  }, [monthlyIncome, monthlyExpenses]);

  // ---------------- GAUGE CHART ----------------
  useEffect(() => {
    gaugeChartRef.current?.destroy();

    const ctx = document.getElementById("incomeConsumptionGauge") as HTMLCanvasElement;
    if (!ctx) return;

    const color =
      incomeConsumptionPercent < 70
        ? "#1A7C3D"
        : incomeConsumptionPercent < 90
        ? "#E0A800"
        : "#C0392B";

    gaugeChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [incomeConsumptionPercent, 100 - incomeConsumptionPercent],
            backgroundColor: [color, "#E5E5E5"],
            borderWidth: 0,
          }
        ]
      },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    return () => gaugeChartRef.current?.destroy();
  }, [incomeConsumptionPercent]);

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>☰</button>

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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard" className="active">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
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

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        
        <FinanceHeader />

        <br/>

        <h1>Finance Overview</h1>

        {/* FILTER */}
        <div className="expense-filter-box">
          <h3>Filter by Date</h3>
          <div className="expense-filter-select">
            <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}>
              {MONTH_LABELS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            &emsp;
            <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => now.getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Income</h3><p>ZMW {totalIncome.toLocaleString()}</p></div>
          <div className="kpi-card"><h3>Total Expenses</h3><p>ZMW {totalExpenses.toLocaleString()}</p></div>
          <div className="kpi-card"><h3>Net Balance</h3><p>ZMW {netBalance.toLocaleString()}</p></div>
          <div className="kpi-card"><h3>Pending Payroll</h3><p>ZMW {pendingPayroll.toLocaleString()}</p></div>
        </div>

        {/* CHARTS */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Monthly Income vs Expenses ({selectedYear})</h3>
            <canvas id="incomeExpenseChart" />
          </div>

          <div className="chart-box">
            <h3>Income Consumption</h3>
            <canvas id="incomeConsumptionGauge" style={{ maxHeight: 220 }} />
            <div style={{ textAlign: "center", marginTop: "-10px" }}>
              <strong>{incomeConsumptionPercent.toFixed(1)}%</strong>
              <p style={{ fontSize: "0.95rem", color: "#666" }}>
                of income consumed by expenses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
