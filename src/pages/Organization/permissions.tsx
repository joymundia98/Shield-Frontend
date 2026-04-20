import React, { useState, useEffect } from "react";
import { orgFetch } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./permissions.css";
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import { TourProvider, useTour } from "@reactour/tour";

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

/*======================
TOUR STEPS
=======================*/
const PermissionsPageSteps = [
  {
    selector: "#tour-hamburger",
    content: (
      <>
        <h3>Navigation Menu</h3>
        <p>Access the Organization Manager sidebar here.</p>
        <p>
          From here you can move between:
        </p>
        <ul>
          <li>Roles</li>
          <li>Permissions</li>
          <li>Admin Accounts</li>
          <li>Main Dashboard</li>
        </ul>
        <p>
          On smaller screens, this becomes the primary navigation method.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-start",
    content: (
      <>
        <h3>Restart This Tour</h3>
        <p>Click here anytime to review how Permission Assignment works.</p>
        <p>
          This page completes the RBAC structure.
        </p>
      </>
    ),
  },
  {
    selector: "#department-select",
    content: (
      <>
        <h3>Select Department</h3>
        <p>
          First, choose a <strong>Department</strong>.
        </p>
        <p>
          Departments organize roles logically
          (Finance, HR, Media, Operations).
        </p>
        <p>
          Departments do NOT grant access directly —
          they simply group related roles.
        </p>
      </>
    ),
  },
  {
    selector: "#role-select",
    content: (
      <>
        <h3>Select Role</h3>
        <p>
          After selecting a department, choose a <strong>Role</strong>.
        </p>
        <p>
          A role represents a responsibility or position.
        </p>
        <p>
          Example:
        </p>
        <ul>
          <li>Finance Manager</li>
          <li>HR Officer</li>
          <li>Content Editor</li>
        </ul>
        <p>
          Permissions are assigned to roles — not directly to users.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-permissions-container",
    content: (
      <>
        <h3>Assign Permissions</h3>
        <p>
          This section displays all available system permissions.
        </p>
        <p>
          Permissions are grouped by system modules (e.g., Finance, Organization).
        </p>
        <p>
          Checking a box grants that role access to that specific feature.
        </p>
        <p>
          ⚠ Be careful — permissions control system access.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-save-permissions",
    content: (
      <>
        <h3>Save Permissions</h3>
        <p>
          After selecting permissions, click here to apply changes.
        </p>
        <p>
          The selected role will immediately receive the updated access rights.
        </p>
        <p>
          Full RBAC Flow:
        </p>
        <p>
          <strong>User → Role → Permission → System Access</strong>
        </p>
      </>
    ),
  },
];

//Custom Close
const CustomClose: React.FC<{ onClick?: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    style={{
      background: "red",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: 32,
      height: 32,
      fontWeight: "bold",
      cursor: disabled ? "not‑allowed" : "pointer",
      display: "flex",           // ✅ Use flex to center the X
      alignItems: "center",      // ✅ Vertical centering
      justifyContent: "center",  // ✅ Horizontal centering
      fontSize: 16,
      position: "absolute",
      top: -9,                     // Adjust as needed
      right: -10,                   // Adjust as needed
      padding: 0,
    }}
  >
    ✕
  </button>
);

// Custom navigation with dots
const CustomNavigation = () => {
  const { currentStep, steps, setCurrentStep, setIsOpen } = useTour();

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div style={{ marginTop: 10 }}>
      {/* Step dots */}
      <div style={{ textAlign: "center", marginBottom: 5 }}>
        {steps.map((_, idx) => (
          <span
            key={idx}
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              margin: "0 4px",
              background: idx === currentStep ? "#007bff" : "#ccc",
              cursor: "pointer",
            }}
            onClick={() => setCurrentStep(idx)}
          />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={{
            backgroundColor: "#ccc",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: currentStep === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>
        <button
          onClick={goNext}
          style={{
            backgroundColor: "#ccc",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {currentStep === steps.length - 1 ? "End Tour" : "Next →"}
        </button>
      </div>
    </div>
  );
};

const PermissionsPage: React.FC = () => {
  const { hasPermission } = useAuth(); // Access the hasPermission function
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

   //Open the radio selections during tour
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  //Tour
    const { setIsOpen, setCurrentStep, currentStep } = useTour();

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
  const categoriesToRemove = ["pastoral", "ministry", "governance", "class", "SuperAdmin"];

  if (
    !hasPermission("View Branch Directory") &&
    !hasPermission("View HQ Reports")
  ) {
    categoriesToRemove.push("hq");
  }
  
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

  //Open Radio input during tour
  useEffect(() => {
  // When tour reaches the "Assign Permissions" step
  if (currentStep === 4) {
    const firstCategory = Object.keys(filteredPermissions)[0];
    if (firstCategory) {
      setOpenCategory(firstCategory);
    }
  }
}, [currentStep, filteredPermissions]);

//Pulsate the Tour Button
const [isPulsating, setIsPulsating] = useState(false);
const [timePassed, setTimePassed] = useState(0);  // Track time passed
const [pulseIntervalStarted, setPulseIntervalStarted] = useState(false);  // To prevent multiple intervals from being set

useEffect(() => {
  // Start pulsating immediately when the component mounts
  setIsPulsating(true);

  const timer = setInterval(() => {
    setTimePassed((prev) => prev + 1);  // Increment time passed every minute
  }, 60000);  // Track every minute

  // If the time passed reaches 2 minutes, stop pulsating for 2 minutes
  if (timePassed === 2 && !pulseIntervalStarted) {
    setIsPulsating(false);  // Stop pulsating
    setTimeout(() => {
      setPulseIntervalStarted(true);
      setIsPulsating(true);  // Resume pulsating
    }, 120000);  // Wait for 2 minutes before resuming
  }

  // Once time passed reaches 4 minutes, set the pulsating interval
  if (timePassed >= 4 && pulseIntervalStarted) {
    const pulseInterval = setInterval(() => {
      setIsPulsating(true);
      setTimeout(() => setIsPulsating(false), 1000);  // Pulsate for 1 second
    }, 120000);  // Pulsates every 2 minutes after the initial 2-minute pause

    // Clean up the interval after 5 minutes (total 7 minutes)
    setTimeout(() => {
      clearInterval(pulseInterval);
      setIsPulsating(false);  // Stop pulsating after 5 minutes
    }, 300000);  // After 5 minutes (5 * 60 seconds)

    return () => clearInterval(pulseInterval);  // Clean up on unmount
  }

  return () => clearInterval(timer);  // Clean up the timer
}, [timePassed, pulseIntervalStarted]);

  if (loading) return <p>Loading permissions and roles...</p>;
  if (error) return <p>{error}</p>;


  return (
    <div className="permissions-body">
      {/* SIDEBAR */}
      <button id="tour-hamburger" className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
        {/*{hasPermission("Manage Organization Profile") && <a href="/Organization/edittableProfile">Profile</a>}*/}
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgPermissionsPage">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts">Manage Accounts</a>}
        {hasPermission("Manage Roles") && <a href="/Organization/roles">Roles</a>}
        {hasPermission("Manage Permissions") && <a href="/Organization/permissions" className="active">Permissions</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && (
          <a
            href="/dashboard"
            className="return-main"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            ← Back to Main Dashboard
          </a>)}
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

        <OrganizationHeader/><br/><br/>

        <h1>Permissions</h1>
        <button
            id="tour-start"
            className={`add-btn ${isPulsating ? 'pulsating' : ''}`}
            style={{background: "#ffffff", color: "#000000", marginLeft: "10px", marginBottom: "2rem"}}
            onClick={() => {
              setCurrentStep(0);
              setIsOpen(true);
            }}
          >
            🎥 Take a Tour
          </button>

        {/* Department & Role Row */}
      
        <div className="perm-select-row">

          <div className="perm-select-group">
            
            <label htmlFor="department-select">Select a Department:</label>
            <select
              id="department-select"
              value={selectedDepartment || ""}
              onChange={handleDepartmentChange}
            >
              <option value="" disabled>
                Please select a department
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="role-select">Select a Role:</label>
            <select
              id="role-select"
              value={selectedRole || ""}
              onChange={handleRoleChange}
            >
              <option value="" disabled>
                Please select a role
              </option>
              {filteredRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <p>Please select a category header e.g Finance, then scroll down to assign permissions</p>

        {/* Save Permissions Button */}
        <button id="tour-save-permissions" className="save-permissions-btn" onClick={handleSavePermissions}>
          Save Permissions
        </button>

        {/* Permissions Categories */}
        <div id="tour-permissions-container" className="permissions-radio-inputs">
          {Object.keys(filteredPermissions).map((category) => (
            <label key={category} className="radio">    
              <input
                type="radio"
                name="radio"
                checked={openCategory === category}
                onChange={() => setOpenCategory(category)}
              />
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

export default function PermissionsPageWithTour() {
  return (
    <TourProvider
      steps={PermissionsPageSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <PermissionsPage />
    </TourProvider>
  );
}
