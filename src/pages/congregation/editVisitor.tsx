import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import axios from "axios";
import { authFetch, orgFetch } from "../../utils/api";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface VisitorForm {
  photoFile?: File | null;
  photoUrl: string;
  name: string;
  gender: "Male" | "Female" | "";
  age: number | "";
  visitDate: string;
  address: string;
  phone: string;
  email: string;
  invitedBy: string;
  serviceAttended: string;
  foundBy: string;
  firstTime: boolean;
  needsFollowUp: boolean;
}

const EditVisitorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Get visitor ID from URL params
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const [formData, setFormData] = useState<VisitorForm>({
    photoFile: null,
    photoUrl: "",
    name: "",
    gender: "",
    age: "",
    visitDate: "",
    address: "",
    phone: "",
    email: "",
    invitedBy: "",
    serviceAttended: "",
    foundBy: "",
    firstTime: false,
    needsFollowUp: false,
  });

  const [loading, setLoading] = useState(true);

  // Fetch visitor data from the backend when the component is mounted
  useEffect(() => {
  const fetchVisitor = async () => {
    try {
      let response = await authFetch(`${baseURL}/api/visitor/${id}`);

      // Handle array or object
      let visitor = Array.isArray(response)
        ? response.find((v: any) => v.id === Number(id))
        : response; // if object, use it directly

      if (!visitor) throw new Error("Visitor not found");

      const formattedVisitDate = visitor.visit_date
        ? new Date(visitor.visit_date).toISOString().split("T")[0]
        : "";

      setFormData({
        photoUrl: visitor.photo_url || "",
        name: visitor.name,
        gender: visitor.gender,
        age: visitor.age,
        visitDate: formattedVisitDate,
        address: visitor.address,
        phone: visitor.phone,
        email: visitor.email,
        invitedBy: visitor.invited_by,
        serviceAttended: visitor.service_id?.toString() || "",
        foundBy: visitor.church_find_out || "",
        firstTime: visitor.first_time,
        needsFollowUp: visitor.needs_follow_up,
      });

    } catch (err) {
      console.error("authFetch failed, falling back to orgFetch:", err);

      try {
        let response = await orgFetch(`${baseURL}/api/visitor/${id}`);

        let visitor = Array.isArray(response)
          ? response.find((v: any) => v.id === Number(id))
          : response;

        if (!visitor) throw new Error("Visitor not found");

        const formattedVisitDate = visitor.visit_date
          ? new Date(visitor.visit_date).toISOString().split("T")[0]
          : "";

        setFormData({
          photoUrl: visitor.photo_url || "",
          name: visitor.name,
          gender: visitor.gender,
          age: visitor.age,
          visitDate: formattedVisitDate,
          address: visitor.address,
          phone: visitor.phone,
          email: visitor.email,
          invitedBy: visitor.invited_by,
          serviceAttended: visitor.service_id?.toString() || "",
          foundBy: visitor.church_find_out || "",
          firstTime: visitor.first_time,
          needsFollowUp: visitor.needs_follow_up,
        });

      } catch (error) {
        console.error("orgFetch failed:", error);
        alert("Error fetching visitor data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchVisitor();
}, [id]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;

    if (target instanceof HTMLInputElement) {
      // Handle different types of inputs (checkbox, number, text)
      const value = target.type === "checkbox" ? target.checked : target.value;
      setFormData((prev) => ({
        ...prev,
        [name]: target.type === "number" ? Number(value) : value,
      }));
    } else if (target instanceof HTMLSelectElement) {
      // Handle <select> element
      setFormData((prev) => ({ ...prev, [name]: target.value }));
    }
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photoFile: file }));
  };

  // ---------------------------------------------------
  // SUBMIT: Update visitor
  // ---------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    name: formData.name,
    gender: formData.gender,
    age: formData.age || null,
    visit_date: formData.visitDate,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    invited_by: formData.invitedBy,
    service_id: Number(formData.serviceAttended),
    church_find_out: formData.foundBy,
    photo_url:
      formData.photoUrl ||
      (formData.photoFile ? formData.photoFile.name : null),
    first_time: formData.firstTime,
    needs_follow_up: formData.needsFollowUp,
  };

  try {
    // 🔐 Try authFetch first
    const response = await authFetch(`${baseURL}/api/visitor/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    // Your backend may return:
    // - updated object
    // - array
    // - message
    // So we just check if response exists
    if (response) {
      alert("Visitor updated successfully!");
      navigate("/congregation/visitors");
    } else {
      throw new Error("Unexpected response");
    }

  } catch (err) {
    console.error("authFetch PUT failed, falling back to orgFetch:", err);

    try {
      const response = await orgFetch(`${baseURL}/api/visitor/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response) {
        alert("Visitor updated successfully!");
        navigate("/congregation/visitors");
      } else {
        throw new Error("Unexpected response");
      }

    } catch (error) {
      console.error("orgFetch PUT failed:", error);
      alert("Error updating visitor.");
    }
  }
};


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper visitors-wrapper">
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

        <h2>CONGREGATION</h2>
        <a href="/congregation/dashboard">Dashboard</a>
        <a href="/congregation/members">Members</a>
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors" className="active">
          Visitors
        </a>
        <a href="/congregation/converts">New Converts</a>

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

        <CongregationHeader /><br />
        
        <header>
          <h1>Edit Visitor</h1>
          <div className="header-buttons" style={{ marginTop: 10 }}>
            <button
              className="add-btn"
              onClick={() => navigate("/congregation/visitors")}
            >
              ← Visitors Overview
            </button>
          </div>
        </header>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoFile} />

            <small>Or enter a URL:</small>
            <input
              type="text"
              name="photoUrl"
              placeholder="https://example.com/photo.jpg"
              value={formData.photoUrl}
              onChange={handleChange}
            />

            <label>Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <label>Gender</label>
            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <label>Age</label>
            <input
              type="number"
              name="age"
              min={0}
              max={120}
              value={formData.age}
              onChange={handleChange}
            />

            <label>Visit Date</label>
            <input
              type="date"
              name="visitDate"
              required
              value={formData.visitDate}
              onChange={handleChange}
            />

            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Invited By</label>
            <input
              type="text"
              name="invitedBy"
              value={formData.invitedBy}
              onChange={handleChange}
            />

            <label>Service Attended</label>
            <select
              name="serviceAttended"
              required
              value={formData.serviceAttended}
              onChange={handleChange}
            >
              <option value="">Choose Service</option>
              <option value="1">Sunday Service</option>
              <option value="2">Midweek Service</option>
              <option value="3">Youth Service</option>
              <option value="4">Special Program</option>
            </select>

            <label>How did you find out about the church?</label>
            <select
              name="foundBy"
              required
              value={formData.foundBy}
              onChange={handleChange}
            >
              <option value="">Select Option</option>
              <option value="Friend/Family">Friend/Family</option>
              <option value="Online Search">Online Search</option>
              <option value="Social Media">Social Media</option>
              <option value="Church Event">Church Event</option>
              <option value="Walk-in">Walk-in</option>
            </select>


            <div className="additional-info">
              <label>
                <input
                  type="checkbox"
                  name="firstTime"
                  checked={formData.firstTime}
                  onChange={handleChange}
                />
                &emsp; First-Time Visitor
              </label>

              <label>
                <input
                  type="checkbox"
                  name="needsFollowUp"
                  checked={formData.needsFollowUp}
                  onChange={handleChange}
                />
                &emsp; Needs Follow-Up
              </label>
            </div>

            <div className="form-buttons">
              <button type="submit" className="add-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/congregation/visitors")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVisitorPage;
