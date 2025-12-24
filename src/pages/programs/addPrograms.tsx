import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making HTTP requests
import "../../styles/global.css";
import ProgramsHeader from './ProgramsHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Program, Category, and Department
interface Program {
  program_id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
  status: string;
  category_id: number;
  event_type: string;
  notes: string;
  department_id: number;
  department_name: string;
}

interface Category {
  category_id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const AddProgram: React.FC = () => {
  const navigate = useNavigate();

  const categories: Category[] = [
    { category_id: 1, name: "Life Events" },
    { category_id: 2, name: "Church Business Events" },
    { category_id: 3, name: "Community Events" },
    { category_id: 4, name: "Spiritual Events" },
    { category_id: 5, name: "Other" },
  ];

  // Event types based on categories, including "Other" for every category
  const eventTypes: { [key: number]: string[] } = {
    1: ["Weddings", "Child Dedication", "Child Naming", "Funeral & Memorials", "Other"], // Life Events
    2: ["Business Meetings", "Other"], // Church Business
    3: ["Outreach & Evangelism", "Conferences", "Other"], // Community Events
    4: ["Prayer & Fasting", "Overnights", "Communion", "Baptism", "Anointing", "Revival / Crusades", "Other"], // Spiritual Events
    5: ["Workshop", "Training", "Conference", "Seminar", "Drill", "Other"], // Other
  };

  const [program, setProgram] = useState<Program>({
    program_id: Date.now(),
    title: "",
    date: "",
    time: "",
    venue: "",
    agenda: "",
    status: "Upcoming",
    category_id: 1,
    event_type: "", // Default empty, updated based on category
    notes: "",
    department_id: 13, // Default department, e.g., IT Department
    department_name: "", // Default department_name
  });

  const [departments, setDepartments] = useState<Department[]>([]); // Departments state
  const [errors, setErrors] = useState<string[]>([]);

  // Sidebar state and logic
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch departments from the backend API
  useEffect(() => {
    axios
      .get(`${baseURL}/api/departments`)
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProgram((prevProgram) => ({
      ...prevProgram,
      [name]: value,
    }));
  };

  // Handle category change and reset event type
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = parseInt(e.target.value);
    setProgram((prevProgram) => ({
      ...prevProgram,
      category_id: selectedCategoryId,
      event_type: "", // Reset event type when category changes
    }));
  };

  // Handle event type change
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedEventType = e.target.value;
      setProgram((prevProgram) => ({
        ...prevProgram,
        event_type: selectedEventType,
      }));
    };
  
    // Access eventTypes safely with optional chaining
    const getEventTypesForCategory = (categoryId: number) => {
      return eventTypes[categoryId] || []; // Return an empty array if categoryId doesn't exist
    };

  // Handle department change and update department name
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDepartmentId = parseInt(e.target.value);
    const selectedDepartment = departments.find(dep => dep.id === selectedDepartmentId);
    setProgram((prevProgram) => ({
      ...prevProgram,
      department_id: selectedDepartmentId,
      department_name: selectedDepartment ? selectedDepartment.name : "", // Set department name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors: string[] = [];
    if (!program.title) validationErrors.push("Title is required.");
    if (!program.date) validationErrors.push("Date is required.");
    if (!program.time) validationErrors.push("Time is required.");
    if (!program.venue) validationErrors.push("Venue is required.");
    if (!program.agenda) validationErrors.push("Agenda is required.");

    // If the category is "Spiritual Events" or "Other", then event_type is required
    if ((program.category_id === 4 || program.category_id === 5) && !program.event_type) {
      validationErrors.push("Event type is required for Spiritual and Other events.");
    }

    if (!program.department_id) {
      validationErrors.push("Department In Charge is required.");
    }

    if (validationErrors.length === 0) {
      try {
        // Send a POST request to the backend to add the program
        const response = await axios.post("${baseURL}/api/programs", {
          name: program.title,
          description: program.agenda,
          category_id: program.category_id,
          date: program.date,
          time: program.time,
          venue: program.venue,
          agenda: program.agenda,
          status: program.status,
          event_type: program.event_type,
          notes: program.notes,
          department_id: program.department_id,
          department_name: program.department_name, // Include department name
        });

        // Check for success and navigate
        if (response.status === 201) {
          alert("Program added successfully!");
          navigate("/programs/RegisteredPrograms");
        }
      } catch (error) {
        console.error("Error adding program:", error);
        alert("There was an issue adding the program. Please try again.");
      }
    } else {
      setErrors(validationErrors); // Show validation errors
    }
  };

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
        <a href="/programs/dashboard">Dashboard</a>
        <a href="/programs/RegisteredPrograms" className="active">
          Registered Programs
        </a>
        <a href="/programs/attendeeManagement">Attendee Management</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>
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

      {/* Main Content */}
      <div className="dashboard-content">

        <ProgramsHeader/><br/>

        <h1>Add New Program</h1><br/>

        <form className="add-form-styling" onSubmit={handleSubmit}>
          {/* Category Field */}
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={program.category_id}
              onChange={handleCategoryChange}
              className="form-input"
            >
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Dropdown */}
          <div className="form-group">
            <label htmlFor="event_type">Event Type</label>
            <select
              id="event_type"
              name="event_type"
              value={program.event_type}
              onChange={handleEventTypeChange}
              className="form-input"
            >
              <option value="">Select Event Type</option>
              {/* Use the helper function to get the event types for the selected category */}
              {getEventTypesForCategory(program.category_id).map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>

          {/* Department In Charge */}
          <div className="form-group">
            <label htmlFor="department_id">Department In Charge</label>
            <select
              id="department_id"
              name="department_id"
              value={program.department_id}
              onChange={handleDepartmentChange}
              className="form-input"
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Other Fields (Title, Date, Time, etc.) */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={program.title}
              onChange={handleChange}
              placeholder="Enter program title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={program.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={program.time}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={program.venue}
              onChange={handleChange}
              placeholder="Enter venue"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="agenda">Agenda</label>
            <textarea
              id="agenda"
              name="agenda"
              value={program.agenda}
              onChange={handleChange}
              placeholder="Enter the event agenda"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={program.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              className="form-input"
            />
          </div>

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
              Add Program
            </button>&emsp;
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/programs/RegisteredPrograms")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgram;
