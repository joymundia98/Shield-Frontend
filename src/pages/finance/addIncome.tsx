import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface ExtraFields {
  [key: string]: string | number;
}

interface NewIncome {
  category: number | "";
  subcategory: number | "";
  date: string;
  source: string;
  description: string;
  amount: number | "";
  paymentMethod: string;
  attachments: File[];
  extraFields: ExtraFields;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

const BACKEND_URL = `${baseURL}/api`;

// Helper function to handle fetching with fallback logic
const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options); // Try authFetch first
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch", err);
    return await orgFetch(url, options); // If authFetch fails, fall back to orgFetch
  }
};

const AddIncome: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Form State
  const [form, setForm] = useState<NewIncome>({
    category: "",
    subcategory: "",
    date: "",
    source: "",
    description: "",
    amount: "",
    paymentMethod: "Cash",
    attachments: [],
    extraFields: {},
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Current User ID
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  // Fetch categories + subcategories using the new helper function
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_categories`);
        setCategories(categoriesData);

        const subcategoriesData = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_subcategories`);
        setAllSubcategories(subcategoriesData);
      } catch (err) {
        console.error("Failed to fetch categories or subcategories", err);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (categoryId: number) => {
    const filtered = allSubcategories.filter(sub => sub.category_id === categoryId);
    setSubcategories(filtered);
    setForm({ ...form, category: categoryId, subcategory: "", extraFields: {} });
  };

  const handleAttachments = (files: FileList | null) => {
    if (!files) return;
    setForm({ ...form, attachments: Array.from(files) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!userId) {
    alert("User not logged in");
    return;
  }

  const payload = {
    user_id: userId,
    category_id: form.category,
    subcategory_id: form.subcategory,
    date: form.date,
    giver: form.source,
    description: form.description,
    amount: form.amount,
    payment_method: form.paymentMethod,
    extra_fields: form.extraFields,
  };

  try {
    const res = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Log the response to check its structure
    console.log("Response Object:", res);

    // Check if the response is what we expect
    if (res && res.id) {
      // If there's an ID, it's likely the created income object, meaning success
      console.log("Income data submitted successfully:", res);
      alert("Income submitted successfully!");
      navigate("/finance/incometracker");
    } else {
      // Handle unexpected response or error
      const errorMessage = res.message || "There was an issue submitting the income.";
      console.error("Error response:", errorMessage);
      alert(errorMessage);
    }

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Server error or network issue");
  }
};

  return (
    <div className="dashboard-wrapper">
      {/* ---------------- SIDEBAR ---------------- */}
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
        <a href="/finance/incometracker" className="active">Track Income</a>
        <a href="/finance/expensetracker">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
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
            navigate("/"); // Redirect to home page after logout
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="dashboard-content">
        <FinanceHeader />

        <br/>

        <header className="page-header income-header">
          <h1>Add Income</h1>
          <button className="hamburger" onClick={toggleSidebar}>☰</button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>

            {/* Category */}
            <label>Income Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Subcategory */}
            <label>Subcategory</label>
            <select
              required
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: parseInt(e.target.value) })}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            {/* Date */}
            <label>Income Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            {/* Source */}
            <label>Giver</label>
            <input
              type="text"
              placeholder="e.g. John Doe, Online Donor"
              required
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />

            {/* Description */}
            <label>Description</label>
            <textarea
              required
              placeholder="What is this income for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* Amount */}
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
            />

            {/* Payment Method */}
            <label>Payment Method</label>
            <select
              required
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>POS</option>
              <option>Mobile Money</option>
              <option>Cheque</option>
              <option>Online Giving Platform</option>
              <option>Debit Card</option>
              <option>Credit Card</option>
              <option>Apple Pay</option>
              <option>Google Pay</option>
              <option>Samsung Pay</option>
              <option>PayPal</option>
              <option>Cryptocurrency</option>
              <option>Buy Now, Pay Later</option>
              <option>Gift Card</option>
              <option>Prepaid Card</option>
              <option>Direct Debit</option>
              <option>Standing Order</option>
              <option>Money Order</option>
            </select>

            {/* Attachments */}
            <label>Upload Documents / Receipts</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleAttachments(e.target.files)}
            />

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
              Submit Income
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddIncome;
