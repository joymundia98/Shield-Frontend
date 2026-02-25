import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import { authFetch } from "../../utils/api";
import HRHeader from './HRHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

{/*interface Staff {
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
}*/}

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

const EditStaff: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { id } = useParams(); // Get the staff ID from the URL

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  // Fetch departments, users, and roles
  useEffect(() => {
    const fetchData = async () => {
        try {
        const depRes = await fetch(`${baseURL}/api/departments`);
        if (!depRes.ok) throw new Error("Failed fetching departments");
        const depData = await depRes.json();

        const [userData, roleData] = await Promise.all([
            authFetch(`${baseURL}/api/users`),
            authFetch(`${baseURL}/api/roles`),
        ]);

        setDepartments(depData);
        setUsers(userData);
        setRoles(roleData);

        // Fetch the staff data by ID if editing an existing staff member
        if (id) {
            const staffRes = await fetch(`${baseURL}/api/staff/${id}`);
            const staffData = await staffRes.json();
            
            // Make sure dates are in the correct format for <input type="date">
            const formattedJoinDate = staffData.join_date ? new Date(staffData.join_date).toISOString().split('T')[0] : '';
            const formattedStartDate = staffData.start_date ? new Date(staffData.start_date).toISOString().split('T')[0] : '';
            
            setForm({
            ...staffData,
            join_date: formattedJoinDate,
            start_date: formattedStartDate,
            });
        }
        } catch (err: any) {
        console.error(err);
        alert(err.message);
        if (err.message.includes("JWT") || err.message.includes("token")) {
            navigate("/");
        }
        }
    };

    fetchData();
    }, [id, navigate]);


  // Form state for the staff member
  const [form, setForm] = useState({
    user_id: undefined as number | undefined,
    name: "",
    role: "",
    department_id: undefined as number | undefined,
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

    try {
      // Send the updated data using PUT method
      await authFetch(`${baseURL}/api/staff/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      alert("Staff member updated successfully!");
      navigate("/hr/staffDirectory");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!form) return <div>Loading...</div>; // Wait until the form data is fetched

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
        {hasPermission("View HR Dashboard") &&  <a href="/hr/dashboard">Dashboard</a>}
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory" className="active">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") &&  <a href="/hr/payroll">Payroll</a>}
        {hasPermission("Manage Leave") &&  <a href="/hr/leave">Leave Management</a>}
        {hasPermission("View Leave Applications") &&  <a href="/hr/leaveApplications">Leave Applications</a>}
        {hasPermission("View Departments") && <a href="/hr/departments">Departments</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/"); // logout
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* Page Content */}
      <div className="dashboard-content">

        <HRHeader/><br/>

        <header className="page-header">
          <h1>Edit Staff</h1>
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
                user_id: selectedUserId ?? undefined, // Converts null to undefined
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
                department_id: depId ?? undefined, // Converts null to undefined
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

            <button type="submit" className="add-btn" style={{ marginTop: 20 }}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStaff;
