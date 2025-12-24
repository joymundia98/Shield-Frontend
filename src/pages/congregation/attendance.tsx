import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Gender = "Male" | "Female";

interface Visitor {
  id: number;
  name: string;
  gender: Gender;
  age: number;
  visit_date: string;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const [selectedCategory, setSelectedCategory] = useState<"All" | "Youth" | "Adults">("All");
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [kpiMode, setKpiMode] = useState<"sum" | "average">("sum");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/visitor`);
        if (Array.isArray(res.data)) {
          setVisitors(res.data);
        } else {
          setError("API did not return an array");
        }
      } catch (err) {
        setError("Error fetching visitors: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Filter visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const date = new Date(v.visit_date);
      const monthCheck = selectedMonth === "All" || date.getMonth().toString() === selectedMonth;
      const yearCheck = selectedYear === "All" || date.getFullYear().toString() === selectedYear;
      let categoryCheck = true;

      if (selectedCategory === "Youth") categoryCheck = v.age <= 30;
      if (selectedCategory === "Adults") categoryCheck = v.age > 30;

      return monthCheck && yearCheck && categoryCheck;
    });
  }, [visitors, selectedCategory, selectedMonth, selectedYear]);

  const overallKPI = filteredVisitors.length;
  const femaleKPI = filteredVisitors.filter((v) => v.gender === "Female").length;
  const maleKPI = filteredVisitors.filter((v) => v.gender === "Male").length;

  // Weekly chart calculation
  const weeklyData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    const maleWeeks = [0, 0, 0, 0];
    const femaleWeeks = [0, 0, 0, 0];

    filteredVisitors.forEach((v) => {
      const week = Math.min(Math.floor(new Date(v.visit_date).getDate() / 7), 3);
      weeks[week]++;
      if (v.gender === "Male") maleWeeks[week]++;
      if (v.gender === "Female") femaleWeeks[week]++;
    });

    return { weeks, maleWeeks, femaleWeeks };
  }, [filteredVisitors]);

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar & hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>
        <h2>CONGREGATION</h2>
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance" className="active">
          Attendance
        </a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts">New Converts</a>
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

      {/* Main content */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        <header className="page-header attendance-header">
          <h1>Attendance Tracker</h1>
          <button className="add-btn" style={{ margin: "10px 0" }} onClick={() => navigate("/congregation/recordAttendance")}>
            Record Attendance
          </button>
        </header>

        <br />
        <br />

        {/* KPI Cards */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Overall Attendance</h3>
            <p>{overallKPI} Congregants</p>
          </div>
          <div className="kpi-card">
            <h3>Female Attendance</h3>
            <p>{femaleKPI} Congregants</p>
          </div>
          <div className="kpi-card">
            <h3>Male Attendance</h3>
            <p>{maleKPI} Congregants</p>
          </div>
        </div>

        {/* Filters */}
        <div className="attendance-filter-box">
          <h3>Filter Attendance</h3>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as any)}>
            <option value="All">All Categories</option>
            <option value="Youth">Youth (≤30)</option>
            <option value="Adults">Adults (&gt;30)</option>
          </select>

          &nbsp; &nbsp;

          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="All">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          &nbsp; &nbsp;

          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="All">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <br />
          <br />

          <div className="radio-container">
            <label>
              <input type="radio" name="kpiMode" value="sum" checked={kpiMode === "sum"} onChange={() => setKpiMode("sum")} />
              Sum
            </label>
            <label>
              <input type="radio" name="kpiMode" value="average" checked={kpiMode === "average"} onChange={() => setKpiMode("average")} />
              Average
            </label>
          </div>
        </div>

        {/* Weekly Charts */}
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Weekly Overall Attendance</h3>
            <Line
              data={{
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                  {
                    label: "Present Congregants",
                    data: weeklyData.weeks,
                    borderColor: "#2980b9",
                    backgroundColor: "rgba(41,128,185,0.2)",
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>

          <div className="chart-box">
            <h3>Weekly Attendance by Gender</h3>
            <Bar
              data={{
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                  { label: "Male", data: weeklyData.maleWeeks, backgroundColor: "#20262C" },
                  { label: "Female", data: weeklyData.femaleWeeks, backgroundColor: "#AF907A" },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
        </div>

        {/* Records Table */}
        <h2 className="records-heading">Records</h2>

        {loading ? (
          <p>Loading visitors...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredVisitors.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((v) => (
                <tr key={v.id}>
                  <td>{new Date(v.visit_date).toLocaleDateString()}</td>
                  <td>{v.name}</td>
                  <td>{v.gender}</td>
                  <td>{v.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
