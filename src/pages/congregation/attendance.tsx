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

interface Member {
  member_id: number;
  full_name: string;
  name: string;
  gender: Gender;
  age: number;
}

interface Visitor {
  id: number;
  full_name: string;
  name: string;
  gender: Gender;
  age: number;
  visit_date: string;
}

interface Service {
  id: number;
  name: string;
}

interface AttendanceRecord {
  record_id: number;
  status: "Present" | "Absent";
  attendance_date: string;
  service_id: number;
  member_id: number | null;
  visitor_id: number | null;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [selectedCategory, setSelectedCategory] = useState<"All" | "Youth" | "Adults">("All");
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedService, setSelectedService] = useState<string>("All"); // Added service filter state
  //const [kpiMode, setKpiMode] = useState<"sum" | "average">("sum");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]); // Added services state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Pagination state
  const [recordsToShow, setRecordsToShow] = useState<number>(5); // Default 5 records shown
  const [showAll, setShowAll] = useState<boolean>(false); // Flag to toggle between "View More" and "View Less"

  // Fetching services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await axios.get(`${baseURL}/api/services`);
        setServices(servicesRes.data);
      } catch (err) {
        setError("Error fetching services data: " + (err as Error).message);
      }
    };

    fetchServices();
  }, []);

  /* ---------------- SIDEBAR LOGIC ---------------- */
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, membersRes, visitorsRes] = await Promise.all([
          axios.get(`${baseURL}/api/congregation/attendance`),
          axios.get(`${baseURL}/api/members`),
          axios.get(`${baseURL}/api/visitor`),
        ]);

        setAttendanceRecords(attendanceRes.data);
        setMembers(membersRes.data);
        setVisitors(visitorsRes.data);
      } catch (err) {
        setError("Error fetching data: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Merge attendance data with member/visitor data
  const mergedAttendanceData = useMemo(() => {
    return attendanceRecords.map((record) => {
      let person = null;

      // Check if the attendance record is for a member
      if (record.member_id) {
        person = members.find((m) => m.member_id === record.member_id);
      }
      // Check if the attendance record is for a visitor
      else if (record.visitor_id) {
        person = visitors.find((v) => v.id === record.visitor_id);
      }

      return {
        ...record,
        person: person ? person : null, // Attach the member/visitor info
      };
    });
  }, [attendanceRecords, members, visitors]);

  // Filter records based on selected filters
  const filteredAttendance = useMemo(() => {
    return mergedAttendanceData.filter((record) => {
      const date = new Date(record.attendance_date);
      const monthCheck = selectedMonth === "All" || date.getMonth().toString() === selectedMonth;
      const yearCheck = selectedYear === "All" || date.getFullYear().toString() === selectedYear;
      const serviceCheck = selectedService === "All" || record.service_id.toString() === selectedService;

      let categoryCheck = true;
      if (selectedCategory === "Youth" && record.person?.age !== undefined) {
        categoryCheck = record.person.age <= 30;
      }

      if (selectedCategory === "Adults" && record.person?.age !== undefined) {
        categoryCheck = record.person.age > 30;
      }

      return monthCheck && yearCheck && categoryCheck && serviceCheck;
    });
  }, [mergedAttendanceData, selectedCategory, selectedMonth, selectedYear, selectedService]);

  // Weekly data for charts
  const weeklyData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    const maleWeeks = [0, 0, 0, 0];
    const femaleWeeks = [0, 0, 0, 0];
    const maleMembers = [0, 0, 0, 0];
    const femaleMembers = [0, 0, 0, 0];
    const maleVisitors = [0, 0, 0, 0];
    const femaleVisitors = [0, 0, 0, 0];

    filteredAttendance.forEach((record) => {
      const week = Math.min(Math.floor(new Date(record.attendance_date).getDate() / 7), 3);

      // Count overall attendees
      weeks[week]++;

      // Gender counts
      if (record.person?.gender === "Male") maleWeeks[week]++;
      if (record.person?.gender === "Female") femaleWeeks[week]++;

      // Member and visitor counts
      if (record.member_id) {
        if (record.person?.gender === "Male") maleMembers[week]++;
        if (record.person?.gender === "Female") femaleMembers[week]++;
      }

      if (record.visitor_id) {
        if (record.person?.gender === "Male") maleVisitors[week]++;
        if (record.person?.gender === "Female") femaleVisitors[week]++;
      }
    });

    return { weeks, maleWeeks, femaleWeeks, maleMembers, femaleMembers, maleVisitors, femaleVisitors };
  }, [filteredAttendance]);

  // KPI Data
  const overallKPI = filteredAttendance.length;
  const femaleKPI = filteredAttendance.filter((record) => record.person?.gender === "Female").length;
  const maleKPI = filteredAttendance.filter((record) => record.person?.gender === "Male").length;

  // Handle "View More" logic
  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredAttendance.length); // Show all records
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5); // Show only the first 5 records
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar & hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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
        <a href="/congregation/attendance" className="active">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts">New Converts</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
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
        <CongregationHeader /><br />
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

          &nbsp; &nbsp;

          {/* Service Filter */}
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
            <option value="All">All Services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Weekly Charts */}
        <br />
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
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        const weekIndex = tooltipItem.dataIndex;
                        const total = weeklyData.weeks[weekIndex];
                        const members = weeklyData.maleMembers[weekIndex] + weeklyData.femaleMembers[weekIndex];
                        const visitors = weeklyData.maleVisitors[weekIndex] + weeklyData.femaleVisitors[weekIndex];

                        return `Total: ${total} (Members: ${members}, Visitors: ${visitors})`;
                      },
                    },
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <h3>Weekly Attendance by Gender</h3>
            <Bar
              data={{
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                  {
                    label: "Male",
                    data: weeklyData.maleWeeks,
                    backgroundColor: "#20262C",
                  },
                  {
                    label: "Female",
                    data: weeklyData.femaleWeeks,
                    backgroundColor: "#AF907A",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        const weekIndex = tooltipItem.dataIndex;
                        const datasetIndex = tooltipItem.datasetIndex;

                        if (datasetIndex === 0) { // "Male" dataset
                          const maleCount = weeklyData.maleWeeks[weekIndex];
                          const maleMembers = weeklyData.maleMembers[weekIndex];
                          const maleVisitors = weeklyData.maleVisitors[weekIndex];

                          return `Male: ${maleCount} (Members: ${maleMembers}, Visitors: ${maleVisitors})`;
                        } else if (datasetIndex === 1) { // "Female" dataset
                          const femaleCount = weeklyData.femaleWeeks[weekIndex];
                          const femaleMembers = weeklyData.femaleMembers[weekIndex];
                          const femaleVisitors = weeklyData.femaleVisitors[weekIndex];

                          return `Female: ${femaleCount} (Members: ${femaleMembers}, Visitors: ${femaleVisitors})`;
                        }

                        return "";
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Records Table */}
        <h2 className="records-heading">Records</h2>
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredAttendance.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <div>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Category</th>
                  <th>Congregant Type</th> {/* Added the Congregant Type column */}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.slice(0, recordsToShow).map((record) => (
                  <tr key={record.record_id}>
                    <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                    <td>{record.person ? record.person.full_name || record.person.name : "Unknown"}</td>
                    <td>{record.person ? record.person.gender : "Unknown"}</td>
                    <td>{record.person ? (record.person.age <= 30 ? "Youth" : "Adult") : "Unknown"}</td>
                    <td>
                      {record.member_id ? "Member" : "Visitor"} {/* Logic to determine Member or Visitor */}
                    </td>
                    <td>
                      {record.status === "Present" ? "🟢 Present" : "🔴 Absent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={showAll ? handleViewLess : handleViewMore} className="add-btn">
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
