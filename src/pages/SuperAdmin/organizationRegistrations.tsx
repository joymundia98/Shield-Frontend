import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
//import CongregationHeader from "./CongregationHeader";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Organization {
  id: number;
  name: string;
  denomination: string;
  region: string;
  district: string;
  email: string;
  status: string;

  createdAt: Date;
  trialEnd: Date;

  createdAtDisplay: string;
  trialEndDisplay: string;
  
  orgType: string;
}

interface OrgType {
  org_type_id: number;
  name: string;
}

const OrganizationRegistrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [_orgTypes, setOrgTypes] = useState<OrgType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [recordsToShow, setRecordsToShow] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const [selectedTrialFilter, setSelectedTrialFilter] = useState("all");

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Authenticated fetch
  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch org types
        const orgTypeRes = await authFetch(`${baseURL}/api/organization_type`);
        setOrgTypes(orgTypeRes);

        // fetch organizations
        const orgRes = await authFetch(`${baseURL}/api/organizations`);

        const data: Organization[] = orgRes.map((org: any) => {
            const createdDate = new Date(org.created_at);

            const trialEndDate = new Date(createdDate);
            trialEndDate.setDate(trialEndDate.getDate() + 21);

            let orgTypeName = "Not Assigned";

            if (org.org_type_id) {
                const typeMatch = orgTypeRes.find(
                    (t: OrgType) => t.org_type_id === org.org_type_id
                );

                if (typeMatch) {
                orgTypeName = typeMatch.name;
                }
            }

            return {
                id: org.id,
                name: org.name,
                denomination: org.denomination,
                region: org.region,
                district: org.district,
                email: org.organization_email,
                status: org.status,
                orgType: orgTypeName,

                createdAt: createdDate, // ✅ keep as Date object
                trialEnd: trialEndDate, // ✅ keep as Date object

                createdAtDisplay: createdDate.toLocaleString(), // for UI only
                trialEndDisplay: trialEndDate.toLocaleDateString(),
            };
            });

        setOrganizations(data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };

    fetchData();
  }, []);

  const filteredOrganizations = useMemo(() => {
 // const today = new Date();

  return organizations
    // remove test emails
    .filter((org) => {
      if (org.email && org.email.toLowerCase().includes("test.com")) {
        return false;
      }
      return true;
    })

    // search filter
    .filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // trial status filter
    .filter((org) => {
      if (selectedTrialFilter === "all") return true;

      const trialEnd = new Date(org.trialEnd);
      const today = new Date();

      if (selectedTrialFilter === "in_trial") {
        return trialEnd > today; // strictly later than today
      }

      if (selectedTrialFilter === "completed") {
        return trialEnd <= today;
      }

      return true;
    });
}, [organizations, searchQuery, selectedTrialFilter]);

// KPI Logic
const kpiData = useMemo(() => {
  const validOrgs = organizations.filter(
    (org) => !org.email || !org.email.toLowerCase().includes("test.com")
  );

  const today = new Date();

  let activeTrial = 0;
  let completedTrial = 0;

  validOrgs.forEach((org) => {
    const trialEnd = new Date(org.trialEnd);

    if (trialEnd > today) {
      activeTrial++;
    } else {
      completedTrial++;
    }
  });

  return {
    totalRegistered: validOrgs.length,
    activeTrial,
    completedTrial,
  };
}, [organizations]);

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredOrganizations.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  return (
    <div className="dashboard-wrapper visitors-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
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

        <h2>SUPER ADMIN</h2>

          <a href="/SuperAdmin/RegisteredOrganizations">Registered Organizations</a>
        
          <a href="/SuperAdmin/RegisteredAdmins">System Admin Accounts</a>
        

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

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        
        <header>
          <h1>Registered Organizations</h1>

        </header>

        {/* KPI Cards */}
        <div className="kpi-container">
        <div className="kpi-card">
            <h3>Total Registered Organizations</h3>
            <p>{kpiData.totalRegistered}</p>
        </div>

        <div className="kpi-card">
            <h3>Total In Active Trial</h3>
            <p>{kpiData.activeTrial}</p>
        </div>

        <div className="kpi-card">
            <h3>Total Completed Trial</h3>
            <p>{kpiData.completedTrial}</p>
        </div>
        </div>

        <br />

        {/* SEARCH */}
        <div className="user-filter-box">
            <div
                style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                }}
            >
                <input
                type="text"
                placeholder="Search organizations..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                className="user-filter-select"
                value={selectedTrialFilter}
                onChange={(e) => setSelectedTrialFilter(e.target.value)}
                >
                <option value="all">All Trials</option>
                <option value="in_trial">In Trial</option>
                <option value="completed">Completed Trial</option>
                </select>
            </div>
        </div>

        <br />

        {/* TABLE */}
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Org Type</th>
              <th>Denomination</th>
              <th>Region</th>
              <th>District</th>
              <th>Email</th>
              <th>Status</th>
              <th>Registered On</th>
              <th>Trial Ends</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrganizations.slice(0, recordsToShow).map((org) => (
              <tr key={org.id}>
                <td>{org.name}</td>
                <td>{org.orgType}</td>
                <td>{org.denomination}</td>
                <td>{org.region}</td>
                <td>{org.district}</td>
                <td>{org.email}</td>
                <td>{org.status}</td>
                <td>{org.createdAtDisplay}</td>
                <td>{org.trialEndDisplay}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />

        <button
          onClick={showAll ? handleViewLess : handleViewMore}
          className="add-btn"
        >
          {showAll ? "View Less" : "View More"}
        </button>
      </div>
    </div>
  );
};

export default OrganizationRegistrationsPage;