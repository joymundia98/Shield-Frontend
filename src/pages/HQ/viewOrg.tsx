import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import { authFetch, orgFetch } from "../../utils/api";  // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import HQHeader from "./HQHeader";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Organization {
  id: number;
  name: string;
  denomination: string;
  address: string;
  region: string;
  district: string;
  status: string;
  created_at: string;
  organization_email: string | null;
  organization_account_id: string;
  org_type_id: string | null;
  headquarters_id: string | null;
}

// Helper function to fetch data with authFetch and fallback to orgFetch if needed
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    // Attempt to fetch using authFetch first
    const data = await authFetch(url);
    console.log("authFetch Response:", data);

    if (data) {
      return data;
    } else {
      throw new Error("No data returned from authFetch.");
    }
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");

    try {
      const data = await orgFetch(url);
      console.log("orgFetch Response:", data);

      if (data) {
        return data;
      } else {
        throw new Error("No data returned from orgFetch.");
      }
    } catch (error) {
      throw new Error('Both authFetch and orgFetch failed');
    }
  }
};

const ViewOrgPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Get organization ID from URL params
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!id) {
        setError("Organization ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use fetchDataWithAuthFallback for fetching organization data
        const data = await fetchDataWithAuthFallback(`${baseURL}/api/organizations/${id}`);

        console.log('Fetched Data:', data);

        // Check if the response contains valid organization data
        if (!data) {
          throw new Error("Organization data is missing.");
        }

        const organizationData: Organization = data;

        // Set the organization data
        setOrganization(organizationData);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch organization data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

        <h2>HQ MANAGER</h2>

        {hasPermission("View Branch Directory") && (
          <a
            href="/HQ/branchDirectory"
            className={
              location.pathname === "/HQ/branchDirectory"
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.preventDefault();
              navigate("/HQ/branchDirectory");
              setSidebarOpen(false);
            }}
          >
            Manage Branches
          </a>
        )}

        {hasPermission("View HQ Reports") && (
          <a
            href="/HQ/GeneralReport"
            className={
              location.pathname === "/HQ/GeneralReport"
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.preventDefault();
              navigate("/HQ/GeneralReport");
              setSidebarOpen(false);
            }}
          >
            Branch Reports
          </a>
        )}

        <hr className="sidebar-separator" />

        {hasPermission("View Main Dashboard") && (
          <a href="/dashboard" className="return-main">
            ← Back to Main Dashboard
          </a>
        )}

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
        <HQHeader />
        <br />

        <h1>{organization.name}</h1>
        <br />
        <button
          className="add-btn"
          onClick={() => navigate("/HQ/branchDirectory")} // Navigate back to organizations list
        >
          &larr; Back to Branch Directory
        </button>
        <br /><br />

        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Organization Name</td>
              <td>{organization.name}</td>
            </tr>
            <tr>
              <td>Denomination</td>
              <td>{organization.denomination}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{organization.address}</td>
            </tr>
            <tr>
              <td>Region</td>
              <td>{organization.region}</td>
            </tr>
            <tr>
              <td>District</td>
              <td>{organization.district}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{organization.status}</td>
            </tr>
            <tr>
              <td>Created At</td>
              <td>{new Date(organization.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Organization Email</td>
              <td>{organization.organization_email || "N/A"}</td>
            </tr>
            <tr>
              <td>Organization Account ID</td>
              <td>{organization.organization_account_id}</td>
            </tr>
            <tr>
              <td>Headquarters ID</td>
              <td>{organization.headquarters_id || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewOrgPage;