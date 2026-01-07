import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";  // Make sure the styles are correctly imported
import Calendar from "./Calendar"; // Import the Calendar component
import ProgramsHeader from './ProgramsHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Upcoming";
  category_id: number;
  event_type: string;
  link: string;
}

export interface Program {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  event_type: string;
  category_id: number;
  status: string;
  notes: string;
}


const ProgramsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events from backend on component mount
  useEffect(() => {
    fetch(`${baseURL}/api/programs`)
      .then((response) => response.json())
      .then((data) => {
        const formattedEvents = data.map((program: Program) => ({
          id: program.id.toString(),
          name: program.name,
          description: program.description,
          date: program.date.slice(0, 10), // Extract the date part (YYYY-MM-DD)
          start: program.time, // Use the time field for start time
          end: "17:00", // Default end time (adjust if you have specific end times)
          venue: program.venue,
          event_type: program.event_type,
          notes: program.notes,
          category_id: program.category_id, // Ensure this field exists
          status: program.status || "Upcoming" // Default status
        }));

        setEvents(formattedEvents); // Save formatted events to state
      });
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  {/*const categories = [
    { category_id: 1, name: "Life Events" },
    { category_id: 2, name: "Church Business Events" },
    { category_id: 3, name: "Community Events" },
    { category_id: 4, name: "Spiritual Events" },
    { category_id: 5, name: "Other" }
  ];*/}

  // KPI Counts (grouped by category)
  const groupCounts = useMemo(() => {
    const counts = { "Life Events": 0, "Church Business Events": 0, "Community Events": 0, "Spiritual Events": 0, "Other": 0 };

    events.forEach((e) => {
      const categoryMap: Record<number, string> = {
        1: "Life Events",
        2: "Church Business Events",
        3: "Community Events",
        4: "Spiritual Events",
        5: "Other",
      };

      const categoryName = categoryMap[e.category_id];

      if (categoryName) {
        counts[categoryName as keyof typeof counts]++;
      }
    });

    return counts;
  }, [events]);

  // Category Colors for the circles
  const categoryColors: { [key: number]: string } = {
    1: "#7aaf7cff",  // Life Events
    2: "#364c63",    // Church Business Events
    3: "#f5e784ff",  // Community Events
    4: "#AF907A",    // Spiritual Events
    5: "#1D1411",    // Other
  };

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

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

        <h2>PROGRAM MANAGER</h2>
        <a href="/programs/dashboard" className="active">Dashboard</a>
        <a href="/programs/RegisteredPrograms">Registered Programs</a>
        <a href="/programs/attendeeManagement">Attendee Management</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
        <a
          href="/"
          className="logout-link"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          ➜ Logout
        </a>
      </div>

      <div className="dashboard-content">

        <ProgramsHeader/><br/>

        <h1>Programs & Events Overview</h1>

        <br/>
        
        <div className="kpi-container programs-container">
          <div className="kpi-card">
            <h3>Life Events</h3>
            <p>{groupCounts["Life Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[1] }}></div> {/* Circle for Life Events */}
          </div>
          <div className="kpi-card">
            <h3>Church Business Events</h3>
            <p>{groupCounts["Church Business Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[2] }}></div> {/* Circle for Church Business Events */}
          </div>
          <div className="kpi-card">
            <h3>Community Events</h3>
            <p>{groupCounts["Community Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[3] }}></div> {/* Circle for Community Events */}
          </div>
          <div className="kpi-card">
            <h3>Spiritual Events</h3>
            <p>{groupCounts["Spiritual Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[4] }}></div> {/* Circle for Spiritual Events */}
          </div>
          <div className="kpi-card">
            <h3>Other Events</h3>
            <p>{groupCounts["Other"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[5] }}></div> {/* Circle for Other Events */}
          </div>
        </div>

        <div className="kpi-card">
          <h3>Event Calendar</h3>
          <Calendar events={events} /> {/* Pass the events to the Calendar component */}
        </div>
      </div>
    </div>
  );
};

export default ProgramsDashboard;
