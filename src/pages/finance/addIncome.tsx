import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

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

const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch", err);
    return await orgFetch(url, options);
  }
};

const AddIncome: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  // ✅ NEW: confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

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

  // ---------------- ACTUAL SUBMIT LOGIC (UNCHANGED) ----------------
  const handleSubmit = async () => {
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

      console.log("Response Object:", res);

      if (res && res.id) {
        alert("Income submitted successfully!");
        navigate("/finance/incometracker");
      } else {
        alert(res.message || "There was an issue submitting the income.");
      }

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Server error or network issue");
    }
  };

  // ---------------- CONFIRMATION HANDLER ----------------
  const handleConfirmSubmit = async () => {
    setConfirmModalOpen(false);
    await handleSubmit();
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

        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome" className="active">Add Income</a>}

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

      {/* ---------------- MAIN ---------------- */}
      <div className="dashboard-content">
        <FinanceHeader />

        <header className="page-header income-header">
          <h1>Add Income</h1>
          <button className="hamburger" onClick={toggleSidebar}>☰</button>
        </header>

        <div className="container">

          {/* ---------------- FORM (ONLY CHANGE IS onSubmit) ---------------- */}
          <form
            className="add-form-styling"
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmModalOpen(true);
            }}
          >

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

            <label>Income Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <label>Giver</label>
            <input
              type="text"
              required
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
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
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
            />

            <label>Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>POS</option>
              <option>Mobile Money</option>
              <option>Cheque</option>
              <option>PayPal</option>
            </select>

            <label>Attachments</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleAttachments(e.target.files)}
            />

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
              Submit Income
            </button>

          </form>
        </div>
      </div>

      {/* ---------------- CONFIRMATION MODAL (NEW) ---------------- */}
      {confirmModalOpen && (
        <div className="expenseModal" style={{ display: "flex" }}>
          <div className="expenseModal-content">

            <h2>Confirm Income Submission</h2>

            <p>
              You are about to submit a financial record.
            </p>

            <p><strong>Please note:</strong></p>
            <ul style={{ textAlign: "left" }}>
              <li>Records cannot be deleted once submitted.</li>
              <li>Corrections require voiding with proper permissions.</li>
              <li>Ensure all details are correct before proceeding.</li>
            </ul>

            <div className="expenseModal-buttons">
              <button
                className="delete-cancel-btn"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="expenseModal-confirm"
                onClick={handleConfirmSubmit}
              >
                Proceed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AddIncome;