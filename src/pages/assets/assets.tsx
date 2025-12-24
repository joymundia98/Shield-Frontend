import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Asset, Category, Location, and Department
interface Asset {
  asset_id: number;
  name: string;
  category_id: number;
  location_id: number;
  department_id: number;
  acquisition_date: string;
  purchase_cost: string;
  current_value: string;
  condition_status: string;
  status: string;
  serial_number: string;
  description: string;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
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
  description: string;
  category: string;
}

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showLocationColumn, _setShowLocationColumn] = useState(false);
  const [_filter, _setFilter] = useState({
    condition: "",
    category: "",
    maintenance: "",
  });

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch data functions
  useEffect(() => {
    const fetchAssets = async () => {
      const response = await fetch(`${baseURL}/api/assets`);
      const data: Asset[] = await response.json();
      setInventory(data);
    };

    const fetchCategories = async () => {
      const response = await fetch(`${baseURL}/api/assets/categories`);
      const data: Category[] = await response.json();
      setCategories(data);
    };

    const fetchLocations = async () => {
      const response = await fetch("${baseURL}/api/asset_locations");
      const data: Location[] = await response.json();
      setLocations(data);
    };

    const fetchDepartments = async () => {
      const response = await fetch(`${baseURL}/api/departments`);
      const data: Department[] = await response.json();
      setDepartments(data);
    };

    fetchAssets();
    fetchCategories();
    fetchLocations();
    fetchDepartments();
  }, []);

  // Group assets by category
  const groupByCategory = (assets: Asset[]) => {
    return assets.reduce((acc: Record<string, Asset[]>, asset) => {
      const category = asset.category_id.toString();
      if (!acc[category]) acc[category] = [];
      acc[category].push(asset);
      return acc;
    }, {});
  };

  const groupedAssets = useMemo(() => groupByCategory(inventory), [inventory]);

  // Action Handlers
  const handleAdd = () => {
    navigate("/assets/addAsset", { state: { addAssetCallback: setInventory } });
  };

  const handleEdit = (id: string) => navigate(`/assets/edit/${id}`);
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setInventory((prev) => prev.filter((a) => a.asset_id !== Number(id)));
    }
  };

  const handleView = (id: string) => {
    // Construct URL for viewAsset page
    const url = `/assets/viewAsset?id=${id}`;
    // Open in a new tab
    window.open(url, "_blank");
  };

  // Helper functions
  const getLocationName = (locationId: number) => {
    const location = locations.find((loc) => loc.location_id === locationId);
    return location ? location.name : "Unknown Location";
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((dep) => dep.id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

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
        <a href="/assets/assets" className="active">Asset Inventory</a>
        <a href="/assets/depreciation">Depreciation Info</a>
        <a href="/assets/maintenance">Maintenance</a>
        <a href="/assets/categories">Categories</a>

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
          ➜] Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <AssetsHeader/><br/>

        <h1>Asset Inventory</h1>

        {/* Add + Filter Buttons */}
        <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="add-btn" onClick={handleAdd}>+ &nbsp; Add New Asset</button>
          {/*<button className="filter-btn" onClick={() => setFilter({ ...filter })}>📂 Filter</button>*/}
        </div>

        {/* Asset Tables Grouped by Category */}
        {Object.keys(groupedAssets).map((categoryId) => {
          const categoryName = categories.find(
            (cat) => cat.category_id === Number(categoryId)
          )?.name;
          return (
            <div key={categoryId}>
              <h2>{categoryName}</h2>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    {showLocationColumn && <th>Location</th>}
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Current Value ($)</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedAssets[categoryId].map((asset) => (
                    <tr key={asset.asset_id}>
                      <td data-title="Asset ID">{asset.asset_id}</td>
                      <td data-title="Asset Name">{asset.name}</td>
                      {showLocationColumn && (
                        <td data-title="Location">{getLocationName(asset.location_id)}</td>
                      )}
                      <td data-title="Condition">{asset.condition_status}</td>
                      <td data-title="Status">{asset.status}</td>
                      <td data-title="Current Value ($)">{parseFloat(asset.current_value).toFixed(2)}</td>
                      <td data-title="Assigned To">{getDepartmentName(asset.department_id)}</td>
                      <td className="actions" data-title="Actions">
                        <button className="add-btn" onClick={() => handleView(asset.asset_id.toString())}>View</button>&nbsp;
                        <button className="edit-btn" onClick={() => handleEdit(asset.asset_id.toString())}>Edit</button>&nbsp;
                        <button className="delete-btn" onClick={() => handleDelete(asset.asset_id.toString())}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetsPage;
