import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


const baseURL = import.meta.env.VITE_BASE_URL;

interface Convert {
  id: number;
  convert_type: "visitor" | "member";
  visitor_id?: number | null;
  member_id?: number | null;
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  convert_date: string;
  follow_up_status: string;
  organization_id: string;
  status?: string;
}

// Helper to fetch with authFetch fallback
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    const data = await authFetch(url);
    if (data) return data;
    throw new Error("No data from authFetch");
  } catch (err) {
    console.log("authFetch failed, falling back to orgFetch:", err);
    try {
      const data = await orgFetch(url);
      if (data) return data;
      throw new Error("No data from orgFetch");
    } catch (err) {
      throw new Error("Both authFetch and orgFetch failed");
    }
  }
};

const ViewConvert: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [convert, setConvert] = useState<Convert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  useEffect(() => {
  const fetchConvert = async () => {
    if (!id) {
      setError("Convert ID is missing.");
      return;
    }

    try {
      // 1️⃣ Fetch the convert record
      const convertData: any = await fetchDataWithAuthFallback(`${baseURL}/api/converts/${id}`);
      if (!convertData) {
        setError("Convert not found.");
        return;
      }

      let demographicData: Partial<Convert> = {};

      if (convertData.convert_type === "visitor" && convertData.visitor_id) {
        const visitor = await fetchDataWithAuthFallback(`${baseURL}/api/visitor/${convertData.visitor_id}`);
        console.log("Visitor data:", visitor); // ✅ Debug
        demographicData = {
          name: visitor?.name,
          age: visitor?.age,
          gender: visitor?.gender,
          phone: visitor?.phone,
          email: visitor?.email,
          address: visitor?.address,
        };
      } else if (convertData.convert_type === "member" && convertData.member_id) {
        const memberResponse: any = await fetchDataWithAuthFallback(
          `${baseURL}/api/members/${convertData.member_id}`
        );
        console.log("Member API response:", memberResponse);

        // The member object is inside `data` key
        const member = memberResponse?.data ?? null;

        if (member) {
          demographicData = {
            name: member.full_name,
            age: member.age,
            gender: member.gender,
            phone: member.phone,
            email: member.email,
            status: member.status,
          };
        }
      }

      console.log("Final demographic data:", demographicData); // ✅ Debug
      setConvert({ ...convertData, ...demographicData });
    } catch (err: any) {
      console.error("Error fetching convert details:", err);
      setError(err.message || "Error fetching convert details.");
    }
  };

  fetchConvert();
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
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
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
        {hasPermission("View Members Summary") && <a href="/congregation/members">Members</a>}
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts" className="active">New Converts</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      <div className="dashboard-content">
        <CongregationHeader /><br />
        <h1>Convert Details</h1>
        <br />
        <button className="add-btn" onClick={() => navigate("/congregation/convertRecords")}>
          ← &nbsp; Back to Converts List
        </button>
        <br /><br />

        <h3>Demographic / Basic Info</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr><td><strong>Name</strong></td><td>{convert.name}</td></tr>
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
            <tr><td><strong>Convert Date</strong></td><td>{new Date(convert.convert_date).toLocaleDateString()}</td></tr>
            <tr><td><strong>Follow-up Status</strong></td><td>{convert.follow_up_status}</td></tr>
            <tr><td><strong>Organization ID</strong></td><td>{convert.organization_id}</td></tr>
            {convert.status && <tr><td><strong>Status</strong></td><td>{convert.status}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewConvert;
