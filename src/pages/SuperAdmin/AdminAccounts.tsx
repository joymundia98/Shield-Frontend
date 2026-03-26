import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface AdminAccount {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organizationName: string;
  status: string;
  createdAt: string;
}

interface Organization {
  id: number;
  name: string;
}

const AdminAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [_organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [recordsToShow, setRecordsToShow] = useState(5);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  // Fetch Organizations and Admin Accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organizations
        const orgRes = await authFetch(`${baseURL}/api/organizations`);
        setOrganizations(orgRes.data || orgRes); // access .data

        // Fetch users
        const userRes = await authFetch(`${baseURL}/api/users/all`);
        const users = userRes.data || userRes; // access .data

        const adminData: AdminAccount[] = users
          .filter((user: any) => {
            if (user.position !== "System Administrator") return false;
            if (user.email?.toLowerCase().includes("test.com")) return false;
            return true;
          })
          .map((user: any) => {
            const org = (orgRes.data || orgRes).find(
              (o: any) => o.id === user.organization_id
            );
            return {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              phone: user.phone,
              position: user.position,
              organizationName: org ? org.name : "Unknown",
              status: user.status,
              createdAt: new Date(user.created_at).toLocaleString(),
            };
          });

        setAdmins(adminData);
      } catch (err) {
        console.error("Error fetching admin accounts:", err);
      }
    };

    fetchData();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      `${admin.firstName} ${admin.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [admins, searchQuery]);

  const kpiData = useMemo(() => {
    const active = admins.filter((a) => a.status === "active").length;
    const inactive = admins.filter((a) => a.status !== "active").length;

    return {
      totalAdmins: admins.length,
      activeAdmins: active,
      inactiveAdmins: inactive,
    };
  }, [admins]);

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredAdmins.length);
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

        <a href="/SuperAdmin/dashboard">Dashboard</a>

        <a href="/SuperAdmin/RegisteredOrganizations">Registered Organizations</a>
        
        <a href="/SuperAdmin/RegisteredAdmins" className="active">System Admin Accounts</a>

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
          <h1>Registered System Administrator Accounts</h1>
          
        </header>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Admin Accounts</h3>
            <p>{kpiData.totalAdmins}</p>
          </div>

          <div className="kpi-card">
            <h3>Active Admins</h3>
            <p>{kpiData.activeAdmins}</p>
          </div>

          <div className="kpi-card">
            <h3>Inactive Admins</h3>
            <p>{kpiData.inactiveAdmins}</p>
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
              placeholder="Search admin..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <br />

        {/* TABLE */}
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {filteredAdmins.slice(0, recordsToShow).map((admin) => (
              <tr key={admin.id}>
                <td>
                  {admin.firstName} {admin.lastName}
                </td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>{admin.position}</td>
                <td>{admin.organizationName}</td>
                <td>{admin.status}</td>
                <td>{admin.createdAt}</td>
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

export default AdminAccountsPage;