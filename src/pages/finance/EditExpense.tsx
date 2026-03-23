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

interface Department {
  id: number;
  name: string;
}

interface FormState {
  category: number | "";
  subcategory: number | "";
  department: number | "";
  date: string;
  description: string;
  amount: number | "";
}

const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch {
    return await orgFetch(url, options);
  }
};

const EditExpense: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    category: "",
    subcategory: "",
    department: "",
    date: "",
    description: "",
    amount: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const cats = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_categories`);
        const subs = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_subcategories`);
        const depts = await fetchDataWithAuthFallback(`${BACKEND_URL}/departments`);
        const record = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expenses/${id}`);

        setCategories(cats);
        setAllSubcategories(subs);
        setDepartments(depts);

        const sub = subs.find((s: Subcategory) => s.id === record.subcategory_id);

        // ✅ Remove VOID text
        const cleanDescription = record.description?.split("[VOIDED")[0].trim();

        setForm({
          category: sub?.category_id || "",
          subcategory: record.subcategory_id,
          department: record.department_id || "",
          date: record.date?.split("T")[0],
          description: cleanDescription || "",
          amount: Number(record.amount),
        });

        const filtered = subs.filter((s: Subcategory) => s.category_id === sub?.category_id);
        setSubcategories(filtered);

      } catch (err) {
        console.error("Failed to load edit expense", err);
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
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const payload = {
        user_id: user?.id || null,
        category_id: form.category,
        subcategory_id: form.subcategory,
        department_id: form.department,
        date: form.date,
        description: form.description,
        amount: form.amount,
        status: "Pending",
      };

      await fetchDataWithAuthFallback(
        `${BACKEND_URL}/finance/expenses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      alert("New expense record created successfully!");
      navigate("/finance/expensetracker");

    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create expense");
    }
  };

  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <h2>FINANCE</h2>

        {hasPermission("View Expense Dashboard") && (
          <a href="/finance/expenseDashboard">Track Expenses</a>
        )}

        <a href="/finance/addExpense" className="active">Add Expense</a>

        <hr className="sidebar-separator" />

        <a href="/dashboard">← Back to Main Dashboard</a>

        <a href="/" onClick={(e) => {
          e.preventDefault();
          localStorage.clear();
          navigate("/");
        }}>
          ➜ Logout
        </a>
      </div>

      {/* MAIN */}
      <div className="dashboard-content">
        <FinanceHeader />

        <header className="page-header expense-header">
          <h1>Edit Expense</h1>
          <p>A new Record will be created based on the old Record</p>
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>

            {/* Category */}
            <label>Expense Category</label>
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

            {/* Department */}
            <label>Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: parseInt(e.target.value) })}
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>

            {/* Date */}
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
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

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
              Create New Record
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;