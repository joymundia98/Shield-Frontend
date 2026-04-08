import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
//import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Subscription {
  id: number;
  organizationName: string;
  email: string;

  planType: string; // Single | Multiple | Branch
  paymentMode: string; // Mobile Money | Card | Bank Transfer
  billingCycle: string; // Monthly | Yearly
  amount: number;

  status: string;
  remarks: string;

  monthsPaidFor: string;

  createdAt: Date;
  createdAtDisplay: string;
  paymentDate: Date;         // <-- add this
  paymentDateDisplay: string; // <-- formatted version
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  //const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [recordsToShow, setRecordsToShow] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = Array.from(
    new Set(subscriptions.map((s) => s.paymentDate.getFullYear()))
  );

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const authFetch = async (url: string) => {
    const token = localStorage.getItem("authToken");

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
      // 🔥 Fetch everything
      const [paymentsRes, orgsRes, plansRes, methodsRes] = await Promise.all([
        authFetch(`${baseURL}/api/payments`),
        authFetch(`${baseURL}/api/organizations`),
        authFetch(`${baseURL}/api/plans`),
        authFetch(`${baseURL}/api/payment_methods`),
      ]);

      const payments = paymentsRes;
      const orgs = orgsRes;
      const plans = plansRes;
      const methods = methodsRes;

      const data: Subscription[] = payments.map((pay: any) => {
        const org = orgs.find((o: any) => o.id === pay.organization_id);

        const plan = plans.find((p: any) => p.id === pay.plan_id);
        const rawPlanName = plan?.name ?? "Unknown Plan";

        const method = methods.find((m: any) => m.id === pay.payment_method_id);

        const createdDate = new Date(pay.created_at);
        const paymentDate = new Date(pay.payment_date); // ✅ use payment_date

        return {
          id: pay.id,
          organizationName: org?.name || "Unknown Organization",
          email: org?.organization_email ?? "No Email Provided",
          planType: rawPlanName,
          paymentMode: method
            ? `${method.name} (${method.provider})`
            : pay.payment_provider || "-",
          billingCycle: pay.billing_cycle || plan?.billing_cycle || "-",
          amount: Number(pay.amount) || 0,
          status: pay.status || "-",
          remarks: pay.remarks || "-",
          monthsPaidFor: pay.date || "-",
          createdAt: createdDate,
          createdAtDisplay: createdDate.toLocaleString(),
          paymentDate,                     // ✅ store payment date
          paymentDateDisplay: paymentDate.toLocaleString(),
        };
      });

      setSubscriptions(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
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
        return sub.planType === selectedPlanFilter;
      });
  }, [subscriptions, searchQuery, selectedPlanFilter]);

//Filter Data for KPIs
const filteredForKPI = useMemo(() => {
  return subscriptions.filter((sub) => {
    const date = sub.paymentDate; // ✅ use paymentDate

    const monthMatch =
      selectedMonth === "all" || months[date.getMonth()] === selectedMonth;

    const yearMatch =
      selectedYear === "all" || date.getFullYear().toString() === selectedYear;

    return monthMatch && yearMatch;
  });
}, [subscriptions, selectedMonth, selectedYear]);

  // KPI Logic
  const canonicalPlans = [
  "Single Church Plan (Independent Churches)",
  "Multiple Church (Head Office) Plan",
  "Branch Church Plan",
  "Mother Body / Oversight Plan",
  "NGO & Donor-Funded Projects"
];

const kpiData = useMemo(() => {
  let totalRevenue = 0;
  const revenueByPlan: Record<string, number> = {};

  // Initialize all plans to 0
  canonicalPlans.forEach((p) => (revenueByPlan[p] = 0));

  filteredForKPI.forEach((sub) => {
    if (sub.status.toLowerCase() !== "paid") return;

    const amount = sub.amount || 0;
    totalRevenue += amount;

    const planName = canonicalPlans.includes(sub.planType)
      ? sub.planType
      : "Unknown Plan";

    revenueByPlan[planName] += amount;
  });

  return { totalRevenue, revenueByPlan };
}, [filteredForKPI]);


  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredSubscriptions.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  // ---------------- Actions ----------------
  const handleAdd = () => {
    console.log("Clicked Add New Payment");
    navigate("/SuperAdmin/AddPayment");
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
        <a href="/SuperAdmin/RegisteredOrganizations">Registered Organizations</a>
        <a href="/SuperAdmin/RegisteredAdmins">System Admin Accounts</a>
        <a href="/SuperAdmin/Subscriptions">
          Subscriptions
        </a>
        <a href="/SuperAdmin/Payments" className="active">
          Payments
        </a>

        {/*{hasPermission("View Main Dashboard") && (
          <a href="/dashboard" className="return-main">
            ← Back to Main Dashboard
          </a>
        )}*/}

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
          <h1>Payments</h1>
          <button className="add-btn" onClick={handleAdd}>
            + &nbsp; Add New Payment
          </button>
        </header>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

        </div>

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Revenue</h3>
            <p>K {kpiData.totalRevenue.toLocaleString()}</p>
          </div>

          {canonicalPlans.map((plan) => (
            <div className="kpi-card" key={plan}>
              <h3>{plan} Revenue</h3>
              <p>K {kpiData.revenueByPlan[plan].toLocaleString()}</p>
            </div>
          ))}

          {kpiData.revenueByPlan["Unknown Plan"] > 0 && (
            <div className="kpi-card">
              <h3>Unknown Plan Revenue</h3>
              <p>K {kpiData.revenueByPlan["Unknown Plan"].toLocaleString()}</p>
            </div>
          )}
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
              <option value="Single">Single Church</option>
              <option value="Multiple">Multiple Church</option>
              <option value="Branch">Branch Church</option>
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
              <th>Payment Mode</th>
              <th>Billing Cycle</th>
              <th>Months Paid For</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Payment Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubscriptions
              .slice(0, recordsToShow)
              .map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.organizationName}</td>
                  <td>{sub.email}</td>
                  <td>{sub.planType}</td>
                  <td>{sub.paymentMode}</td>
                  <td>{sub.billingCycle}</td>
                  <td>{sub.monthsPaidFor}</td>
                  <td>{sub.amount}</td>
                  <td>{sub.status}</td>
                  <td>{sub.remarks}</td>
                  <td>{sub.paymentDateDisplay}</td>
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

export default PaymentsPage;