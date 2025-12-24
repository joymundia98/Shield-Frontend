import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Donation {
  id: number | string;
  donor: string;
  registered: boolean;
  date: string;
  amount: number;
  type: string;
  method: string;
}

const DonationsManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- SIDEBAR ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- DONATION DATA ----------------
  const [donationData, setDonationData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseURL}/api/donations`)
      .then((res) => res.json())
      .then((data) => {
        const mapped: Donation[] = data.map((d: any) => ({
          id: d.id,
          donor:
            d.donor_registered && d.donor
              ? d.donor
              : d.is_anonymous
              ? "Anonymous"
              : d.donor_name ?? "Walk-in Guest",
          registered: d.donor_registered,
          date: d.date.slice(0, 10),
          amount: Number(d.amount),
          type: d.purpose || "Other",
          method: d.method,
        }));
        setDonationData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load donations", err);
        setLoading(false);
      });
  }, []);

  // ---------------- SEARCH ----------------
  const [searchQuery, setSearchQuery] = useState("");
  const filteredDonations = useMemo(() => {
    return donationData.filter((d) =>
      `${d.id} ${d.donor} ${d.type} ${d.method}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [donationData, searchQuery]);

  // ---------------- GROUPING ----------------
  const donationGroups = useMemo(() => {
    return {
      "Registered Donors": filteredDonations.filter((d) => d.registered),
      "Unregistered Donors": filteredDonations.filter((d) => !d.registered),
    };
  }, [filteredDonations]);

  // ---------------- REDIRECT ----------------
  const handleAddDonation = () => {
    navigate("/donor/addDonation");
  };

  // Handle view and edit redirections (to new tabs)
  const handleView = (id: string) => {
    const url = `/donor/DonationViewPage/${id}`;
    window.open(url, "_blank");  // Open donation view in a new tab
  };

  const handleEdit = (id: string) => {
    const url = `/donor/EditDonationPage/${id}`;
    window.open(url, "_blank");  // Open donation edit in a new tab
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
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

        <h2>DONOR MANAGER</h2>
        <a href="/donor/dashboard">Dashboard</a>
        <a href="/donor/donors">Donors</a>
        <a href="/donor/donations" className="active">
          Donations
        </a>
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

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <DonorsHeader/><br/>
        
        <h1>Donations</h1>
        <br />

        {/* Search + Add */}
        <div
          className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={handleAddDonation}>
            + Add Donation
          </button>
        </div>

        {/* Loading */}
        {loading && <p>Loading donations...</p>}

        {/* Donation Groups */}
        {Object.entries(donationGroups).map(([groupName, records]) => (
          <div className="department-block" key={groupName}>
            <h2>{groupName}</h2>

            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor</th>
                  <th>Date</th>
                  <th>Amount ($)</th>
                  <th>Type</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.donor}</td>
                    <td>{d.date}</td>
                    <td>{d.amount}</td>
                    <td>{d.type}</td>
                    <td>{d.method}</td>
                    <td className="actions">
                      <button className="add-btn" onClick={() => handleView(d.id.toString())}>
                        View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(d.id.toString())} // Open the donation edit in a new tab
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

export default DonationsManagementPage;
