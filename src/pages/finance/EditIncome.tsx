import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api`;

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface FormState {
  category: number | "";
  subcategory: number | "";
  date: string;
  source: string;
  description: string;
  amount: number | "";
  paymentMethod: string;
}

const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch {
    return await orgFetch(url, options);
  }
};

const EditIncome: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [form, setForm] = useState<FormState>({
    category: "",
    subcategory: "",
    date: "",
    source: "",
    description: "",
    amount: "",
    paymentMethod: "Cash",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [_original, setOriginal] = useState<any>(null);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const cats = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_categories`);
        const subs = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_subcategories`);
        const record = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes/${id}`);

        setCategories(cats);
        setAllSubcategories(subs);
        setOriginal(record);

        // ✅ find subcategory and category
        const sub = subs.find((s: Subcategory) => s.id === record.subcategory_id);

        // ✅ remove VOID text
        const cleanDescription = record.description?.split("[VOIDED")[0].trim();

        setForm({
          category: sub?.category_id || "",
          subcategory: record.subcategory_id,
          date: record.date?.split("T")[0],
          source: record.giver || "",
          description: cleanDescription || "",
          amount: Number(record.amount),
          paymentMethod: record.payment_method || "Cash",
        });

        // filter subcategories correctly
        const filtered = subs.filter((s: Subcategory) => s.category_id === sub?.category_id);
        setSubcategories(filtered);

      } catch (err) {
        console.error("Failed to load edit data", err);
      }
    };

    fetchAll();
  }, [id]);

  // ---------------- CATEGORY CHANGE ----------------
  const handleCategoryChange = (categoryId: number) => {
    const filtered = allSubcategories.filter(sub => sub.category_id === categoryId);
    setSubcategories(filtered);
    setForm({ ...form, category: categoryId, subcategory: "" });
  };

  // ---------------- SUBMIT (CREATE NEW RECORD) ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        // ✅ get user from localStorage
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        const payload = {
        user_id: user?.id || null, // ✅ NOW ADDED
        donor_id: null,
        category_id: form.category,
        subcategory_id: form.subcategory,
        date: form.date,
        giver: form.source,
        description: form.description,
        amount: form.amount,
        status: "Pending",
        };

        const res = await fetchDataWithAuthFallback(
        `${BACKEND_URL}/finance/incomes`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
        );

        console.log("Created new income:", res);

        alert("New income record created successfully!");
        navigate("/finance/incometracker");

    } catch (err) {
        console.error("Create failed", err);
        alert("Failed to create income");
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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome" className="active">Add Income</a>}
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
            navigate("/"); // Redirect to home page after logout
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* MAIN */}
      <div className="dashboard-content">
        <FinanceHeader />

        <header className="page-header income-header">
          <h1>Edit Income</h1>
          <p>A new Record will be created based on the old Record</p>
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>

            {/* Category */}
            <label>Income Category</label>
            <select
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
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: parseInt(e.target.value) })}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            {/* Date */}
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            {/* Giver */}
            <label>Giver</label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />

            {/* Description */}
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* Amount */}
            <label>Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
            />

            {/* Payment Method */}
            <label>Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
            </select>

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
              Create New Record
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIncome;