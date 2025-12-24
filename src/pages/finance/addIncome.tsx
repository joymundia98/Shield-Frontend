import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';

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

  // Fetch categories + subcategories
  useEffect(() => {
    fetch(`${BACKEND_URL}/finance/income_categories`)
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${BACKEND_URL}/finance/income_subcategories`)
      .then(res => res.json())
      .then(data => setAllSubcategories(data));
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

  {/*const handleExtraFieldChange = (key: string, value: string | number) => {
    setForm({ ...form, extraFields: { ...form.extraFields, [key]: value } });
  };*/}

  // Submit Form
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
      const res = await fetch(`${BACKEND_URL}/finance/incomes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.message);
        return;
      }

      alert("Income submitted successfully!");
      navigate("/finance/incometracker");
    } catch (err) {
      console.error("Failed to submit income:", err);
      alert("Server error");
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
