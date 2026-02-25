import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Donation {
  id: number | string;
  donor_name: string | null;
  donor_phone: string | null;
  donor_email: string | null;
  donor_registered: boolean;
  date: string;
  amount: number;
  method: string;
  notes: string;
}

const DonationViewPage: React.FC = () => {
  const { id: donationId } = useParams<{ id: string }>(); // Access the donation ID from the route
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Helper function to fetch data with auth fallback
const fetchDataWithAuthFallback = async (url: string, options?: RequestInit) => {
  try {
    return await authFetch(url, options);
  } catch (error: unknown) {
    console.log("authFetch failed, falling back to orgFetch", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Unauthorized, redirecting to login");
      navigate("/login");
      return;
    }

    return await orgFetch(url, options);
  }
};

  // Debugging: Check if donationId is being retrieved
  console.log("Donation ID from URL params:", donationId);

  // Fetch donation data by ID
  useEffect(() => {
    const fetchDonation = async () => {
      if (!donationId) {
        setError("Donation ID is missing");
        console.error("Error: Donation ID is missing");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching donations...");

        const data: Donation[] = await fetchDataWithAuthFallback(
          `${baseURL}/api/donations`
        );

        if (!data) {
          throw new Error("Error fetching donations");
        }
        console.log("Fetched donations data:", data); // Log the fetched data

        // Find the donation with the matching ID
        const selectedDonation = data.find((donation) => donation.id === Number(donationId));

        if (selectedDonation) {
          console.log("Selected donation found:", selectedDonation);
          setDonation(selectedDonation);
        } else {
          console.error("Donation not found");
          setError("Donation not found");
        }
      } catch (err: any) {
        console.error("Error fetching donation details:", err); // Log the error
        setError(err.message || "Error fetching donation details");
      } finally {
        setLoading(false);
        console.log("Finished loading donation details.");
      }
    };

    fetchDonation();
  }, [donationId]);

  if (loading) {
    console.log("Loading donation details...");
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Error:", error); // Log any error to the console
    return <div>Error: {error}</div>;
  }

  if (!donation) {
    console.log("No donation found");
    return <div>Donation not found.</div>;
  }

  // Handle delete request
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await fetchDataWithAuthFallback(
          `${baseURL}/api/donations/${donation.id}`,
          { method: "DELETE" }
        );

        // Redirect back to the donation list after successful deletion
        alert("Donation deleted successfully.");
        navigate("/donor/donations");
      } catch (err: any) {
        console.error("Failed to delete donation:", err); // Log the error
        alert("Failed to delete donation: " + err.message);
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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
        {hasPermission("View Donor Dashboard") && <a href="/donor/dashboard">Dashboard</a>}
        {hasPermission("View All Donors") &&  <a href="/donor/donors">Donors</a>}
        {hasPermission("View All Donations") &&  <a href="/donor/donations" className="active">
          Donations
        </a>}
        {hasPermission("View Donor Categories") && <a href="/donor/donorCategories">Donor Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

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
        
        <h1>Donation Details</h1>

        {/* Back to Donations List Button */}
        <button
          className="add-btn"
          onClick={() => navigate("/donor/donations")}
        >
          &larr; Back to Donations List
        </button>
        <br />
        <br />

        {/* Donation Details */}
        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Donation ID</td>
              <td>{donation.id}</td>
            </tr>
            <tr>
              <td>Donor</td>
              <td>{donation.donor_name || "N/A"}</td>
            </tr>
            <tr>
              <td>Date</td>
              <td>{new Date(donation.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Amount</td>
              <td>${donation.amount}</td>
            </tr>
            <tr>
              <td>Payment Method</td>
              <td>{donation.method}</td>
            </tr>
            <tr>
              <td>Registered</td>
              <td>{donation.donor_registered ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Notes</td>
              <td>{donation.notes || "No notes available"}</td>
            </tr>
          </tbody>
        </table>

        {/* Edit and Delete Buttons */}
        <div style={{ marginTop: "20px" }}>
          <button
            className="edit-btn"
            onClick={() => navigate(`/donor/editDonation/${donation.id}`)}
          >
            Edit Donation
          </button>&emsp;
          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete Donation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationViewPage;
