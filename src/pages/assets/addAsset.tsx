import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

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

const baseURL = import.meta.env.VITE_BASE_URL;

const AddAssetPage: React.FC = () => {
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

  // ---------------- Fetch dropdown data ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);
      return await orgFetch(url);
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catData, locData, depData] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/assets/categories`),
          fetchDataWithAuthFallback(`${baseURL}/api/assets/location`),
          fetchDataWithAuthFallback(`${baseURL}/api/departments`),
        ]);

        setCategories(catData);
        setLocations(locData);
        setDepartments(depData);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchDropdowns();
  }, []);

  // ---------------- Handle form changes ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;

    const value =
      target.type === "number" ? Number(target.value) :
      target.type === "text" || target.type === "textarea" ? target.value :
      target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------- Submit form ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      category_id: formData.category_id,
      location_id: formData.location_id,
      department_id: formData.department_id,
      acquisition_date: formData.acquisition_date,
      purchase_cost: formData.purchase_cost,
      current_value: formData.current_value,
      condition_status: formData.condition_status,
      status: formData.status,
      serial_number: formData.serial_number,
      description: formData.description,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    };

    try {
      // Just await, no need to store response if you don't use it
      await authFetch(`${baseURL}/api/assets`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert("Asset added successfully!");
      navigate("/assets/assets");
    } catch (err) {
      console.error("Error submitting with authFetch, falling back to orgFetch:", err);

      try {
        await orgFetch(`${baseURL}/api/assets`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("Asset added successfully!");
        navigate("/assets/assets");
      } catch (error) {
        console.error("Error submitting with orgFetch:", error);
        alert("Failed to add asset. Please try again.");
      }
    }
  };

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

        <h1>Add New Asset</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Asset Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

            <label>Category</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
              ))}
            </select>

            <label>Location</label>
            <select name="location_id" value={formData.location_id} onChange={handleChange} required>
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
              ))}
            </select>

            <label>Department</label>
            <select name="department_id" value={formData.department_id} onChange={handleChange} required>
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>

            <label>Acquisition Date</label>
            <input type="date" name="acquisition_date" value={formData.acquisition_date} onChange={handleChange} required />

            <label>Purchase Cost ($)</label>
            <input type="number" name="purchase_cost" step="0.01" value={formData.purchase_cost} onChange={handleChange} required />

            <label>Current Value ($)</label>
            <input type="number" name="current_value" step="0.01" value={formData.current_value} onChange={handleChange} required />

            <label>Condition Status</label>
            <select name="condition_status" value={formData.condition_status} onChange={handleChange} required>
              <option value="">Select Condition</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>

            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Select Status</option>
              <option>In Use</option>
              <option>In Maintenance</option>
              <option>Disposed</option>
            </select>

            <label>Serial Number</label>
            <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />

            <label>Latitude</label>
            <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} />

            <label>Longitude</label>
            <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Add Asset</button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/assets/assets")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAssetPage;