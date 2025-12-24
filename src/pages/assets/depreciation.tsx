import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

interface Asset {
  id: string;
  name: string;
  acquisitionDate: string;
  initialValue: number;
  currentValue: number;
}

const DepreciationPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [assets, setAssets] = useState<Asset[]>([
    { id: "001", name: "Projector X1", acquisitionDate: "2022-06-15", initialValue: 1500, currentValue: 1200 },
  ]);

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

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => {
    console.log("Toggling sidebar", !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    console.log("Sidebar state changed:", sidebarOpen);
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Modal ----------------
  const openModal = (index: number | null = null) => {
    console.log("openModal called with index:", index);
    setEditIndex(index);
    if (index !== null) {
      const asset = assets[index];
      setFormData({
        name: asset.name,
        acquisitionDate: asset.acquisitionDate,
        initialValue: asset.initialValue,
        currentValue: asset.currentValue,
      });
    } else {
      setFormData({ name: "", acquisitionDate: "", initialValue: "", currentValue: "" });
    }
    setModalOpen(true);
    console.log("modalOpen state after openModal:", true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log("Form change:", id, value);
    setFormData(prev => ({
      ...prev,
      [id]: id.includes("Value") ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // ---------------- Depreciation ----------------
  const depreciationRate = useMemo(() => {
    const initial = Number(formData.initialValue);
    const current = Number(formData.currentValue);
    if (!isNaN(initial) && !isNaN(current) && initial > 0 && current <= initial) {
      return ((initial - current) / initial * 100).toFixed(2);
    }
    return "";
  }, [formData.initialValue, formData.currentValue]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving form:", formData);

    if (
      formData.name === "" ||
      formData.acquisitionDate === "" ||
      formData.initialValue === "" ||
      formData.currentValue === ""
    ) return;

    const newAsset: Asset = {
      id: editIndex !== null ? assets[editIndex].id : (assets.length + 1).toString().padStart(3, "0"),
      name: formData.name,
      acquisitionDate: formData.acquisitionDate,
      initialValue: Number(formData.initialValue),
      currentValue: Number(formData.currentValue),
    };

    if (editIndex === null) {
      setAssets(prev => [...prev, newAsset]);
      console.log("Added new asset:", newAsset);
    } else {
      setAssets(prev => prev.map((a, idx) => (idx === editIndex ? newAsset : a)));
      console.log("Edited asset at index", editIndex, newAsset);
    }

    setFormData({ name: "", acquisitionDate: "", initialValue: "", currentValue: "" });
    setEditIndex(null);
    closeModal();
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(prev => prev.filter((_, idx) => idx !== index));
      console.log("Deleted asset at index:", index);
    }
  };

  console.log("Render - modalOpen:", modalOpen);

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
        <a href="/assets/depreciation" className="active">Depreciation Info</a>
        <a href="/assets/maintenance">Maintenance</a>
        <a href="/assets/categories">Categories</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
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

        <div className="table-header">
          <button
            className="add-btn"
            onClick={() => { console.log("Clicked Add Asset"); openModal(); }}
          >
            + &nbsp; Add New Asset
          </button>
        </div>

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
            {assets.map((asset, index) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.acquisitionDate}</td>
                <td>{asset.initialValue}</td>
                <td>{asset.currentValue}</td>
                <td>{((asset.initialValue - asset.currentValue) / asset.initialValue * 100).toFixed(2)}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => openModal(index)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {modalOpen && (
          <>
            <div
              className="overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9998
              }}
              onClick={closeModal}
            ></div>
            <div
              className="modal"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                minWidth: "300px",
              }}
            >
              <div className="modal-content">
                <h2>{editIndex !== null ? "Edit Asset" : "Add New Asset"}</h2>
                <form onSubmit={handleSave}>
                  <label>Asset Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />

                  <label>Acquisition Date</label>
                  <input
                    type="date"
                    id="acquisitionDate"
                    value={formData.acquisitionDate}
                    onChange={handleFormChange}
                    required
                  />

                  <label>Initial Value ($)</label>
                  <input
                    type="number"
                    id="initialValue"
                    value={formData.initialValue ?? ""}
                    onChange={handleFormChange}
                    required
                  />

                  <label>Current Value ($)</label>
                  <input
                    type="number"
                    id="currentValue"
                    value={formData.currentValue ?? ""}
                    onChange={handleFormChange}
                    required
                  />

                  <label>Depreciation Rate (%)</label>
                  <input type="number" value={depreciationRate} readOnly />

                  <div className="modal-buttons" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
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
