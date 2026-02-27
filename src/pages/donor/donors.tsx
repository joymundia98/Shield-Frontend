import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from "./DonorsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Donor {
  id: number;
  name: string;
  email: string;
  phone: string;
  donor_type_id: number | null;
  donor_type?: string;
}

// Fetch helper
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    return await authFetch(url);
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");
    return await orgFetch(url);
  }
};

const DonorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // ---------------- Sidebar ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Donor Data ----------------
  const [donorData, setDonorData] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/donors`
        );

        const donorsWithType = data.map((d: any) => ({
          ...d,
          donor_type:
            d.donor_type_id === 1
              ? "Individual"
              : d.donor_type_id === 2
              ? "Organization"
              : "Unknown",
        }));

        setDonorData(donorsWithType);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // ---------------- Search ----------------
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDonors = useMemo(() => {
    return donorData.filter(
      (d) =>
        d.name &&
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [donorData, searchQuery]);

  // ---------------- Grouping ----------------
  const donorGroups = useMemo(() => {
    return filteredDonors.reduce((groups: Record<string, Donor[]>, donor) => {
      const type = donor.donor_type || "Unknown";
      if (!groups[type]) groups[type] = [];
      groups[type].push(donor);
      return groups;
    }, {});
  }, [filteredDonors]);

  // ---------------- Independent Pagination ----------------
  const [expandedGroups, setExpandedGroups] =
    useState<Record<string, boolean>>({});

  const toggleGroupExpansion = (type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const RECORDS_PER_GROUP = 5;

  const handleAddDonor = () => navigate("/donor/addDonor");
  const handleEdit = (id: string) =>
    navigate(`/donor/editDonor/${id}`);
  const handleView = (id: string) =>
    window.open(`/donor/donorView?id=${id}`, "_blank");

  // ---------------- Rendering ----------------
  if (loading) return <p>Loading donors...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>DONOR MGMT</h2>
        {hasPermission("View Donor Dashboard") && (
          <a href="/donor/dashboard">Dashboard</a>
        )}
        {hasPermission("View All Donors") && (
          <a href="/donor/donors" className="active">
            Donors
          </a>
        )}
        {hasPermission("View All Donations") && (
          <a href="/donor/donations">Donations</a>
        )}
        {hasPermission("View Donor Categories") && (
          <a href="/donor/donorCategories">Donor Categories</a>
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
        <DonorsHeader />
        <br />

        <h1>Donors</h1>
        <br />

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
            placeholder="Search donors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={handleAddDonor}>
            + Add Donor
          </button>
        </div>

        {/* Donor Groups */}
        {Object.entries(donorGroups).map(([type, donors]) => {
          const isExpanded = expandedGroups[type];
          const donorsToShow = isExpanded
            ? donors
            : donors.slice(0, RECORDS_PER_GROUP);

          return (
            <div className="department-block" key={type}>
              <h2>{type} Donors</h2>

              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Donor ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donorsToShow.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.name}</td>
                      <td>{d.email}</td>
                      <td>{d.phone}</td>
                      <td className="actions">
                        <button
                          className="add-btn"
                          onClick={() =>
                            handleView(d.id.toString())
                          }
                        >
                          View
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(d.id.toString())
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {donors.length > RECORDS_PER_GROUP && (
                <>
                <button
                  className="add-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => toggleGroupExpansion(type)}
                >
                  {isExpanded ? "View Less" : "View More"}
                </button>
                <br/><br/>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonorManagementPage;