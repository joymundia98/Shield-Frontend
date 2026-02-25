import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces
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
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [_locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- AUTH FETCH WITH FALLBACK ----------------
  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/login");
      }

      return await orgFetch(url);
    }
  };

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data: Asset[] = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets`
        );
        setInventory(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const data: Category[] = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/categories`
        );
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const data: Location[] = await fetchDataWithAuthFallback(
          `${baseURL}/api/asset_locations`
        );
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const data: Department[] = await fetchDataWithAuthFallback(
          `${baseURL}/api/departments`
        );
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchAssets();
    fetchCategories();
    fetchLocations();
    fetchDepartments();
  }, []);

  // ---------------- Group By Category ----------------
  const groupByCategory = (assets: Asset[]) => {
    return assets.reduce((acc: Record<string, Asset[]>, asset) => {
      const category = asset.category_id.toString();
      if (!acc[category]) acc[category] = [];
      acc[category].push(asset);
      return acc;
    }, {});
  };

  const groupedAssets = useMemo(() => groupByCategory(inventory), [inventory]);

  // ---------------- Actions ----------------
  const handleAdd = () => {
    navigate("/assets/addAsset", { state: { addAssetCallback: setInventory } });
  };

  const handleEdit = (id: string) => navigate(`/assets/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/${id}`
        );
        setInventory((prev) =>
          prev.filter((a) => a.asset_id !== Number(id))
        );
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  const handleView = (id: string) => {
    const url = `/assets/viewAsset?id=${id}`;
    window.open(url, "_blank");
  };

  // ---------------- Helpers ----------------
  {/*const getLocationName = (locationId: number) => {
    const location = locations.find(
      (loc) => loc.location_id === locationId
    );
    return location ? location.name : "Unknown Location";
  };*/}

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(
      (dep) => dep.id === departmentId
    );
    return department ? department.name : "Unknown Department";
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        id="sidebar"
      >
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
        <AssetsHeader />
        <br />

        <h1>Asset Inventory</h1>

        <div
          className="table-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button className="add-btn" onClick={handleAdd}>
            + &nbsp; Add New Asset
          </button>
        </div>

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
                      <td>{asset.asset_id}</td>
                      <td>{asset.name}</td>
                      <td>{asset.condition_status}</td>
                      <td>{asset.status}</td>
                      <td>
                        {parseFloat(asset.current_value).toFixed(2)}
                      </td>
                      <td>
                        {getDepartmentName(asset.department_id)}
                      </td>
                      <td>
                        <button
                          className="add-btn"
                          onClick={() =>
                            handleView(asset.asset_id.toString())
                          }
                        >
                          View
                        </button>
                        &nbsp;
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(asset.asset_id.toString())
                          }
                        >
                          Edit
                        </button>
                        &nbsp;
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(asset.asset_id.toString())
                          }
                        >
                          Delete
                        </button>
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