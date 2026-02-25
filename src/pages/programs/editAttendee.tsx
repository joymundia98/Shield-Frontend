import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css"; // Import your styles
import ProgramsHeader from './ProgramsHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  venue: string;
  category_id: number;
}

interface Attendee {
  attendee_id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  role: string;
  program_id: number;
  customRole?: string; // Optional custom role field
}

const EditAttendee: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { attendeeId } = useParams<{ attendeeId: string }>(); // Getting attendeeId from URL
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

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

  // Fetch Attendee and Event Details
  useEffect(() => {
    if (!attendeeId) {
      console.error("Attendee ID is missing.");
      return;
    }

    // Fetch attendee details by attendeeId
    const fetchAttendeeDetails = async () => {
      try {
        const response = await fetch(`${baseURL}/api/programs/attendees/${attendeeId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch attendee details. Status: ${response.status}`);
        }
        const fetchedAttendee = await response.json();
        setAttendee(fetchedAttendee);

        // Fetch event details based on the program_id in the attendee data
        const responseEvent = await fetch(`${baseURL}/api/programs/${fetchedAttendee.program_id}`);
        if (!responseEvent.ok) {
          throw new Error(`Failed to fetch event details. Status: ${responseEvent.status}`);
        }
        const fetchedEvent = await responseEvent.json();
        setEvent(fetchedEvent);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching details:", error);
          alert("Error fetching details: " + error.message);
        } else {
          console.error("Unknown error:", error);
          alert("Unknown error occurred.");
        }
      }

    };

    fetchAttendeeDetails();
  }, [attendeeId]);

  // Handling input changes for attendee form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAttendee((prevAttendee) => ({
      ...prevAttendee!,
      [name]: value,
    }));
  };

  // Handling form submission for updating attendee
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors: string[] = [];

      // Ensure 'attendee' is not null before proceeding
      if (!attendee) {
        validationErrors.push("Attendee data is not available.");
      } else {
        if (!attendee.name) validationErrors.push("Name is required.");
        if (!attendee.email) validationErrors.push("Email is required.");
        if (!attendee.phone) validationErrors.push("Phone is required.");
        if (!attendee.age) validationErrors.push("Age is required.");
        if (!attendee.gender) validationErrors.push("Gender is required.");
        if (!attendee.role) validationErrors.push("Role is required.");
      }

      // If there are no validation errors, proceed to update attendee
      if (validationErrors.length === 0 && attendee) {
        try {
          const roleToSend = attendee.role === "Other" ? attendee.customRole : attendee.role;

          const response = await fetch(`${baseURL}/api/programs/attendees/${attendeeId}`, {
            method: "PUT",
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
              program_id: attendee.program_id,
            }),
          });

          if (response.ok) {
            alert("Attendee updated successfully!");
            navigate(`/programs/attendeeManagement`);
          } else {
            const errorData = await response.json();
            console.error("Error updating attendee:", errorData);
            alert(`Error updating attendee: ${errorData.message || "Unknown error"}`);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error updating attendee:", error);
            alert("Error updating attendee: " + error.message);
          } else {
            console.error("Unknown error:", error);
            alert("Unknown error occurred.");
          }
        }
      } else {
        setErrors(validationErrors);
      }
    };


  if (!attendee || !event) {
    return <div>Loading attendee and event details...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
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

      <div className="dashboard-content">

        <ProgramsHeader/><br/>

        <h1>Edit Attendee: {attendee.name}</h1>

        <br />

        <form onSubmit={handleSubmit} className="add-form-styling">
          {/* Event Info */}
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

          {/* Role Field */}
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

          {/* Custom Role Input */}
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

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Update Attendee
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

export default EditAttendee;
