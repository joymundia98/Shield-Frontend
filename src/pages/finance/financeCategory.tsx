import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

const baseURL = import.meta.env.VITE_BASE_URL;

interface Category {
  id?: number;
  name: string;
  subcategories?: string[];
}

interface PaymentMethod {
  id: number;
  name: string;
}

type GroupType = "income" | "expense" | "payment";

const FinanceCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* -------------------- Finance States -------------------- */
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
  { id: 1, name: "Cash" },
  { id: 2, name: "Credit Card" },
  { id: 3, name: "Bank Transfer" },
  { id: 4, name: "POS" },
  { id: 5, name: "Mobile Money" },
  { id: 6, name: "Cheque" },
  { id: 7, name: "Online Giving Platform" },
  { id: 8, name: "Debit Card" },
  { id: 9, name: "Apple Pay" },
  { id: 10, name: "Google Pay" },
  { id: 11, name: "Samsung Pay" },
  { id: 12, name: "PayPal" },
  { id: 13, name: "Cryptocurrency" },
  { id: 14, name: "Buy Now, Pay Later" },
  { id: 15, name: "Gift Card" },
  { id: 16, name: "Prepaid Card" },
  { id: 17, name: "Direct Debit" },
  { id: 18, name: "Standing Order" },
  { id: 19, name: "Money Order" },
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

  /* -------------------- Helper Fetch Logic -------------------- */
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url); // Try fetching with authFetch
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch", error);
      return await orgFetch(url); // Fallback to orgFetch
    }
  };

  /* -------------------- Fetch Income Categories -------------------- */
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/finance/income_categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/finance/income_subcategories`),
        ]);

        const categories: Category[] = categoriesRes.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          subcategories: [],
        }));

        const subcategoriesData: any[] = subcategoriesRes;

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
          fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/finance/expense_subcategories`),
          
        ]);

        const categories: Category[] = categoriesRes.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          subcategories: [],
        }));

        const subcategoriesData: any[] = subcategoriesRes;

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
  const saveItem = async () => {
  if (!itemName.trim()) {
    alert("Name is required");
    return;
  }

  if ((editingGroup === "income" || editingGroup === "expense") && subcategories.length === 0) {
    alert("Add at least one subcategory");
    return;
  }

  try {
    const headers = await authFetch(baseURL);  // Await to get headers

    // Handle "income" categories
    if (editingGroup === "income") {
      const updated = [...incomeCategories];
      
      if (editIndex !== null) {
        // Update existing category (income_categories table)
        const updatedCategory = { ...updated[editIndex], name: itemName };
        await fetch(`${baseURL}/api/finance/income_categories/${updated[editIndex].id}`, {
          method: 'PUT',
          headers: headers,  // Use the awaited headers
          body: JSON.stringify(updatedCategory),
        });
        updated[editIndex] = updatedCategory;

        // Now, handle the subcategories update in income_subcategory table
        for (let subcategory of subcategories) {
          const existingSubcategory = updated[editIndex].subcategories?.find(sub => sub === subcategory);
          if (!existingSubcategory) {
            await fetch(`${baseURL}/api/finance/income_subcategories`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                category_id: updated[editIndex].id,
                name: subcategory,
              }),
            });
          }
        }
      } else {
        // Add new category (income_categories table)
        const newCategory = { name: itemName, subcategories };
        const response = await fetch(`${baseURL}/api/finance/income_categories`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newCategory),
        });
        const data = await response.json();
        updated.push(data); // Assuming the backend responds with the newly created category

        // Now handle subcategories addition to the income_subcategory table
        for (let subcategory of subcategories) {
          await fetch(`${baseURL}/api/finance/income_subcategories`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              category_id: data.id,
              name: subcategory,
            }),
          });
        }
      }

      setIncomeCategories(updated);

    } else if (editingGroup === "expense") {
      const updated = [...expenseCategories];
      
      if (editIndex !== null) {
        // Update existing category (expense_categories table)
        const updatedCategory = { ...updated[editIndex], name: itemName };
        await fetch(`${baseURL}/api/finance/expense_categories/${updated[editIndex].id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedCategory),
        });
        updated[editIndex] = updatedCategory;

        // Now, handle the subcategories update in expense_subcategory table
        for (let subcategory of subcategories) {
          const existingSubcategory = updated[editIndex].subcategories?.find(sub => sub === subcategory);
          if (!existingSubcategory) {
            await fetch(`${baseURL}/api/finance/expense_subcategories`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                category_id: updated[editIndex].id,
                name: subcategory,
              }),
            });
          }
        }
      } else {
        // Add new category (expense_categories table)
        const newCategory = { name: itemName, subcategories };
        const response = await fetch(`${baseURL}/api/finance/expense_categories`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newCategory),
        });
        const data = await response.json();
        updated.push(data);

        // Now handle subcategories addition to the expense_subcategory table
        for (let subcategory of subcategories) {
          await fetch(`${baseURL}/api/finance/expense_subcategories`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              category_id: data.id,
              name: subcategory,
            }),
          });
        }
      }

      setExpenseCategories(updated);
    } else if (editingGroup === "payment") {
      const updated = [...paymentMethods];
      if (editIndex !== null) {
        const updatedPayment = { id: paymentMethods[editIndex].id, name: itemName };  // Ensure id is present
        await fetch(`${baseURL}/api/finance/payment_methods/${paymentMethods[editIndex].id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedPayment),
        });
        updated[editIndex] = updatedPayment;
      } else {
        const newPayment = { name: itemName };
        const response = await fetch(`${baseURL}/api/finance/payment_methods`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newPayment),
        });
        const data = await response.json();
        updated.push(data);
      }
      setPaymentMethods(updated);
    }

    closePopup();
  } catch (error) {
    console.error("Failed to save item", error);
  }
};


const deleteItem = async (group: GroupType, index: number) => {
  if (group === "income") {
    const updated = [...incomeCategories];
    const categoryToDelete = updated[index];
    await fetch(`${baseURL}/api/finance/income_categories/${categoryToDelete.id}`, {
      method: 'DELETE',
      headers: await authFetch(baseURL),  // Assuming you need headers here as well
    });
    updated.splice(index, 1);  // Remove the deleted category from the list
    setIncomeCategories(updated);
  } else if (group === "expense") {
    const updated = [...expenseCategories];
    const categoryToDelete = updated[index];
    await fetch(`${baseURL}/api/finance/expense_categories/${categoryToDelete.id}`, {
      method: 'DELETE',
      headers: await authFetch(baseURL),
    });
    updated.splice(index, 1);
    setExpenseCategories(updated);
  } else if (group === "payment") {
    const updated = [...paymentMethods];
    const paymentToDelete = updated[index];
    await fetch(`${baseURL}/api/finance/payment_methods/${paymentToDelete.id}`, {
      method: 'DELETE',
      headers: await authFetch(baseURL),
    });
    updated.splice(index, 1);
    setPaymentMethods(updated);
  }
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
        {/* Only show the subcategories column for "income" or "expense" */}
        {group !== "payment" && <td>{(item as Category).subcategories?.join(", ")}</td>}
        {/* Remove actions column for payment methods */}
        {group !== "payment" && (
          <td className="actions">
            <button className="edit-btn" onClick={() => openPopup(group, idx)}>Edit</button>
            <button className="delete-btn" onClick={() => deleteItem(group, idx)}>Delete</button>
          </td>
        )}
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
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard">Track Expenses</a>}
        {hasPermission("Add Expense") && <a href="/finance/addExpense">Add Expense</a>}
        {hasPermission("View Budgets Summary") && <a href="/finance/budgets">Budget</a>}
        {hasPermission("Manage Payroll") && <a href="/finance/payroll">Payroll</a>}
        {hasPermission("View Finance Categories") && <a href="/finance/financeCategory" className="active">Finance Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/"); // Redirect to login page
          }}
        >
          ➜ Logout
        </a>
      </div>

      <div className="dashboard-content">
        <FinanceHeader />

        <br />

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
