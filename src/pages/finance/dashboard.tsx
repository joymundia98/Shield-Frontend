import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';

const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const incomeExpenseChartRef = useRef<Chart | null>(null);

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add/remove sidebar-open class on body for proper animation
    useEffect(() => {
      const body = document.body;
      if (sidebarOpen) {
        body.classList.add("sidebar-open");
      } else {
        body.classList.remove("sidebar-open");
      }
      // Clean up on unmount
      return () => body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

  // KPI values (static from your HTML demo)
  const totalIncome = 0;
  const totalExpenses = 0;
  const netBalance = 0;
  const pendingPayroll = 0;

  useEffect(() => {
    // Cleanup old chart
    incomeExpenseChartRef.current?.destroy();

    const ctx = document.getElementById(
      "incomeExpenseChart"
    ) as HTMLCanvasElement;

    if (ctx) {
      incomeExpenseChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Income",
              data: [2000, 2500, 1800, 2200, 2400, 2600],
              backgroundColor: "#1A3D7C",
            },
            {
              label: "Expenses",
              data: [1500, 1200, 1600, 1800, 1700, 2000],
              backgroundColor: "#AF907A",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
        },
      });
    }
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        {/* Close Button (Styled like ClassDashboard) */}
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

        <a href="/finance/dashboard" className="active">Dashboard</a>
        <a href="/finance/incometracker">Track Income</a>
        <a href="/finance/expensetracker">Track Expenses</a>
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
          ➜] Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <FinanceHeader />
        
        <br/>

        <h1>Finance Overview</h1>

        <br /><br />

        {/* KPI CARDS */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Income</h3>
            <p>${totalIncome.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Total Expenses</h3>
            <p>${totalExpenses.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Net Balance</h3>
            <p>${netBalance.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Pending Payroll</h3>
            <p>${pendingPayroll.toLocaleString()}</p>
          </div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Monthly Income vs Expenses</h3>
            <canvas id="incomeExpenseChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
