import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Donor {
  id: number;
  name: string;
  email: string;
  phone: string;
  donor_type_id: number | null;
  donor_type?: string; // optional, fetched from backend
}

const DonorManagementPage: React.FC = () => {
  const navigate = useNavigate();

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
        const res = await fetch(`${baseURL}/api/donors`);
        if (!res.ok) throw new Error("Failed to fetch donors");
        const data = await res.json();

        // Optional: Map donor_type_id to donor_type name if your backend provides it
        const donorsWithType = data.map((d: any) => ({
          ...d,
          donor_type: d.donor_type_id !== null ? (d.donor_type_id === 1 ? "Individual" : "Organization") : "Unknown", // default to "Unknown"
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
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        d.donor_type !== "Anonymous" // exclude anonymous
    );
  }, [donorData, searchQuery]);

  // ---------------- Grouping ----------------
  const donorGroups = useMemo(() => {
    return filteredDonors.reduce((groups: Record<string, Donor[]>, donor) => {
      if (!groups[donor.donor_type!]) groups[donor.donor_type!] = [];
      groups[donor.donor_type!].push(donor);
      return groups;
    }, {});
  }, [filteredDonors]);


  const handleAddDonor = () => navigate("/donor/addDonor");

  // ---------------- Handle Edit and View Actions ----------------
  const handleEdit = (id: string) => navigate(`/donor/editDonor/${id}`);
  const handleView = (id: string) => {
    const url = `/donor/donorView?id=${id}`;
    window.open(url, "_blank"); // Open in a new tab
  };

  // ---------------- Rendering ----------------
  if (loading) return <p>Loading donors...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

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
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>DONOR MGMT</h2>
        <a href="/donor/dashboard">Dashboard</a>
        <a href="/donor/donors" className="active">
          Donors List
        </a>
        <a href="/donor/donations">Donations</a>
        <a href="/donor/donorCategories">Donor Categories</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>
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

        <DonorsHeader/><br/>

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
        {Object.entries(donorGroups).map(([type, donors]) => (
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
                {donors.map((d) => {
                  return (
                    <tr key={d.id}>
                      <td data-title="ID">{d.id}</td>
                      <td data-title="Name">{d.name}</td>
                      <td data-title="Email">{d.email}</td>
                      <td data-title="Phone">{d.phone}</td>
                      <td className="actions">
                        {/* View Button that opens the view page in a new tab */}
                        <button
                          className="add-btn"
                          onClick={() => handleView(d.id.toString())} // Open in new tab
                        >
                          View
                        </button>
                        {/* Edit Button that redirects to the EditDonorPage */}
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(d.id.toString())} // Edit the donor
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorManagementPage;
