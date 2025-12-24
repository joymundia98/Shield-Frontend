import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

interface Category {
  id: number;
  name: string;
  desc: string;
  total: number;
}

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- Sidebar ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Category States ----------------
  const [assetCategories, setAssetCategories] = useState<Category[]>([
    { id: 1, name: "Electronics", desc: "Projectors, laptops, sound systems", total: 14 },
    { id: 2, name: "Furniture", desc: "Chairs, tables, pulpits", total: 32 },
    { id: 3, name: "Vehicles", desc: "Church vans, buses, motorcycles", total: 3 },
    { id: 4, name: "Religious Items", desc: "Altars, robes, communion sets", total: 18 },
  ]);

  const [maintenanceCategories, setMaintenanceCategories] = useState<Category[]>([
    { id: 1, name: "Cleaning & Calibration", desc: "Regular maintenance of electronics", total: 12 },
    { id: 2, name: "Repair", desc: "Repair works", total: 7 },
    { id: 3, name: "Inspection", desc: "Inspection records", total: 20 },
  ]);

  // ---------------- Popup State ----------------
  const [showPopup, setShowPopup] = useState(false);
  const [editingTable, setEditingTable] = useState<"asset" | "maintenance" | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  const openPopup = (table: "asset" | "maintenance", index: number | null = null) => {
    setEditingTable(table);
    setEditIndex(index);
    setShowPopup(true);

    if (index !== null) {
      const data = table === "asset" ? assetCategories[index] : maintenanceCategories[index];
      setCategoryName(data.name);
      setCategoryDesc(data.desc);
    } else {
      setCategoryName("");
      setCategoryDesc("");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingTable(null);
    setEditIndex(null);
    setCategoryName("");
    setCategoryDesc("");
  };

  // ---------------- Save Category ----------------
  const saveCategory = () => {
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    if (!editingTable) return;

    if (editIndex !== null) {
      // Editing existing
      if (editingTable === "asset") {
        const updated = [...assetCategories];
        updated[editIndex] = { ...updated[editIndex], name: categoryName, desc: categoryDesc };
        setAssetCategories(updated);
      } else {
        const updated = [...maintenanceCategories];
        updated[editIndex] = { ...updated[editIndex], name: categoryName, desc: categoryDesc };
        setMaintenanceCategories(updated);
      }
    } else {
      // Adding new
      const newCategory: Category = {
        id:
          editingTable === "asset"
            ? assetCategories.length + 1
            : maintenanceCategories.length + 1,
        name: categoryName,
        desc: categoryDesc,
        total: 0,
      };

      if (editingTable === "asset") {
        setAssetCategories((prev) => [...prev, newCategory]);
      } else {
        setMaintenanceCategories((prev) => [...prev, newCategory]);
      }
    }

    closePopup();
  };

  // ---------------- Delete Category ----------------
  const deleteCategory = (table: "asset" | "maintenance", index: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    if (table === "asset") {
      setAssetCategories(prev => prev.filter((_, i) => i !== index));
    } else {
      setMaintenanceCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="dashboard-wrapper">

      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">

        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              id="closeSidebarButton"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ASSET MANAGER</h2>

        <a href="/assets/dashboard">Dashboard</a>
        <a href="/assets/assets">Asset Inventory</a>
        <a href="/assets/depreciation">Depreciation Info</a>
        <a href="/assets/maintenance">Maintenance</a>
        <a href="/assets/categories" className="active">Categories</a>

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

      {/* Main Content */}
      <div className="dashboard-content">

        <AssetsHeader/><br/>

        <h1>Categories Management</h1>

        {/* ----------- Asset Categories ----------- */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Asset Categories</h2>
            <button className="add-btn" onClick={() => openPopup("asset")}>
              + &nbsp; Add Asset Category
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Assets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assetCategories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>{cat.total}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openPopup("asset", index)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteCategory("asset", index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ----------- Maintenance Categories ----------- */}
        <div className="table-section" style={{ marginTop: "3rem" }}>
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Maintenance Categories</h2>
            <button className="add-btn" onClick={() => openPopup("maintenance")}>
              + &nbsp; Add Maintenance Category
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Records</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {maintenanceCategories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>{cat.total}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openPopup("maintenance", index)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteCategory("maintenance", index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------- Popup + Overlay -------- */}
      {showPopup && (
        <>
          <div className="overlay" onClick={closePopup} />

          <div className="filter-popup" style={{ width: 380, padding: "2rem" }}>
            <h3>{editIndex !== null ? "Edit Category" : "Add Category"}</h3>

            <label style={{ marginTop: "1rem" }}>Name</label>
            <input
              type="text"
              value={categoryName}
              placeholder="Category Name"
              onChange={(e) => setCategoryName(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1.5rem" }}
            />

            <label>Description</label>
            <textarea
              value={categoryDesc}
              placeholder="Short description"
              onChange={(e) => setCategoryDesc(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1.5rem" }}
            />

            <div className="filter-popup-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="add-btn" onClick={saveCategory}>Save</button>
              <button className="cancel-btn" onClick={closePopup}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
