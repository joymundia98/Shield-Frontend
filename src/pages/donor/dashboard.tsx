import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Helper function to fetch data with authFetch and fallback to orgFetch if needed
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    // Attempt to fetch using authFetch first
    return await authFetch(url);  // Return the response directly if it's already structured
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");
    return await orgFetch(url);  // Fallback to orgFetch and return the response directly
  }
};

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const donationTypeChartRef = useRef<Chart | null>(null);
  const monthlyDonationChartRef = useRef<Chart | null>(null);

  const [donors, setDonors] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add/remove sidebar-open class on body for proper animation
  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    // Clean up on unmount
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch the data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch donors and donations data using the new helper function
        const donorsData = await fetchDataWithAuthFallback(`${baseURL}/api/donors`);
        const donationsData = await fetchDataWithAuthFallback(`${baseURL}/api/donations`);
        
        setDonors(donorsData);
        setDonations(donationsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // KPI Calculations
  const totalDonors = donors.length; // Total number of donors
  const activeDonors = donors.filter((d) => d.is_active).length; // Count active donors
  
  // Total Donations Calculation
  const totalDonationAmount = donations.reduce(
    (sum, donation) => sum + parseFloat(donation.amount),
    0
  );
  
  // Top Donor Calculation (including anonymous donors)
  const topDonorData = donations
    .reduce((prev, curr) => (parseFloat(prev.amount) > parseFloat(curr.amount) ? prev : curr), donations[0]);

  const topDonor = topDonorData?.is_anonymous ? "Anonymous" : (topDonorData?.donor_name || "Anonymous");

  // Donation Types (if applicable, could be categorized)
  const donationTypes = useMemo(() => {
    // Aggregate donations by type (if necessary, could be grouped by `purpose_id` or others)
    const typeMap: { [key: string]: number } = {};
    donations.forEach((donation) => {
      const type = donation.method; // Example grouping by method, e.g., "Cash", "Bank Transfer"
      typeMap[type] = (typeMap[type] || 0) + parseFloat(donation.amount);
    });
    return Object.keys(typeMap).map((key) => ({ type: key, amount: typeMap[key] }));
  }, [donations]);

  // Monthly Donations (if needed, assuming you want to split by date)
  const monthlyDonations = useMemo(() => {
    const months: number[] = Array(12).fill(0); // Create array for 12 months
    donations.forEach((donation) => {
      const month = new Date(donation.date).getMonth(); // Get the month (0 - 11)
      months[month] += parseFloat(donation.amount); // Sum donations per month
    });
    return months;
  }, [donations]);

  useEffect(() => {
    // Destroy old charts if they exist
    donationTypeChartRef.current?.destroy();
    monthlyDonationChartRef.current?.destroy();

    // Donations by Type (donation method)
    const typeCanvas = document.getElementById(
      "donationTypeChart"
    ) as HTMLCanvasElement;

    if (typeCanvas && donationTypes.length > 0) {
      donationTypeChartRef.current = new Chart(typeCanvas, {
        type: "doughnut",
        data: {
          labels: donationTypes.map((d) => d.type),
          datasets: [
            {
              data: donationTypes.map((d) => d.amount),
              backgroundColor: ["#1A3D7C", "#5C4736", "#AF907A", "#20262C"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    // Monthly Donations
    const monthlyCanvas = document.getElementById(
      "monthlyDonationsChart"
    ) as HTMLCanvasElement;

    if (monthlyCanvas && monthlyDonations.length > 0) {
      monthlyDonationChartRef.current = new Chart(monthlyCanvas, {
        type: "bar",
        data: {
          labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
          datasets: [
            {
              label: "Donations ($)",
              data: monthlyDonations,
              backgroundColor: "#1A3D7C",
              borderRadius: 5,
            },
          ],
        },
        options: {
          scales: { y: { beginAtZero: true } },
          plugins: { legend: { display: false } },
        },
      });
    }
  }, [donationTypes, monthlyDonations]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
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

        <h2>DONOR MGMT</h2>
        <a href="/donor/dashboard" className="active">
          Dashboard
        </a>
        <a href="/donor/donors">Donors List</a>
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

        <DonorsHeader /><br />

        <h1>Donor Dashboard Overview</h1>

        <br /><br />

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Donors</h3>
            <p>{totalDonors}</p>
          </div>

          <div className="kpi-card">
            <h3>Total Donations</h3>
            <p>${totalDonationAmount.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <h3>Active Donors</h3>
            <p>{activeDonors}</p>
          </div>

          <div className="kpi-card">
            <h3>Top Donor</h3>
            <p>{topDonor}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Donations by Type</h3>
            <canvas id="donationTypeChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Monthly Donations</h3>
            <canvas id="monthlyDonationsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
