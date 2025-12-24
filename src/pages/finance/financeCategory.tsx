import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Category {
  id?: number;
  name: string;
  subcategories?: string[];
}

interface PaymentMethod {
  name: string;
}

type GroupType = "income" | "expense" | "payment";

const FinanceCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* -------------------- Finance States -------------------- */
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { name: "Cash" },
    { name: "Credit Card" },
    { name: "Bank Transfer" },
  ]);

  /* -------------------- Popup States -------------------- */
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<GroupType | null>(null);

  const [itemName, setItemName] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);

  /* -------------------- Sidebar -------------------- */
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  /* -------------------- Fetch Income Categories -------------------- */
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          axios.get(`${baseURL}/api/finance/income_categories`),
          axios.get(`${baseURL}/api/finance/income_subcategories`),
        ]);

        const categories: Category[] = categoriesRes.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          subcategories: [],
        }));

        const subcategoriesData: any[] = subcategoriesRes.data;

        categories.forEach(cat => {
          cat.subcategories = subcategoriesData
            .filter(sub => sub.category_id === cat.id)
            .map(sub => sub.name);
        });

        setIncomeCategories(categories);
      } catch (err) {
        console.error("Failed to fetch income categories", err);
        setIncomeCategories([]);
      }
    };

    fetchIncomeData();
  }, []);

  /* -------------------- Fetch Expense Categories -------------------- */
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          axios.get(`${baseURL}/api/finance/expense_categories`),
          axios.get(`${baseURL}/api/finance/expense_subcategories`),
        ]);

        const categories: Category[] = categoriesRes.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          subcategories: [],
        }));

        const subcategoriesData: any[] = subcategoriesRes.data;

        categories.forEach(cat => {
          cat.subcategories = subcategoriesData
            .filter(sub => sub.category_id === cat.id)
            .map(sub => sub.name);
        });

        setExpenseCategories(categories);
      } catch (err) {
        console.error("Failed to fetch expense categories", err);
        setExpenseCategories([]);
      }
    };

    fetchExpenseData();
  }, []);

  /* -------------------- Popup Logic -------------------- */
  const openPopup = (group: GroupType, index: number | null = null) => {
    setEditingGroup(group);
    setEditIndex(index);

    if (index !== null) {
      if (group === "income") {
        setItemName(incomeCategories[index].name);
        setSubcategories([...incomeCategories[index].subcategories || []]);
      } else if (group === "expense") {
        setItemName(expenseCategories[index].name);
        setSubcategories([...expenseCategories[index].subcategories || []]);
      } else if (group === "payment") {
        setItemName(paymentMethods[index].name);
        setSubcategories([]);
      }
    } else {
      setItemName("");
      setSubcategories([]);
    }

    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditIndex(null);
    setEditingGroup(null);
    setItemName("");
    setSubcategories([]);
  };

  /* -------------------- Add/Edit/Delete Handlers -------------------- */
  const saveItem = () => {
    if (!itemName.trim()) {
      alert("Name is required");
      return;
    }

    if ((editingGroup === "income" || editingGroup === "expense") && subcategories.length === 0) {
      alert("Add at least one subcategory");
      return;
    }

    if (editingGroup === "income") {
      const updated = [...incomeCategories];
      if (editIndex !== null) updated[editIndex] = { ...updated[editIndex], name: itemName, subcategories };
      else updated.push({ name: itemName, subcategories });
      setIncomeCategories(updated);
    } else if (editingGroup === "expense") {
      const updated = [...expenseCategories];
      if (editIndex !== null) updated[editIndex] = { ...updated[editIndex], name: itemName, subcategories };
      else updated.push({ name: itemName, subcategories });
      setExpenseCategories(updated);
    } else if (editingGroup === "payment") {
      const updated = [...paymentMethods];
      if (editIndex !== null) updated[editIndex] = { name: itemName };
      else updated.push({ name: itemName });
      setPaymentMethods(updated);
    }

    closePopup();
  };

  const deleteItem = (group: GroupType, index: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    if (group === "income") setIncomeCategories(prev => prev.filter((_, i) => i !== index));
    if (group === "expense") setExpenseCategories(prev => prev.filter((_, i) => i !== index));
    if (group === "payment") setPaymentMethods(prev => prev.filter((_, i) => i !== index));
    closePopup();
  };

  const addSubcategory = (name?: string) => setSubcategories([...subcategories, name || ""]);
  const deleteSubcategory = (index: number) => setSubcategories(subcategories.filter((_, i) => i !== index));
  const updateSubcategory = (index: number, value: string) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  /* -------------------- Render Table Rows -------------------- */
  const renderCategoryRows = (group: GroupType, data: Category[] | PaymentMethod[]) => {
    if (!Array.isArray(data)) return null;
    return data.map((item, idx) => (
      <tr key={idx}>
        <td>{idx + 1}</td>
        <td>{item.name}</td>
        {group !== "payment" && <td>{(item as Category).subcategories?.join(", ")}</td>}
        <td className="actions">
          <button className="edit-btn" onClick={() => openPopup(group, idx)}>Edit</button>
          <button className="delete-btn" onClick={() => deleteItem(group, idx)}>Delete</button>
        </td>
      </tr>
    ));
  };

  /* -------------------- Main Render -------------------- */
  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>FINANCE MANAGER</h2>
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incometracker">Track Income</a>
        <a href="/finance/expensetracker">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
        <a href="/finance/payroll">Payroll</a>
        <a href="/finance/financeCategory" className="active">Finance Categories</a>

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

      <div className="dashboard-content">

        <FinanceHeader />
                        
        <br/>

        {/* Income Categories */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Income Categories</h2>
            <button className="add-btn" onClick={() => openPopup("income")}>+ Add Income Category</button>
          </div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderCategoryRows("income", incomeCategories)}</tbody>
          </table>
        </div>

        {/* Expense Categories */}
        <div className="table-section" style={{ marginTop: "2rem" }}>
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Expense Categories</h2>
            <button className="add-btn" onClick={() => openPopup("expense")}>+ Add Expense Category</button>
          </div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderCategoryRows("expense", expenseCategories)}</tbody>
          </table>
        </div>

        {/* Payment Methods */}
        <div className="table-section" style={{ marginTop: "2rem" }}>
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Payment Methods</h2>
            <button className="add-btn" onClick={() => openPopup("payment")}>+ Add Payment Method</button>
          </div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Method Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderCategoryRows("payment", paymentMethods)}</tbody>
          </table>
        </div>

      </div>

      {showPopup && <div className="overlay" onClick={closePopup}></div>}

      <div className="filter-popup" style={{ display: showPopup ? "block" : "none", width: "380px", padding: "2rem" }}>
        <h3>{editIndex !== null ? "Edit" : "Add"} {editingGroup === "income" ? "Income Category" : editingGroup === "expense" ? "Expense Category" : "Payment Method"}</h3>

        <label>Name</label>
        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Enter Name" />

        {(editingGroup === "income" || editingGroup === "expense") && (
          <>
            <label>Subcategories</label>
            {subcategories.map((sub, idx) => (
              <div className="subcategory-row" key={idx}>
                <input type="text" value={sub} onChange={e => updateSubcategory(idx, e.target.value)} />
                <button type="button" onClick={() => deleteSubcategory(idx)}>Delete</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => addSubcategory()}>+ Add another subcategory</button>
          </>
        )}

        <div className="filter-popup-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button className="add-btn" onClick={saveItem}>Save</button>
          <button className="cancel-btn" onClick={closePopup}>Cancel</button>
          {editIndex !== null && <button className="delete-btn" onClick={() => deleteItem(editingGroup!, editIndex)}>Delete</button>}
        </div>
      </div>

    </div>
  );
};

export default FinanceCategoriesPage;
