import React, { useState, useEffect } from "react";
import { orgFetch } from "../../utils/api"; // Assuming you have an api helper to handle requests
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import "./permissions.css"; // Ensure this CSS file is loaded properly

const baseURL = import.meta.env.VITE_BASE_URL;

interface Permission {
  id: number;
  name: string;
  path: string;
  method: string;
  description: string;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate hook for redirection

  // Function to fetch permissions from the API
  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Assuming the JWT is saved in localStorage

      if (!token) {
        setError("No authToken found, please log in.");
        setLoading(false);
        setTimeout(() => {
          navigate("/home"); // Redirect to home after 1.5 seconds
        }, 1500);
        return;
      }

      const response = await orgFetch(`${baseURL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the JWT token to the request header
        },
      });

      if (response.status === 401) {
        setError("Login Required");
        setLoading(false);
        setTimeout(() => {
          navigate("/home"); // Redirect to home after 1.5 seconds
        }, 1500);
        return;
      }

      if (Array.isArray(response)) {
        setPermissions(response);
      } else {
        setError("Received invalid data structure for permissions.");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError("There was an error fetching permissions. Please try logging in again...");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions(); // Fetch permissions when the component mounts
  }, []);

  

  // Group permissions by category
  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const groupedPermissions: { [key: string]: Permission[] } = {};

    permissions.forEach((permission) => {
      const category = permission.path.split("/")[1]; // Use the first part of the path (category)
      if (!groupedPermissions[category]) {
        groupedPermissions[category] = [];
      }
      groupedPermissions[category].push(permission);
    });

    return groupedPermissions;
  };

  const groupedPermissions = groupPermissionsByCategory(permissions);

  // Temporary removal of specific categories (Pastors, Ministry, and Governance)
  const categoriesToRemove = ["pastoral", "ministry", "governance", "class"];
  const filteredPermissions: { [key: string]: Permission[] } = Object.keys(groupedPermissions)
    .filter((category) => !categoriesToRemove.includes(category.toLowerCase())) // Remove unwanted categories
    .reduce((obj, key) => {
      obj[key] = groupedPermissions[key];
      return obj;
    }, {} as { [key: string]: Permission[] });  // Explicitly set the type
  
  // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sidebar toggle effect
    useEffect(() => {
      if (sidebarOpen) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }, [sidebarOpen]);

    // Render a loading state or an error if there's an issue
    if (loading) return <p>Loading permissions...</p>;
    if (error) return <p>{error}</p>;

  return (
    <div className="permissions-body">
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
        <a href="/Organization/ListedAccounts">Accounts Tracker</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions" className="active">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Content */}
      <div className="permissions-page-content">
        {/* Replacing the old header */}
        <h1>Permissions</h1>
        <p>Please select a category to assign permissions</p>

        {/* Permissions Categories */}
        <div className="permissions-radio-inputs">
          {Object.keys(filteredPermissions).map((category) => (
            <label key={category} className="radio">
              <input type="radio" name="radio" />
              <span className="name">
                <span className="pre-name"></span>
                <span className="pos-name"></span>
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </span>
              <div className="content">
                <div>
                  {/*<h2>{category.charAt(0).toUpperCase() + category.slice(1)} Permissions</h2>*/}
                  <div className="grid">
                    <form>
                      <fieldset>
                        <legend>{category.charAt(0).toUpperCase() + category.slice(1)} Permissions</legend>
                        {filteredPermissions[category].map((permission) => (
                          <div key={permission.id} className="form__group">
                            &emsp;
                            <input
                              type="checkbox"
                              id={permission.name}
                              name={`${category}_${permission.name}`}
                            />
                            <label htmlFor={permission.name}>{permission.description}</label>
                          </div>
                        ))}
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;