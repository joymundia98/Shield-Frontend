import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css"; // Assuming global styles are already imported
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ViewConvert: React.FC = () => {
  const { id } = useParams(); // Get the id from URL
  const navigate = useNavigate();
  const [convert, setConvert] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchConvert = async () => {
      try {
        const response = await fetch(`${baseURL}/api/converts/${id}`);
        const data = await response.json();

        if (data) {
          // Fetch additional information based on convert type
          let name = "";
          let additionalData = {};

          if (data.convert_type === "visitor") {
            const visitorResponse = await fetch(`${baseURL}/api/visitor/${data.visitor_id}`);
            const visitor = await visitorResponse.json();
            name = visitor.name;
            additionalData = {
              age: visitor.age,
              gender: visitor.gender,
              phone: visitor.phone,
              email: visitor.email,
              address: visitor.address,
            };
          } else if (data.convert_type === "member") {
            const memberResponse = await fetch(`${baseURL}/api/members/${data.member_id}`);
            const member = await memberResponse.json();
            name = member.full_name;
            additionalData = {
              age: member.age,
              gender: member.gender,
              phone: member.phone,
              email: member.email,
              status: member.status,
            };
          }

          setConvert({ ...data, name, ...additionalData });
        } else {
          setError("Convert not found.");
        }
      } catch (error) {
        setError("Error fetching convert details.");
        console.error("Error fetching convert details:", error);
      }
    };

    if (id) {
      fetchConvert();
    }
  }, [id]);

  if (error) {
    return (
      <div className="error-message">
        <h3>{error}</h3>
        <button onClick={() => navigate("/congregation/converts")}>Go Back to Converts</button>
      </div>
    );
  }

  if (!convert) {
    return <div>Loading...</div>;
  }

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

        <h2>CONGREGATION</h2>
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts" className="active">New Converts</a>

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

        <CongregationHeader/><br/>
        
        <h1>Convert Details</h1>

        <br />
        {/* Back to Converts List Button */}
        <button className="add-btn" onClick={() => navigate("/congregation/convertRecords")}>
          ← &nbsp; Back to Converts List
        </button>
        <br /><br/>

        {/* Convert Information Table */}
        <h3>Demographic / Basic Info</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Name</strong></td>
              <td>{convert.name}</td>
            </tr>
            {convert.age && <tr><td><strong>Age</strong></td><td>{convert.age}</td></tr>}
            {convert.gender && <tr><td><strong>Gender</strong></td><td>{convert.gender}</td></tr>}
          </tbody>
        </table>

        <h3>Contact Info</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            {convert.phone && <tr><td><strong>Phone</strong></td><td>{convert.phone}</td></tr>}
            {convert.email && <tr><td><strong>Email</strong></td><td>{convert.email}</td></tr>}
            {convert.address && <tr><td><strong>Address</strong></td><td>{convert.address}</td></tr>}
          </tbody>
        </table>

        <h3>Convert Details</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Convert Date</strong></td>
              <td>{new Date(convert.convert_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Follow-up Status</strong></td>
              <td>{convert.follow_up_status}</td>
            </tr>
            <tr>
              <td><strong>Organization ID</strong></td>
              <td>{convert.organization_id}</td>
            </tr>
            {convert.status && <tr><td><strong>Status</strong></td><td>{convert.status}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewConvert;
