import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import { orgFetch } from "../../utils/api"; // Import orgFetch

const baseURL = import.meta.env.VITE_BASE_URL;

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  status: string | null;
  role_id: number;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
}

const ViewUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get user ID from URL params
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null); // State to store role
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch user and role data
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user data
        const userRes = await orgFetch(`${baseURL}/api/users/${id}`);
        console.log(userRes); // Log userRes to check the data

        if (!userRes || userRes.error) {
          console.log("Error data:", userRes);  // Log the entire object for debugging
          setError("User not found.");
          return;
        }

        setUser(userRes);

        // Fetch role data
        const roleRes = await orgFetch(`${baseURL}/api/roles`);
        if (!roleRes || roleRes.error) {
          console.log("Error data:", roleRes);  // Log the entire object for debugging
          setError("Roles not found.");
          return;
        }

        const userRole = roleRes.find((role: Role) => role.id === userRes.role_id);
        setRole(userRole || null); // Set the role if found

      } catch (error: any) {
        setError(error.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>
      
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
        <a href="/Organization/ListedAccounts">Manage Accounts</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/Organization/to_SCI-ELD_ERP" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1>User Profile</h1>
        <br />

        {/* Back to Users List Button */}
        <button
          className="add-btn"
          onClick={() => navigate("/Organization/orgLobby")} // Navigate back to the lobby
        >
          &larr; Back to Lobby
        </button>
        <br /><br />

        {/* User Details Table */}
        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Full Name</td>
              <td>{user.first_name} {user.last_name}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{user.phone}</td>
            </tr>
            <tr>
              <td>Role</td>
              <td>{role ? role.name : "N/A"}</td> {/* Display the role name */}
            </tr>
            <tr>
              <td>Position</td>
              <td>{user.position}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{user.status ? user.status : "N/A"}</td>
            </tr>
            <tr>
              <td>Account Created</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Last Updated</td>
              <td>{new Date(user.updated_at).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUserPage;
