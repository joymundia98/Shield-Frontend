import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HQHeader from './HQHeader';
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Organization {
  id: number;
  name: string;
  status: "active" | "inactive";
  address: string;
  org_type_id: number;  // Ensure we're using `org_type_id` here
  district: string;
  region: string;
}

const BranchDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [organizationData, setOrganizationData] = useState<Organization[]>([]);
  const [orgTypes, setOrgTypes] = useState<Record<number, string>>({});
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch headquarters info and auth token from local storage
  //const headquartersInfo = JSON.parse(localStorage.getItem("headquarters") || "{}");
  //const authToken = localStorage.getItem("authToken");

  useEffect(() => {
  // 1️⃣ Grab data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const orgData = JSON.parse(localStorage.getItem("organization") || "null");

  // 2️⃣ Determine the HQ ID based on who is logged in
  const headquarterId = userData?.headquarter_id || orgData?.headquarters_id;
  const authToken = localStorage.getItem("authToken");

  // 3️⃣ If missing data, set error and stop
  if (!headquarterId || !authToken) {
    setError("Authentication or headquarters data is missing.");
    setLoading(false);
    return;
  }

  // 4️⃣ Fetch organizations under this HQ
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/headquarters/organizations/${headquarterId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch organizations");

      const data = await response.json();
      console.log("Fetched Organization Data:", data);
      setOrganizationData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load organization data");
      setLoading(false);
    }
  };

  // 5️⃣ Fetch organization types
  const fetchOrgTypes = async () => {
    try {
      const response = await fetch(`${baseURL}/api/organization_type`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch organization types");

      const data = await response.json();
      console.log("Fetched Organization Types:", data);

      // Map org_type_id → name
      const orgTypesMap = data.reduce(
        (acc: Record<number, string>, orgType: { org_type_id: number; name: string }) => {
          acc[orgType.org_type_id] = orgType.name;
          return acc;
        },
        {}
      );

      setOrgTypes(orgTypesMap);
    } catch (err) {
      console.error(err);
      setError("Failed to load organization types");
    }
  };

  // 6️⃣ Trigger fetches
  fetchOrganizations();
  fetchOrgTypes();
}, []);


  const filteredOrganizations = useMemo(() => {
    let filtered = organizationData;

    if (searchQuery) {
      filtered = filtered.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter((org) => org.status === selectedStatusFilter);
    }

    if (selectedRegionFilter !== "all") {
      filtered = filtered.filter((org) => org.region === selectedRegionFilter);
    }

    if (selectedDistrictFilter !== "all") {
      filtered = filtered.filter((org) => org.district === selectedDistrictFilter);
    }

    return filtered;
  }, [organizationData, selectedStatusFilter, selectedRegionFilter, selectedDistrictFilter, searchQuery]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(organizationData.map((org) => org.region)));
    return ["all", ...uniqueRegions];
  }, [organizationData]);

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(new Set(organizationData.map((org) => org.district)));
    return ["all", ...uniqueDistricts];
  }, [organizationData]);

  const openViewOrganization = () => {
    navigate(`/InProgress`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>&#9776;</button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar content */}
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>HQ MANAGER</h2>

        {hasPermission("View Branch Directory") && (
          <a
            href="/HQ/branchDirectory"
            className={location.pathname === "/HQ/branchDirectory" ? "active" : ""}
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
            className={location.pathname === "/HQ/GeneralReport" ? "active" : ""}
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

        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }} > ➜ Logout </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        <HQHeader /><br />
        <header className="page-header user-header">
          <h1>Branch Directory</h1>
          <div className="header-buttons">
            <button className="add-btn" onClick={() => navigate("/HQ/newBranch")}>+ &nbsp; New Branch</button>
          </div>
        </header>

        {/* Error or loading state */}
        {error && <div className="error">{error}</div>}
        {loading && <p>Loading organizations...</p>}

        {/* No branches message */}
        {filteredOrganizations.length === 0 && !loading && !error && (
          <p className="no-branches-message">
            There are no branches under this organization.
          </p>
        )}

        <br />

        {/* Search and Filter */}
        <div className="user-filter-box">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="user-filter-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="user-filter-select"
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              className="user-filter-select"
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
            >
              <option value="all">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        <br />

        {/* GROUPED TABLE RENDERING */}
        {["active", "inactive"].map((status) => {
          if (selectedStatusFilter !== "all" && selectedStatusFilter !== status) return null;

          const filtered = filteredOrganizations.filter((org) => org.status === status);

          const groupedByDistrict = filtered.reduce((acc, org) => {
            acc[org.region] = acc[org.region] || {};
            acc[org.region][org.district] = acc[org.region][org.district] || [];
            acc[org.region][org.district].push(org);
            return acc;
          }, {} as Record<string, Record<string, Organization[]>>);

          return (
            <div key={status}>
              <h2>{status === "active" ? "Active" : "Inactive"} Organizations</h2>
              {Object.keys(groupedByDistrict).map((region) => (
                <div key={region}>
                  <h3>{region}</h3>
                  {Object.keys(groupedByDistrict[region]).map((district) => (
                    <div key={district}>
                      <h4>{district}</h4>
                      <table className="responsive-table">
                        <thead>
                          <tr>
                            <th>Organization Name</th>
                            <th>Status</th>
                            <th>Address</th>
                            <th>Organization Type</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedByDistrict[region][district].map((org) => (
                            <tr key={org.id}>
                              <td>{org.name}</td>
                              <td>{org.status}</td>
                              <td>{org.address}</td>
                              <td>{orgTypes[org.org_type_id] || "Unknown Type"}</td> {/* Corrected to use org_type_id */}
                              <td>
                                <button className="add-btn" onClick={() => openViewOrganization()}>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BranchDirectoryPage;
