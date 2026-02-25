import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

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

const ViewAssetPage: React.FC = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const assetId = queryParams.get("id");
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [categoryName, setCategoryName] = useState<string>("Loading...");
  const [locationName, setLocationName] = useState<string>("Loading...");
  const [departmentName, setDepartmentName] = useState<string>("Loading...");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // ---------------- Fetch Categories ----------------
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // ---------------- Fetch Asset ----------------
  useEffect(() => {
    const fetchAsset = async () => {
      if (!assetId) {
        setError("Asset ID is missing");
        return;
      }

      try {
        setLoading(true);

        const data: Asset = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/${assetId}`
        );

        if (!data) {
          throw new Error("Asset not found");
        }

        setAsset(data);

        // Category lookup
        const category = categories.find(
          (cat) => cat.category_id === data.category_id
        );
        setCategoryName(category ? category.name : "Unknown Category");

        // Fetch Location
        try {
          const locationData: Location = await fetchDataWithAuthFallback(
            `${baseURL}/api/assets/location/${data.location_id}`
          );
          setLocationName(locationData?.name || "Unknown Location");
        } catch {
          setLocationName("Unknown Location");
        }

        // Fetch Department
        try {
          const departmentData: Department = await fetchDataWithAuthFallback(
            `${baseURL}/api/departments/${data.department_id}`
          );
          setDepartmentName(departmentData?.name || "Unknown Department");
        } catch {
          setDepartmentName("Unknown Department");
        }

      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the asset");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, categories]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!asset) return <div>Asset not found.</div>;

  return (
    <div className="dashboard-wrapper">
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        &#9776;
      </button>

      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        id="sidebar"
      ></div>

      <div className="dashboard-content">
        <AssetsHeader />
        <br />

        <h1>Asset Details</h1>
        <br />

        <button
          className="add-btn"
          onClick={() => navigate("/assets/assets")}
        >
          ← Back to Asset Inventory
        </button>

        <br />
        <br />

        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Asset ID</td><td>{asset.asset_id}</td></tr>
            <tr><td>Asset Name</td><td>{asset.name}</td></tr>
            <tr><td>Category</td><td>{categoryName}</td></tr>
            <tr><td>Location</td><td>{locationName}</td></tr>
            <tr><td>Department</td><td>{departmentName}</td></tr>
            <tr><td>Acquisition Date</td><td>{asset.acquisition_date}</td></tr>
            <tr><td>Purchase Cost</td><td>{asset.purchase_cost}</td></tr>
            <tr><td>Current Value</td><td>{asset.current_value}</td></tr>
            <tr><td>Condition</td><td>{asset.condition_status}</td></tr>
            <tr><td>Status</td><td>{asset.status}</td></tr>
            <tr><td>Serial Number</td><td>{asset.serial_number}</td></tr>
            <tr><td>Description</td><td>{asset.description}</td></tr>
            <tr><td>Latitude</td><td>{asset.latitude}</td></tr>
            <tr><td>Longitude</td><td>{asset.longitude}</td></tr>
            <tr><td>Created At</td><td>{asset.created_at}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAssetPage;