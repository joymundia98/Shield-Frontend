import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";

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

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- Sidebar ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // ---------------- AUTH FETCH WITH FALLBACK ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }

      return await orgFetch(url);
    }
  };

  // ---------------- STATE ----------------
  const [assetCategories, setAssetCategories] = useState<Category[]>([]);
  const [maintenanceCategories, setMaintenanceCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoriesData, assetsData] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/assets/categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/assets`)
        ]);

        // Count assets per category
        const assetCounts: Record<number, number> = {};
        (assetsData as Asset[]).forEach((asset) => {
          assetCounts[asset.category_id] =
            (assetCounts[asset.category_id] || 0) + 1;
        });

        // Map asset categories with totals
        const mappedAssetCategories: Category[] = categoriesData.map((item: any) => ({
          id: item.category_id,
          name: item.name,
          desc: item.description,
          total: assetCounts[item.category_id] || 0,
        }));

        setAssetCategories(mappedAssetCategories);

        // ---------------- Maintenance Categories ----------------
        // If you have a backend endpoint, replace this with API call
        setMaintenanceCategories([
          { id: 1, name: "Preventive", desc: "Scheduled routine maintenance" },
          { id: 2, name: "Corrective", desc: "Repair after breakdown" },
          { id: 3, name: "Inspection", desc: "Routine inspection and checks" },
        ]);

      } catch (err: any) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------- POPUP STATE ----------------
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  const openPopup = (index: number | null = null, maintenance = false) => {
    setEditIndex(index);
    setIsMaintenance(maintenance);
    setShowPopup(true);

    const source = maintenance ? maintenanceCategories : assetCategories;

    if (index !== null) {
      const data = source[index];
      setCategoryName(data.name);
      setCategoryDesc(data.desc);
    } else {
      setCategoryName("");
      setCategoryDesc("");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditIndex(null);
    setCategoryName("");
    setCategoryDesc("");
  };

  const saveCategory = () => {
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    if (isMaintenance) {
      if (editIndex !== null) {
        const updated = [...maintenanceCategories];
        updated[editIndex] = {
          ...updated[editIndex],
          name: categoryName,
          desc: categoryDesc,
        };
        setMaintenanceCategories(updated);
      } else {
        setMaintenanceCategories((prev) => [
          ...prev,
          { id: Date.now(), name: categoryName, desc: categoryDesc },
        ]);
      }
    } else {
      if (editIndex !== null) {
        const updated = [...assetCategories];
        updated[editIndex] = {
          ...updated[editIndex],
          name: categoryName,
          desc: categoryDesc,
        };
        setAssetCategories(updated);
      } else {
        setAssetCategories((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: categoryName,
            desc: categoryDesc,
            total: 0,
          },
        ]);
      }
    }

    closePopup();
  };

  const deleteCategory = (index: number, maintenance = false) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    if (maintenance) {
      setMaintenanceCategories((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAssetCategories((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <h2>ASSET MANAGER</h2>
        <a href="/assets/dashboard">Dashboard</a>
        <a href="/assets/assets">Asset Inventory</a>
        <a href="/assets/depreciation">Depreciation Info</a>
        <a href="/assets/maintenance">Maintenance</a>
        <a href="/assets/categories" className="active">
          Categories
        </a>

        <hr />
        <a href="/dashboard">← Back to Main Dashboard</a>
        <a
          href="/"
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
        <AssetsHeader />
        <br />
        <h1>Categories Management</h1>

        {/* ---------------- Asset Categories ---------------- */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Asset Categories</h2>
            <button className="add-btn" onClick={() => openPopup(null, false)}>
              + Add Asset Category
            </button>
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
              {assetCategories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>{cat.total}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openPopup(index, false)}>Edit</button>&emsp;
                    <button className="delete-btn" onClick={() => deleteCategory(index, false)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- Maintenance Categories ---------------- */}
        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Maintenance Categories</h2>
            <button className="add-btn" onClick={() => openPopup(null, true)}>
              + Add Maintenance Category
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceCategories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.desc}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openPopup(index, true)}>Edit</button>&emsp;
                    <button className="delete-btn" onClick={() => deleteCategory(index, true)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- POPUP ---------------- */}
      {showPopup && (
        <>
          <div className="overlay" onClick={closePopup} />
          <div className="filter-popup" style={{ width: 380 }}>
            <h3>{editIndex !== null ? "Edit Category" : "Add Category"}</h3>

            <input
              type="text"
              value={categoryName}
              placeholder="Category Name"
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <textarea
              value={categoryDesc}
              placeholder="Short description"
              onChange={(e) => setCategoryDesc(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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