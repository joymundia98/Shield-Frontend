import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';
import { useAuth } from "../../hooks/useAuth";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Asset {
  id: string;
  name: string;
  acquisitionDate: string;
  initialValue: number;
  currentValue: number;
  depreciation_id?: number;
}

const DepreciationPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [_assetMap, setAssetMap] = useState<Record<number, string>>({}); // Keeping assetMap

  const [formData, setFormData] = useState<{
    name: string;
    acquisitionDate: string;
    initialValue: number | "";
    currentValue: number | "";
  }>({
    name: "",
    acquisitionDate: "",
    initialValue: "",
    currentValue: "",
  });

  // ---------------- AUTH FETCH WITH FALLBACK ----------------
  const fetchDataWithAuthFallback = async (
    url: string,
    options?: RequestInit
  ) => {
    try {
      return await authFetch(url, options);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/login");
      }

      return await orgFetch(url, options);
    }
  };

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Fetch Assets + Depreciation ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depreciationData, assetsData] = await Promise.all([
          fetchDataWithAuthFallback(`${baseURL}/api/depreciation`),
          fetchDataWithAuthFallback(`${baseURL}/api/assets`)
        ]);

        // Build asset ID → name map
        const map: Record<number, string> = {};
        assetsData.forEach((asset: any) => {
          map[asset.asset_id] = asset.name;
        });
        setAssetMap(map);

        // Format data (preserving your structure)
        const formatted = depreciationData.map((item: any) => ({
          id: item.asset_id.toString(),
          name: map[item.asset_id] || `Asset ${item.asset_id}`,
          acquisitionDate: item.created_at,
          initialValue: parseFloat(item.opening_value),
          currentValue: parseFloat(item.closing_value),
          depreciation_id: item.depreciation_id,
        }));

        setAssets(formatted);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ---------------- Modal ----------------
  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id.includes("Value") ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // ---------------- Depreciation ----------------
  const depreciationRate = ((initial: number, current: number) => {
    if (!isNaN(initial) && !isNaN(current) && initial > 0 && current <= initial) {
      return ((initial - current) / initial * 100).toFixed(2);
    }
    return "";
  })(Number(formData.initialValue), Number(formData.currentValue));

  // ---------------- Save (UNCHANGED) ----------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.name === "" ||
      formData.acquisitionDate === "" ||
      formData.initialValue === "" ||
      formData.currentValue === ""
    ) return;

    const payload = {
      name: formData.name,
      acquisition_date: formData.acquisitionDate,
      purchase_cost: formData.initialValue,
      current_value: formData.currentValue,
    };

    try {
      if (editIndex === null) {
        const newAsset = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        setAssets(prev => [
          ...prev,
          {
            id: newAsset.asset_id.toString(),
            name: newAsset.name,
            acquisitionDate: newAsset.acquisition_date,
            initialValue: parseFloat(newAsset.purchase_cost),
            currentValue: parseFloat(newAsset.current_value),
          },
        ]);
      } else {
        const id = assets[editIndex].id;

        await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        setAssets(prev =>
          prev.map((a, idx) =>
            idx === editIndex
              ? {
                  ...a,
                  name: payload.name,
                  acquisitionDate: payload.acquisition_date,
                  initialValue: Number(payload.purchase_cost),
                  currentValue: Number(payload.current_value),
                }
              : a
          )
        );
      }

      closeModal();
      setEditIndex(null);
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  };

  // ---------------- Delete ----------------
  const handleDelete = async (depreciationId?: number) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await fetchDataWithAuthFallback(
          `${baseURL}/api/depreciation/${depreciationId}`,
          {
            method: "DELETE",
          }
        );

        setAssets(prev => prev.filter(a => a.depreciation_id !== depreciationId));
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
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
        {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
        {hasPermission("View All Assets") && <a href="/assets/assets">Asset Inventory</a>}
        {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation" className="active">Depreciation Info</a>}
        {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance">Maintenance</a>}
        
        <a href="/assets/locations">Asset Locations</a>
        
        {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}
        >
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <AssetsHeader/><br/>

        <h1>Asset Depreciation</h1>

        <table className="responsive-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Acquisition Date</th>
              <th>Initial Value ($)</th>
              <th>Current Value ($)</th>
              <th>Depreciation Rate (%)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.acquisitionDate}</td>
                <td>{asset.initialValue}</td>
                <td>{asset.currentValue}</td>
                <td>
                  {((asset.initialValue - asset.currentValue) / asset.initialValue * 100).toFixed(2)}
                </td>
                <td className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/assets/editDepreciation/${asset.depreciation_id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(asset.depreciation_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal (UNCHANGED) */}
        {modalOpen && (
          <>
            <div className="overlay" onClick={closeModal}></div>
            <div className="modal">
              <div className="modal-content">
                <h2>{editIndex !== null ? "Edit Asset" : "Add New Asset"}</h2>
                <form onSubmit={handleSave}>
                  <label>Asset Name</label>
                  <input type="text" id="name" value={formData.name} onChange={handleFormChange} required />

                  <label>Acquisition Date</label>
                  <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleFormChange} required />

                  <label>Initial Value (K)</label>
                  <input type="number" id="initialValue" value={formData.initialValue ?? ""} onChange={handleFormChange} required />

                  <label>Current Value (K)</label>
                  <input type="number" id="currentValue" value={formData.currentValue ?? ""} onChange={handleFormChange} required />

                  <label>Depreciation Rate (%)</label>
                  <input type="number" value={depreciationRate} readOnly />

                  <div className="modal-buttons">
                    <button type="submit" className="add-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepreciationPage;