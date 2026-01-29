import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import ProgramsHeader from "./ProgramsHeader";
import { authFetch, orgFetch } from "../../utils/api";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

/* =========================
   Interfaces
========================= */
interface Program {
  id: number;
  name: string;
  description: string;
  department: string;
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
  created_at: string;
}

interface Category {
  category_id: number;
  name: string;
}

/* =========================
   Component
========================= */
const ViewProgramPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const programId = queryParams.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories] = useState<Category[]>([
    { category_id: 1, name: "Life Events" },
    { category_id: 2, name: "Church Business Events" },
    { category_id: 3, name: "Community Events" },
    { category_id: 4, name: "Spiritual Events" },
    { category_id: 5, name: "Other" },
  ]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* Sidebar body lock */
  useEffect(() => {
    const body = document.body;
    sidebarOpen
      ? body.classList.add("sidebar-open")
      : body.classList.remove("sidebar-open");

    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  /* =========================
     Auth / Org Fetch Helper
  ========================= */
  const fetchWithAuthFallback = async (url: string, options?: RequestInit) => {
    try {
      return await authFetch(url, options);
    } catch (err) {
      console.warn("authFetch failed, falling back to orgFetch");
      return await orgFetch(url, options);
    }
  };

  /* =========================
     Fetch Program by ID
  ========================= */
  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) {
        setError("Program ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchWithAuthFallback(
          `${baseURL}/api/programs/${programId}`
        );
        setProgram(data);
      } catch (err: any) {
        setError(err.message || "Error fetching program details");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!program) return <div>Program not found.</div>;

  const categoryName =
    categories.find((c) => c.category_id === program.category_id)?.name ||
    "Unknown";

  /* =========================
     Delete Handler
  ========================= */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;

    try {
      await fetchWithAuthFallback(
        `${baseURL}/api/programs/${program.id}`,
        { method: "DELETE" }
      );
      alert("Program deleted successfully.");
      navigate("/programs/RegisteredPrograms");
    } catch (err: any) {
      alert("Failed to delete program.");
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
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
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <ProgramsHeader />
        <br />

        <h1>Program Details</h1>

        <button
          className="add-btn"
          onClick={() => navigate("/programs/RegisteredPrograms")}
        >
          &larr; Back to Programs
        </button>

        <br />
        <br />

        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Program ID</td><td>{program.id}</td></tr>
            <tr><td>Title</td><td>{program.name}</td></tr>
            <tr><td>Description</td><td>{program.description}</td></tr>
            <tr><td>Category</td><td>{categoryName}</td></tr>
            <tr><td>Department</td><td>{program.department}</td></tr>
            <tr><td>Date</td><td>{program.date}</td></tr>
            <tr><td>Time</td><td>{program.time}</td></tr>
            <tr><td>Venue</td><td>{program.venue}</td></tr>
            <tr><td>Agenda</td><td>{program.agenda}</td></tr>
            <tr><td>Status</td><td>{program.status}</td></tr>
            <tr><td>Event Type</td><td>{program.event_type}</td></tr>
            <tr><td>Notes</td><td>{program.notes || "N/A"}</td></tr>
            <tr>
              <td>Created At</td>
              <td>{new Date(program.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Action Buttons */}
        <div style={{ marginTop: "20px" }}>
          <button
            className="edit-btn"
            onClick={() =>
              navigate(`/programs/editProgram/${program.id}`)
            }
          >
            Edit Program
          </button>
          &emsp;
          <button className="delete-btn" onClick={handleDelete}>
            Delete Program
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProgramPage;
