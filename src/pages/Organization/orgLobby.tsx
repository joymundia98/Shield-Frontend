import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api"; // Import orgFetch
import profile_icon from '../../assets/profile_icon.png';
import "./OrgLobby.css";
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import { TourProvider, useTour } from "@reactour/tour";

const baseURL = import.meta.env.VITE_BASE_URL;

interface LobbyUser {
  id: number;
  name: string;
  imageSrc: string;
  altText: string;
  status: string | null;
}

/*======================
TOUR STEPS
=======================*/
const lobbyTourSteps = [
  {
    selector: "#tour-hamburger",
    content: (
      <>
        <h3>Navigation Menu</h3>
        <p>
          Open the Organization Manager sidebar from here.
        </p>
        <p>
          Use it to manage roles, admins, permissions,
          and return to the main dashboard.
        </p>
        <p>
          On smaller screens, this becomes your primary navigation tool.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-start",
    content: (
      <>
        <h3>Restart This Tour</h3>
        <p>
          Click here anytime to relaunch this guided walkthrough.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-lobby-guide",
    content: (
      <>
        <h3>The Lobby Overview</h3>
        <p>
          The Lobby displays users waiting for approval
          to join your organization.
        </p>
        <p>
          Review each registration carefully before confirming access.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-lobby-cards",
    content: (
      <>
        <h3>Pending User Cards</h3>
        <p>
          Each card represents a user with a
          <strong> pending</strong> or <strong>unverified</strong> status.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-approve",
    content: (
      <>
        <h3>Approve User</h3>
        <p>
          Approving activates the account and grants system access.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-reject",
    content: (
      <>
        <h3>Reject User</h3>
        <p>
          Rejecting marks the account inactive.
        </p>
        <p>
          This action will deactivate the account.
          It can later be reactivated in the Manage Accounts tab.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-confirmation-modal",
    content: (
      <>
        <h3>Confirmation Required</h3>
        <p>
          Every approval or rejection must be confirmed here
          before being finalized.
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

const OrgLobby: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [_users, setUsers] = useState<LobbyUser[]>([]); // All users (including all statuses)
  const [filteredUsers, setFilteredUsers] = useState<LobbyUser[]>([]); // Filtered users (only pending or null)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);

  //Tour
  const { setIsOpen, setCurrentStep } = useTour();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<LobbyUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  //Automatically Open the modal during the tour
  const { currentStep, isOpen } = useTour();
  const [modalAutoOpened, setModalAutoOpened] = useState(false);

  // Auto-open modal when reaching the confirmation step
  useEffect(() => {
  const confirmationStepIndex = 6;

  if (
    currentStep === confirmationStepIndex &&
    filteredUsers.length > 0 &&
    !modalOpen &&
    !modalAutoOpened &&
    isOpen // ✅ only auto-open if the tour is still open
  ) {
    const firstUser = filteredUsers[0];
    setSelectedUser(firstUser);
    setActionType("approve"); // or "reject"
    setModalOpen(true);
    setModalAutoOpened(true); // mark as auto-opened
  }
}, [currentStep, filteredUsers, modalOpen, modalAutoOpened, isOpen]);

  // Close modal when moving away from the confirmation step
  // Close modal when leaving the confirmation step or when the tour ends
  useEffect(() => {
  const confirmationStepIndex = 6;

  if ((currentStep !== confirmationStepIndex || !isOpen) && modalOpen && modalAutoOpened) {
    setModalOpen(false);
    setModalAutoOpened(false); // reset flag
  }
}, [currentStep, isOpen, modalOpen, modalAutoOpened]);

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
    navigate(`/Organization/viewUser/${id}`);
  };

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
          <button className="hamburger" onClick={toggleSidebar} id="tour-hamburger"> ☰ </button>
            <button
              className={`add-btn ${isPulsating ? 'pulsating' : ''}`}
              id="tour-start"
              style={{ background: "#ffffff", color: "#000000", marginLeft: "10px"}}
              onClick={() => {
                setCurrentStep(0);
                setIsOpen(true);
              }}
            >
              🎥 Take a Tour
          </button>
        </header>

        {/* Lobby Guide */}
        <h3 className="lobby-guide" id="tour-lobby-guide">
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
        <div className="lobbyContainer" id="tour-lobby-cards">
          {error && <div className="error">{error}</div>}

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div key={user.id} className="lobbyCard">
                {/* Use user.id as key for better reconciliation */}
                <img
                  src={user.imageSrc}
                  alt={user.altText}
                  className="lobbyCard-image"
                />

                <div className="lobbyCard-content">
                  <h3 className="lobbyCard-name">{user.name}</h3>

                  <div className="lobbyCard-buttons">
                    {/* Tour IDs only applied to first card for Reactour targeting */}
                    <button
                      id={index === 0 ? "tour-approve" : undefined}
                      className="approve-btn"
                      onClick={() => handleApprove(user)}
                    >
                      Approve
                    </button>

                    <button
                      id={index === 0 ? "tour-reject" : undefined}
                      className="reject-btn"
                      onClick={() => handleReject(user)}
                    >
                      Reject
                    </button>

                    <button
                      id={index === 0 ? "tour-view" : undefined}
                      className="add-btn"
                      onClick={() => openViewUser(user.id)}
                    >
                      View
                    </button>
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
                  style={{
                    backgroundColor: actionType === "approve" ? "#28a745" : "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 14,
                    boxShadow: "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset"
                  }}
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

export default function OrgLobbyWithTour() {
  return (
    <TourProvider
      steps={lobbyTourSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <OrgLobby />
    </TourProvider>
  );
}