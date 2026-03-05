import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api"; // API fetch function
import profile_icon from "../../assets/profile_icon.png"; // Profile image for the card
import "./OrgLobby.css"; // Import the OrgLobby styles
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions
import { TourProvider, useTour } from "@reactour/tour";

const baseURL = import.meta.env.VITE_BASE_URL;

interface AdminAccount {
  id: number;
  email: string;
  status: string;
}

/*======================
TOUR STEPS
=======================*/
const AdminAccountsSteps = [
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
    selector: "#tour-create-admin",
    content: (
      <>
        <h3>Create Administrator Account</h3>
        <p>
          Use this button to create a new Administrator account.
        </p>
        <p>
          Administrators have <strong>complete system access</strong>, including:
        </p>
        <ul>
          <li>Managing all organization users</li>
          <li>Creating and editing roles</li>
          <li>Assigning permissions</li>
          <li>Accessing all dashboards and modules</li>
        </ul>
        <p>
          Only grant this role to highly trusted users.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-admin-container",
    content: (
      <>
        <h3>Administrator Accounts</h3>
        <p>
          This section displays all users assigned the <strong>Administrator</strong> role.
        </p>
        <p>
          Administrator accounts have <strong>full access to the entire system</strong>.
        </p>
        <p>
          They can manage users, roles, permissions, organization settings,
          and access all dashboards and system features.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-admin-card",
    content: (
      <>
        <h3>Admin Account Card</h3>
        <p>
          Each card shows the administrator’s email address.
        </p>
        <p>
          Click <strong>View</strong> to open that user’s full profile in a new tab.
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

const AdminAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]); // Admin accounts list
  const [organization, setOrganization] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminRoleId, setAdminRoleId] = useState<number | null>(null); // Store the Administrator role id

  //Tour
  const { setIsOpen, setCurrentStep } = useTour();

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
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setOrganization({ id: parsedUser.organization_id });
      fetchRoles();
    } else {
      setError("User data not found.");
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
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgAdminAccounts" className="active">Admin Accounts</a>}
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
          </a>)}
          <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">

        <OrganizationHeader/><br/>

        <header className="page-header">
          <h1>Admin Accounts for {organization?.name}</h1>
          {/* Create Admin Account button moved here */}
          <button
              className={`add-btn ${isPulsating ? 'pulsating' : ''}`}
              id="tour-start"
              style={{background: "#ffffff", color: "#000000", marginLeft: "10px"}}
              onClick={() => {
                setCurrentStep(0);
                setIsOpen(true);
              }}
            >
              🎥 Take a Tour
            </button> &emsp;

          <button onClick={handleCreateAdminAccount} className="create-admin-account-btn" id="tour-create-admin">
            + &nbsp; Create Admin Account
          </button>
          {/* Hamburger menu */}
          <button id="tour-hamburger" className="hamburger" onClick={toggleSidebar}> ☰ </button>
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
            <div className="lobbyContainer" id="tour-admin-container">
              {adminAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="lobbyCard"
                  id={index === 0 ? "tour-admin-card" : undefined}
                >
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


export default function AdminAccountsWithTour() {
  return (
    <TourProvider
      steps={AdminAccountsSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <AdminAccounts />
    </TourProvider>
  );
}
