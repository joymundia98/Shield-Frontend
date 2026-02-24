import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import HRHeader from './HRHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Staff {
  user_id?: number;
  name: string;
  role: string;
  department_id?: number;
  department?: string;
  position: string;
  contract_type: string;
  status: "active" | "on-leave" | "unpaid";
  join_date: string;
  start_date?: string;
  gender: "Male" | "Female";
  NRC: string;
  address: string;
  phone: string;
  email: string;
  photo: string;
  paid: boolean;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface Role {
  id: number;
  name: string;
}

const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  // Auth + fallback helper
const fetchWithAuthFallback = async (
  url: string,
  options?: RequestInit
) => {
  try {
    return await authFetch(url, options);
  } catch (error: unknown) {
    console.error("authFetch failed", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      navigate("/");
      return;
    }

    // fallback to orgFetch
    return await orgFetch(url, options);
  }
};

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [depData, userData, roleData] = await Promise.all([
        fetchWithAuthFallback(`${baseURL}/api/departments`),
        fetchWithAuthFallback(`${baseURL}/api/users`),
        fetchWithAuthFallback(`${baseURL}/api/roles`),
      ]);

      if (!depData || !userData || !roleData) {
        throw new Error("Failed to fetch initial data");
      }

      setDepartments(depData);
      setUsers(userData);
      setRoles(roleData);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load data");
    }
  };

  fetchData();
}, [navigate]);

  const [form, setForm] = useState<Staff>({
    name: "",
    role: "",
    department_id: undefined,
    department: "",
    position: "",
    contract_type: "",
    status: "active",
    join_date: "",
    start_date: "",
    gender: "Male",
    NRC: "",
    address: "",
    phone: "",
    email: "",
    photo: "",
    paid: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.user_id || !form.department_id) {
      alert("Please select both a user and a department.");
      return;
    }

    console.log("Submitting staff:", form);

    try {
      await fetchWithAuthFallback(`${baseURL}/api/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      alert("Staff member added successfully!");
      navigate("/hr/staffDirectory");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>HR MANAGER</h2>
        <a href="/hr/dashboard">Dashboard</a>
        <a href="/hr/staffDirectory" className="active">Staff Directory</a>
        <a href="/hr/payroll">Payroll</a>
        <a href="/hr/leave">Leave Management</a>
        <a href="/hr/leaveApplications">Leave Applications</a>
        <a href="/hr/departments">Departments</a>

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

      {/* Page Content */}
      <div className="dashboard-content">

        <HRHeader/><br/>

        <header className="page-header">
          <h1>Add Staff</h1>
          <div>
            <button className="add-btn" style={{ margin: "10px 0" }} onClick={() => navigate("/hr/staffDirectory")}>
              ← Back
            </button>
            <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>
          </div>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {/* USER */}
            <label>User (Select Existing User)</label>
            <select
              required
              value={form.user_id || ""}
              onChange={(e) => {
                const selectedUserId = Number(e.target.value);
                const selectedUser = users.find(u => u.id === selectedUserId);
                setForm({
                  ...form,
                  user_id: selectedUserId,
                  name: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "",
                });
              }}
            >
              <option value="">-- Select User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>

            {/* DEPARTMENT */}
            <label>Department</label>
            <select
              required
              value={form.department_id || ""}
              onChange={(e) => {
                const depId = Number(e.target.value);
                const selectedDept = departments.find(d => d.id === depId);
                setForm({
                  ...form,
                  department_id: depId,
                  department: selectedDept ? selectedDept.name : "",
                });
              }}
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* ROLE */}
            <label>Role</label>
            <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">-- Select Role --</option>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>

            {/* POSITION */}
            <label>Position</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />

            {/* CONTRACT TYPE */}
            <label>Contract Type</label>
            <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}>
              <option value="">-- Select Contract Type --</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Temporary">Temporary</option>
            </select>

            {/* STATUS */}
            <label>Status</label>
            <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* DATES */}
            <label>Join Date</label>
            <input type="date" required value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
            <label>Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />

            {/* GENDER */}
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* OTHER FIELDS */}
            <label>NRC</label>
            <input type="text" value={form.NRC} onChange={(e) => setForm({ ...form, NRC: e.target.value })} />
            <label>Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <label>Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            {/* PHOTO */}
            <label>Photo URL</label>
            <input type="text" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
            <label>Or Upload Photo</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {/* PAID */}
            <label>Paid?</label>
            <select value={form.paid ? "yes" : "no"} onChange={(e) => setForm({ ...form, paid: e.target.value === "yes" })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>Add Staff</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;
