import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Asset {
  asset_id: number;
  name: string;
}

interface FormData {
  asset_id: number | "";
  fiscal_year: number;
  opening_value: number;
  useful_life: number | "";
}

const EditDepreciationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 GET ID FROM URL
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [formData, setFormData] = useState<FormData>({
    asset_id: "",
    fiscal_year: new Date().getFullYear(),
    opening_value: 0,
    useful_life: "",
  });

  // ---------------- AUTH FETCH ----------------
  const fetchDataWithAuthFallback = async (
    url: string,
    options?: RequestInit
  ) => {
    try {
      return await authFetch(url, options);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }
      return await orgFetch(url, options);
    }
  };

  // ---------------- Sidebar ----------------
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Fetch Assets ----------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets`
        );
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssets();
  }, []);

  // ---------------- Fetch Depreciation by ID ----------------
  useEffect(() => {
    const fetchDepreciation = async () => {
      try {
        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/depreciation/${id}`
        );

        setFormData({
          asset_id: data.asset_id,
          fiscal_year: data.fiscal_year,
          opening_value: Number(data.opening_value),
          useful_life: data.useful_life || "",
        });
      } catch (error) {
        console.error("Error fetching depreciation:", error);
      }
    };

    if (id) fetchDepreciation();
  }, [id]);

  // ---------------- Handle Change ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // ---------------- Calculations ----------------
  const depreciationRate = useMemo(() => {
    if (formData.useful_life && formData.useful_life > 0) {
      return (100 / formData.useful_life).toFixed(2);
    }
    return "";
  }, [formData.useful_life]);

  const depreciationAmount = useMemo(() => {
    if (formData.useful_life && formData.useful_life > 0) {
      return (formData.opening_value / formData.useful_life).toFixed(2);
    }
    return "";
  }, [formData]);

  const closingValue = useMemo(() => {
    if (depreciationAmount) {
      return (
        formData.opening_value - Number(depreciationAmount)
      ).toFixed(2);
    }
    return "";
  }, [depreciationAmount, formData.opening_value]);

  // ---------------- Submit (UPDATE) ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      asset_id: formData.asset_id,
      fiscal_year: formData.fiscal_year,
      opening_value: formData.opening_value,
      depreciation_rate: depreciationRate,
      depreciation_amount: depreciationAmount,
      closing_value: closingValue,
      useful_life: formData.useful_life,
    };

    try {
      await fetchDataWithAuthFallback(
        `${baseURL}/api/depreciation/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      alert("Depreciation updated successfully!");
      navigate("/assets/depreciation");
    } catch (error) {
      console.error("Error updating depreciation:", error);
      alert("Failed to update depreciation");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <h2>ASSET MANAGER</h2>

        {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
        {hasPermission("View All Assets") && <a href="/assets/assets">Asset Inventory</a>}
        {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation" className="active">Depreciation Info</a>}

        <a href="/assets/locations">Asset Locations</a>

        <hr />
        <a href="/dashboard">← Back</a>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <AssetsHeader />
        <br />

        <h1>Edit Depreciation</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>

            <label>Asset</label>
            <select value={formData.asset_id} disabled>
              {assets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.name}
                </option>
              ))}
            </select>

            <label>Fiscal Year</label>
            <input
              type="number"
              name="fiscal_year"
              value={formData.fiscal_year}
              onChange={handleChange}
              required
            />

            <label>Starting Value ($)</label>
            <input type="number" value={formData.opening_value} readOnly />

            <label>Useful Life (Years)</label>
            <input
              type="number"
              name="useful_life"
              value={formData.useful_life}
              onChange={handleChange}
              required
            />

            <label>Depreciation Rate (%)</label>
            <input type="text" value={depreciationRate} readOnly />

            <label>Value Lost ($)</label>
            <input type="text" value={depreciationAmount} readOnly />

            <label>End Value ($)</label>
            <input type="text" value={closingValue} readOnly />

            <div className="form-buttons">
              <button type="submit" className="add-btn">
                Update
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/assets/depreciation")}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDepreciationPage;