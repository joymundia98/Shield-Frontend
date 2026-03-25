import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

interface MaintenanceForm {
  asset_id: number | "";
  category_id: number | "";
  last_service: string;
  next_service: string;
  status: "Pending" | "Completed" | "Overdue" | "";
  description: string;
}

interface Asset {
  asset_id: number;
  name: string;
}

interface MaintenanceCategory {
  id: number;
  name: string;
}

const baseURL = import.meta.env.VITE_BASE_URL;

const EditMaintenancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) body.classList.add("sidebar-open");
    else body.classList.remove("sidebar-open");
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const [formData, setFormData] = useState<MaintenanceForm>({
    asset_id: "",
    category_id: "",
    last_service: "",
    next_service: "",
    status: "",
    description: "",
  });

  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceCategories, setMaintenanceCategories] = useState<MaintenanceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);
      return await orgFetch(url);
    }
  };

  // ---------------- Fetch record and dropdowns ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [assetsData, categoriesData, recordData] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/assets`),
          fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/maintenance_records/${id}`),
        ]);

        setAssets(assetsData);
        setMaintenanceCategories(categoriesData);

        // ✅ FIX: format dates for input[type="date"]
        const formatDate = (dateString?: string) =>
          dateString ? dateString.split("T")[0] : "";

        setFormData({
          asset_id: recordData.asset_id,
          category_id: recordData.category_id,
          last_service: formatDate(recordData.last_service),
          next_service: formatDate(recordData.next_service),
          status: recordData.status,
          description: recordData.description || "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to load maintenance record.");
        navigate("/assets/maintenance");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.asset_id || !formData.category_id || !formData.last_service || !formData.next_service || !formData.status) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      asset_id: formData.asset_id,
      category_id: formData.category_id,
      last_service: formData.last_service,
      next_service: formData.next_service,
      status: formData.status,
      description: formData.description || null,
    };

    try {
      await authFetch(`${baseURL}/api/maintenance_records/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      alert("Maintenance record updated successfully!");
      navigate("/assets/maintenance");
    } catch (err) {
      console.error("Error submitting with authFetch, falling back to orgFetch:", err);
      try {
        await orgFetch(`${baseURL}/api/maintenance_records/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        alert("Maintenance record updated successfully!");
        navigate("/assets/maintenance");
      } catch (error) {
        console.error("Error submitting with orgFetch:", error);
        alert("Failed to update maintenance record. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading maintenance record...</div>;

  return (
    <div className="dashboard-wrapper assets-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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
        {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance" className="active">Maintenance</a>}
        <a href="/assets/locations">Asset Locations</a>
        {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}
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
        <AssetsHeader />
        <br />

        <h1>Edit Maintenance Record</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Asset</label>
            <select name="asset_id" value={formData.asset_id} onChange={handleChange} required>
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>{asset.name}</option>
              ))}
            </select>

            <label>Maintenance Category</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} required>
              <option value="">Select Category</option>
              {maintenanceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <label>Last Service Date</label>
            <input type="date" name="last_service" value={formData.last_service} onChange={handleChange} required />

            <label>Next Service Date</label>
            <input type="date" name="next_service" value={formData.next_service} onChange={handleChange} required />

            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Select Status</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>

            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Update Maintenance Record</button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/assets/maintenance")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMaintenancePage;