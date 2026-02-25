import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api"; // Import orgFetch
import profile_icon from '../../assets/profile_icon.png';
import "./OrgLobby.css";
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

const baseURL = import.meta.env.VITE_BASE_URL;

interface LobbyUser {
  id: number;
  name: string;
  imageSrc: string;
  altText: string;
  status: string | null;
}

const OrgLobby: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [_users, setUsers] = useState<LobbyUser[]>([]); // All users (including all statuses)
  const [filteredUsers, setFilteredUsers] = useState<LobbyUser[]>([]); // Filtered users (only pending or null)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<LobbyUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Fetch token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      console.log("No authToken found in localStorage");
    }
  }, []);

  // Load organization data from localStorage
  // Old Logic
  /*useEffect(() => {
    const savedOrg = localStorage.getItem('organization');
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      setOrganization(parsedOrg);
    } else {
      console.log('No organization data found in localStorage.');
    }
  }, []);*/

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setOrganization({ id: parsedUser.organization_id }); 
    } else {
      console.log("No user data found in localStorage.");
    }
  }, []);

  // Function to fetch users from the API
  const fetchUsers = useCallback(async () => {
  console.log('Fetching users with authToken:', authToken);

  if (!authToken) {
    setError("No authToken found, please log in.");
    navigate("/login");
    return;
  }

  const orgId = organization ? organization.id : null;
  if (!orgId) {
    setError("No organization found.");
    return;
  }

  try {
    const response = await orgFetch(`${baseURL}/api/users`);
    console.log('Fetched users response:', response);

    // Manually filter the users by the organization_id (frontend filtering)
    const filteredUsersByOrg = response.filter((user: any) => user.organization_id === orgId);

    const formattedUsers = filteredUsersByOrg.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      imageSrc: profile_icon,
      altText: `${user.first_name} ${user.last_name}`,
      status: user.status, // Ensure status is included in the response
    }));

    setUsers(formattedUsers);
    // Initially, filter users by 'pending' or 'null' status
    setFilteredUsers(formattedUsers.filter((user: any) => user.status === "pending" || user.status === null));
    setLoading(false);
  } catch (err) {
    console.error('Error fetching users:', err);
    setError("There was an error fetching users.");
    setLoading(false);
  }
}, [authToken, navigate, organization]);


  // Fetch users when authToken and organization are ready
  useEffect(() => {
    if (authToken && organization) {
      fetchUsers();
    }
  }, [authToken, organization, fetchUsers]);

  // Handle approve action
  const handleApprove = (user: LobbyUser) => {
    setSelectedUser(user);
    setActionType("approve");
    setModalOpen(true);
  };

  // Handle reject action
  const handleReject = (user: LobbyUser) => {
    setSelectedUser(user);
    setActionType("reject");
    setModalOpen(true);
  };

  // Handle status update (approve/reject) and UI refresh
  const handleStatusUpdate = async (user: LobbyUser, action: "approve" | "reject") => {
    if (!authToken || !organization) return;

    const updatedStatus = action === "approve" ? "active" : "inactive";

    try {
      // Update user status in the database
      const response = await orgFetch(`${baseURL}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: updatedStatus })
      });

      console.log('Updated user response:', response);  // Log the response to verify

      if (response && response.status === updatedStatus) {
        console.log(`User ${user.name} status updated to ${updatedStatus}`);

        // Re-fetch users after a status update to get the latest state
        fetchUsers();  // This will re-fetch all users, including updated status
      } else {
        console.error("Failed to update status:", response);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setModalOpen(false); // Close the modal after the action
    }
  };

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Open the view visitor page in a new tab
  const openViewUser = (id: number) => {
    console.log('User ID from URL:', id);
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
        {/*{hasPermission("Manage Organization Profile") && <a href="/Organization/edittableProfile">Profile</a>}*/}
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby" className="active">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgAdminAccounts">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts">Manage Accounts</a>}
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
          </a>
        )}
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">

        <OrganizationHeader/><br/>

        <header className="page-header">
          <h1>The Lobby</h1>
          <button className="hamburger" onClick={toggleSidebar}> ☰ </button>
        </header>

        {/* Lobby Guide */}
        <h3 className="lobby-guide">
          <br />
          {organization ? (
            <>
              <h3>Welcome to {organization.name}</h3><br />
              <p>The users listed below are presently in the lobby.<br />
                Please take a moment to review and either confirm or reject their account registration.<br/>
                <br/>
                Please refresh your browser regularly to get the latest users. Thank you...
              </p>
            </>
          ) : (
            <p>Loading organization data...</p>
          )}
        </h3><br />

        {organization && (
          <div className="organization-info">
            {/* Render any additional organization info here */}
          </div>
        )}

        {/* User Lobby Cards */}
        <div className="lobbyContainer">
          {error && <div className="error">{error}</div>}

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, _index) => (
              <div key={user.id} className="lobbyCard"> {/* Use user.id as key for better reconciliation */}
                <img src={user.imageSrc} alt={user.altText} className="lobbyCard-image" />
                <div className="lobbyCard-content">
                  <h3 className="lobbyCard-name">{user.name}</h3>
                  <div className="lobbyCard-buttons">
                    <button className="approve-btn" onClick={() => handleApprove(user)}>Approve</button>
                    <button className="reject-btn" onClick={() => handleReject(user)}>Reject</button>
                    <button className="add-btn" onClick={() => openViewUser(user.id)}>View</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No users in the lobby with pending or null status.</p>
          )}
        </div>

        {/* Confirmation Modal for Approve/Reject */}
        {modalOpen && selectedUser && actionType && (
          <div className="confirmation-modal">
            <div className="modal-content org-modal-content">
              <h2>{actionType === "approve" ? "Approve this user?" : "Reject this user?"}</h2>
              <p>This action cannot be undone. Are you sure you want to proceed?</p>
              <div className="modal-buttons">
                <button onClick={() => setModalOpen(false)} className="cancel-btn">Cancel</button>
                <button
                  onClick={async () => {
                    await handleStatusUpdate(selectedUser, actionType);
                  }}
                  className={actionType === "approve" ? "approve-btn" : "reject-btn"}
                >
                  {actionType === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgLobby;
