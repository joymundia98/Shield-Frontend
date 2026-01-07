import React, { useState, useEffect } from "react";
import { orgFetch } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./permissions.css";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Permission {
  id: number;
  name: string;
  path: string;
  method: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);
      if (!token) {
        setError("No authToken found, please log in.");
        setLoading(false);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
        return;
      }

      const response = await orgFetch(`${baseURL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Login Required");
        setLoading(false);
        setTimeout(() => {
          navigate("/home");
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

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("No authToken found, please log in.");
        setLoading(false);
        return;
      }

      const response = await orgFetch(`${baseURL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Login Required");
        setLoading(false);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
        return;
      }

      if (Array.isArray(response)) {
        const sortedRoles = response.sort((a, b) => a.name.localeCompare(b.name));
        setRoles(sortedRoles);
      } else {
        setError("Received invalid data structure for roles.");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("There was an error fetching roles. Please try logging in again...");
      setLoading(false);
    }
  };

  // Fetch role permissions when a role is selected
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authToken found, please log in.");
        return;
      }

      const response = await orgFetch(`${baseURL}/api/role_permissions/role/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Login Required");
        return;
      }

      if (Array.isArray(response)) {
        const permissionSet = new Set(response.map((item) => item.permission_id));
        setRolePermissions(permissionSet);
      } else {
        setError("Received invalid data structure for role permissions.");
      }
    } catch (err) {
      console.error("Error fetching role permissions:", err);
      setError("There was an error fetching role permissions.");
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = parseInt(event.target.value);
    setSelectedRole(roleId);
    fetchRolePermissions(roleId);
  };

  // Handle checkbox change to update permissions
  const handleCheckboxChange = (permissionId: number) => {
    setRolePermissions((prev) => {
      const newPermissions = new Set(prev);
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId); // Remove permission if already checked
      } else {
        newPermissions.add(permissionId); // Add permission if unchecked
      }
      return newPermissions;
    });
  };

  // Save the permissions when the user clicks the "Save Permissions" button
  const handleSavePermissions = async () => {
    if (selectedRole === null) {
      setError("Please select a role.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authToken found, please log in.");
      return;
    }

    const permissionIds = Array.from(rolePermissions);

    try {
      const response = await orgFetch(`${baseURL}/api/role_permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role_id: selectedRole,
          permissions: permissionIds,
        }),
      });

      if (response.status === 200) {
        alert("Permissions saved successfully!");
      } else {
        setError("Failed to save permissions.");
      }
    } catch (err) {
      console.error("Error saving permissions:", err);
      setError("There was an error saving permissions.");
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
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

  // Filter out unwanted categories
  const categoriesToRemove = ["pastoral", "ministry", "governance", "class"];
  const filteredPermissions: { [key: string]: Permission[] } = Object.keys(groupedPermissions)
    .filter((category) => !categoriesToRemove.includes(category.toLowerCase()))
    .reduce((obj, key) => {
      obj[key] = groupedPermissions[key];
      return obj;
    }, {} as { [key: string]: Permission[] });

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  if (loading) return <p>Loading permissions and roles...</p>;
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
        <a href="/Organization/permissions" className="active">
          Permissions
        </a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
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
      <div className="permissions-page-content">
        <h1>Permissions</h1>

        {/* Roles Drop-down */}
        <label htmlFor="role-select">Select a Role:</label>
        <select id="role-select" value={selectedRole || ""} onChange={handleRoleChange}>
          <option value="" disabled>
            Please select a role
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <p>Please select a category to assign permissions</p>

        {/* Save Permissions Button */}
        <button className="save-permissions-btn" onClick={handleSavePermissions}>
          Save Permissions
        </button>

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
                              checked={rolePermissions.has(permission.id)}
                              onChange={() => handleCheckboxChange(permission.id)}  // Added onChange
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
