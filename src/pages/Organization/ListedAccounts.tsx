import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api";
import "../../styles/global.css";
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import { TourProvider, useTour } from "@reactour/tour";
interface User {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  status: "active" | "pending" | "inactive";
  role_id?: number; // Added role_id to track assigned role
  fullName?: string;
}

interface UserStatusCategories {
  [status: string]: User[];
}

interface Role {
  id: number;
  name: string;
}

const baseURL = import.meta.env.VITE_BASE_URL;

/*======================
TOUR STEPS
=======================*/
const UserTrackerPageSteps = [
  {
    selector: "#tour-hamburger",
    content: (
      <>
        <h3>Navigation Menu</h3>
        <p>Access the Organization Manager sidebar here.</p>
        <p>The hamburger menu offers an alternative navigation to the header.</p>
        <p>Quick access to roles, permissions, admin accounts, and the dashboard.</p>
        <p>On small screens, it becomes the primary navigation method for all sections.</p>
      </>
    ),
  },
  {
    selector: "#tour-start",
    content: (
      <>
        <h3>Restart This Tour</h3>
        <p>
          Click here anytime to relaunch this walkthrough.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-search-filter",
    content: (
      <>
        <h3>Search & Filter</h3>
        <p>
          Search users by name or filter them by status:
          Active, Pending, or Inactive.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-user-table",
    content: (
      <>
        <h3>User Table</h3>
        <p>
          This table displays all users grouped by status.
        </p>
        <p>
          You can view details, change status, and assign roles here.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-status-button",
    content: (
      <>
        <h3>Change User Status</h3>
        <p>
          Quickly update a user’s account to Active, Pending, or Inactive.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-role-dropdown",
    content: (
      <>
        <h3>User Roles & Access</h3>
        <p>
          A user’s <strong>role</strong> determines their level of access 
          within the system.
        </p>
        <p>
          If the existing roles are not sufficient, you can create 
          <strong> custom roles</strong> in the Roles tab.
        </p>
        <p>
          You can then assign specific <strong>permissions</strong> to those 
          roles in the Permissions tab to fully customize access control.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-role-modal",
    content: (
      <>
        <h3>Role Confirmation</h3>
        <p>
          Confirm the role assignment before it is saved.
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

const UserTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [userCategories, setUserCategories] = useState<UserStatusCategories>({
    active: [],
    pending: [],
    inactive: [],
  });

  const [roles, setRoles] = useState<Role[]>([]); // State for roles
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  //Tour
  const { setIsOpen, setCurrentStep } = useTour();

  // Pagination states
  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  // RoleAssignModal states
  const [isRoleAssignModalOpen, setIsRoleAssignModalOpen] = useState(false);
  const [RoleAssignModalMessage, setRoleAssignModalMessage] = useState('');
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Success Card state
  const [showSuccessCard, setShowSuccessCard] = useState(false); // New success card state

  // Fetch token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      console.log("No authToken found in localStorage");
    }
  }, []);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      if (!authToken) return;

      try {
        const response = await orgFetch(`${baseURL}/api/roles`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (Array.isArray(response)) {
          setRoles(response.sort((a: Role, b: Role) => a.name.localeCompare(b.name)));
        } else {
          setError("Failed to fetch roles.");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("There was an error fetching roles.");
      }
    };

    fetchRoles();
  }, [authToken]);

  // Fetch users based on token and organization
  const fetchUsers = useCallback(async () => {
    if (!authToken) {
      setError("No authToken found, please log in.");
      navigate("/login");
      return;
    }

    try {
      const response = await orgFetch(`${baseURL}/api/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const categorizedUsers: UserStatusCategories = {
        active: [],
        pending: [],
        inactive: [],
      };

      response.forEach((user: any) => {
        const formattedUser: User = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          position: user.position,
          status: user.status,
          role_id: user.role_id, // Added role_id to user
          fullName: `${user.first_name} ${user.last_name}`,
        };

        if (user.status === "active") {
          categorizedUsers.active.push(formattedUser);
        } else if (user.status === "pending") {
          categorizedUsers.pending.push(formattedUser);
        } else if (user.status === "inactive") {
          categorizedUsers.inactive.push(formattedUser);
        }
      });

      setUserCategories(categorizedUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("There was an error fetching users.");
      setLoading(false);
    }
  }, [authToken, navigate]);

  useEffect(() => {
    if (authToken) {
      fetchUsers();
    }
  }, [authToken, fetchUsers]);

  // Apply search query and filter (status) together
  const filteredUsers = useMemo(() => {
    let filtered: User[] = [];

    // Filter users based on selectedFilter (active, pending, inactive, or all)
    if (selectedFilter === "all") {
      filtered = [
        ...userCategories.active,
        ...userCategories.pending,
        ...userCategories.inactive,
      ];
    } else {
      filtered = userCategories[selectedFilter] || [];
    }

    // Further filter based on searchQuery
    return filtered.filter((user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userCategories, selectedFilter, searchQuery]);

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const openViewUser = (id: number) => {
    window.open(`/Organization/viewUser/${id}`, "_blank");
  };

  const handleRoleSelection = (user: User, newRoleId: number) => {
  const selectedRole = roles.find((role) => role.id === newRoleId);
  if (!selectedRole) return;

  // Check if there's already a role assigned
  if (!user.role_id) {
    // If no role is assigned, show the modal asking for assignment
    setRoleAssignModalMessage(`Do you want to assign the role "${selectedRole.name}" to ${user.first_name} ${user.last_name}?`);
  } else {
    // If a role is assigned, show the modal asking for confirmation to change the role
    const currentRole = roles.find((role) => role.id === user.role_id);
    setRoleAssignModalMessage(`Are you sure you want to change the role of ${user.first_name} ${user.last_name} from "${currentRole?.name}" to "${selectedRole.name}"?`);
  }

  // Set up the state for the user to update and the selected role ID
  setUserToUpdate(user);
  setSelectedRoleId(newRoleId);
  setIsRoleAssignModalOpen(true); // This opens the modal
};


  const handleConfirmRoleChange = async () => {
  if (!userToUpdate || selectedRoleId === null || !authToken) return;

  console.log("Updating user:", userToUpdate);
  console.log("New Role ID:", selectedRoleId);

  try {
    const response = await orgFetch(`${baseURL}/api/users/${userToUpdate.id}/role`, {
      method: "PATCH", // Use PATCH for updating
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role_id: selectedRoleId }),
    });

    // Check if the response contains the updated user data
    if (response && response.role_id === selectedRoleId) {
      // Immediately update the user categories without re-fetching users
      setUserCategories((prevCategories) => {
        const updatedCategories = { ...prevCategories };
        for (const status in updatedCategories) {
          const userIndex = updatedCategories[status as keyof UserStatusCategories].findIndex(
            (user) => user.id === userToUpdate.id
          );
          if (userIndex !== -1) {
            updatedCategories[status as keyof UserStatusCategories][userIndex] = {
              ...updatedCategories[status as keyof UserStatusCategories][userIndex],
              role_id: selectedRoleId, // Update the user's role
            };
            break;
          }
        }
        return updatedCategories;
      });

      // Show success card after successful role update
      setShowSuccessCard(true);
      setTimeout(() => setShowSuccessCard(false), 3000); // Hide after 3 seconds
    } else {
      setError("Failed to update user role: Role ID mismatch.");
    }
  } catch (err) {
    console.error("Error updating role:", err);
    setError("Error updating user role.");
  }

  // Close the RoleAssignModal
  setIsRoleAssignModalOpen(false);
  setUserToUpdate(null);
  setSelectedRoleId(null);
};

  const handleCancelRoleChange = () => {
    setIsRoleAssignModalOpen(false);
    setUserToUpdate(null);
    setSelectedRoleId(null);
  };

  const handleStatusChange = async (userId: number, newStatus: "active" | "pending" | "inactive") => {
    if (!authToken) return;

    try {
      setUserCategories((prevCategories) => {
        const updatedCategories = { ...prevCategories };

        for (const status in updatedCategories) {
          const userIndex = updatedCategories[status as keyof UserStatusCategories].findIndex(user => user.id === userId);
          if (userIndex !== -1) {
            const updatedUser = {
              ...updatedCategories[status as keyof UserStatusCategories][userIndex],
              status: newStatus
            };

            updatedCategories[status as keyof UserStatusCategories].splice(userIndex, 1);
            updatedCategories[newStatus].push(updatedUser);
            break;
          }
        }

        return updatedCategories;
      });

      const response = await orgFetch(`${baseURL}/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(`Failed to update user status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error updating user status.");
    }
  };

  // Handle View More functionality
  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(Infinity);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  const handleCSVUpload = () => {
    // Navigate to UploadUsers page directly
    navigate("/UploadUsers");
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button className="hamburger" id="tour-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgAdminAccounts">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts" className="active">Manage Accounts</a>}
        {hasPermission("Manage Roles") && <a href="/Organization/roles">Roles</a>}
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

        <OrganizationHeader/><br/>

        <header className="page-header user-header">
          <h1>User Management</h1>
          <div className="header-buttons">
            <button
              className="add-btn"
              id="tour-start"
              style={{background: "#ffffff", color: "#000000", marginLeft: "10px"}}
              onClick={() => {
                setCurrentStep(0);
                setIsOpen(true);
              }}
            >
              🎥 Take a Tour
            </button>&emsp;
            <button className="add-btn" onClick={() => navigate("/Create_new_User")}>+ &nbsp; New User</button>
            &emsp;
            <button className="upload-btn" onClick={handleCSVUpload}>
              📤 Upload CSV
            </button>
          </div>
        </header>

        {/* Error or loading state */}
        {error && <div className="error">{error}</div>}
        {loading && <p>Loading users...</p>}

        {/* Success Card */}
        {showSuccessCard && (
          <div className="success-card">
            Role updated successfully!
          </div>
        )}

        <br /><br />

        {/* Search and Filter */}
        <div className="user-filter-box" id="tour-search-filter">
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
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <br />
        {/* GROUPED TABLE RENDERING */}
        {["active", "pending", "inactive"].map((status) => {
          if (selectedFilter !== "all" && selectedFilter !== status) return null;

          const users = filteredUsers.filter((user) => user.status === status);

          return (
            <div key={status}>
              <h2>{status.charAt(0).toUpperCase() + status.slice(1)} Users</h2>
              {users.length > 0 ? (
                <table className="responsive-table" id="tour-user-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Position</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, recordsToShow).map((user) => (
                      <tr key={user.id}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.position}</td>
                        <td>
                          {user.role_id ? (
                            roles.find(role => role.id === user.role_id)?.name
                          ) : (
                            "⚠️ No role Assigned"
                          )}
                        </td>
                        <td>
                          <button className="add-btn" onClick={() => openViewUser(user.id)}>
                            View
                          </button>
                          &emsp;

                          {/* Action Buttons */}
                          {user.status !== "active" && (
                            <>
                            <button
                              className="user-status-btn active"
                              id="tour-status-button"
                              onClick={() => handleStatusChange(user.id, "active")}
                            >
                              Set Active
                            </button>&emsp;
                            </>
                          )}
                          {user.status !== "pending" && (
                            <>
                            <button
                              className="user-status-btn pending"
                              onClick={() => handleStatusChange(user.id, "pending")}
                            >
                              Set Pending
                            </button>&emsp;
                            </>
                          )}
                          {user.status !== "inactive" && (
                            <>
                            <button
                              className="user-status-btn inactive"
                              onClick={() => handleStatusChange(user.id, "inactive")}
                            >
                              Set Inactive
                            </button>&emsp;
                            </>
                          )}

                          {/* Role Editing */}
                          {user.role_id ? (
                            <select
                              id="tour-role-dropdown"
                              value={user.role_id}
                              onChange={(e) => handleRoleSelection(user, parseInt(e.target.value))}
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              onChange={(e) => handleRoleSelection(user, parseInt(e.target.value))}
                            >
                              <option value="">Assign Role</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found under this category.</p>
              )}

              {/* View More/Less */}
              <button onClick={showAll ? handleViewLess : handleViewMore} className="add-btn">
                {showAll ? "View Less" : "View More"}
              </button>
              <br /><br />
            </div>
          );
        })}
      </div>

      {/* RoleAssignModal */}
      {isRoleAssignModalOpen && (
        <div className="RoleAssignModal" id="tour-role-modal">
          <div className="RoleAssignModal-content">
            <p>{RoleAssignModalMessage}</p>
            <div className="RoleAssignModal-actions">
              <button onClick={handleCancelRoleChange} className="cancelRoleAssignment">Cancel</button>
              <button onClick={handleConfirmRoleChange} className="confirmRole">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function UserTrackerPageWithTour() {
  return (
    <TourProvider
      steps={UserTrackerPageSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <UserTrackerPage />
    </TourProvider>
  );
}