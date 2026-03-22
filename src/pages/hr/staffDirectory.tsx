import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';
import axios from "axios";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Staff {
  id?: number;
  name: string;
  department: string;
  role: string;
  status: "active" | "on-leave" | "unpaid";
  joinDate: string;
  gender: "Male" | "Female";
  NRC: string;
  address: string;
  phone: string;
  email: string;
  photo: string;
  paid: boolean;
}

interface Filter {
  department: string;
  status: string;
}

const StaffDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // ---------------- Sidebar ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Staff Data ----------------
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataWithAuthFallback = async (url: string) => {
    try {
      return await authFetch(url);
    } catch (error: unknown) {
      console.log("authFetch failed, falling back to orgFetch", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/login");
      }

      return await orgFetch(url);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/staff`
        );

        console.log("DATA:", data);

        if (!Array.isArray(data)) {
          throw new Error("Staff data is not an array");
        }

        const mappedData = data.map((s: any) => ({
          ...s,
          id: s.id, // ✅ ensure id exists
          name: s.name || "Unnamed",
          department: s.department || "Unassigned",
          status: s.status || "pending",
          joinDate: s.join_date,
          NRC: s.nrc,
        }));

        setStaffData(mappedData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // ---------------- Filters/Search ----------------
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, _setFilter] = useState<Filter>({ department: "", status: "" });
  const [_tempFilter, _setTempFilter] = useState(filter);
  const [_showFilterPopup, _setShowFilterPopup] = useState(false);

  const filteredStaff = useMemo(() => {
    return staffData.filter((s) => {
      if (filter.department && s.department !== filter.department) return false;
      if (filter.status && s.status !== filter.status) return false;
      if (
        searchQuery &&
        s.name &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [staffData, filter, searchQuery]);

  const handleAddStaff = () => {
    navigate("/hr/addStaff");
  };

  // ---------------- Helper function ----------------
  const formatDate = (date: string | null) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString("en-GB");
  };

  // ---------------- Render ----------------
  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              id="closeSidebarButton"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>HR MANAGER</h2>
        {hasPermission("View HR Dashboard") && (
          <a href="/hr/dashboard">Dashboard</a>
        )}
        {hasPermission("View Staff Directory") && (
          <a href="/hr/staffDirectory" className="active">
            Staff Directory
          </a>
        )}
        {hasPermission("Manage HR Payroll") && (
          <a href="/hr/payroll">Payroll</a>
        )}
        {hasPermission("Manage Leave") && (
          <a href="/hr/leave">Leave Management</a>
        )}
        {hasPermission("View Leave Applications") && (
          <a href="/hr/leaveApplications">Leave Applications</a>
        )}
        {hasPermission("View Departments") && (
          <a href="/hr/departments">Departments</a>
        )}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && (
          <a href="/dashboard" className="return-main">
            ← Back to Main Dashboard
          </a>
        )}

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

      {/* Main Content */}
      <div className="dashboard-content">
        <HRHeader />
        <br />

        <h1>Staff Directory</h1>
        <br />
        <br />

        {loading && <p>Loading staff data...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {/* Add + Search */}
        <div
          className="table-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={handleAddStaff}>
            + Add New Staff
          </button>
          &emsp;
        </div>

        {/* Departments */}
        {Object.entries(
          filteredStaff.reduce((groups: Record<string, Staff[]>, s) => {
            if (!groups[s.department]) groups[s.department] = [];
            groups[s.department].push(s);
            return groups;
          }, {} as Record<string, Staff[]>)
        ).map(([dept, staffList]) => (
          <div className="department-block" key={dept}>
            <h2>{dept}</h2>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, i) => (
                  <tr key={i}>
                    <td data-title="Name">{s.name}</td>
                    <td data-title="Role">{s.role}</td>
                    <td data-title="Status">
                      <span className={`status ${s.status}`}>
                        {(s.status || "").replace("-", " ")}
                      </span>
                    </td>
                    <td data-title="Join Date">
                      {formatDate(s.joinDate)}
                    </td>
                    <td className="actions" data-title="Actions">
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(`/hr/viewStaff/${s.id}`)
                        }
                      >
                        View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/hr/editStaff/${s.id}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDirectoryPage;