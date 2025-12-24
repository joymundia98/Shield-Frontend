import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/global.css";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Asset, Location, Category, Department
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

interface Location {
  location_id: number;
  name: string;
  description: string;
}

interface Category {
  category_id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const ViewAsset: React.FC = () => {
  const { id } = useParams();  // Get the asset id from the URL
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);

  // Fetch asset data by ID
  useEffect(() => {
    const fetchAsset = async () => {
      const response = await fetch(`${baseURL}/api/assets/${id}`);
      const data: Asset = await response.json();
      setAsset(data);
      
      // Fetch related data (location, category, department)
      const locationResponse = await fetch(`${baseURL}/api/assets/location/${data.location_id}`);
      const locationData: Location = await locationResponse.json();
      setLocation(locationData);

      const categoryResponse = await fetch(`${baseURL}/api/assets/categories/${data.category_id}`);
      const categoryData: Category = await categoryResponse.json();
      setCategory(categoryData);

      const departmentResponse = await fetch(`${baseURL}/api/departments/${data.department_id}`);
      const departmentData: Department = await departmentResponse.json();
      setDepartment(departmentData);
    };

    fetchAsset();
  }, [id]);

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Navigate back to the asset list
  const handleBack = () => {
    navigate('/assets/assets');
  };

  if (!asset || !location || !category || !department) return <div>Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
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
        <h1>Asset Details - {asset.name}</h1>
        <button className="back-btn" onClick={handleBack}>← Back to Asset List</button>

        {/* General Information Table */}
        <h2>General Information</h2>
        <table className="responsive-table">
          <tbody>
            <tr>
              <td><strong>Asset ID</strong></td>
              <td>{asset.asset_id}</td>
            </tr>
            <tr>
              <td><strong>Asset Name</strong></td>
              <td>{asset.name}</td>
            </tr>
            <tr>
              <td><strong>Category</strong></td>
              <td>{category.name}</td>
            </tr>
            <tr>
              <td><strong>Location</strong></td>
              <td>{location.name} - {location.description}</td>
            </tr>
            <tr>
              <td><strong>Condition</strong></td>
              <td>{asset.condition_status}</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>{asset.status}</td>
            </tr>
            <tr>
              <td><strong>Acquisition Date</strong></td>
              <td>{new Date(asset.acquisition_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Purchase Cost</strong></td>
              <td>${parseFloat(asset.purchase_cost).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Current Value</strong></td>
              <td>${parseFloat(asset.current_value).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Serial Number</strong></td>
              <td>{asset.serial_number}</td>
            </tr>
            <tr>
              <td><strong>Description</strong></td>
              <td>{asset.description}</td>
            </tr>
          </tbody>
        </table>

        {/* Warranty Information Table */}
        <h2>Warranty Information</h2>
        <table className="responsive-table">
          <tbody>
            <tr>
              <td><strong>Warranty Status</strong></td>
              <td>{asset.status === 'In Use' ? 'Under Warranty' : 'No Warranty'}</td>
            </tr>
            {/* Add more warranty-specific data if available */}
          </tbody>
        </table>

        {/* Assignment History Table */}
        <h2>Assignment History</h2>
        <table className="responsive-table">
          <tbody>
            <tr>
              <td><strong>Assigned To</strong></td>
              <td>{department.name}</td>
            </tr>
            {/* Add more assignment history info here if available */}
          </tbody>
        </table>

        {/* Request History Table */}
        <h2>Request History</h2>
        <table className="responsive-table">
          <tbody>
            <tr>
              <td><strong>Request ID</strong></td>
              <td>Pending Request Info</td> {/* Placeholder, replace with actual request history if available */}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAsset;
