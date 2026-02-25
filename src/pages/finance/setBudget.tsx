import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css"; // Ensure your styles are being imported
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // <-- Added auth/org fetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// ---------------- Helper: Fetch with auth then fallback to org ----------------
const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch", err);
    return await orgFetch(url, options);
  }
};

interface Budgets {
  [category: string]: { [subCategory: string]: number };
}

const SetBudgetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // ---------------- Sidebar State ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Budget Categories ----------------
  const [budgetCategories, setBudgetCategories] = useState<{ [category: string]: string[] }>({});
  const [categoryIds, setCategoryIds] = useState<{ [category: string]: number }>({}); // To store category_id
  const [subcategoryIds, setSubcategoryIds] = useState<{ [subCategory: string]: number }>({}); // To store subcategory_id

  // ---------------- Budget State ----------------
  const [budgets, setBudgets] = useState<Budgets>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("01"); // Default to January
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString()); // Default to current year
  const [budgetTitle, setBudgetTitle] = useState<string>("June 2026 Budget"); // New state for Budget Title

  // ---------------- Fetch Categories and Existing Budgets ----------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_categories`);
        const categories: { [category: string]: string[] } = {};
        const categoryIdsMap: { [category: string]: number } = {};
        
        res.forEach((category: any) => {
          categories[category.name] = []; // Initialize empty array for subcategories
          categoryIdsMap[category.name] = category.id; // Store category_id
        });

        // Fetch expense subcategories and group by category
        const subCategoriesRes = await fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_subcategories`);
        
        const subcategoryIdsMap: { [subCategory: string]: number } = {};
        subCategoriesRes.forEach((subCategory: any) => {
          const categoryName = res.find((cat: any) => cat.id === subCategory.category_id)?.name;
          if (categoryName) {
            categories[categoryName].push(subCategory.name);
            subcategoryIdsMap[subCategory.name] = subCategory.id; // Map subcategory name to ID
          } else {
            console.error(`No category found for subcategory: ${subCategory.name}`);
          }
        });

        setBudgetCategories(categories);
        setCategoryIds(categoryIdsMap); // Set the category_id map
        setSubcategoryIds(subcategoryIdsMap); // Set the subcategory_id map

      } catch (err) {
        console.error("Error fetching data", err);
        alert("Error fetching data. Please try again.");
      }
    };

    fetchCategories();
  }, []);

  // ---------------- Handle Input Change ----------------
  const handleChange = (category: string, subCategory: string, value: string) => {
    setBudgets(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: parseFloat(value) || 0
      }
    }));
  };

  // ---------------- Handle Month Change ----------------
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // ---------------- Handle Year Change ----------------
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // ---------------- Save Budgets ----------------
  const saveBudgets = async () => {
    try {
      // Flatten the data into an array of objects
      const dataToSave = [];

      // Iterate over each category and subcategory to flatten the structure
      for (const category in budgets) {
        if (category !== 'month' && category !== 'year') {
          for (const subCategory in budgets[category]) {
            const amount = budgets[category][subCategory];

            // Only include entries with valid amounts
            if (amount !== undefined && !isNaN(amount) && amount > 0) {
              // Get category_id and subcategory_id from the maps
              const categoryId = categoryIds[category]; // Get category_id from the categoryIds map
              const subcategoryId = subcategoryIds[subCategory]; // Get subcategory_id from the subcategoryIds map

              // Check if both categoryId and subcategoryId are valid
              if (categoryId && subcategoryId) {
                dataToSave.push({
                  title: budgetTitle,
                  amount,
                  year: parseInt(selectedYear, 10),
                  month: parseInt(selectedMonth, 10),  // Ensure month is correctly set
                  category_id: categoryId,
                  expense_subcategory_id: subcategoryId,
                });
              } else {
                console.error(`Invalid category or subcategory for ${category} - ${subCategory}`);
              }
            }
          }
        }
      }

      // Validate that there's data to send
      if (dataToSave.length === 0) {
        alert("No valid budget data to save.");
        return;
      }

      console.log("Data to save:", dataToSave);  // Log data to confirm the structure

      // Send each budget entry separately
      for (const budgetData of dataToSave) {
        const response = await fetchDataWithAuthFallback(`${baseURL}/api/finance/budgets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(budgetData)
        });
        console.log("Response from backend:", response);
      }

      alert("Budgets have been saved successfully!");

      // Redirect to budgets page after saving
      navigate("/finance/budgets");
    } catch (err: unknown) {
      console.error("Failed to save budgets:", err);
      alert("Error saving budgets. Please try again.");
    }
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

      {/* Main Content */}
      <div className="dashboard-content container">

        <FinanceHeader />
                        
        <br/>

        <header>
          <h1>Budget Setup</h1>
        </header>

        <br />

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button className="add-btn" onClick={() => navigate("/finance/budgets")}>
            Budget Summary
          </button>
        </div>

        <h2>Set Budget for Categories</h2>

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
          <select value={selectedMonth} onChange={handleMonthChange} style={{ marginRight: "10px" }}>
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
          <select value={selectedYear} onChange={handleYearChange}>
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Render Budget Form with Cards */}
        {Object.entries(budgetCategories).map(([category, subCategories]) => (
          <div className="budget-card" key={category}>
            <h3 className="budget-card-title">{category}</h3>

            {subCategories.map(sub => (
              <div className="budget-input-row" key={sub}>
                <label>{sub}</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Enter budget"
                  value={budgets[category]?.[sub] || ""}
                  onChange={(e) => handleChange(category, sub, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button className="add-btn" onClick={saveBudgets} style={{ marginTop: "20px" }}>
          Save Budgets
        </button>
      </div>
    </div>
  );
};

export default SetBudgetsPage;
