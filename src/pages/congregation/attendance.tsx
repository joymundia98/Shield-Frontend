import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import axios from "axios"; //For downloads
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

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
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [selectedCategory, setSelectedCategory] = useState<"All" | "Youth" | "Adults">("All");
  const [selectedService, setSelectedService] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Pagination state
  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  /* ---------------- SIDEBAR LOGIC ---------------- */
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  /* ---------------- AUTH FETCH FUNCTION ---------------- */
  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found.");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error fetching data from ${url}: ${res.statusText}`);
    }

    return res.json();
  };

  /* ---------------- FETCHING SERVICES DATA ---------------- */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await authFetch(`${baseURL}/api/services`);
        setServices(servicesRes);
      } catch (err) {
        setError("Error fetching services data: " + (err as Error).message);
      }
    };

    fetchServices();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, membersRes, visitorsRes] = await Promise.all([
          authFetch(`${baseURL}/api/congregation/attendance`),
          authFetch(`${baseURL}/api/members`),
          authFetch(`${baseURL}/api/visitor`),
        ]);

        setAttendanceRecords(attendanceRes);
        setMembers(membersRes.data);
        setVisitors(visitorsRes);

        if (attendanceRes.length > 0) {
          const sorted = [...attendanceRes].sort(
            (a, b) =>
              new Date(b.attendance_date).getTime() -
              new Date(a.attendance_date).getTime()
          );

          const latestDate = new Date(sorted[0].attendance_date)
            .toISOString()
            .split("T")[0];
          setSelectedDate(latestDate);

          // ✅ Set default service to last recorded service
          setSelectedService(sorted[0].service_id.toString());
        }

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
      const recordDate = new Date(record.attendance_date)
        .toISOString()
        .split("T")[0];

      const dateCheck = !selectedDate || recordDate === selectedDate;

      const serviceCheck =
        selectedService === "All" ||
        record.service_id.toString() === selectedService;

      let categoryCheck = true;

      if (selectedCategory === "Youth" && record.person?.age !== undefined) {
        categoryCheck = record.person.age <= 30;
      }

      if (selectedCategory === "Adults" && record.person?.age !== undefined) {
        categoryCheck = record.person.age > 30;
      }

      return dateCheck && categoryCheck && serviceCheck;
    });
  }, [mergedAttendanceData, selectedCategory, selectedDate, selectedService]);

  /* -------------------- WEEK CALCULATION ---------------- */
  const getLast4Weeks = (dateStr: string) => {
    const selected = new Date(dateStr);
    const weeks: { start: Date; end: Date }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay() - (i * 7) + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({ start, end });
    }
    return weeks;
  };

  /* -------------------- WEEKLY DATA FOR CHARTS ---------------- */
  const weeklyData = useMemo(() => {
    if (!selectedDate) return { weeks: [0,0,0,0], maleWeeks: [0,0,0,0], femaleWeeks: [0,0,0,0], maleMembers:[0,0,0,0], femaleMembers:[0,0,0,0], maleVisitors:[0,0,0,0], femaleVisitors:[0,0,0,0], weekLabels: ["","","",""] };

    const weeks = getLast4Weeks(selectedDate);
    const weekLabels = weeks.map(w => `${w.start.toLocaleDateString()} - ${w.end.toLocaleDateString()}`);

    const data = {
      weeks: [0,0,0,0],
      maleWeeks: [0,0,0,0],
      femaleWeeks: [0,0,0,0],
      maleMembers: [0,0,0,0],
      femaleMembers: [0,0,0,0],
      maleVisitors: [0,0,0,0],
      femaleVisitors: [0,0,0,0],
      weekLabels
    };

    filteredAttendance.forEach(record => {
      const recordDate = new Date(record.attendance_date);
      weeks.forEach((week, idx) => {
        if (recordDate >= week.start && recordDate <= week.end) {
          data.weeks[idx]++;
          if (record.person?.gender === "Male") data.maleWeeks[idx]++;
          if (record.person?.gender === "Female") data.femaleWeeks[idx]++;
          if (record.member_id) {
            if (record.person?.gender === "Male") data.maleMembers[idx]++;
            if (record.person?.gender === "Female") data.femaleMembers[idx]++;
          }
          if (record.visitor_id) {
            if (record.person?.gender === "Male") data.maleVisitors[idx]++;
            if (record.person?.gender === "Female") data.femaleVisitors[idx]++;
          }
        }
      });
    });

    return data;
  }, [filteredAttendance, selectedDate]);

  // KPI Data
  const overallKPI = filteredAttendance.length;
  const femaleKPI = filteredAttendance.filter((record) => record.person?.gender === "Female").length;
  const maleKPI = filteredAttendance.filter((record) => record.person?.gender === "Male").length;

  // Handle "View More" logic
  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredAttendance.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  //--------------------DOWNLOAD REPORTS ----------------
  const downloadFile = async (type: "pdf" | "excel" | "csv") => {
    try {
      const response = await axios.get(
        `${baseURL}/api/reports/attendance/${type}`,
        {
          responseType: "blob", // VERY important
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          params: {
            organization_id: localStorage.getItem("organization_id"),
          }
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const extensionMap = {
        pdf: "pdf",
        excel: "xlsx",
        csv: "csv"
      };

      link.download = `attendance_data.${extensionMap[type]}`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* HAMBURGER */}
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
        {hasPermission("View Congregation Dashboard") && <a href="/congregation/dashboard">Dashboard</a>}
        {hasPermission("View Members Summary") && <a href="/congregation/members">Members</a>}
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance" className="active">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts">New Converts</a>}

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

      {/* Main content */}
      <div className="dashboard-content">
        <div className="do-not-print">
          <CongregationHeader />
        </div>

        {/* PRINT BUTTON */}
        <div className="do-not-print print-button-container">
          <button
            className="print-button"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
        </div>

        <br/>

        <header className="page-header attendance-header">
          <h1>Attendance Tracker</h1>
          <button className="add-btn" style={{ margin: "10px 0" }} onClick={() => navigate("/congregation/recordAttendance")}>
            Record Attendance
          </button>
        </header>

        {/* Filters */}
        <div className="attendance-filter-box">
          <h3>Filter Attendance</h3>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as any)}>
            <option value="All">All Categories</option>
            <option value="Youth">Youth (≤30)</option>
            <option value="Adults">Adults (&gt;30)</option>
          </select>&emsp;

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />&emsp;

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
        <br/>

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

        {/* Weekly Charts */}
        <br />
        <div className="chart-grid">
          <div className="chart-box">
            <h3>Weekly Overall Attendance</h3>
            <Line
              data={{
                labels: weeklyData.weekLabels,
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
                labels: weeklyData.weekLabels,
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
        <h2 className="records-heading do-not-print">Records</h2>
        
        <br/>

        <button className="add-btn do-not-print" onClick={() => downloadFile("pdf")}>
          📄 Export PDF
        </button>&emsp;

        <button className="add-btn do-not-print" onClick={() => downloadFile("excel")}>
          📊 Export Excel
        </button>&emsp;

        <button className="add-btn do-not-print" onClick={() => downloadFile("csv")}>
          ⬇️ Export CSV
        </button>
        <br/><br/>

        {loading ? (
          <p className="do-not-print">Loading records...</p>
        ) : error ? (
          <p className="" style={{ color: "red" }}>{error}</p>
        ) : filteredAttendance.length === 0 ? (
          <p className="do-not-print">No records found.</p>
        ) : (
          <div className="do-not-print">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Category</th>
                  <th>Congregant Type</th>
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
                      {record.member_id ? "Member" : "Visitor"}
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