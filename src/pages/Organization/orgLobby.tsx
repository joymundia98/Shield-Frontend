import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './OrgLobby.css';
import johnImage from '../../assets/Man.jpg';
//import janeImage from '../../assets/girl.jpg';
//import davidImage from '../../assets/Man2.jpg';

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
  const [jwtToken, _setJwtToken] = useState<string | null>(localStorage.getItem("jwt"));
  const [organization, setOrganization] = useState<any | null>(null); // Store organization data

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    console.log('JWT Token from localStorage:', jwtToken); // Debug log to check token from localStorage
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen, jwtToken]);

  const fetchUsers = useCallback(async () => {
    console.log('Fetching users with JWT:', jwtToken); // Debug log: Check the token being used

    if (!jwtToken) {
      setError("No JWT token found, please log in.");
      navigate("/login");
      return;
    }

    // Check organization ID
    const orgId = organization ? organization.id : null;
    if (!orgId) {
      setError("No organization found.");
      return;
    }

    try {
      const response = await axios.get("${baseURL}/api/users", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        params: {
          organization_id: orgId, // Pass organization_id as a parameter
        },
      });

      console.log('Fetched users response:', response.data); // Log the full response

      const allUsers = response.data;
      if (allUsers.length === 0) {
        console.log('No users found for the organization.');
      }

      // Filter users with status "pending" or null
      const filteredUsers = allUsers.filter(
        (user: any) => user.status === "pending" || user.status === null
      );

      console.log('Filtered users:', filteredUsers); // Log filtered users

      const formattedUsers = filteredUsers.map((user: any) => ({
        name: `${user.first_name} ${user.last_name}`,
        imageSrc: johnImage, // Use actual user images or a default one
        altText: `${user.first_name} ${user.last_name}`,
      }));

      setUsers(formattedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError("There was an error fetching users.");
      setLoading(false);
    }
  }, [jwtToken, navigate, organization]);

  useEffect(() => {
    if (jwtToken) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [jwtToken, fetchUsers]);

  useEffect(() => {
    const savedOrg = localStorage.getItem('organization');
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      console.log('Organization loaded from localStorage:', parsedOrg);
      setOrganization(parsedOrg);  // Store the organization data in state
    } else {
      console.log('No organization data found in localStorage.');
    }
  }, []);

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

        {/* Display Organization Name */}
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
