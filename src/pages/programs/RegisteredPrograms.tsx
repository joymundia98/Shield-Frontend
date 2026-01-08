import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import ProgramsHeader from './ProgramsHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Interfaces for Program
interface Program {
  id: number;
  name: string;
  description: string;
  department: string;
  created_at: string;
  department_id: number;
  category_id: number;
  organization_id: number;
  date: string;
  time: string;
  venue: string;
  agenda: string;
  status: string;
  event_type: string;
  notes: string;
}

interface Category {
  category_id: number;
  name: string;
}

const RegisteredProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, _setCategories] = useState<Category[]>([
    { category_id: 1, name: "Life Events" },
    { category_id: 2, name: "Church Business Events" },
    { category_id: 3, name: "Community Events" },
    { category_id: 4, name: "Spiritual Events" },
    { category_id: 5, name: "Other" },
  ]);

  const [showVenueColumn, _setShowVenueColumn] = useState(true);

  // ---------------- Helper function to fetch programs with authFetch or orgFetch ----------------
  const fetchProgramsWithAuthFallback = async () => {
    try {
      // Attempt to fetch using authFetch first
      const programsData = await authFetch(`${baseURL}/api/programs`);
      return programsData; // Return the response directly if it's already structured
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      // If authFetch fails, fall back to orgFetch
      const programsData = await orgFetch(`${baseURL}/api/programs`);
      return programsData;
    }
  };

  // Fetch programs from backend on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsData = await fetchProgramsWithAuthFallback();
        setPrograms(programsData); // Set programs data from the response
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    fetchPrograms();
  }, []);

  // Helper function to format the date (removes time part)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Formats the date to a more readable form, like "12/14/2025"
  };

  const groupByCategory = (programs: Program[]) => {
    if (!Array.isArray(programs)) {
      console.error("Expected an array but got", programs);
      return {};  // Return an empty object or handle as needed
    }
    return programs.reduce((acc: Record<string, Program[]>, program) => {
      const category = program.category_id.toString();
      if (!acc[category]) acc[category] = [];
      acc[category].push(program);
      return acc;
    }, {});
  };

  const groupedPrograms = useMemo(() => groupByCategory(programs), [programs]);

  // Action Handlers
  const handleAddProgram = () => {
    navigate("/programs/addPrograms");
  };

  const handleEditProgram = (id: string) => {
    navigate(`/programs/editProgram/${id}`);
  };

  const handleDeleteProgram = (id: string) => {
    const baseURL = import.meta.env.VITE_BASE_URL;

    if (window.confirm("Are you sure you want to delete this program?")) {
      // Make the API call to delete the program from the backend
      authFetch(`${baseURL}/api/programs/${id}`, { method: 'DELETE' })
        .then(() => {
          // On success, filter out the deleted program from the local state
          setPrograms((prev) => prev.filter((program) => program.id !== Number(id)));
          alert("Program deleted successfully.");
        })
        .catch((error) => {
          console.error("Error deleting program:", error);
          alert("Failed to delete the program. Please try again later.");
        });
    }
  };

  const handleViewProgram = (id: string) => {
    const url = `/programs/viewProgram?id=${id}`;
    window.open(url, "_blank");
  };

  // Toggle sidebar state
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sidebar close logic and animation (exact logic copied from ProgramsDashboard)
  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    // Clean up on unmount
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
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          ➜] Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <ProgramsHeader/><br/>

        <h1>Registered Programs</h1>

        <div
          className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <button className="add-btn" onClick={handleAddProgram}>
            + &nbsp; Add New Program
          </button>
        </div>

        {Object.keys(groupedPrograms).map((categoryId) => {
          const categoryName = categories.find(
            (cat) => cat.category_id === Number(categoryId)
          )?.name;
          return (
            <div key={categoryId}>
              <h2>{categoryName}</h2>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    {showVenueColumn && <th>Venue</th>}
                    <th>Agenda</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPrograms[categoryId].map((program) => (
                    <tr key={program.id}>
                      <td data-title="Title">{program.name}</td>
                      <td data-title="Date">{formatDate(program.date)}</td> {/* Formatted date here */}
                      <td data-title="Time">{program.time}</td>
                      {showVenueColumn && <td data-title="Venue">{program.venue}</td>}
                      <td data-title="Agenda">{program.agenda}</td>
                      <td data-title="Status">{program.status}</td>
                      <td className="actions" data-title="Actions">
                        <button
                          className="add-btn"
                          onClick={() => handleViewProgram(program.id.toString())}
                        >
                          View
                        </button>&nbsp;
                        <button
                          className="edit-btn"
                          onClick={() => handleEditProgram(program.id.toString())}
                        >
                          Edit
                        </button>&nbsp;
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProgram(program.id.toString())}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegisteredProgramsPage;
