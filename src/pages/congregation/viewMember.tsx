import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Member {
  member_id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string | null;
  date_joined: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  age: number;
  disabled: boolean;
  orphan: boolean;
  widowed: boolean;
  nrc: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: string;
  category: string; // This will be calculated
}

const ViewMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Get member ID from URL params
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setError("Member ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${baseURL}/api/members/${id}`);

        if (!res.ok) {
          throw new Error("Member not found.");
        }

        const data: Member = await res.json();

        // Calculate the category based on age
        const calculateCategory = (age: number): string => {
          if (age < 18) return "Child";
          if (age >= 18 && age <= 30) return "Youth";
          if (age >= 31 && age <= 60) return "Adult";
          return "Elderly";
        };

        // Calculate category based on the member's age
        const category = calculateCategory(data.age);

        // Set the category in the member data
        setMember({ ...data, category });

      } catch (error: any) {
        setError(error.message || "Failed to fetch member data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!member) {
    return <div>Member not found.</div>;
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
        <a href="/congregation/members" className="active">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
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

        <CongregationHeader/><br/>
        
        <h1>Member Profile</h1>
        <br />
        {/* Back to Members List Button */}
        <button
          className="add-btn"
          onClick={() => navigate("/congregation/members")} // Navigate back to members list
        >
          &larr; Back to Members List
        </button>
        <br /><br />

        {/* Member Details Table */}
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
              <td>{member.full_name}</td>
            </tr>
            <tr>
              <td>Age</td>
              <td>{member.age}</td>
            </tr>
            {member.age >= 18 && (
              <tr>
                <td>Category</td>
                <td>{member.category}</td>  {/* Display calculated category */}
              </tr>
            )}
            <tr>
              <td>Gender</td>
              <td>{member.gender}</td>
            </tr>
            <tr>
              <td>Date Joined</td>
              <td>{new Date(member.date_joined).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{member.email}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{member.phone}</td>
            </tr>
            {member.gender === "Female" && member.widowed && (
              <tr>
                <td>Widowed</td>
                <td>Yes</td>
              </tr>
            )}
            <tr>
              <td>Disabled</td>
              <td>{member.disabled ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Orphan</td>
              <td>{member.orphan ? "Yes" : "No"}</td>
            </tr>
            {member.age < 18 && (
              <>
                <tr>
                  <td>Guardian Name</td>
                  <td>{member.guardian_name || "N/A"}</td>
                </tr>
                <tr>
                  <td>Guardian Phone</td>
                  <td>{member.guardian_phone || "N/A"}</td>
                </tr>
              </>
            )}
            {member.age >= 18 && (
              <tr>
                <td>NRC</td>
                <td>{member.nrc}</td>
              </tr>
            )}
            <tr>
              <td>Status</td>
              <td>{member.status}</td>
            </tr>
            <tr>
              <td>Created At</td>
              <td>{new Date(member.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Updated At</td>
              <td>{new Date(member.updated_at).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewMemberPage;
