import React, { useState } from "react";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import Calendar from "../../pages/programs/Calendar"; // Import the Calendar component

// Static Data
const staticMembers = [
  { member_id: 1, full_name: "John Doe", age: 30, gender: "Male", date_joined: "2021-01-01", widowed: false, orphan: false, disabled: false, status: "Active" },
  { member_id: 2, full_name: "Jane Doe", age: 25, gender: "Female", date_joined: "2022-01-15", widowed: false, orphan: false, disabled: false, status: "Active" },
  // Add more static members as needed
];

const staticKPI = {
  totalMembers: staticMembers.length,
  weeklyAttendance: 80,
  monthlyGiving: 15000,
  activeVolunteers: 50,
};

const staticChartData = {
  attendance: [50, 60, 70, 80],
  donations: [15000, 8000, 5000, 6000],
};

const staticEvents = [
  { id: "1", name: "Service", date: "2026-01-20", start: "09:00", end: "12:00", venue: "Main Hall", event_type: "Religious", notes: "Weekly Service" },
  { id: "2", name: "Youth Meeting", date: "2026-01-22", start: "14:00", end: "16:00", venue: "Youth Hall", event_type: "Meeting", notes: "Youth Gathering" },
  // Add more events as needed
];

const HQDashboardPage: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState("Main Branch");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("January");

  const [members] = useState(staticMembers);
  const [kpi] = useState(staticKPI);
  const [chartData] = useState(staticChartData);
  const [events] = useState(staticEvents);

  // Filter function for the dynamic overview title
  const churchOverviewTitle = `${selectedBranch} Overview - ${selectedYear} ${selectedMonth}`;

  // Handle filter change
  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "branch") {
      setSelectedBranch(value);
    } else if (filter === "year") {
      setSelectedYear(value);
    } else if (filter === "month") {
      setSelectedMonth(value);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Main Dashboard */}
      <div className="dashboard-content">
        {/* Filter Section */}
        <div className="filter-container">
          <label htmlFor="branch">Branch:</label>
          <select id="branch" onChange={(e) => handleFilterChange("branch", e.target.value)} value={selectedBranch}>
            <option value="Main Branch">Main Branch</option>
            <option value="South Branch">South Branch</option>
            <option value="East Branch">East Branch</option>
          </select>

          <label htmlFor="year">Year:</label>
          <select id="year" onChange={(e) => handleFilterChange("year", e.target.value)} value={selectedYear}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <label htmlFor="month">Month:</label>
          <select id="month" onChange={(e) => handleFilterChange("month", e.target.value)} value={selectedMonth}>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
          </select>
        </div>

        <h1>{churchOverviewTitle}</h1>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Members</h3>
            <p>{kpi.totalMembers}</p>
          </div>
          <div className="kpi-card">
            <h3>Weekly Attendance</h3>
            <p>{kpi.weeklyAttendance}</p>
            <h4>(Average)</h4>
          </div>
          <div className="kpi-card">
            <h3>Monthly Giving</h3>
            <h4>Tithes and Donations</h4>
            <p>ZMW {kpi.monthlyGiving.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <h4>(Average)</h4>
          </div>
          <div className="kpi-card">
            <h3>Active Volunteers</h3>
            <p>{kpi.activeVolunteers}</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Attendance Trends</h3>
            <canvas id="attendanceChart"></canvas>
          </div>

          <div className="chart-box">
            <h3>Church Growth (12 Months)</h3>
            <canvas id="growthChart"></canvas>
          </div>
        </div>

        <div className="chart-box">
          <h3>Event Calendar</h3>
          <Calendar events={events} />
        </div>
      </div>
    </div>
  );
};

export default HQDashboardPage;
