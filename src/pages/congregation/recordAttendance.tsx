import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [category, setCategory] = useState<Category>("Children");
  const [gender, setGender] = useState<Gender>("Male");

  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);

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
          axios.get(`${baseURL}/api/members`),
          axios.get(`${baseURL}/api/visitor`)
        ]);

        const allMembers: Person[] = membersRes.data.map((m: any) => ({
          id: m.member_id,
          name: m.full_name,
          age: m.age,
          gender: m.gender,
          type: "member",
        }));

        const allVisitors: Person[] = visitorsRes.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          age: v.age,
          gender: v.gender,
          type: "visitor",
        }));

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
        console.error("Error fetching people:", err);
      }
    };

    fetchPeople();
  }, [category, gender]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("${baseURL}/api/services");
        setServices(res.data);
      } catch (err) {
        console.error("Error fetching services:", err);
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

    const records: AttendanceRecord[] = people.map(p => ({
      member_id: p.type === "member" ? p.id : null,
      visitor_id: p.type === "visitor" ? p.id : null,
      attendance_date: attendanceDate,
      status: attendance[`${p.type}_${p.id}`] ? "Present" : "Absent",
      service_id: selectedService,
    }));

    // Log the request to debug the data being sent
    console.log("Attendance records being sent:", records);

    try {
      const response = await axios.post("${baseURL}/api/congregation/attendance", { records });
      console.log("Server response:", response); // Log the response from the backend
      alert("Attendance saved successfully!");
      navigate("/congregation/attendance");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Error saving attendance:", err.message);
        if (err.response) {
          console.error("Response data:", err.response.data);
        }
      } else {
        console.error("Unexpected error:", err);
      }
      alert("Failed to save attendance.");
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
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance" className="active">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts">New Converts</a>
        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
      </div>

      <div className="dashboard-content attendanceRollCall">

        <CongregationHeader/><br/>
        
        <header>
          <h1>Record Attendance</h1>
          <br />
          <button className="add-btn" onClick={() => navigate("/congregation/attendance")}>← Back to Attendance Records</button>
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

        <button className="add-btn" style={{ marginTop: 20 }} onClick={saveAttendance}>Save Attendance</button>
      </div>
    </div>
  );
};

export default RecordAttendance;
