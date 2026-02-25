import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Donor {
  id: number;
  donor_type_id: number | null;
  donor_subcategory_id: number | null;
  name: string | null;
  email: string;
  phone: string;
  address: string | null;
  member_id: number | null;
  organization_id: number | null;
  preferred_contact_method: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ViewDonorPage: React.FC = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const donorId = queryParams.get("id");
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [categoryName, setCategoryName] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Helper function to fetch data with auth fallback
const fetchDataWithAuthFallback = async (url: string, options?: RequestInit) => {
  try {
    return await authFetch(url, options);
  } catch (error: unknown) {
    console.log("authFetch failed, falling back to orgFetch", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Unauthorized, redirecting to login");
      navigate("/login");
      return;
    }

    return await orgFetch(url, options);
  }
};

  // Fetch donor data by ID
  useEffect(() => {
    const fetchDonor = async () => {
      if (!donorId) {
        setError("Donor ID is missing");
        return;
      }

      try {
        setLoading(true);
        const data: Donor = await fetchDataWithAuthFallback(
          `${baseURL}/api/donors/${donorId}`
        );

        if (!data) throw new Error("Donor not found");
        setDonor(data);

        // Optional: You can map donor_type_id to donor_type (e.g., Individual, Organization)
        setCategoryName(data.donor_type_id === 1 ? "Individual" : "Organization");
      } catch (err: any) {
        setError(err.message || "Error fetching donor details");
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, [donorId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!donor) {
    return <div>Donor not found.</div>;
  }

  // Handle delete request
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donor?")) {
      try {
        await fetchDataWithAuthFallback(
            `${baseURL}/api/donors/${donor.id}`,
            { method: "DELETE" }
          );

        // Redirect back to the donor list after successful deletion
        alert("Donor deleted successfully.");
        navigate("/donor/donors");
      } catch (err: any) {
        alert("Failed to delete donor: " + err.message);
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>DONOR MGMT</h2>
        {hasPermission("View Donor Dashboard") && <a href="/donor/dashboard">Dashboard</a>}
        {hasPermission("View All Donors") &&  <a href="/donor/donors" className="active">Donors</a>}
        {hasPermission("View All Donations") &&  <a href="/donor/donations">
          Donations
        </a>}
        {hasPermission("View Donor Categories") && <a href="/donor/donorCategories">Donor Categories</a>}

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

        <DonorsHeader/><br/>

        <h1>Donor Details</h1>

        {/* Back to Donor List Button */}
        <button
          className="add-btn"
          onClick={() => navigate("/donor/donors")}
        >
          &larr; Back to Donor List
        </button>
        <br />
        <br />

        {/* Donor Details */}
        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Donor ID</td>
              <td>{donor.id}</td>
            </tr>
            <tr>
              <td>Name</td>
              <td>{donor.name}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{donor.email}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{donor.phone}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{donor.address || "N/A"}</td>
            </tr>
            <tr>
              <td>Preferred Contact Method</td>
              <td>{donor.preferred_contact_method || "N/A"}</td>
            </tr>
            <tr>
              <td>Notes</td>
              <td>{donor.notes || "N/A"}</td>
            </tr>
            <tr>
              <td>Donor Type</td>
              <td>{categoryName}</td>
            </tr>
            <tr>
              <td>Is Active?</td>
              <td>{donor.is_active ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Created At</td>
              <td>{new Date(donor.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Updated At</td>
              <td>{new Date(donor.updated_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Edit and Delete Buttons */}
        <div style={{ marginTop: "20px" }}>
          <button
            className="edit-btn"
            onClick={() => navigate(`/donor/editDonor/${donor.id}`)}
          >
            Edit Donor
          </button>&emsp;
          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete Donor
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDonorPage;
