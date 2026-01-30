import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HQHeader from './HQHeader';

interface Organization {
  name: string;
  status: "Active" | "Inactive";
  address: string;
  orgType: number;
  district: string;
  province: string;
}

const organizationTypes = [
  { id: 1, name: "Headquarters / Central Authority" },
  { id: 2, name: "Regional / Territorial Level" },
  { id: 3, name: "Local Church Level" },
  { id: 4, name: "Sub-Local Units (Optional)" }
];

//const baseURL = import.meta.env.VITE_BASE_URL;

const BranchDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [organizationData, setOrganizationData] = useState<Organization[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, _setError] = useState<string | null>(null);

  // Temporary static data for organizations
  const staticData: Organization[] = [
    { name: "Org A", status: "Active", address: "123 Street, Lusaka", orgType: 1, district: "Lusaka District", province: "Lusaka" },
    { name: "Org B", status: "Inactive", address: "456 Avenue, Ndola", orgType: 2, district: "Ndola District", province: "Copperbelt" },
    { name: "Org C", status: "Active", address: "789 Road, Kitwe", orgType: 3, district: "Kitwe District", province: "Copperbelt" },
    // Add more organizations here...
  ];

  useEffect(() => {
    // Simulating an API fetch
    setTimeout(() => {
      setOrganizationData(staticData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter organizations based on search query
  const filteredOrganizations = useMemo(() => {
    let filtered = organizationData;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected status filter
    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter((org) => org.status === selectedStatusFilter);
    }

    // Filter by selected province filter
    if (selectedProvinceFilter !== "all") {
      filtered = filtered.filter((org) => org.province === selectedProvinceFilter);
    }

    // Filter by selected district filter
    if (selectedDistrictFilter !== "all") {
      filtered = filtered.filter((org) => org.district === selectedDistrictFilter);
    }

    return filtered;
  }, [organizationData, selectedStatusFilter, selectedProvinceFilter, selectedDistrictFilter, searchQuery]);

  // Helper function to get organization type name by ID
  const getOrgTypeName = (orgTypeId: number): string => {
    const orgType = organizationTypes.find((type) => type.id === orgTypeId);
    return orgType ? orgType.name : "Unknown Type";
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Get distinct provinces and districts
  const provinces = useMemo(() => {
    const uniqueProvinces = Array.from(new Set(organizationData.map((org) => org.province)));
    return ["all", ...uniqueProvinces];
  }, [organizationData]);

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(new Set(organizationData.map((org) => org.district)));
    return ["all", ...uniqueDistricts];
  }, [organizationData]);

  // Navigate to the organization details page
  const openViewOrganization = (name: string) => {
    navigate(`/Organization/view/${name}`);
  };

  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>&#9776;</button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>
        <h2>ORG MANAGER</h2>
        <a href="/Organization/edittableProfile">Profile</a>
        <a href="/HQ/orgLobby">The Lobby</a>
        <a href="/HQ/orgAdminAccounts">Admin Accounts</a>
        <a href="/HQ/branchDirectory" className="active">Branch Directory</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/Organization/to_SCI-ELD_ERP" className="return-main">To SCI-ELD ERP</a>
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              className="user-filter-select"
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
            >
              <option value="all">All Provinces</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
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
        {["Active", "Inactive"].map((status) => {
          if (selectedStatusFilter !== "all" && selectedStatusFilter !== status) return null;

          const filtered = filteredOrganizations.filter((org) => org.status === status);

          // Group organizations by District then Province
          const groupedByDistrict = filtered.reduce((acc, org) => {
            acc[org.province] = acc[org.province] || {};
            acc[org.province][org.district] = acc[org.province][org.district] || [];
            acc[org.province][org.district].push(org);
            return acc;
          }, {} as Record<string, Record<string, Organization[]>>);

          return (
            <div key={status}>
              <h2>{status} Organizations</h2>
              {Object.keys(groupedByDistrict).map((province) => (
                <div key={province}>
                  <h3>{province}</h3>
                  {Object.keys(groupedByDistrict[province]).map((district) => (
                    <div key={district}>
                      <h4>{district}</h4>
                      <table className="responsive-table">
                        <thead>
                          <tr>
                            <th>Organization Name</th>
                            <th>Status</th>
                            <th>Address</th>
                            <th>Organization Type</th>
                            <th>Actions</th> {/* New Actions Column */}
                          </tr>
                        </thead>
                        <tbody>
                          {groupedByDistrict[province][district].map((org) => (
                            <tr key={org.name}>
                              <td>{org.name}</td>
                              <td>{org.status}</td>
                              <td>{org.address}</td>
                              <td>{getOrgTypeName(org.orgType)}</td>
                              <td>
                                <button className="add-btn" onClick={() => openViewOrganization(org.name)}>
                                  View
                                </button>
                              </td> {/* View button */}
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
