import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HRHeader from './HRHeader';
import { useAuth } from "../../hooks/useAuth";
import { authFetch } from "../../utils/api";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Department { id: number; name: string; }
interface User { id: number; first_name: string; last_name: string; }
interface Role { id: number; name: string; }

const EditStaff: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [_staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

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

  // ---------------- Fetch options ----------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [depData, userData, roleData] = await Promise.all([
          authFetch(`${baseURL}/api/departments`),
          authFetch(`${baseURL}/api/users`),
          authFetch(`${baseURL}/api/roles`),
        ]);

        // Sort alphabetically
        setDepartments((depData || []).sort((a: Department, b: Department) => a.name.localeCompare(b.name)));
        setUsers((userData || []).sort((a: User, b: User) => {
          const nameA = `${a.first_name} ${a.last_name}`;
          const nameB = `${b.first_name} ${b.last_name}`;
          return nameA.localeCompare(nameB);
        }));
        setRoles((roleData || []).sort((a: Role, b: Role) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to load options");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // ---------------- Fetch staff data ----------------
  useEffect(() => {
    if (!id || users.length === 0 || departments.length === 0) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await authFetch(`${baseURL}/api/staff/${id}`);
        setStaffData(data);

        const selectedUser = users.find(u => u.id === data.user_id);

        const formattedJoinDate = data.join_date
          ? new Date(data.join_date).toISOString().split("T")[0]
          : "";
        const formattedStartDate = data.start_date
          ? new Date(data.start_date).toISOString().split("T")[0]
          : "";

        setForm({
          user_id: data.user_id,
          name: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : data.name,
          role: data.role ?? "",
          department_id: data.department_id ?? undefined,
          department: "",
          position: data.position ?? "",
          contract_type: data.contract_type ?? "",
          status: data.status ?? "active",
          join_date: formattedJoinDate,
          start_date: formattedStartDate,
          gender: data.gender ?? "Male",
          NRC: data.nrc ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          photo: data.photo ?? "",
          paid: data.paid ?? true,
        });
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to load staff data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, users, departments, navigate]);

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
      await authFetch(`${baseURL}/api/staff/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, nrc: form.NRC }),
      });

      alert("Staff member updated successfully!");
      navigate("/hr/staffDirectory");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

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
        {hasPermission("View HR Dashboard") && <a href="/hr/dashboard">Dashboard</a>}
        {hasPermission("View Staff Directory") && <a href="/hr/staffDirectory" className="active">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") && <a href="/hr/payroll">Payroll</a>}
        {hasPermission("Manage Leave") && <a href="/hr/leave">Leave Management</a>}
        {hasPermission("View Leave Applications") && <a href="/hr/leaveApplications">Leave Applications</a>}
        {hasPermission("View Departments") && <a href="/hr/departments">Departments</a>}

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

      {/* Content */}
      <div className="dashboard-content">
        <HRHeader /><br />
        <header className="page-header">
          <h1>Edit Staff</h1>
          <div>
            <button className="add-btn" onClick={() => navigate("/hr/staffDirectory")}>
              ← Back
            </button>
            <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>
          </div>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>

            {/* User */}
            <label>User</label>
            <select
              value={form.user_id ? String(form.user_id) : ""}
              onChange={(e) => {
                const selectedUserId = Number(e.target.value);
                const selectedUser = users.find(u => u.id === selectedUserId);
                setForm({
                  ...form,
                  user_id: selectedUserId || undefined,
                  name: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "",
                });
              }}
            >
              <option value="">-- Select User --</option>
              {users.map(u => (
                <option key={u.id} value={String(u.id)}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>

            {/* Department */}
            <label>Department</label>
            <select
              value={form.department_id || ""}
              onChange={(e) => {
                const depId = Number(e.target.value);
                const selectedDept = departments.find(d => d.id === depId);
                setForm({
                  ...form,
                  department_id: depId || undefined,
                  department: selectedDept ? selectedDept.name : "",
                });
              }}
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Role */}
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">-- Select Role --</option>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>

            {/* Contract Type */}
            <label>Contract Type</label>
            <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}>
              <option value="">-- Select Contract Type --</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Temporary">Temporary</option>
            </select>

            {/* Status */}
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* Gender */}
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>

            {/* Paid */}
            <label>Paid?</label>
            <select value={form.paid ? "yes" : "no"} onChange={(e) => setForm({ ...form, paid: e.target.value === "yes" })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>

            {/* Other Fields */}
            <label>Position</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />

            <label>Join Date</label>
            <input type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />

            <label>Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />

            <label>NRC</label>
            <input type="text" value={form.NRC} onChange={(e) => setForm({ ...form, NRC: e.target.value })} />

            <label>Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <label>Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <label>Photo URL</label>
            <input type="text" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />

            <label>Upload Photo</label>
            <input type="file" onChange={handleImageUpload} />

            <button type="submit" className="add-btn">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStaff;