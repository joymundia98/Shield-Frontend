import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css"; // Ensure your styles are being imported
import FinanceHeader from './FinanceHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

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

const BudgetBreakdownPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- Sidebar State ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Budget State ----------------
  const [budgetData, setBudgetData] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("01"); // Default to January
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString()); // Default to current year
  const [_categories, setCategories] = useState<{ [category: string]: string[] }>({});
  const [categoryIds, setCategoryIds] = useState<{ [category: string]: number }>({});
  const [subcategoryIds, setSubcategoryIds] = useState<{ [subcategory: string]: number }>({});
  const [budgetTitle, setBudgetTitle] = useState<string>("");

  // ---------------- Fetch Categories and Existing Budgets ----------------
  const fetchCategoriesAndBudgets = async () => {
    try {
      // Fetch categories
      const categoryRes = await axios.get(`${baseURL}/api/finance/expense_categories`);
      const categoriesMap: { [category: string]: string[] } = {};
      const categoryIdsMap: { [category: string]: number } = {};

      categoryRes.data.forEach((category: any) => {
        categoriesMap[category.name] = [];
        categoryIdsMap[category.name] = category.id;
      });

      // Fetch subcategories
      const subCategoryRes = await axios.get(`${baseURL}/api/finance/expense_subcategories`);
      const subcategoryIdsMap: { [subcategory: string]: number } = {};

      subCategoryRes.data.forEach((subCategory: any) => {
        const categoryName = categoryRes.data.find((cat: any) => cat.id === subCategory.category_id)?.name;
        if (categoryName) {
          categoriesMap[categoryName].push(subCategory.name);
          subcategoryIdsMap[subCategory.name] = subCategory.id;
        }
      });

      setCategories(categoriesMap);
      setCategoryIds(categoryIdsMap);
      setSubcategoryIds(subcategoryIdsMap);

      // Fetch budget data for selected month and year from the backend
      const budgetRes = await axios.get(`${baseURL}/api/finance/budgets`, {
        params: { month: selectedMonth, year: selectedYear } // Filter by selected month and year
      });
      
      setBudgetData(budgetRes.data);

      // Fetch the title based on month and year (assuming the title is consistent for each month/year combination)
      if (budgetRes.data.length > 0) {
        setBudgetTitle(budgetRes.data[0].title); // Set the first title that matches the month and year
      }

    } catch (err) {
      console.error("Error fetching data", err);
      alert("Error fetching data. Please try again.");
    }
  };

  // ---------------- Fetch Budgets when Month or Year Changes ----------------
  useEffect(() => {
    fetchCategoriesAndBudgets();
  }, [selectedMonth, selectedYear]);

  // ---------------- Handle Month Change ----------------
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // ---------------- Handle Year Change ----------------
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // ---------------- Generate Year Options ----------------
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i.toString());
    }
    return years;
  };

  // ---------------- Group Budget Data ----------------
  const groupedBudgetData = useMemo(() => {
    const groupedData: { [category: string]: { [subcategory: string]: string } } = {};

    budgetData.forEach((budget) => {
      const category = Object.keys(categoryIds).find((key) => categoryIds[key] === budget.category_id);
      const subcategory = Object.keys(subcategoryIds).find((key) => subcategoryIds[key] === budget.expense_subcategory_id);
      
      if (category && subcategory) {
        if (!groupedData[category]) {
          groupedData[category] = {};
        }
        groupedData[category][subcategory] = budget.amount;
      }
    });

    return groupedData;
  }, [budgetData, categoryIds, subcategoryIds]);

  // ---------------- Calculate Total Amount ----------------
  const totalAmount = useMemo(() => {
    return budgetData.reduce((total, budget) => total + parseFloat(budget.amount), 0);
  }, [budgetData]);

  // ---------------- Format Number with Commas ----------------
  const formatNumberWithCommas = (num: number) => {
    return num.toLocaleString();
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
      <div className="dashboard-content container">

        <FinanceHeader />
                        
        <br/>

        <header>
          <h1>Budget Breakdown</h1>
        </header>

        <br />

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button className="add-btn" onClick={() => navigate("/finance/budgets")}>
            Back to Budget Summary
          </button>
        </div>

        {/* Display Budget Title */}
        <h2>{budgetTitle}</h2>

        {/* Month and Year Dropdowns */}
        <div style={{ marginBottom: "20px" }}>
          <label>Select Month: </label>
          <select value={selectedMonth} onChange={handleMonthChange} style={{ marginRight: "10px" }}>
            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((month, idx) => (
              <option key={month} value={month}>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][idx]}</option>
            ))}
          </select>

          <label>Select Year: </label>
          <select value={selectedYear} onChange={handleYearChange}>
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Render Budget Breakdown */}
        {Object.entries(groupedBudgetData).map(([category, subCategories]) => (
          <div className="budget-card" key={category}>
            <h3 className="budget-card-title">{category}</h3>
            {Object.entries(subCategories).map(([subcategory, amount]) => (
              <div className="budget-input-row" key={subcategory}>
                <label>{subcategory}</label>
                <input type="text" value={amount} readOnly />
              </div>
            ))}
          </div>
        ))}

        {/* Display Total */}
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>
          <h3>Total: ${formatNumberWithCommas(totalAmount)}</h3>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdownPage;
