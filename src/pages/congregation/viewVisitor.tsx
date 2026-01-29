import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { authFetch, orgFetch } from "../../utils/api";  // Import authFetch and orgFetch

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Visitor {
  id: number;
  name: string;
  gender: string;
  age: number;
  visit_date: string;
  address: string;
  phone: string;
  email: string;
  invited_by: string;
  photo_url: string | null;
  first_time: boolean;
  needs_follow_up: boolean;
}

// Helper function to fetch data with authFetch and fallback to orgFetch if needed
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    const data = await authFetch(url);
    if (data) return data;
    throw new Error("No data returned from authFetch.");
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");
    try {
      const data = await orgFetch(url);
      if (data) return data;
      throw new Error("No data returned from orgFetch.");
    } catch (error) {
      throw new Error("Both authFetch and orgFetch failed");
    }
  }
};

const ViewVisitorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch visitor data
  useEffect(() => {
      const fetchVisitor = async () => {
        if (!id) {
          setError("Visitor ID is missing.");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          // Use fetchDataWithAuthFallback for visitor data
          const data = await fetchDataWithAuthFallback(`${baseURL}/api/visitor/${id}`);

          if (!data) {
            throw new Error("Visitor data is missing.");
          }

          const visitorData: Visitor = data;  // <-- use data directly
          setVisitor(visitorData);

        } catch (error: any) {
          console.error("Error fetching visitor data:", error);
          setError(error.message || "Failed to fetch visitor data.");
        } finally {
          setLoading(false);
        }
      };

      fetchVisitor();
    }, [id]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!visitor) {
    return <div>Visitor not found.</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        {/* Sidebar Content */}
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>CONGREGATION</h2>
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors" className="active">Visitors</a>
        <a href="/congregation/converts">New Converts</a>

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
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <CongregationHeader /><br />
        
        <h1>Visitor Profile</h1>
        <br />
        {/* Back to Visitors List Button */}
        <button
          className="add-btn"
          onClick={() => navigate("/congregation/visitors")} // Navigate back to visitors list
        >
          &larr; Back to Visitors List
        </button>
        <br /><br />

        {/* Visitor Details Table */}
        <table className="responsive-table left-aligned-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Full Name</td>
              <td>{visitor.name}</td>
            </tr>
            <tr>
              <td>Age</td>
              <td>{visitor.age}</td>
            </tr>
            <tr>
              <td>Gender</td>
              <td>{visitor.gender}</td>
            </tr>
            <tr>
              <td>Visit Date</td>
              <td>{new Date(visitor.visit_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{visitor.address}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{visitor.phone}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{visitor.email}</td>
            </tr>
            <tr>
              <td>Invited By</td>
              <td>{visitor.invited_by || "N/A"}</td>
            </tr>
            <tr>
              <td>First Time Visitor</td>
              <td>{visitor.first_time ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Needs Follow Up</td>
              <td>{visitor.needs_follow_up ? "Yes" : "No"}</td>
            </tr>
            {visitor.photo_url && (
              <tr>
                <td>Photo</td>
                <td><img src={visitor.photo_url} alt="Visitor Photo" className="visitor-photo" /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewVisitorPage;
