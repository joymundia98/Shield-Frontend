import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./roles.css";
import { authFetch, orgFetch } from "../../utils/api"; // Importing authFetch and orgFetch
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import { TourProvider, useTour } from "@reactour/tour";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Department {
  id: number;
  name: string;
  category: string;
  roles: Role[];
  showMoreRoles?: boolean; // Added to track the visibility of roles
}

interface Role {
  id: number;
  name: string;
  description: string;
  department_id: number;
}

/*======================
TOUR STEPS
=======================*/
const RolesPageSteps = [
  {
    selector: "#tour-hamburger",
    content: (
      <>
        <h3>Navigation Menu</h3>
        <p>Access the Organization Manager sidebar here.</p>
        <p>The hamburger menu offers an alternative navigation to the header.</p>
        <p>Quick access to roles, permissions, admin accounts, and the dashboard.</p>
        <p>On small screens, it becomes the primary navigation method for all sections.</p>
        {/*<p>
          After creating roles:
        </p>
        <ol>
          <li>Go to <strong> Permissions</strong> to assign access rights.</li>
          <li>Assign roles to users in <strong>Manage Accounts</strong>.</li>
        </ol>
        <p>
          Full RBAC Flow:
        </p>
        <p>
          <strong>User → Role → Permission → System Access</strong>
        </p>*/}
      </>
    ),
  },
  {
    selector: "#tour-start",
    content: (
      <>
        <h3>Restart This Tour</h3>
        <p>
          Click here anytime to review how RBAC works.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-roles-title",
    content: (
      <>
        <h3>Role-Based Access Control (RBAC)</h3>
        <p>
          This page manages <strong>Roles</strong> within your organization.
        </p>
        <p>
          In RBAC, permissions are not assigned directly to users.
        </p>
        <p>
          Instead: <strong>Users → Roles → Permissions</strong>.
        </p>
        <p>
          This ensures scalable, secure, and maintainable access control.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-church-section",
    content: (
      <>
        <h3>Departments Group Roles</h3>
        <p>
          Roles are grouped inside Departments.
        </p>
        <p>
          Departments help logically organize responsibilities
          (e.g., Finance, Media, HR, Operations).
        </p>
        <p>
          This structure keeps large organizations manageable.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-department-card",
    content: (
      <>
        <h3>Department Card</h3>
        <p>
          Each department contains multiple roles.
        </p>
        <p>
          A department does NOT grant access —
          roles inside it define access.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-role-card",
    content: (
      <>
        <h3>Role</h3>
        <p>
          A Role represents a responsibility or position.
        </p>
        <p>
          Example:
        </p>
        <ul>
          <li>Finance Manager</li>
          <li>Content Editor</li>
          <li>HR Officer</li>
        </ul>
        <p>
          Roles are later linked to specific permissions.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-add-role",
    content: (
      <>
        <h3>Create a Role</h3>
        <p>
          Add new roles inside a department.
        </p>
        <p>
          After creating a role, you must assign permissions
          in the Permissions section.
        </p>
        <p>
          ⚠ A role without permissions grants no access.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-add-department",
    content: (
      <>
        <h3>Create a Department</h3>
        <p>
          Create a department only when necessary.
        </p>
        <p>
          Avoid duplication — reuse existing departments where possible.
        </p>
        <p>
          Departments improve structure but do not control access directly.
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

const RolesPage: React.FC = () => {
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [churchDepartments, setChurchDepartments] = useState<Department[]>([]);
  const [corporateDepartments, setCorporateDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //Tour
    const { setIsOpen, setCurrentStep } = useTour();

  // State for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

   // Declare departmentCategory state (this is the key fix)
  const [departmentCategory, setDepartmentCategory] = useState<string>("church"); // Default to 'church'

  // State for modal (Add Department)
  const [departmentModalOpen, setDepartmentModalOpen] = useState<boolean>(false);

  // State for department name and description
  const [newDepartmentName, setNewDepartmentName] = useState<string>("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState<string>("");


  // State for visible cards
  const [visibleChurchCount, setVisibleChurchCount] = useState(3); // Start with showing 3
  const [visibleCorporateCount, setVisibleCorporateCount] = useState(3); // Start with showing 3

  // State for modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDescription, setNewRoleDescription] = useState<string>("");
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);

  // Function to fetch departments with auth logic
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await authFetch(`${baseURL}/api/departments`); // Fetch departments

      // Fetch roles for each department
      const rolesData = await authFetch(`${baseURL}/api/roles`); // Assuming there's an endpoint for roles

      // Organize roles by department_id for quick lookup
      const rolesByDept: { [key: number]: Role[] } = {};
      rolesData.forEach((role: Role) => {
        if (!rolesByDept[role.department_id]) {
          rolesByDept[role.department_id] = [];
        }
        rolesByDept[role.department_id].push(role);
      });

      // Categorize departments and assign roles
      const churchDepts = data
        .filter((dept: Department) => dept.category === "church")
        .map((dept: Department) => {
          const departmentRoles = rolesByDept[dept.id] || []; // Get roles or empty array if none
          return {
            ...dept,
            roles: departmentRoles, // Use empty array if no roles
            showMoreRoles: false,
          };
        })
        .sort((a: Department, b: Department) => a.name.localeCompare(b.name)); // Sort church departments alphabetically

      const corporateDepts = data
        .filter((dept: Department) => dept.category === "corporate")
        .map((dept: Department) => {
          const departmentRoles = rolesByDept[dept.id] || []; // Get roles or empty array if none
          return {
            ...dept,
            roles: departmentRoles, // Use empty array if no roles
            showMoreRoles: false,
          };
        })
        .sort((a: Department, b: Department) => a.name.localeCompare(b.name)); // Sort corporate departments alphabetically

      setChurchDepartments(churchDepts);
      setCorporateDepartments(corporateDepts);
      setLoading(false);
    } catch (err: any) {
      // Fallback to orgFetch if authFetch fails
      console.error("authFetch failed, falling back to orgFetch", err);
      try {
        const fallbackData = await orgFetch(`${baseURL}/api/departments`);
        const fallbackRolesData = await orgFetch(`${baseURL}/api/roles`);

        const rolesByDept: { [key: number]: Role[] } = {};
        fallbackRolesData.forEach((role: Role) => {
          if (!rolesByDept[role.department_id]) {
            rolesByDept[role.department_id] = [];
          }
          rolesByDept[role.department_id].push(role);
        });

        const churchDepts = fallbackData
          .filter((dept: Department) => dept.category === "church")
          .map((dept: Department) => {
            const departmentRoles = rolesByDept[dept.id] || [];
            return {
              ...dept,
              roles: departmentRoles,
              showMoreRoles: false,
            };
          })
          .sort((a: Department, b: Department) => a.name.localeCompare(b.name));

        const corporateDepts = fallbackData
          .filter((dept: Department) => dept.category === "corporate")
          .map((dept: Department) => {
            const departmentRoles = rolesByDept[dept.id] || [];
            return {
              ...dept,
              roles: departmentRoles,
              showMoreRoles: false,
            };
          })
          .sort((a: Department, b: Department) => a.name.localeCompare(b.name));

        setChurchDepartments(churchDepts);
        setCorporateDepartments(corporateDepts);
        setLoading(false);
      } catch (fallbackErr: unknown) {
        if (fallbackErr instanceof Error) {
          setError(fallbackErr.message || "An error occurred while fetching departments.");
        } else {
          setError("An error occurred while fetching departments.");
        }
        setLoading(false);
      }
    }
  }, []);

  // Open modal for adding department
  const openDepartmentModal = (category: string) => {
    setDepartmentCategory(category); // Set the category dynamically based on which button was clicked
    setDepartmentModalOpen(true); // Open the modal
  };


  // Function to close the department modal
  const closeDepartmentModal = () => {
    setDepartmentModalOpen(false);
    setNewDepartmentName(""); // Reset name
    setNewDepartmentDescription(""); // Reset description
  };


  // Handle adding a new department
const handleAddDepartment = async () => {
  if (!newDepartmentName || !newDepartmentDescription) {
    setError("Both department name and description are required.");
    return;
  }

  const newDepartment = {
    name: newDepartmentName,
    description: newDepartmentDescription,
    category: departmentCategory,
  };

  try {
    const response = await fetch(`${baseURL}/api/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(newDepartment),
    });

    if (!response.ok) {
      throw new Error("Failed to add department");
    }

    const addedDepartment = await response.json();

    // Update departments immediately
    if (departmentCategory === "church") {
      setChurchDepartments((prev) => [...prev, addedDepartment]);
      setVisibleChurchCount((prev) => prev + 1);
    } else {
      setCorporateDepartments((prev) => [...prev, addedDepartment]);
      setVisibleCorporateCount((prev) => prev + 1);
    }

    // Immediately trigger success message without relying on state update delay
    setSuccessMessage("Department added successfully!");
    setTimeout(() => setSuccessMessage(null), 2000); // Hide success message after 2 seconds

    // Close the modal after adding the department
    closeDepartmentModal();
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError(error.message || "An error occurred while adding the department.");
    } else {
      setError("An unknown error occurred while adding the department.");
    }
  }
};


  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate(); // Add this to your component

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Toggle roles visibility for each department
  const toggleRolesVisibility = (departmentId: number) => {
    setChurchDepartments((prevDepts) =>
      prevDepts.map((dept) =>
        dept.id === departmentId
          ? { ...dept, showMoreRoles: !dept.showMoreRoles }
          : dept
      )
    );
    setCorporateDepartments((prevDepts) =>
      prevDepts.map((dept) =>
        dept.id === departmentId
          ? { ...dept, showMoreRoles: !dept.showMoreRoles }
          : dept
      )
    );
  };

  // Show 5 more church departments
  const showMoreChurch = () => {
    setVisibleChurchCount((prev) => prev + 5);
  };

  // Show 5 more corporate departments
  const showMoreCorporate = () => {
    setVisibleCorporateCount((prev) => prev + 5);
  };

  // Show all church departments
  const showAllChurch = () => {
    setVisibleChurchCount(churchDepartments.length);
  };

  // Show all corporate departments
  const showAllCorporate = () => {
    setVisibleCorporateCount(corporateDepartments.length);
  };

  // Show less for church departments
  const showLessChurch = () => {
    setVisibleChurchCount(3);
  };

  // Show less for corporate departments
  const showLessCorporate = () => {
    setVisibleCorporateCount(3);
  };

  // Modal handler
  const openModal = (departmentId: number) => {
    setCurrentDepartmentId(departmentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewRoleName("");
    setNewRoleDescription("");
  };

  const handleAddRole = async () => {
    if (currentDepartmentId === null) return;

    const newRole = {
      name: newRoleName,
      description: newRoleDescription,
      department_id: currentDepartmentId,
    };

    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No token found");
      }

      // Perform the POST request to add the new role
      const response = await fetch(`${baseURL}/api/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Include the token in the Authorization header
        },
        body: JSON.stringify(newRole),
      });

      const addedRole = await response.json();

      // Update the roles in the department
      setChurchDepartments((prevDepts) =>
        prevDepts.map((dept) =>
          dept.id === currentDepartmentId
            ? { ...dept, roles: [...dept.roles, addedRole] }
            : dept
        )
      );
      setCorporateDepartments((prevDepts) =>
        prevDepts.map((dept) =>
          dept.id === currentDepartmentId
            ? { ...dept, roles: [...dept.roles, addedRole] }
            : dept
        )
      );

      // Set the success message and automatically hide it after 2 seconds
    setSuccessMessage(`Role "${newRoleName}" added successfully!`);
    
    setTimeout(() => {
      setSuccessMessage(null); // Hide the success message after 2 seconds
    }, 2000);

      closeModal();
    } catch (error) {
      console.error("Error adding role:", error);
      setError("Failed to add role.");
    }
  };

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="roles-page">
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
        {/*{hasPermission("Manage Organization Profile") && <a href="/Organization/edittableProfile">Profile</a>}*/}
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgRolesPage">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts">Manage Accounts</a>}
        {hasPermission("Manage Roles") && <a href="/Organization/roles" className="active">Roles</a>}
        {hasPermission("Manage Permissions") && <a href="/Organization/permissions">Permissions</a>}
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
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Success Card */}
      {successMessage && (
        <div className="success-card">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="button-30">
            Close
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="roles-page-content">

        <OrganizationHeader/><br/>

        <header className="page-header">
          <h1 id="tour-roles-title">Roles</h1>
          <button
            id="tour-start"
            className="add-btn"
            style={{background: "#ffffff", color: "#000000", marginLeft: "10px"}}
            onClick={() => {
              setCurrentStep(0);
              setIsOpen(true);
            }}
          >
            🎥 Take a Tour
          </button>
          <button id="tour-hamburger" className="hamburger" onClick={toggleSidebar}> ☰ </button>
        </header>

        {/* Church Departments */}
        <h1 id="tour-church-section">Church Departments</h1>
        <p>Please ensure to go through all departments before creating a new department...</p>
        <div className="department-grid">
          {churchDepartments.slice(0, visibleChurchCount).map((dept, index) => (
            <div
              key={dept.id}
              className="department-card"
              id={index === 0 ? "tour-department-card" : undefined}
            >
              <div className="department-card-header">
                <h3>{dept.name}</h3>
              </div>

              <div className="department-card-body">
                {dept.roles.slice(0, 3).map((role, index) => (
                  <div
                    key={role.id}
                    className="role-card"
                    id={index === 0 ? "tour-role-card" : undefined}
                  >
                      <div className="role-card-header">
                        <h4>{role.name}</h4>
                      </div>
                      <div className="tooltip">{role.description}</div>
                    </div>
                  ))}

                {/* Show more roles */}
                {dept.roles.length > 3 && dept.showMoreRoles && (
                  <>
                    {dept.roles.slice(3).map((role) => (
                      <div key={role.id} className="role-card">
                        <div className="role-card-header">
                          <h4>{role.name}</h4>
                        </div>
                        <div className="tooltip">{role.description}</div>
                      </div>
                    ))}
                    <button
                      className="button-30"
                      role="button"
                      onClick={() => toggleRolesVisibility(dept.id)}
                    >
                      View Less 
                    </button> &emsp;
                  </>
                )}
                {/* Show less roles */}
                {dept.roles.length > 3 && !dept.showMoreRoles && (
                  <>
                  <button
                    className="button-30"
                    role="button"
                    onClick={() => toggleRolesVisibility(dept.id)}
                  >
                    View More
                  </button>  &emsp;
                  </>
                )}

                {/* Add New Role Button */}
                <button
                  id="tour-add-role"
                  className="button-30 role-add"
                  onClick={() => openModal(dept.id)}
                >
                  + Add New Role
                </button>
              </div>
            </div>
          ))}

            {/* Conditionally show the "Add Department" card */}
            {(churchDepartments.length === 0 || visibleChurchCount === churchDepartments.length || churchDepartments.length > 0) && (
            <div id="tour-add-department" className="department-card add-department-card" onClick={() => openDepartmentModal("church")}>
              <div className="add-department-content">
                <span className="add-icon">+</span>
                <p>Add Department</p>
              </div>
            </div>
          )}
        </div>

        {/* View More and View Less buttons for Church Departments */}
        <div className="view-more-buttons">
          {visibleChurchCount < churchDepartments.length && (
            <>
              <button className="button-30" onClick={showMoreChurch}>
                View 5 More
              </button>&emsp;
              <button className="button-30" onClick={showAllChurch}>
                View All
              </button>&emsp;
            </>
          )}
          {visibleChurchCount > 3 && (
            <button className="button-30" onClick={showLessChurch}>
              View Less
            </button>
          )}
        </div>

        <br />

        {/* Corporate Departments */}

        <h1>Corporate Departments</h1>
        <p>Please ensure to go through all departments before creating a new department...</p>
        <div className="department-grid">
          {corporateDepartments.slice(0, visibleCorporateCount).map((dept) => (
            <div key={dept.id} className="department-card">
              <div className="department-card-header">
                <h3>{dept.name}</h3>
              </div>

              <div className="department-card-body">
                {Array.isArray(dept.roles) && dept.roles.length > 0 ? (
                  <>
                    {dept.roles.slice(0, 3).map((role) => (
                      <div key={role.id} className="role-card">
                        <div className="role-card-header">
                          <h4>{role.name}</h4>
                        </div>
                        <div className="tooltip">{role.description}</div>
                      </div>
                    ))}

                    {/* Show more roles if any */}
                    {dept.roles.length > 3 && dept.showMoreRoles && (
                      <>
                        {dept.roles.slice(3).map((role) => (
                          <div key={role.id} className="role-card">
                            <div className="role-card-header">
                              <h4>{role.name}</h4>
                            </div>
                            <div className="tooltip">{role.description}</div>
                          </div>
                        ))}
                        <button
                          className="button-30"
                          role="button"
                          onClick={() => toggleRolesVisibility(dept.id)}
                        >
                          View Less 
                        </button> &emsp;
                      </>
                    )}

                    {/* Show less roles */}
                    {dept.roles.length > 3 && !dept.showMoreRoles && (
                      <>
                      <button
                        className="button-30"
                        role="button"
                        onClick={() => toggleRolesVisibility(dept.id)}
                      >
                        View More 
                      </button>&emsp;
                      </>
                    )}
                  </>
                ) : (
                  <p>No roles available for this department.</p>
                )}
                {/* Add New Role Button */}
                <button
                  className="button-30 role-add"
                  onClick={() => openModal(dept.id)}
                >
                  + Add New Role
                </button>
              </div>
            </div>
          ))}

          {/* Add Corporate Department Card */}
          {/* Conditionally show the "Add Department" card */}
          {(corporateDepartments.length === 0 || visibleCorporateCount === corporateDepartments.length || corporateDepartments.length > 0) && (
          <div className="department-card add-department-card" onClick={() => openDepartmentModal("corporate")}>
            <div className="add-department-content">
              <span className="add-icon">+</span>
              <p>Add Department</p>
            </div>
          </div>
        )}
        </div>

        {/* View More and View Less buttons for Corporate Departments */}
        <div className="view-more-buttons">
          {visibleCorporateCount < corporateDepartments.length && (
            <>
              <button className="button-30" onClick={showMoreCorporate}>
                View 5 More
              </button>&emsp;
              <button className="button-30" onClick={showAllCorporate}>
                View All
              </button>&emsp;
            </>
          )}
          {visibleCorporateCount > 3 && (
            <button className="button-30" onClick={showLessCorporate}>
              View Less
            </button>
          )}
        </div>
      </div>

      {/* Modal for Adding Role */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Role</h2>
            <input
              type="text"
              placeholder="Role Name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <textarea
              placeholder="Role Description"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
            />
            <button onClick={handleAddRole} className="add-role-btn">Add Role</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modal for Adding Department */}
      {departmentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Department ({departmentCategory.charAt(0).toUpperCase() + departmentCategory.slice(1)})</h2>
            <input
              type="text"
              placeholder="Department Name"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
            />
            <textarea
              placeholder="Department Description"
              value={newDepartmentDescription}
              onChange={(e) => setNewDepartmentDescription(e.target.value)}
            />
            <button onClick={handleAddDepartment} className="add-role-btn">Add Department</button>
            <button onClick={closeDepartmentModal}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default function RolesPageWithTour() {
  return (
    <TourProvider
      steps={RolesPageSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
      /*styles={{
        popover: (base) => ({
          ...base,
          maxHeight: "80vh",      // limit height
          overflowY: "auto",      // enable vertical scroll
          paddingRight: "10px",   // avoid scrollbar overlap
        }),
      }}*/
    >
      <RolesPage />
    </TourProvider>
  );
}
