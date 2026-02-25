import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  condition: string;
  assignedTo: string;
  initialValue: number;
  currentValue: number;
  depreciationRate: number;
  underMaintenance: boolean;
}

const AddAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // We receive setInventory from AssetsPage
  const addAsset = location.state?.addAssetCallback;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    value: "",
    condition: "",
    assignedTo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addAsset) {
      alert("Error: assets page did not receive callback.");
      return;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      location: formData.location,
      condition: formData.condition,
      assignedTo: formData.assignedTo,
      initialValue: Number(formData.value),
      currentValue: Number(formData.value),
      depreciationRate: 10,
      underMaintenance: false,
    };

    addAsset((prev: Asset[]) => [...prev, newAsset]);

    navigate("/assets"); // redirect back to list
  };

  const handleCancel = () => navigate("/assets");

  // ---------------- Sidebar ----------------
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
    useEffect(() => {
      if (sidebarOpen) document.body.classList.add("sidebar-open");
      else document.body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

  return (
    <div className="dashboard-wrapper">

      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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
        {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
        {hasPermission("View All Assets") && <a href="/assets/assets" className="active">
          Asset Inventory
        </a>}
        {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation">Depreciation Info</a>}
        {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance">Maintenance</a>}
        {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

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

        <AssetsHeader/><br/>

        <h1>Add New Asset</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>

            <label>Asset Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <label>Category</label>
            <select name="category" required value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Vehicles</option>
              <option>Religious Items</option>
              <option>Other</option>
            </select>

            <label>Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
            />

            <label>Value ($)</label>
            <input
              type="number"
              name="value"
              required
              value={formData.value}
              onChange={handleChange}
            />

            <label>Condition</label>
            <select name="condition" required value={formData.condition} onChange={handleChange}>
              <option value="">Select Condition</option>
              <option>New</option>
              <option>Good</option>
              <option>Needs Repair</option>
            </select>

            <label>Assigned To</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Add Asset</button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddAssetPage;
