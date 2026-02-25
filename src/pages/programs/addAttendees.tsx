import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css"; // Import your styles
import ProgramsHeader from './ProgramsHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Event and Attendee
interface Event {
  id: number;        // Changed from event_id
  name: string;      // Changed from title
  date: string;
  time: string;
  venue: string;
  category_id: number; // Changed from category
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  role: string;
  customRole?: string; // For custom role input
}

const NewAttendees: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { programId } = useParams<{ programId: string }>(); // Getting the programId from the URL
  const [event, setEvent] = useState<Event | null>(null);
  const [attendee, setAttendee] = useState<Attendee>({
    name: "",
    email: "",
    phone: "",
    age: 0,
    gender: "",
    role: "",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const fetchEventDetails = async () => {
  try {
    console.log(`Fetching event details for programId: ${programId}`);  // Debugging log

    // Use authFetch, fall back to orgFetch if authFetch fails
    let eventResponse;
    try {
      eventResponse = await authFetch(`${baseURL}/api/programs/${programId}`);
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      eventResponse = await orgFetch(`${baseURL}/api/programs/${programId}`);
    }

    console.log("Received event response:", eventResponse);  // Debugging log

    if (!eventResponse) {
      throw new Error("No event data received.");
    }

    const fetchedEvent = eventResponse;  // Assuming data is nested in `data` property, adjust as needed

    console.log("Fetched event details:", fetchedEvent);  // Debugging log

    // Check event status (only proceed if it's 'Scheduled' or 'Upcoming')
    if (fetchedEvent && (fetchedEvent.status === "Scheduled" || fetchedEvent.status === "Upcoming")) {
      setEvent(fetchedEvent);  // Set event state
    } else {
      // If status is not "Scheduled" or "Upcoming", show a message and prevent further action
      alert("This event is not currently available for registration.");
      navigate("/programs/attendeeManagement");  // Navigate away from this page
    }
  } catch (error) {
    console.error("Error fetching event details:", error);
    alert("Error fetching event details. Please try again.");
  }
};


    fetchEventDetails();

  // Handling input changes for attendee registration form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAttendee((prevAttendee) => ({
      ...prevAttendee,
      [name]: value,
    }));
  };

  // Handling form submission for attendee registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    // Validate attendee data
    if (!attendee.name) validationErrors.push("Name is required.");
    if (!attendee.email) validationErrors.push("Email is required.");
    if (!attendee.phone) validationErrors.push("Phone is required.");
    if (!attendee.age) validationErrors.push("Age is required.");
    if (!attendee.gender) validationErrors.push("Gender is required.");
    if (!attendee.role) validationErrors.push("Role is required.");

    // If there are no validation errors, send POST request
    if (validationErrors.length === 0) {
      try {
        const roleToSend = attendee.role === "Other" ? attendee.customRole : attendee.role;

        // Use authFetch to submit attendee, fall back to orgFetch if authFetch fails
        let attendeeResponse;
        try {
          attendeeResponse = await authFetch(`${baseURL}/api/programs/attendees`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: attendee.name,
              email: attendee.email,
              phone: attendee.phone,
              age: attendee.age,
              gender: attendee.gender,
              role: roleToSend,
              program_id: programId,
            }),
          });
        } catch (error) {
          console.log("authFetch failed, falling back to orgFetch");
          attendeeResponse = await orgFetch(`${baseURL}/api/programs/attendees`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: attendee.name,
              email: attendee.email,
              phone: attendee.phone,
              age: attendee.age,
              gender: attendee.gender,
              role: roleToSend,
              program_id: programId,
            }),
          });
        }

        if (attendeeResponse) {
          alert("Attendee registered successfully!");
          navigate(`/programs/attendeeManagement`); // Navigate to attendee management
        } else {
          // Handle error from backend response
          const errorData = await attendeeResponse.json();
          console.error("Error registering attendee:", errorData);
          alert(`Error registering attendee: ${errorData.message || "Unknown error"}`);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert("Error registering attendee: " + error.message);
        } else {
          alert("An unknown error occurred.");
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  // If event is still null, show loading message
  if (!event) {
    console.log("Event is still null or undefined.");
    return <div>Loading event details...</div>;
  }

  return (
    <div className="dashboard-wrapper">
            {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        {/* Close Button */}
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
        {hasPermission("View Programs Dashboard") &&  <a href="/programs/dashboard">Dashboard</a>}
        {hasPermission("View Registered Programs") &&  <a href="/programs/RegisteredPrograms">Registered Programs</a>}
        {hasPermission("Manage Attendees") &&  <a href="/programs/attendeeManagement" className="active">Attendee Management</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <ProgramsHeader /><br />

        <h1>Register Attendee for {event.name}</h1>

        <br />

        <form className="add-form-styling" onSubmit={handleSubmit}>
          {/* Event Info Display */}
          <div className="event-info">
            <p><strong>Event:</strong> {event.name}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Category:</strong> {event.category_id}</p>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={attendee.name}
              onChange={handleChange}
              placeholder="Enter attendee's name"
              className="form-input"
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={attendee.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="form-input"
            />
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={attendee.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="form-input"
            />
          </div>

          {/* Age Field */}
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={attendee.age}
              onChange={handleChange}
              placeholder="Enter age"
              className="form-input"
            />
          </div>

          {/* Gender Field */}
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={attendee.gender}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Role Field with Custom Role Option */}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={attendee.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Role</option>
              <option value="Speaker">Speaker</option>
              <option value="Participant">Participant</option>
              <option value="Organizer">Organizer</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Role Input Field */}
          {attendee.role === "Other" && (
            <div className="form-group">
              <label htmlFor="customRole">Custom Role</label>
              <input
                type="text"
                id="customRole"
                name="customRole"
                value={attendee.customRole || ""}
                onChange={handleChange}
                placeholder="Enter custom role"
                className="form-input"
              />
            </div>
          )}

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="error-messages">
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit and Cancel buttons */}
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Register Attendee
            </button>&emsp;
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(`/programs/attendeeManagement`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAttendees;
