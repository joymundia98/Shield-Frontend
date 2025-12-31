import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { orgFetch } from "../../utils/api";
import "../../styles/global.css";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  status: "active" | "pending" | "inactive";
  fullName?: string;
}

interface UserStatusCategories {
  [status: string]: User[];
}

const baseURL = import.meta.env.VITE_BASE_URL;

const UserTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [userCategories, setUserCategories] = useState<UserStatusCategories>({
    active: [],
    pending: [],
    inactive: [],
  });

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Pagination states
  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  // Fetch token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      console.log("No authToken found in localStorage");
    }
  }, []);

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

      console.log("Fetched users response:", response);

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
    // Filter users based on selectedFilter and searchQuery
    let filtered = selectedFilter === "all"
      ? [
          ...userCategories.active,
          ...userCategories.pending,
          ...userCategories.inactive,
        ]
      : userCategories[selectedFilter] || [];

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

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(Infinity); // Display all records
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5); // Reset to initial limit
  };

  return (
    <div className="dashboard-wrapper">
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
        <a href="/Organization/ListedAccounts" className="active">Accounts Tracker</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
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
        <header className="page-header user-header">
          <h1>User Tracker</h1>
          <div>
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
          </div>
        </header>

        {/* Error or loading state */}
        {error && <div className="error">{error}</div>}
        {loading && <p>Loading users...</p>}

        <br /><br />

        {/* Search and Filter */}
        <div className="user-filter-box">
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
          const users = filteredUsers.filter((user) => user.status === status);

          return (
            <div key={status}>
              <h2>{status.charAt(0).toUpperCase() + status.slice(1)} Users</h2>
              {users.length > 0 ? (
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Position</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, recordsToShow).map((user) => (
                      <tr key={user.id}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.position}</td>
                        <td>
                          <button className="add-btn" onClick={() => openViewUser(user.id)}>
                            View
                          </button>
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
    </div>
  );
};

export default UserTrackerPage;
