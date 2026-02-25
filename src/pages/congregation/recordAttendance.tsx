import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

type Gender = "Male" | "Female";
type Category = "Children" | "Youth" | "Adults" | "Elderly";

interface Person {
  id: number;       // member_id or visitor_id
  name: string;     // full_name for members, name for visitors
  age: number;
  gender: Gender;
  type: "member" | "visitor";  // Identifies whether the person is a member or visitor
}

interface AttendanceRecord {
  member_id: number | null;   // Member ID (null if not a member)
  visitor_id: number | null;  // Visitor ID (null if not a visitor)
  attendance_date: string;
  status: "Present" | "Absent";
  service_id: number;
}

interface Service {
  id: number;
  name: string;
}

const RecordAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [category, setCategory] = useState<Category>("Children");
  const [gender, setGender] = useState<Gender>("Male");

  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const getCategory = (age: number): Category => {
    if (age < 18) return "Children";
    if (age <= 30) return "Youth";
    if (age <= 60) return "Adults";
    return "Elderly";
  };

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const [membersRes, visitorsRes] = await Promise.all([
          authFetch(`${baseURL}/api/members`),
          authFetch(`${baseURL}/api/visitor`)
        ]);

        const allMembers: Person[] = Array.isArray(membersRes?.data)
          ? membersRes.data.map((m: any) => ({
              id: m.member_id,
              name: m.full_name,
              age: m.age,
              gender: m.gender,
              type: "member",
            }))
          : [];

        const allVisitors: Person[] = Array.isArray(visitorsRes)
          ? visitorsRes.map((v: any) => ({
              id: v.id,
              name: v.name,
              age: v.age,
              gender: v.gender,
              type: "visitor",
            }))
          : [];

        const allPeople = [...allMembers, ...allVisitors];

        const filtered = allPeople
          .filter(p => getCategory(p.age) === category && p.gender === gender)
          .sort((a, b) => a.name.localeCompare(b.name));

        setPeople(filtered);

        const initialAttendance: Record<string, boolean> = {};
        filtered.forEach(p => {
          initialAttendance[`${p.type}_${p.id}`] = false;
        });
        setAttendance(initialAttendance);

      } catch (err) {
        console.error("authFetch failed, falling back to orgFetch:", err);
        try {
          const [membersRes, visitorsRes] = await Promise.all([
            orgFetch(`${baseURL}/api/members`),
            orgFetch(`${baseURL}/api/visitor`)
          ]);

          const allMembers: Person[] = Array.isArray(membersRes?.data)
            ? membersRes.data.map((m: any) => ({
                id: m.member_id,
                name: m.full_name,
                age: m.age,
                gender: m.gender,
                type: "member",
              }))
            : [];

          const allVisitors: Person[] = Array.isArray(visitorsRes)
            ? visitorsRes.map((v: any) => ({
                id: v.id,
                name: v.name,
                age: v.age,
                gender: v.gender,
                type: "visitor",
              }))
            : [];

          const allPeople = [...allMembers, ...allVisitors];

          const filtered = allPeople
            .filter(p => getCategory(p.age) === category && p.gender === gender)
            .sort((a, b) => a.name.localeCompare(b.name));

          setPeople(filtered);
        } catch (error) {
          console.error("Error fetching people:", error);
          setPeople([]);
        }
      }
    };

    fetchPeople();
  }, [category, gender]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await authFetch(`${baseURL}/api/services`);
        setServices(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("authFetch failed, falling back to orgFetch:", err);
        try {
          const res = await orgFetch(`${baseURL}/api/services`);
          setServices(Array.isArray(res) ? res : []);
        } catch (error) {
          console.error("Error fetching services:", error);
          setServices([]);
        }
      }
    };

    fetchServices();
  }, []);

  const toggleCheck = (key: string) => {
    setAttendance(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAttendance = async () => {
    if (!selectedService) {
      alert("Please select a service.");
      return;
    }

    // Send just the array, not wrapped in an object
    const records: AttendanceRecord[] = people.map(p => ({
      member_id: p.type === "member" ? p.id : null,
      visitor_id: p.type === "visitor" ? p.id : null,
      attendance_date: attendanceDate,
      status: attendance[`${p.type}_${p.id}`] ? "Present" : "Absent",
      service_id: selectedService,
    }));

    console.log("📤 Attendance POST payload (array only)");
    console.log("Endpoint:", `${baseURL}/api/congregation/attendance`);
    console.log("Method: POST");
    console.log(JSON.stringify(records, null, 2));

    try {
      const response = await authFetch(
        `${baseURL}/api/congregation/attendance`,
        { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(records)
        }
      );
      console.log("Server response:", response);
      alert("Attendance saved successfully!");
      navigate("/congregation/attendance");
    } catch (err) {
      console.error("authFetch failed, falling back to orgFetch:", err);
      try {
        const response = await orgFetch(
          `${baseURL}/api/congregation/attendance`,
          { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(records)
          }
        );
        console.log("Server response:", response);
        alert("Attendance saved successfully!");
        navigate("/congregation/attendance");
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("Failed to save attendance.");
      }
    }

  };

  return (
    <div className="dashboard-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance" className="active">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts">New Converts</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      <div className="dashboard-content attendanceRollCall">

        <CongregationHeader/><br/>
        
        <header>
          <h1>Record Attendance</h1>
          <br />
          <button className="add-btn" onClick={() => navigate("/congregation/attendance")}>
            ← Back to Attendance Records
          </button>
        </header>
        <br /><br />

        <div className="kpi-container">
          <div className="kpi-card selection-card">
            <h3>Select Category</h3>
            <div className="rollcall-radio">
              {(["Children", "Youth", "Adults", "Elderly"] as Category[]).map((cat) => (
                <label key={cat}>
                  <input type="radio" name="category" checked={category === cat} onChange={() => setCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="kpi-card selection-card">
            <h3>Select Gender</h3>
            <div className="rollcall-radio">
              {(["Male", "Female"] as Gender[]).map((g) => (
                <label key={g}>
                  <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>
          
          <div className="kpi-card selection-card">
            <h3>Select Service</h3>
            <select
              value={selectedService ?? ""}
              onChange={(e) => setSelectedService(Number(e.target.value))}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="kpi-card selection-card">
            <h3>Select Date</h3>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>

        <div className="attendance-group">
          <h3>{category} — {gender}</h3>
          <div className="rollcall-list">
            {people.map(p => (
              <label key={`${p.type}_${p.id}`}>
                <input
                  type="checkbox"
                  checked={attendance[`${p.type}_${p.id}`] || false}
                  onChange={() => toggleCheck(`${p.type}_${p.id}`)}
                />
                {p.name} {p.type === "visitor" ? "(Visitor)" : ""}
              </label>
            ))}
          </div>
        </div>

        <button className="add-btn" style={{ marginTop: 20 }} onClick={saveAttendance}>
          Save Attendance
        </button>
      </div>
    </div>
  );
};

export default RecordAttendance;
