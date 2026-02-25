import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/api"; // Importing authFetch from utils/api
import "../../styles/global.css";
import ProgramsHeader from './ProgramsHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Program, Category, and Department
interface Program {
  program_id: number;
  title: string;
  name: string;
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

const EditProgram: React.FC = () => {
  const { id: programId } = useParams<{ id: string }>(); // Get the program ID from the URL
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // Static categories and event types
  const categories: Category[] = [
    { category_id: 1, name: "Life Events" },
    { category_id: 2, name: "Church Business Events" },
    { category_id: 3, name: "Community Events" },
    { category_id: 4, name: "Spiritual Events" },
    { category_id: 5, name: "Other" },
  ];

  const eventTypes: { [key: number]: string[] } = {
    1: ["Weddings", "Child Dedication", "Child Naming", "Funeral & Memorials", "Other"],
    2: ["Business Meetings", "Other"],
    3: ["Outreach & Evangelism", "Conferences", "Other"],
    4: ["Prayer & Fasting", "Overnights", "Communion", "Baptism", "Anointing", "Revival / Crusades", "Other"],
    5: ["Workshop", "Training", "Conference", "Seminar", "Drill", "Other"],
  };

  const [program, setProgram] = useState<Program>({
    program_id: 0,
    title: "",
    name: "",
    date: "",
    time: "",
    venue: "",
    agenda: "",
    status: "Upcoming",
    category_id: 1,
    event_type: "",
    notes: "",
    department_id: 13,
    department_name: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
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

  useEffect(() => {
    authFetch(`${baseURL}/api/departments`)
      .then((data) => {
        setDepartments(data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });

    if (programId) {
      authFetch(`${baseURL}/api/programs/${programId}`)
        .then((programData) => {
          setProgram({
            program_id: programData.program_id,
            title: programData.title,
            name: programData.name,
            date: programData.date.split("T")[0], // Format the date to 'YYYY-MM-DD'
            time: programData.time,
            venue: programData.venue,
            agenda: programData.agenda,
            status: programData.status,
            category_id: programData.category_id,
            event_type: programData.event_type,
            notes: programData.notes,
            department_id: programData.department_id,
            department_name: programData.department_name,
          });
        })
        .catch((error) => {
          console.error("Error fetching program data:", error);
          alert("Error fetching program data");
        });
    }
  }, [programId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProgram((prevProgram) => ({
      ...prevProgram,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = parseInt(e.target.value);
    setProgram((prevProgram) => ({
      ...prevProgram,
      category_id: selectedCategoryId,
      event_type: "",
    }));
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEventType = e.target.value;
    setProgram((prevProgram) => ({
      ...prevProgram,
      event_type: selectedEventType,
    }));
  };

  const getEventTypesForCategory = (categoryId: number) => {
    return eventTypes[categoryId] || [];
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDepartmentId = parseInt(e.target.value);
    const selectedDepartment = departments.find(dep => dep.id === selectedDepartmentId);
    setProgram((prevProgram) => ({
      ...prevProgram,
      department_id: selectedDepartmentId,
      department_name: selectedDepartment ? selectedDepartment.name : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: string[] = [];
    if (!program.title) validationErrors.push("Title is required.");
    if (!program.date) validationErrors.push("Date is required.");
    if (!program.time) validationErrors.push("Time is required.");
    if (!program.venue) validationErrors.push("Venue is required.");
    if (!program.agenda) validationErrors.push("Agenda is required.");
    if ((program.category_id === 4 || program.category_id === 5) && !program.event_type) {
      validationErrors.push("Event type is required for Spiritual and Other events.");
    }
    if (!program.department_id) {
      validationErrors.push("Department In Charge is required.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await authFetch(`${baseURL}/api/programs/${programId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: program.name,
          description: program.agenda,
          category_id: program.category_id,
          date: program.date.split("T")[0], // Format the date to 'YYYY-MM-DD',
          time: program.time,
          venue: program.venue,
          agenda: program.agenda,
          status: program.status,
          event_type: program.event_type,
          notes: program.notes,
          department_id: program.department_id,
          department_name: program.department_name,
        }),
      });

      alert("Program updated successfully!");
      navigate("/programs/RegisteredPrograms");
    } catch (error) {
      console.error("Error updating program:", error);
      alert("There was an issue updating the program. Please try again.");
    }
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
        {hasPermission("View Programs Dashboard") &&  <a href="/programs/dashboard">Dashboard</a>}
        {hasPermission("View Registered Programs") &&  <a href="/programs/RegisteredPrograms" className="active">Registered Programs</a>}
        {hasPermission("Manage Attendees") &&  <a href="/programs/attendeeManagement">Attendee Management</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

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

        <h1>Edit Program</h1><br />

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
              value={program.name}
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
              Save Changes
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

export default EditProgram;
