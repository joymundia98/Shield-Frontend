import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";  // Make sure the styles are correctly imported
import Calendar from "./Calendar"; // Import the Calendar component
import ProgramsHeader from './ProgramsHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import the authFetch and orgFetch utilities

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  status: "Scheduled" | "Completed" | "Upcoming";
  category_id: number;
  event_type: string;
  notes: string;
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

const ProgramsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events from backend on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events using the helper function
        const data = await fetchDataWithAuthFallback(`${baseURL}/api/programs`);
        
        // Process the response and format it accordingly
        const formattedEvents = data.map((program: Program) => ({
          id: program.id.toString(),
          name: program.name,
          description: program.description,
          date: program.date.slice(0, 10), // Extract the date part (YYYY-MM-DD)
          time: program.time, // Use the time field for start time
          end: "17:00", // Default end time (adjust if you have specific end times)
          venue: program.venue,
          event_type: program.event_type,
          notes: program.notes,
          category_id: program.category_id, // Ensure this field exists
          status: program.status || "Upcoming" // Default status
        }));

        setEvents(formattedEvents); // Save formatted events to state
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };

    fetchEvents();
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

  // Upcoming Program Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  // Compute the next upcoming program
  useEffect(() => {
    const now = new Date();
    const upcomingEvents = events
      .filter((e) => new Date(`${e.date}T${e.time}`) > now)
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
    setNextEvent(upcomingEvents[0] || null);
  }, [events]);

  // Countdown timer
  useEffect(() => {
    if (!nextEvent) return;

    const interval = setInterval(() => {
      const nowTime = new Date().getTime();
      const eventTime = new Date(`${nextEvent.date}T${nextEvent.time}`).getTime();
      const diff = eventTime - nowTime;

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

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
            navigate("/"); // Redirect to the login page
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
            <div className="category-circle" style={{ backgroundColor: categoryColors[1] }}></div>
          </div>
          <div className="kpi-card">
            <h3>Church Business Events</h3>
            <p>{groupCounts["Church Business Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[2] }}></div>
          </div>
          <div className="kpi-card">
            <h3>Community Events</h3>
            <p>{groupCounts["Community Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[3] }}></div>
          </div>
          <div className="kpi-card">
            <h3>Spiritual Events</h3>
            <p>{groupCounts["Spiritual Events"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[4] }}></div>
          </div>
          <div className="kpi-card">
            <h3>Other Events</h3>
            <p>{groupCounts["Other"]}</p>
            <div className="category-circle" style={{ backgroundColor: categoryColors[5] }}></div>
          </div>
        </div>

        {/* Upcoming Program Section */}
        {nextEvent && (
          <div className="upcoming-program">
            <div className="upcominEvent-card">
              <img src="/hourglass.png" alt="Hourglass" className="hourglass" />

              <h1 className="upcominEvent-title">
                Just around the corner: {nextEvent.name}
              </h1>
              <p className="upcominEvent-desc">{nextEvent.description}</p>

              <div className="upcominEvent-meta">
                <div className="meta-box">
                  <span>Date</span>
                  {new Date(nextEvent.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="meta-box">
                  <span>Time</span>
                  {nextEvent.time}
                </div>

                <div className="meta-box">
                  <span>Venue</span>
                  {nextEvent.venue}
                </div>
                <div className="meta-box">
                  <span>Status</span>
                  {nextEvent.status}
                </div>
              </div>

              <div className="agenda">
                <strong>Agenda</strong>
                {nextEvent.notes || "Details will be provided soon."}
              </div>

              <div className="countdown">
                <div className="time-box">
                  <h2>{countdown.days}</h2>
                  <span>Days</span>
                </div>
                <div className="time-box">
                  <h2>{countdown.hours}</h2>
                  <span>Hours</span>
                </div>
                <div className="time-box">
                  <h2>{countdown.minutes}</h2>
                  <span>Minutes</span>
                </div>
                <div className="time-box">
                  <h2>{countdown.seconds}</h2>
                  <span>Seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="kpi-card">
          <h3>Event Calendar</h3>
          <Calendar events={events} /> {/* Pass the events to the Calendar component */}
        </div>
      </div>
    </div>
  );
};

export default ProgramsDashboard;
