import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const AddConvert: React.FC = () => {
  const navigate = useNavigate();

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
        const response = await fetch(`${baseURL}/api/visitor`);
        const data = await response.json();
        console.log("Fetched visitors:", data);  // Debugging: Check fetched visitors data
        setVisitors(data); // Save visitors data to state
      } catch (error) {
        console.error("Error fetching visitors:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetch(`${baseURL}/api/members`);
        const data = await response.json();
        console.log("Fetched members:", data);  // Debugging: Check fetched members data
        setMembers(data); // Save members data to state
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

    // Prepare data to be sent to the backend
    const data = {
      convert_type: convertType,
      convert_date: convertDate,
      follow_up_status: followUpStatus,  // Add the follow-up status
      member_id: convertType === "member" ? selectedMember : null,
      visitor_id: convertType === "visitor" ? selectedVisitor : null,
      organization_id: 1,  // Assuming you're sending a static organization ID (could be dynamic)
    };

    console.log("Sending data to the backend:", data);  // Debugging: Check the data being sent

    try {
      const response = await fetch(`${baseURL}/api/converts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to add convert.");
      }

      alert("Convert added successfully!");
      navigate("/congregation/convertRecords");  // Redirect to convert records page
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error);
        alert("Error: " + error.message);  // Access message after confirming it's an instance of Error
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
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts" className="active">New Converts</a>

        <hr className="sidebar-separator" />

        <a href="/dashboard">← Back to Main Dashboard</a>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
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
