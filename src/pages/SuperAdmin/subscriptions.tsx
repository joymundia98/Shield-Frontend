import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Subscription {
  id: number;

  organizationName: string;
  email: string;

  planName: string;

  status: "Active" | "Inactive" | "Pending-Renewal" | "Discontinued";

  startDate: Date;
  startDateDisplay: string;

  endDate: Date | null;
  endDateDisplay: string;

  trialEndDate: Date;
  trialEndDateDisplay: string;
}

const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [recordsToShow, setRecordsToShow] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch(`${baseURL}/api/subscriptions`);

        const data: Subscription[] = res.map((sub: any) => {
          const startDate = new Date(sub.start_date);
          const endDate = sub.end_date ? new Date(sub.end_date) : null;

          const orgCreated = new Date(sub.organization_created_at);

          // Trial = 21 days after org signup
          const trialEnd = new Date(orgCreated);
          trialEnd.setDate(trialEnd.getDate() + 21);

          return {
            id: sub.id,

            organizationName: sub.organization_name,
            email: sub.email,

            planName: sub.plan_name,

            status: sub.status,

            startDate,
            startDateDisplay: startDate.toLocaleDateString(),

            endDate,
            endDateDisplay: endDate
              ? endDate.toLocaleDateString()
              : "-",

            trialEndDate: trialEnd,
            trialEndDateDisplay: trialEnd.toLocaleDateString(),
          };
        });

        setSubscriptions(data);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
      }
    };

    fetchData();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) =>
        sub.organizationName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .filter((sub) => {
        if (selectedPlanFilter === "all") return true;
        return sub.planName === selectedPlanFilter;
      });
  }, [subscriptions, searchQuery, selectedPlanFilter]);

  // KPI Logic
  const kpiData = useMemo(() => {
    let single = 0;
    let multiple = 0;
    let branch = 0;

    subscriptions.forEach((sub) => {
      if (sub.planName === "Single Church") single++;
      if (sub.planName === "Multiple Church") multiple++;
      if (sub.planName === "Branch Church") branch++;
    });

    return {
      totalConversions: subscriptions.length,
      single,
      multiple,
      branch,
    };
  }, [subscriptions]);

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredSubscriptions.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };


  return (
    <div className="dashboard-wrapper visitors-wrapper">
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

        <h2>SUPER ADMIN</h2>

        <a href="/SuperAdmin/dashboard">Dashboard</a>
        <a href="/SuperAdmin/RegisteredOrganizations">
          Registered Organizations
        </a>
        <a href="/SuperAdmin/RegisteredAdmins">
          System Admin Accounts
        </a>
        <a href="/SuperAdmin/Subscriptions" className="active">
          Subscriptions
        </a>
        <a href="/SuperAdmin/Payments">
          Payments
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
        <header>
          <h1>Subscriptions</h1>
          
        </header>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Conversions</h3>
            <p>{kpiData.totalConversions}</p>
          </div>

          <div className="kpi-card">
            <h3>Single Church Plan</h3>
            <p>{kpiData.single}</p>
          </div>

          <div className="kpi-card">
            <h3>Multiple Church Plan</h3>
            <p>{kpiData.multiple}</p>
          </div>

          <div className="kpi-card">
            <h3>Branch Church Plan</h3>
            <p>{kpiData.branch}</p>
          </div>
        </div>

        <br />

        {/* SEARCH + FILTER */}
        <div className="user-filter-box">
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Search organization..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="user-filter-select"
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="Single Church">Single Church</option>
              <option value="Multiple Church">Multiple Church</option>
              <option value="Branch Church">Branch Church</option>
            </select>
          </div>
        </div>

        <br />

        {/* TABLE */}
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Trial Ends</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubscriptions
              .slice(0, recordsToShow)
              .map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.organizationName}</td>
                  <td>{sub.email}</td>
                  <td>{sub.planName}</td>
                  <td>{sub.status}</td>
                  <td>{sub.startDateDisplay}</td>
                  <td>{sub.endDateDisplay}</td>
                  <td>{sub.trialEndDateDisplay}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <br />

        <button
          onClick={showAll ? handleViewLess : handleViewMore}
          className="add-btn"
        >
          {showAll ? "View Less" : "View More"}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionsPage;