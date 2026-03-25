import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Category {
  id: number;
  name: string;
  desc: string;
  total?: number;
}

interface Asset {
  asset_id: number;
  category_id: number;
}

interface MaintenanceRecord {
  id: number;
  asset_id: number;
  category_id: number; // maintenance category
}

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- AUTH FETCH WITH FALLBACK ----------------
  const fetchDataWithAuthFallback = async (url: string, options?: RequestInit) => {
    try {
      return await authFetch(url, options);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);
      return await orgFetch(url, options);
    }
  };

  // ---------------- STATE ----------------
  const [assetCategories, setAssetCategories] = useState<Category[]>([]);
  const [maintenanceCategories, setMaintenanceCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [assetCategoriesData, assetsData, maintenanceData, maintenanceRecordsData] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/assets/categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/assets`),
          fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/maintenance_records`),
        ]);

        // ---------------- Asset Categories ----------------
        const assetCounts: Record<number, number> = {};
        (assetsData as Asset[]).forEach((asset) => {
          assetCounts[asset.category_id] = (assetCounts[asset.category_id] || 0) + 1;
        });

        const mappedAssetCategories: Category[] = (assetCategoriesData as any[]).map((item) => ({
          id: item.category_id,
          name: item.name,
          desc: item.description,
          total: assetCounts[item.category_id] || 0,
        }));

        setAssetCategories(mappedAssetCategories);

        // ---------------- Maintenance Categories ----------------
        const maintenanceCounts: Record<number, number> = {};
        (maintenanceRecordsData as MaintenanceRecord[]).forEach((record) => {
          const catId = record.category_id;
          if (catId) {
            maintenanceCounts[catId] = (maintenanceCounts[catId] || 0) + 1;
          }
        });

        const mappedMaintenanceCategories: Category[] = (maintenanceData as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          desc: item.description,
          total: maintenanceCounts[item.id] || 0,
        }));

        setMaintenanceCategories(mappedMaintenanceCategories);

      } catch (err: any) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------- POPUP ----------------
  const openPopup = (id: number | null = null, maintenance = false) => {
    setIsMaintenance(maintenance);
    setShowPopup(true);

    const source = maintenance ? maintenanceCategories : assetCategories;

    if (id !== null) {
      const data = source.find((c) => c.id === id);
      if (!data) return;
      setCategoryName(data.name);
      setCategoryDesc(data.desc);
      setEditId(id);
    } else {
      setCategoryName("");
      setCategoryDesc("");
      setEditId(null);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditId(null);
    setCategoryName("");
    setCategoryDesc("");
    setIsMaintenance(false);
  };

  // ---------------- SAVE CATEGORY ----------------
  const saveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const options: RequestInit = {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, description: categoryDesc }),
      };

      if (isMaintenance) {
        // ---------------- Maintenance Categories ----------------
        if (editId !== null) {
          // Update existing
          options.method = "PATCH";
          await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories/${editId}`, options);

          const updated = maintenanceCategories.map((c) =>
            c.id === editId ? { ...c, name: categoryName, desc: categoryDesc } : c
          );
          setMaintenanceCategories(updated);
        } else {
          // Create new
          options.method = "POST";
          const newCategory = await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories`, options);
          setMaintenanceCategories([...maintenanceCategories, { id: newCategory.id, name: newCategory.name, desc: newCategory.description, total: 0 }]);
        }

        closePopup();
        return;
      }

      // ---------------- Asset Categories ----------------
      if (editId !== null) {
        // Update existing
        options.method = "PATCH";
        await fetchDataWithAuthFallback(`${baseURL}/api/assets/categories/${editId}`, options);

        const updated = assetCategories.map((c) =>
          c.id === editId ? { ...c, name: categoryName, desc: categoryDesc } : c
        );
        setAssetCategories(updated);
      } else {
        // Create new
        options.method = "POST";
        const newCategory = await fetchDataWithAuthFallback(`${baseURL}/api/assets/categories`, options);
        setAssetCategories([...assetCategories, { id: newCategory.category_id, name: newCategory.name, desc: newCategory.description, total: 0 }]);
      }

      closePopup();
    } catch (err: any) {
      console.error(err);
      alert("Error saving category: " + err.message);
    }
  };

  // ---------------- DELETE CATEGORY ----------------
  const deleteCategory = async (id: number, maintenance = false) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      if (maintenance) {
        await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories/${id}`, { method: "DELETE" });
        setMaintenanceCategories((prev) => prev.filter((c) => c.id !== id));
        return;
      }

      await fetchDataWithAuthFallback(`${baseURL}/api/assets/categories/${id}`, { method: "DELETE" });
      setAssetCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Error deleting category: " + err.message);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

      {/* ---------------- SIDEBAR ---------------- */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ASSET MANAGER</h2>
        {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
        {hasPermission("View All Assets") && <a href="/assets/assets">Asset Inventory</a>}
        {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation">Depreciation Info</a>}
        {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance">Maintenance</a>}
        
        <a href="/assets/locations">Asset Locations</a>
        
        {hasPermission("View Categories") && <a href="/assets/categories" className="active">Categories</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}
        <a href="/" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="dashboard-content">
        <AssetsHeader />
        <br />
        <h1>Categories Management</h1>

        {/* ---------------- Asset Categories Table ---------------- */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Asset Categories</h2>
            <button className="add-btn" onClick={() => openPopup(null, false)}>+ Add Asset Category</button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Assets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assetCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>{cat.total || 0}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openPopup(cat.id, false)}>Edit</button>&emsp;
                    <button className="delete-btn" onClick={() => deleteCategory(cat.id, false)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- Maintenance Categories Table ---------------- */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Maintenance Categories</h2>
            <button className="add-btn" onClick={() => openPopup(null, true)}>+ Add Maintenance Category</button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Assets</th> {/* NEW */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>{cat.total || 0}</td> {/* NEW */}
                  <td>
                    <button className="edit-btn" onClick={() => openPopup(cat.id, true)}>Edit</button>&emsp;
                    <button className="delete-btn" onClick={() => deleteCategory(cat.id, true)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- POPUP ---------------- */}
      {showPopup && <div className="overlay" onClick={closePopup}></div>}
      <div className="filter-popup" style={{ display: showPopup ? "block" : "none", width: "400px", padding: "2rem" }}>
        <h3>{editId !== null ? "Edit" : "Add"} {isMaintenance ? "Maintenance Category" : "Asset Category"}</h3>

        <label>Name</label>
        <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Enter category name" />
        <label>Description</label>
        <textarea value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} placeholder="Enter description" />

        <div className="filter-popup-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button className="add-btn" onClick={saveCategory}>Save</button>
          <button className="cancel-btn" onClick={closePopup}>Cancel</button>
          {editId !== null && (
            <button className="delete-btn" onClick={() => deleteCategory(editId, isMaintenance)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;