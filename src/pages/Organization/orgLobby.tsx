import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api"; // Import orgFetch
import johnImage from '../../assets/Man.jpg';

const baseURL = import.meta.env.VITE_BASE_URL;

interface LobbyUser {
  name: string;
  imageSrc: string;
  altText: string;
}

const OrgLobby: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LobbyUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [authToken, setAuthToken] = useState<string | null>(null);

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
  useEffect(() => {
    const savedOrg = localStorage.getItem('organization');
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      setOrganization(parsedOrg);
    } else {
      console.log('No organization data found in localStorage.');
    }
  }, []);

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
      const response = await orgFetch(`${baseURL}/api/users?organization_id=${orgId}`);
      console.log('Fetched users response:', response);

      const filteredUsers = response.filter((user: any) => user.status === "pending" || user.status === null);

      const formattedUsers = filteredUsers.map((user: any) => ({
        name: `${user.first_name} ${user.last_name}`,
        imageSrc: johnImage,
        altText: `${user.first_name} ${user.last_name}`,
      }));

      setUsers(formattedUsers);
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

  return (
    <div className="dashboard-wrapper">
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
        <a href="/Organization/orgLobby" className="active">The Lobby</a>
        <a href="/Organization/ListedAccounts">Accounts Tracker</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      <div className="dashboard-content">
        <header className="page-header">
          <h1>The Lobby</h1>
          <button className="hamburger" onClick={toggleSidebar}> ☰ </button>
        </header>

        <h3 className="lobby-guide">
          The users listed below are presently in the lobby.<br />
          Please take a moment to review and either confirm or reject their account registration.
        </h3>

        {organization && (
          <div className="organization-info">
            <h3>Welcome to {organization.name}</h3>
            <p>Status: {organization.status}</p>
          </div>
        )}

        <div className="lobbyContainer">
          {error && <div className="error">{error}</div>} 

          {loading ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            users.map((user, index) => (
              <div key={index} className="lobbyCard">
                <img src={user.imageSrc} alt={user.altText} className="lobbyCard-image" />
                <div className="lobbyCard-content">
                  <h3 className="lobbyCard-name">{user.name}</h3>
                  <div className="lobbyCard-buttons">
                    <button className="approve-btn">Approve</button>
                    <button className="reject-btn">Reject</button>
                    <button className="add-btn">View</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No users in the lobby with pending or null status.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgLobby;
