import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Base URL
const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api`;

interface NewExpense {
  subcategory: number | "";
  department: number | "";
  date: string;
  description: string;
  amount: number | "";
  attachments: File[];
  extraFields: Record<string, string>;
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

interface Department {
  id: number;
  name: string;
}

// Helper function: authFetch with orgFetch fallback
const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch", err);
    return await orgFetch(url, options);
  }
};

const AddExpense: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Form state
  const [form, setForm] = useState<NewExpense>({
    subcategory: "",
    department: "",
    date: "",
    description: "",
    amount: "",
    attachments: [],
    extraFields: {},
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_categories`);
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_subcategories`);
        setAllSubcategories(data);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/departments`);
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleCategoryChange = (categoryId: number) => {
    const filtered = allSubcategories.filter((sub) => sub.category_id === categoryId);
    setSubcategories(filtered);
    setForm({ ...form, subcategory: "", extraFields: {} });
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
      subcategory_id: form.subcategory,
      department_id: form.department,
      date: form.date,
      description: form.description,
      amount: form.amount,
      user_id: userId,
      status: "Pending",
    };

    try {
      const res = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response:", res);

      if (res && res.id) {
        alert("Expense submitted successfully!");
        navigate("/finance/expensetracker");
      } else {
        const errorMessage = res.message || "There was an issue submitting the expense.";
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
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
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
        <a href="/finance/expenseDashboard" className="active">Track Expenses</a>
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
            navigate("/");
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="dashboard-content">
        <FinanceHeader />
        <br/>
        <header className="page-header expense-header">
          <h1>Add Expense</h1>
          <button className="hamburger" onClick={toggleSidebar}>☰</button>
        </header>

        <div className="container">
          <h2 style={{ marginBottom: 20, textAlign: "center" }}>New Expense</h2>
          <form className="add-form-styling" onSubmit={handleSubmit}>

            <label>Category</label>
            <select
              required
              onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

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

            <label>Department</label>
            <select
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: parseInt(e.target.value) })}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <label>Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <label>Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({
                ...form,
                amount: e.target.value === "" ? "" : parseFloat(e.target.value)
              })}
            />

            <label>Attachments</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleAttachments(e.target.files)}
            />

            <button type="submit" className="add-btn">Submit Expense</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
