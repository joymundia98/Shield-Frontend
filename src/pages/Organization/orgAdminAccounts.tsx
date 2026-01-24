import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api"; // API fetch function
import profile_icon from "../../assets/profile_icon.png"; // Profile image for the card
import "./OrgLobby.css"; // Import the OrgLobby styles

const baseURL = import.meta.env.VITE_BASE_URL;

interface AdminAccount {
  id: number;
  email: string;
  status: string;
}

const AdminAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]); // Admin accounts list
  const [organization, setOrganization] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminRoleId, setAdminRoleId] = useState<number | null>(null); // Store the Administrator role id

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch admin accounts
  const fetchAdminAccounts = async (orgId: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authToken found, please log in.");
      return;
    }

    try {
      const response = await orgFetch(`${baseURL}/api/users?organization_id=${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Login required. Redirecting...");
        setTimeout(() => navigate("/home"), 1500);
        return;
      }

      if (Array.isArray(response)) {
        // Filter users by adminRoleId if it's set
        const filteredAccounts = response.filter((user: any) => user.role_id === adminRoleId);
        setAdminAccounts(filteredAccounts);
      } else {
        setError("No valid data received for admin accounts.");
      }
    } catch (error) {
      console.error("Error fetching admin accounts:", error);
      setError("Error fetching admin accounts.");
    }
  };

  // Fetch roles to get the admin role id
  const fetchRoles = async () => {
  try {
    const response = await orgFetch(`${baseURL}/api/roles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (response.status === 401) {
      setError("Login required. Redirecting...");
      setTimeout(() => navigate("/home"), 1500);
      return;
    }

    // Check if the response is a plain object or an actual Response object
    const roles = response.json ? await response.json() : response; // If response is a Response object, parse JSON

    const adminRole = roles.find((role: any) => role.name === "Administrator"); // Match exactly "Administrator"

    if (adminRole) {
      setAdminRoleId(adminRole.id); // Set the admin role id
    } else {
      setError("Administrator role not found.");
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    setError("Error fetching roles.");
  }
};


  useEffect(() => {
    const savedOrg = localStorage.getItem("organization");
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      setOrganization(parsedOrg);
      fetchRoles(); // Fetch roles first
    } else {
      setError("Organization data not found.");
    }
  }, []);

  useEffect(() => {
    // Only fetch admin accounts when the adminRoleId is available
    if (adminRoleId && organization) {
      fetchAdminAccounts(organization.id);
    }
  }, [adminRoleId, organization]);

  // Handle creating a new admin account
  const handleCreateAdminAccount = () => {
    navigate("/admin/create-account"); // Navigate to the create account page
  };

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Open view user page in a new tab
  const openViewUser = (id: number) => {
    window.open(`/Organization/viewUser/${id}`, "_blank");
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
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
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/orgAdminAccounts" className="active">Admin Accounts</a>
        <a href="/Organization/ListedAccounts">Manage Accounts</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/Organization/to_SCI-ELD_ERP" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <header className="page-header">
          <h1>Admin Accounts for {organization?.name}</h1>
          {/* Create Admin Account button moved here */}
          <button onClick={handleCreateAdminAccount} className="create-admin-account-btn">
            + &nbsp; Create Admin Account
          </button>
          {/* Hamburger menu */}
          <button className="hamburger" onClick={toggleSidebar}> ☰ </button>
        </header>

        {error && <div className="form-error">{error}</div>}

        <div className="admin-content">
          {adminAccounts.length === 0 ? (
            <div className="no-admin-message">
                <br/>
              <p>
                It seems that there are no Administrator accounts associated with this
                organization. An admin account is required to access the SCI-ELD ERP system.
                Please create one to proceed.
              </p>
              <button onClick={handleCreateAdminAccount} className="create-admin-account-btn">
                Create Admin Account
              </button>
            </div>
          ) : (
            <div className="lobbyContainer">
              {adminAccounts.map((account) => (
                <div key={account.id} className="lobbyCard">
                  <img src={profile_icon} alt="Profile" className="lobbyCard-image" />
                  <div className="lobbyCard-content">
                    <h3>{account.email}</h3>
                    <br/>
                    {/* Replace status with View button */}
                    <button onClick={() => openViewUser(account.id)} className="add-btn">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccounts;
