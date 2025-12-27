import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api/members`;

interface MemberForm {
  photo: string;
  name: string;
  category: string;
  age: number | "";
  gender: "Male" | "Female" | "";
  joinDate: string;
  address: string;
  phone: string;
  email: string;
  disabled: boolean;
  orphan: boolean;
  widowed: boolean;
  NRC?: string;
  guardianName?: string;
  guardianPhone?: string;
  dateOfBirth?: string;
}

const EditMemberPage: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>(); // Get memberId from URL

  const [formData, setFormData] = useState<MemberForm>({
    photo: "",
    name: "",
    category: "",
    age: "",
    gender: "",
    joinDate: "",
    address: "",
    phone: "",
    email: "",
    disabled: false,
    orphan: false,
    widowed: false,
    NRC: "",
    guardianName: "",
    guardianPhone: "",
  });
  const [isAdult, _setIsAdult] = useState<boolean | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Format date function to ensure the correct format (YYYY-MM-DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Returns the date in YYYY-MM-DD format
  };

  useEffect(() => {
    console.log("Member ID from URL:", memberId); // Add this line to check if memberId is correct
    const fetchMemberData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/${memberId}`);
        const data = res.data;
        console.log(data); // Check if the response data is correct

        // Prefill formData with fetched data
        setFormData({
          photo: data.photo || "",
          name: data.full_name || "",
          category: data.category || "",
          age: data.age || "",
          gender: data.gender || "",
          joinDate: formatDate(data.date_joined) || "", // Format joinDate
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          disabled: data.disabled || false,
          orphan: data.orphan || false,
          widowed: data.widowed || false,
          NRC: data.nrc || "",
          guardianName: data.guardian_name || "",
          guardianPhone: data.guardian_phone || "",
          dateOfBirth: data.date_of_birth || "",
        });
      } catch (err) {
        console.error("Failed to fetch member data:", err);
        alert("Error fetching member data");
      }
    };

    if (memberId) {
      fetchMemberData();
    }
  }, [memberId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;

    if (target instanceof HTMLInputElement) {
      const value = target.type === "checkbox" ? target.checked : target.value;
      setFormData((prev) => ({ ...prev, [name]: target.type === "number" ? Number(value) : value }));
    } else if (target instanceof HTMLSelectElement) {
      setFormData((prev) => ({ ...prev, [name]: target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, any> = {
      photo: formData.photo || null,
      full_name: formData.name || null,
      category: formData.category || null,
      age: formData.age !== "" ? Number(formData.age) : null,
      gender: formData.gender || null,
      join_date: formData.joinDate || null,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      disabled: Boolean(formData.disabled),
      orphan: Boolean(formData.orphan),
      widowed: Boolean(formData.widowed),
      date_of_birth: formData.dateOfBirth || null,
    };

    if (isAdult) {
      payload.nrc = formData.NRC || null;
    } else if (isAdult === false) {
      payload.guardian_name = formData.guardianName || null;
      payload.guardian_phone = formData.guardianPhone || null;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/${memberId}`, {
        method: "PUT", // Use PUT method to update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        alert("Error: " + error.message);
        return;
      }

      alert("Member updated successfully!");
      navigate("/congregation/members"); // Redirect after success
    } catch (err) {
      console.error("Failed to submit member update:", err);
      alert("Server error. Check console for details.");
    }
  };

  return (
    <div className="dashboard-wrapper members-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
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
        <CongregationHeader /><br />
        <header>
          <h1>Edit Member</h1>
          <div className="header-buttons">
            <button className="add-btn" onClick={() => navigate("/congregation/members")}>
              ← Members Overview
            </button>
          </div>
        </header>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Photo</label>
            <input type="text" placeholder="Photo URL" name="photo" value={formData.photo} onChange={handleChange} />

            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

            <label>Age</label>
            <input type="number" name="age" min={0} max={120} value={formData.age} onChange={handleChange} required />

            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <label>Join Date</label>
            <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />

            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />

            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />

            <div className="additional-info">
              <div className="selection">
                <label>
                  <input type="checkbox" name="disabled" checked={formData.disabled} onChange={handleChange} /> Disabled
                </label>
              </div><br />

              <div className="selection">
                <label>
                  <input type="checkbox" name="orphan" checked={formData.orphan} onChange={handleChange} /> Orphan
                </label>
              </div><br />

              <div className="selection">
                <label>
                  <input type="checkbox" name="widowed" checked={formData.widowed} onChange={handleChange} /> Widowed (if Female)
                </label>
              </div><br />
            </div>

            {isAdult ? (
              <div>
                <label>NRC</label>
                <input type="text" name="NRC" value={formData.NRC} onChange={handleChange} />
              </div>
            ) : isAdult === false ? (
              <div>
                <label>Guardian Name</label>
                <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                <label>Guardian Phone</label>
                <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
              </div>
            ) : null}

            <div className="form-buttons">
              <button type="submit" className="add-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/congregation/members")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMemberPage;
