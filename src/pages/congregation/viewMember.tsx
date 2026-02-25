import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { authFetch, orgFetch } from "../../utils/api";  // Import authFetch and orgFetch
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


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

// Helper function to fetch data with authFetch and fallback to orgFetch if needed
// Helper function to fetch data with authFetch and fallback to orgFetch if needed
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    // Attempt to fetch using authFetch first
    const data = await authFetch(url);

    // If data is returned correctly, return it
    if (data) {
      return data;
    } else {
      throw new Error("No data returned from authFetch.");
    }
  } catch (error) {
    console.log("authFetch failed, falling back to orgFetch");
    try {
      // Fallback to orgFetch if authFetch fails
      const data = await orgFetch(url);

      // If data is returned correctly, return it
      if (data) {
        return data;
      } else {
        throw new Error("No data returned from orgFetch.");
      }
    } catch (error) {
      throw new Error('Both authFetch and orgFetch failed');
    }
  }
};

const ViewMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Get member ID from URL params
  console.log('id', id)
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

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
        // Use fetchDataWithAuthFallback for fetching member data
        const data = await fetchDataWithAuthFallback(`${baseURL}/api/members/${id}`);

        console.log('Fetched Data:', data);

        // Check if the response has the 'data' field
        if (!data || !data.data) {
          throw new Error("Member data is missing.");
        }

        const memberData: Member = data.data;

        // Calculate the category based on age
        const calculateCategory = (age: number): string => {
          if (age < 18) return "Child";
          if (age >= 18 && age <= 30) return "Youth";
          if (age >= 31 && age <= 60) return "Adult";
          return "Elderly";
        };

        // Calculate category based on the member's age
        const category = calculateCategory(memberData.age);

        // Set the member data and category
        setMember({ ...memberData, category });

      } catch (error: any) {
        console.error("Error fetching data:", error);
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
        {/* Conditional Sidebar Links Based on Permissions */}
        {hasPermission("View Congregation Dashboard") && <a href="/congregation/dashboard">Dashboard</a>}
        {hasPermission("View Members Summary") && <a href="/congregation/members" className="active">Members</a>}
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts">New Converts</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

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
