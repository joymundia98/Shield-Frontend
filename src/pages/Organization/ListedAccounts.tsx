import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  status: "Active" | "Pending" | "Inactive";
  fullName?: string; // Optional fullName property
}

interface UserGroup {
  name: string;
  users: User[];
}

interface UserStatusCategories {
  [status: string]: UserGroup[];
}

//const BACKEND_URL = "${baseURL}/api";

const UserTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Static data for KPI cards
  const totalActive = 10; // Static value for active users
  const totalPending = 5; // Static value for pending users
  const totalInactive = 3; // Static value for inactive users

  // Static user data (can be replaced with actual API data later)
  const [userCategories, _setUserCategories] = useState<UserStatusCategories>({
    Active: [
      {
        name: "Active",
        users: [
          { id: 1, first_name: "John", last_name: "Doe", position: "Developer", status: "Active", fullName: "John Doe" },
          { id: 2, first_name: "Jane", last_name: "Smith", position: "Designer", status: "Active", fullName: "Jane Smith" },
        ]
      }
    ],
    Pending: [
      {
        name: "Pending",
        users: [
          { id: 3, first_name: "Alice", last_name: "Brown", position: "Manager", status: "Pending", fullName: "Alice Brown" },
        ]
      }
    ],
    Inactive: [
      {
        name: "Inactive",
        users: [
          { id: 4, first_name: "Bob", last_name: "Johnson", position: "Intern", status: "Inactive", fullName: "Bob Johnson" },
        ]
      }
    ],
  });

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  // Filter users by status (All, Active, Pending, Inactive)
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredUsers = selectedFilter === "All" ? userCategories : { [selectedFilter]: userCategories[selectedFilter] || [] };

  // View User Modal logic
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const openViewModal = (user: User) => {
    setViewUser(user);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewUser(null);
    setViewModalOpen(false);
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
        <a href="/Organization/edittableProfile">Profile</a>
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/ListedAccounts" className="active">Accounts Tracker</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
        <a
          href="/"
          className="logout-link"
          onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}
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

        <br /><br />

        {/* KPI CARDS */}
        <div className="kpi-container">
          <div className="kpi-card kpi-active">
            <h3>Total Active Users</h3>
            <p>{totalActive}</p>
          </div>
          <div className="kpi-card kpi-pending">
            <h3>Total Pending Users</h3>
            <p>{totalPending}</p>
          </div>
          <div className="kpi-card kpi-inactive">
            <h3>Total Inactive Users</h3>
            <p>{totalInactive}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="user-filter-box">
          <h3>Filter by Status</h3>
          <select
            className="user-filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <br/>
        {/* TABLE RENDER */}
        {Object.entries(filteredUsers).map(([status, groups]) => (
          <div key={status}>
            <h2>{status}</h2>

            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.name}>
                  <h3>{group.name}</h3>

                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {group.users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.first_name} {user.last_name}</td> {/* Correctly accessing the user data */}
                          <td>{user.position}</td>
                          <td>
                            <button className="add-btn" onClick={() => openViewModal(user)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              ))
            ) : (
              <p>No users</p>
            )}
          </div>
        ))}

        {/* View Modal */}
        {viewModalOpen && viewUser && (
          <div className="userModal" style={{ display: "flex" }} onClick={closeViewModal}>
            <div className="userModal-content" onClick={(e) => e.stopPropagation()}>
              <h2>User Details</h2>
              <table>
                <tbody>
                  <tr>
                    <th>Full Name</th>
                    <td>{viewUser.fullName}</td>
                  </tr>
                  <tr>
                    <th>Position</th>
                    <td>{viewUser.position}</td>
                  </tr>
                </tbody>
              </table>
              <button className="userModal-cancel" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTrackerPage;
