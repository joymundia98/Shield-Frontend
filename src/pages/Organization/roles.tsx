import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./roles.css";

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
}

const RolesPage: React.FC = () => {
  const [churchDepartments, setChurchDepartments] = useState<Department[]>([]);
  const [corporateDepartments, setCorporateDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Static roles data (for demonstration purposes)
  const staticRoles: Role[] = [
    { id: 1, name: "Role 1", description: "Role 1 description" },
    { id: 2, name: "Role 2", description: "Role 2 description" },
    { id: 3, name: "Role 3", description: "Role 3 description" },
    { id: 4, name: "Role 4", description: "Role 4 description" },
    { id: 5, name: "Role 5", description: "Role 5 description" },
    { id: 6, name: "Role 6", description: "Role 6 description" },
  ];

  // State for visible cards
  const [visibleChurchCount, setVisibleChurchCount] = useState(3); // Start with showing 3
  const [visibleCorporateCount, setVisibleCorporateCount] = useState(3); // Start with showing 3

  // Function to fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/api/departments`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }

      const data: Department[] = await response.json();

      // Categorize departments
      const churchDepts = data
        .filter((dept) => dept.category === "church")
        .map((dept) => ({
          ...dept,
          roles: staticRoles,
          showMoreRoles: false, // Default state to hide extra roles
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort church departments alphabetically

      const corporateDepts = data
        .filter((dept) => dept.category === "corporate")
        .map((dept) => ({
          ...dept,
          roles: staticRoles,
          showMoreRoles: false, // Default state to hide extra roles
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort corporate departments alphabetically

      setChurchDepartments(churchDepts);
      setCorporateDepartments(corporateDepts);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching departments.");
      setLoading(false);
    }
  }, []);

  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate();  // Add this to your component

  //const [authToken, setAuthToken] = useState<string | null>(null);
  //const [organization, setOrganization] = useState<any | null>(null);

  // Fetch token and organization data
  {/*useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      console.log("No authToken found in localStorage");
    }

    const savedOrg = localStorage.getItem("organization");
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      setOrganization(parsedOrg);
    } else {
      console.log("No organization data found in localStorage.");
    }
  }, []);*/}

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
        <a href="/Organization/edittableProfile">Profile</a>
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/ListedAccounts">Accounts Tracker</a>
        <a href="/Organization/roles" className="active">Roles</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Content */}
      <div className="roles-page-content">
        <header className="page-header">
          <h1>Roles</h1>
          <button className="hamburger" onClick={toggleSidebar}> ☰ </button>
        </header>

        {/* Church Departments */}
        <h1>Church Departments</h1>
        <div className="department-grid">
          {churchDepartments.slice(0, visibleChurchCount).map((dept) => (
            <div key={dept.id} className="department-card">
              <div className="department-card-header">
                <h3>{dept.name}</h3>
              </div>
              <div className="department-card-body">
                {dept.roles
                  .slice(0, 3) // Show the first 3 roles
                  .map((role) => (
                    <div key={role.id} className="role-card">
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
                    </button>
                  </>
                )}
                {/* Show less roles */}
                {dept.roles.length > 3 && !dept.showMoreRoles && (
                  <button
                    className="button-30"
                    role="button"
                    onClick={() => toggleRolesVisibility(dept.id)}
                  >
                    View More
                  </button>
                )}
              </div>
            </div>
          ))}
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
        <div className="department-grid">
          {corporateDepartments.slice(0, visibleCorporateCount).map((dept) => (
            <div key={dept.id} className="department-card">
              <div className="department-card-header">
                <h3>{dept.name}</h3>
              </div>
              <div className="department-card-body">
                {dept.roles
                  .slice(0, 3) // Show the first 3 roles
                  .map((role) => (
                    <div key={role.id} className="role-card">
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
                    </button>
                  </>
                )}
                {/* Show less roles */}
                {dept.roles.length > 3 && !dept.showMoreRoles && (
                  <button
                    className="button-30"
                    role="button"
                    onClick={() => toggleRolesVisibility(dept.id)}
                  >
                    View More
                  </button>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default RolesPage;
