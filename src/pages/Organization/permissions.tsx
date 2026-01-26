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
  department_id: number;
}

interface Department {
  id: number;
  name: string;
  description: string;
  category: string;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]); // To store filtered roles based on department
  const [departments, setDepartments] = useState<Department[]>([]); // For departments
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null); // State for selected department
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const navigate = useNavigate();

  //const [successMessage, _setSuccessMessage] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authToken found, please log in.");
        setLoading(false);
        return;
      }

      const response = await orgFetch(`${baseURL}/api/departments`, {
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
        // Sort the departments alphabetically by name
        const sortedDepartments = response.sort((a, b) => a.name.localeCompare(b.name));
        setDepartments(sortedDepartments);
      } else {
        setError("Received invalid data structure for departments.");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("There was an error fetching departments. Please try logging in again...");
      setLoading(false);
    }
  };

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

    if (Array.isArray(response.data)) {
      // Use the 'id' field of each permission to set the permission set
      // Update the map function to explicitly type 'item' as 'Permission'
      const permissionSet = new Set<number>(response.data.map((item: Permission) => item.id));

      // Set the state with the correct type for the permission set
      setRolePermissions(permissionSet);

    } else {
      setError("Received invalid data structure for role permissions.");
    }
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    setError("There was an error fetching role permissions.");
  }
};

  // Filter roles based on selected department
  const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = parseInt(event.target.value);
    setSelectedDepartment(departmentId);
    setFilteredRoles(roles.filter((role) => role.department_id === departmentId)); // Filter roles by department
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
    const response = await orgFetch(`${baseURL}/api/role_permissions/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role_id: selectedRole,
        permission_ids: permissionIds,
      }),
    });

    console.log("response", response);

    if (response.message === "Permissions successfully assigned to role") {
      setShowSuccessCard(true);  // Show the success card
      setTimeout(() => {
        setShowSuccessCard(false); // Hide the success card after 2 seconds
      }, 2000);

      await fetchRoles();  // Refresh the roles list
      await fetchPermissions();  // Refresh the permissions list
    } else {
      setError(response.message || "Failed to save permissions.");
    }
  } catch (err) {
    console.error("Error saving permissions:", err);
    setError("There was an error saving permissions.");
  }
};


  useEffect(() => {
    fetchPermissions();
    fetchRoles();
    fetchDepartments(); // Fetch departments on initial render
  }, []);

  // Group permissions by category
  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const groupedPermissions: { [key: string]: Permission[] } = {};

    permissions.forEach((permission) => {
      let category = permission.path.split("/")[1]; // Default category from path

      // If the path starts with 'org-', categorize it under 'Organization'
      if (permission.path.startsWith("/org-")) {
        category = "Organization";
      }

      // Ensure the category exists in the groupedPermissions object
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
        <a href="/Organization/orgAdminAccounts">Admin Accounts</a>
        <a href="/Organization/ListedAccounts">Manage Accounts</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions" className="active">
          Permissions
        </a>
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

      {showSuccessCard && (
        <div className="success-card">
          <h3>✅</h3>
          <p>Changes have been saved.</p>
        </div>
      )}


      {/*{error && !successMessage && <p className="error-message">{error}</p>}*/}


      {/* Main Content */}
      <div className="permissions-page-content">
        <h1>Permissions</h1>

        {/* Department Drop-down */}
        <label htmlFor="department-select">Select a Department:</label>
        <select id="department-select" value={selectedDepartment || ""} onChange={handleDepartmentChange}>
          <option value="" disabled>
            Please select a department
          </option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        {/* Roles Drop-down */}
        <label htmlFor="role-select">Select a Role:</label>
        <select id="role-select" value={selectedRole || ""} onChange={handleRoleChange}>
          <option value="" disabled>
            Please select a role
          </option>
          {filteredRoles.map((role) => (
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
                            <label htmlFor={permission.name}>{permission.name}</label>
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
