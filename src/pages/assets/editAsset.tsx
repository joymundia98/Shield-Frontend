import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface AssetForm {
  name: string;
  category_id: number | "";
  location_id: number | "";
  department_id: number | "";
  acquisition_date: string;
  purchase_cost: string;
  current_value: string;
  condition_status: "Good" | "Fair" | "Poor" | "";
  status: "In Use" | "In Maintenance" | "Disposed" | "";
  serial_number: string;
  description: string;
  latitude?: string;
  longitude?: string;
}

interface Category {
  category_id: number;
  name: string;
}

interface Location {
  location_id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const EditAssetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) body.classList.add("sidebar-open");
    else body.classList.remove("sidebar-open");
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Form state
  const [formData, setFormData] = useState<AssetForm>({
    name: "",
    category_id: "",
    location_id: "",
    department_id: "",
    acquisition_date: "",
    purchase_cost: "",
    current_value: "",
    condition_status: "",
    status: "",
    serial_number: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- Fetch with fallback ----------------
  const fetchWithFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (err) {
      console.warn("authFetch failed, falling back:", err);
      return await orgFetch(url);
    }
  };

  // ---------------- Fetch asset + dropdowns ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetData, catData, locData, depData] = await Promise.all([
          fetchWithFallback(`${baseURL}/api/assets/${id}`),
          fetchWithFallback(`${baseURL}/api/assets/categories`),
          fetchWithFallback(`${baseURL}/api/assets/location`),
          fetchWithFallback(`${baseURL}/api/departments`),
        ]);

        const asset = Array.isArray(assetData)
          ? assetData.find((a: any) => a.id === Number(id))
          : assetData;

        if (!asset) throw new Error("Asset not found");

        setFormData({
          name: asset.name || "",
          category_id: asset.category_id || "",
          location_id: asset.location_id || "",
          department_id: asset.department_id || "",
          acquisition_date: asset.acquisition_date
            ? new Date(asset.acquisition_date).toISOString().split("T")[0]
            : "",
          purchase_cost: asset.purchase_cost || "",
          current_value: asset.current_value || "",
          condition_status: asset.condition_status || "",
          status: asset.status || "",
          serial_number: asset.serial_number || "",
          description: asset.description || "",
          latitude: asset.latitude || "",
          longitude: asset.longitude || "",
        });

        setCategories(catData);
        setLocations(locData);
        setDepartments(depData);
      } catch (error) {
        console.error("Error loading asset:", error);
        alert("Failed to load asset data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ---------------- Handle change ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        e.target.type === "number"
          ? Number(value)
          : value,
    }));
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    };

    // Calculate Depreciation Rate and Depreciation Amount
    const purchaseCost = parseFloat(formData.purchase_cost);
    const currentValue = parseFloat(formData.current_value);

    const depreciationRate = ((purchaseCost - currentValue) / purchaseCost) * 100;
    const depreciationAmount = purchaseCost - currentValue;  // Assuming full depreciation is recorded at the point of purchase

    const depreciationPayload = {
      asset_id: id,
      fiscal_year: new Date().getFullYear(),
      opening_value: purchaseCost,
      depreciation_rate: depreciationRate.toFixed(2),
      depreciation_amount: depreciationAmount.toFixed(2),
      closing_value: currentValue,
      useful_life: 10, // Assuming 10 years useful life. You can adjust based on user input
    };

    try {
      // Step 1: Update Asset
      await authFetch(`${baseURL}/api/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // Step 2: Update Depreciation for the Asset
      await authFetch(`${baseURL}/api/depreciation/${id}`, {
        method: "PATCH",
        body: JSON.stringify(depreciationPayload),
      });

      alert("Asset and depreciation updated successfully!");
      navigate("/assets/assets");
    } catch (err) {
      console.error("Error updating asset or depreciation:", err);
      try {
        await orgFetch(`${baseURL}/api/assets/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        await orgFetch(`${baseURL}/api/depreciation/${id}`, {
          method: "PATCH",
          body: JSON.stringify(depreciationPayload),
        });

        alert("Asset and depreciation updated successfully!");
        navigate("/assets/assets");
      } catch (error) {
        console.error("Error updating with orgFetch:", error);
        alert("Failed to update asset or depreciation.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

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
        {hasPermission("View All Assets") && <a href="/assets/assets" className="active">Asset Inventory</a>}
        {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation">Depreciation Info</a>}
        {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance">Maintenance</a>}
        
        <a href="/assets/locations">Asset Locations</a>
        
        {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard">← Back</a>}

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

        <h1>Edit Asset</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Asset Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />

            <label>Category</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>

            <label>Location</label>
            <select name="location_id" value={formData.location_id} onChange={handleChange} required>
              <option value="">Select Location</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>{l.name}</option>
              ))}
            </select>

            <label>Department</label>
            <select name="department_id" value={formData.department_id} onChange={handleChange} required>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <label>Acquisition Date</label>
            <input type="date" name="acquisition_date" value={formData.acquisition_date} onChange={handleChange} required />

            <label>Purchase Cost</label>
            <input type="number" name="purchase_cost" value={formData.purchase_cost} onChange={handleChange} required />

            <label>Current Value</label>
            <input type="number" name="current_value" value={formData.current_value} onChange={handleChange} required />

            <label>Condition</label>
            <select name="condition_status" value={formData.condition_status} onChange={handleChange} required>
              <option value="">Select</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>

            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Select</option>
              <option>In Use</option>
              <option>In Storage</option>
              <option>In Maintenance</option>
              <option>Disposed</option>
            </select>

            <label>Serial Number</label>
            <input name="serial_number" value={formData.serial_number} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />

            <label>Latitude</label>
            <input name="latitude" value={formData.latitude} onChange={handleChange} />

            <label>Longitude</label>
            <input name="longitude" value={formData.longitude} onChange={handleChange} />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/assets/assets")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAssetPage;