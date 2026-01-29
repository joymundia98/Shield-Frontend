import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

/* ---------------- AUTH FETCH / ORG FETCH ---------------- */
// Attempt authFetch first, fallback to orgFetch if it fails
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token found");
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`authFetch failed: ${res.status}`);
  return res.json();
};

const orgFetch = async (url: string, options: RequestInit = {}) => {
  const user = localStorage.getItem("user");
  if (!user) throw new Error("No user found in localStorage");
  const parsedUser = JSON.parse(user);
  const orgId = parsedUser.organization;
  if (!orgId) throw new Error("No organization ID found");

  const orgUrl = url.includes("?") ? `${url}&organization_id=${orgId}` : `${url}?organization_id=${orgId}`;

  const res = await fetch(orgUrl, options);
  if (!res.ok) throw new Error(`orgFetch failed: ${res.status}`);
  return res.json();
};

// Wrapper to try authFetch first, fallback to orgFetch
const fetchWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    return await authFetch(url, options);
  } catch (err) {
    console.warn("authFetch failed, falling back to orgFetch:", err);
    return await orgFetch(url, options);
  }
};

const AddConvert: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // State for the form
  const [convertType, setConvertType] = useState<"visitor" | "member" | "">("");
  const [selectedVisitor, setSelectedVisitor] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [convertDate, setConvertDate] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState<"required" | "not_required" | "">("");

  // State for visitors and members data
  const [visitors, setVisitors] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Fetch visitors and members data on component mount
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const data = await fetchWithAuthFallback(`${baseURL}/api/visitor`);
        console.log("Fetched visitors:", data);  // Debugging: Check fetched visitors data
        setVisitors(data);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetchWithAuthFallback(`${baseURL}/api/members`);
        console.log("Fetched members:", response);  // Debugging: Check fetched members data
        setMembers(response.data || []); // <-- Extract data array
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchVisitors();
    fetchMembers();
  }, []); // Empty dependency array means this runs only once on mount

  /* ---------------- FORM SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the organization ID from local storage
    const user = localStorage.getItem("user");
    let organization_id = null;
    if (user) {
      const parsedUser = JSON.parse(user);
      organization_id = parsedUser.organization || null;
    }

    // Prepare data to be sent to the backend
    const data = {
      convert_type: convertType,
      convert_date: convertDate,
      follow_up_status: followUpStatus,
      member_id: convertType === "member" ? selectedMember : null,
      visitor_id: convertType === "visitor" ? selectedVisitor : null,
      organization_id: organization_id,
    };

    console.log("Sending data to the backend:", data);

    try {
      await fetchWithAuthFallback(`${baseURL}/api/converts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      alert("Convert added successfully!");
      navigate("/congregation/convertRecords");  // Redirect to convert records page
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="dashboard-wrapper converts-wrapper">
      {/* HEADER */}
      <header>
        <h1>Add New Convert</h1>

        <div style={{ marginTop: 10 }}>
          <button
            className="add-btn"
            onClick={() => navigate("/congregation/convertRecords")}
          >
            ← Convert Records
          </button>&emsp;

          <button
            className="add-btn"
            onClick={() => navigate("/congregation/converts")}
          >
            ← Converts Overview
          </button>

          <button className="hamburger" onClick={toggleSidebar}>
            &#9776;
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
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

        <h2>CONGREGATION</h2>
        {/* Conditional Sidebar Links Based on Permissions */}
        {hasPermission("View Congregation Dashboard") && <a href="/congregation/dashboard">Dashboard</a>}
        {hasPermission("View Members Summary") && <a href="/congregation/members">Members</a>}
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts" className="active">New Converts</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}
        <a
          href="/"
          className="logout-link"
          onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}
        >
          ➜ Logout
        </a>
      </div>

      {/* MAIN FORM */}
      <div className="FormContainer">

        <CongregationHeader/><br/>
        
        <form id="addConvertForm" onSubmit={handleSubmit}>
          {/* Convert Type */}
          <label>Convert Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="convertType"
                value="visitor"
                onChange={() => setConvertType("visitor")}
                required
              />
              Visitor
            </label>&emsp;&emsp;

            <label>
              <input
                type="radio"
                name="convertType"
                value="member"
                onChange={() => setConvertType("member")}
              />
              Member
            </label>
          </div>

          {/* Visitor select */}
          {convertType === "visitor" && (
            <div>
              <label>Select Visitor</label>
              <select
                value={selectedVisitor}
                onChange={(e) => setSelectedVisitor(e.target.value)}
              >
                <option value="">--Select Visitor--</option>
                {visitors.map((visitor) => (
                  <option key={visitor.id} value={visitor.id}>
                    {visitor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Member select */}
          {convertType === "member" && (
            <div>
              <label>Select Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">--Select Member--</option>
                {members.map((member) => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <label>Convert Date</label>
          <input
            type="date"
            required
            value={convertDate}
            onChange={(e) => setConvertDate(e.target.value)}
          />

          {/* Follow-Up Status */}
          <label>Follow-Up Status</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="followUpStatus"
                value="required"
                checked={followUpStatus === "required"}
                onChange={() => setFollowUpStatus("required")}
              />
              Required
            </label>&emsp;&emsp;

            <label>
              <input
                type="radio"
                name="followUpStatus"
                value="not_required"
                checked={followUpStatus === "not_required"}
                onChange={() => setFollowUpStatus("not_required")}
              />
              Not Required
            </label>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="submit" className="add-btn">
              Add Convert
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/congregation/convertRecords")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConvert;
