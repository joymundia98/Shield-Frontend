import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

interface Class {
  id: number;
  name: string;
  type: string;
}

interface Student {
  id: number;
  name: string;
  classId: number;
}

const ClassDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const enrollmentChartRef = useRef<Chart | null>(null);
  const attendanceChartRef = useRef<Chart | null>(null);

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add/remove sidebar-open class on body
  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }

    // Cleanup on unmount
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Example dynamic data
  const classes: Class[] = useMemo(
    () => [
      { id: 1, name: "Kids Class", type: "Kids" },
      { id: 2, name: "Teens Class", type: "Teens" },
      { id: 3, name: "Adult Class", type: "Adults" },
      { id: 4, name: "Baptism Class", type: "Baptism" },
      { id: 5, name: "Discipleship Class", type: "Discipleship" },
    ],
    []
  );

  const students: Student[] = useMemo(
    () => [
      { id: 1, name: "Alice", classId: 1 },
      { id: 2, name: "Bob", classId: 1 },
      { id: 3, name: "Charlie", classId: 2 },
      { id: 4, name: "Diana", classId: 3 },
      { id: 5, name: "Ethan", classId: 4 },
      { id: 6, name: "Fiona", classId: 5 },
    ],
    []
  );

  // KPI calculations
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalTeachers = 12; // Example
  const avgAttendance = 86; // Example %

  // Enrollment Chart
  useEffect(() => {
    enrollmentChartRef.current?.destroy();
    const ctx = document.getElementById("enrollmentChart") as HTMLCanvasElement;
    if (ctx) {
      const classNames = classes.map((c) => c.type);
      const studentCounts = classes.map(
        (c) => students.filter((s) => s.classId === c.id).length
      );

      enrollmentChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: classNames,
          datasets: [
            {
              label: "Students Enrolled",
              data: studentCounts,
              backgroundColor: "#1A3D7C",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }, [classes, students]);

  // Attendance Chart
  useEffect(() => {
    attendanceChartRef.current?.destroy();
    const ctx = document.getElementById("attendanceChart") as HTMLCanvasElement;
    if (ctx) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May"];
      const attendanceData = [80, 82, 88, 87, 90];

      attendanceChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "Attendance (%)",
              data: attendanceData,
              borderColor: "#1A3D7C",
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
    }
  }, []);

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

        <h2>CLASS MANAGER</h2>
        <a href="/class/dashboard" className="active">Dashboard</a>
        <a href="/class/classes">Classes</a>
        <a href="/class/enrollments">Enrollments</a>
        <a href="/class/attendance">Attendance</a>
        <a href="/class/teachers">Teachers</a>
        <a href="/class/reports">Reports</a>
        <a href="/class/settings">Settings</a>

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
          ➜] Logout
        </a>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <h1>Class Management Overview</h1>

        <br/><br/>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Classes</h3>
            <p>{totalClasses}</p>
          </div>
          <div className="kpi-card">
            <h3>Total Students</h3>
            <p>{totalStudents}</p>
          </div>
          <div className="kpi-card">
            <h3>Teachers</h3>
            <p>{totalTeachers}</p>
          </div>
          <div className="kpi-card">
            <h3>Avg Attendance</h3>
            <p>{avgAttendance}%</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Enrolled Students</h3>
            <canvas id="enrollmentChart"></canvas>
          </div>
          <div className="chart-box">
            <h3>Attendance Last 5 Months</h3>
            <canvas id="attendanceChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDashboard;
