import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from './HRHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Department {
  id: number;
  name: string;
  desc: string;
  total: number;
  category: "church" | "corporate";
}

const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* -------------------- Department States -------------------- */
  const [churchDepartments, setChurchDepartments] = useState<Department[]>([]);
  const [corporateDepartments, setCorporateDepartments] = useState<Department[]>([]);

  /* -------------------- Popup States -------------------- */
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<"church" | "corporate" | null>(null);

  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  /* -------------------- Sidebar -------------------- */
 const toggleSidebar = () => setSidebarOpen((prev) => !prev);
 
   useEffect(() => {
     if (sidebarOpen) document.body.classList.add("sidebar-open");
     else document.body.classList.remove("sidebar-open");
   }, [sidebarOpen]);

  /* -------------------- Fetch Departments from Backend -------------------- */
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${baseURL}/api/departments`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        const churchDepts = data
          .filter((d: any) => d.category === "church")
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            desc: d.description,
            total: d.total || 0, // Default to 0 if no total is provided
            category: d.category,
          }));

        const corporateDepts = data
          .filter((d: any) => d.category === "corporate")
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            desc: d.description,
            total: d.total || 0, // Default to 0 if no total is provided
            category: d.category,
          }));

        const staffRes = await fetch(`${baseURL}/api/staff`);
        if (!staffRes.ok) throw new Error(`HTTP error! status: ${staffRes.status}`);
        const staffData = await staffRes.json();

        const countStaffForDepartment = (departments: Department[], staff: any[]) => {
          return departments.map((dept) => ({
            ...dept,
            total: staff.filter((staffMember: any) => staffMember.department_id === dept.id).length,
          }));
        };

        setChurchDepartments(countStaffForDepartment(churchDepts, staffData));
        setCorporateDepartments(countStaffForDepartment(corporateDepts, staffData));
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  /* -------------------- Popup Logic -------------------- */
  const openPopup = (group: "church" | "corporate", index: number | null = null) => {
    setEditingGroup(group);
    setEditIndex(index);

    if (index !== null) {
      const dept =
        group === "church" ? churchDepartments[index] : corporateDepartments[index];
      setDeptName(dept.name);
      setDeptDesc(dept.desc);
    } else {
      setDeptName("");
      setDeptDesc("");
    }

    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditIndex(null);
    setEditingGroup(null);
  };

  /* --------------------FETCH FUNCTION --------------------*/
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${baseURL}/api/departments`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      const churchDepts = data
        .filter((d: any) => d.category === "church")
        .map((d: any) => ({
          id: d.id,
          name: d.name,
          desc: d.description,
          total: d.total || 0, // Default to 0 if no total is provided
          category: d.category,
        }));

      const corporateDepts = data
        .filter((d: any) => d.category === "corporate")
        .map((d: any) => ({
          id: d.id,
          name: d.name,
          desc: d.description,
          total: d.total || 0, // Default to 0 if no total is provided
          category: d.category,
        }));

      const staffRes = await fetch(`${baseURL}/api/staff`);
      if (!staffRes.ok) throw new Error(`HTTP error! status: ${staffRes.status}`);
      const staffData = await staffRes.json();

      const countStaffForDepartment = (departments: Department[], staff: any[]) => {
        return departments.map((dept) => ({
          ...dept,
          total: staff.filter((staffMember: any) => staffMember.department_id === dept.id).length,
        }));
      };

      setChurchDepartments(countStaffForDepartment(churchDepts, staffData));
      setCorporateDepartments(countStaffForDepartment(corporateDepts, staffData));
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };


  /* -------------------- Save Handler -------------------- */
  const saveDepartment = async () => {
    if (!deptName.trim()) {
      alert("Department name is required");
      return;
    }

    if (!editingGroup) return;

    const departmentData = {
      name: deptName,
      description: deptDesc,
      category: editingGroup,
      total: 0,
    };

    if (editIndex !== null) {
      // Editing existing department
      const deptId =
        editingGroup === "church"
          ? churchDepartments[editIndex].id
          : corporateDepartments[editIndex].id;

      try {
        const res = await fetch(`${baseURL}/api/departments/${deptId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(departmentData),
        });
        if (!res.ok) throw new Error("Failed to update department");

        await res.json(); // Make sure to await the response

        // Re-fetch all departments
        fetchDepartments();

        alert("Department updated successfully!");
      } catch (err) {
        console.error("Error updating department:", err);
        alert("Failed to update department.");
      }
    } else {
      // Creating new department
      try {
        const res = await fetch(`${baseURL}/api/departments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(departmentData),
        });
        if (!res.ok) throw new Error("Failed to add new department");

        await res.json();

        // Re-fetch all departments
        fetchDepartments();

        alert("Department added successfully!");
      } catch (err) {
        console.error("Error adding department:", err);
        alert("Failed to add new department.");
      }
    }

    closePopup();
  };



  /* -------------------- Delete Handler -------------------- */
  const deleteDepartment = async (group: "church" | "corporate", index: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    const deptId =
      group === "church" ? churchDepartments[index].id : corporateDepartments[index].id;

    try {
      const res = await fetch(`${baseURL}/api/departments/${deptId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete department");

      // Remove department locally
      if (group === "church") {
        setChurchDepartments((prev) => prev.filter((_, i) => i !== index));
      } else {
        setCorporateDepartments((prev) => prev.filter((_, i) => i !== index));
      }

      alert("Department deleted successfully!");
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Failed to delete department.");
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              id="closeSidebarButton"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>
         
        <h2>HR MANAGER</h2>
        <a href="/hr/dashboard">Dashboard</a>
        <a href="/hr/staffDirectory">Staff Directory</a>
        <a href="/hr/payroll">Payroll</a>
        <a href="/hr/leave">Leave Management</a>
        <a href="/hr/leaveApplications">Leave Applications</a>
        <a href="/hr/departments" className="active">
          Departments
        </a>

        <hr className="sidebar-separator" />

        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
        </a>
        <a
          className="logout-btn"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <HRHeader/><br/>

        {/* Church Departments */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="department-header">Church Departments</h2>
            <button className="add-btn" onClick={() => openPopup("church")}>
              + &nbsp; Add Church Department
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>Department ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {churchDepartments.map((dept, index) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>{dept.name}</td>
                  <td>{dept.desc}</td>
                  <td>{dept.total}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openPopup("church", index)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteDepartment("church", index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Corporate Departments */}
        <div className="table-section" style={{ marginTop: "3rem" }}>
          <div className="table-header">
            <h2 className="department-header">Corporate Departments</h2>
            <button className="add-btn" onClick={() => openPopup("corporate")}>
              + &nbsp; Add Corporate Department
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>Department ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corporateDepartments.map((dept, index) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>{dept.name}</td>
                  <td>{dept.desc}</td>
                  <td>{dept.total}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openPopup("corporate", index)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteDepartment("corporate", index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Overlay */}
      {showPopup && <div className="overlay" onClick={closePopup}></div>}

      {/* Popup Form */}
      <div
        className="filter-popup"
        style={{ display: showPopup ? "block" : "none", width: "380px", padding: "2rem" }}
      >
        <h3>{editIndex !== null ? "Edit Department" : "Add Department"}</h3>

        <label>Name</label>
        <input
          type="text"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
          placeholder="Department Name"
        />

        <br/>
        <label>Description</label>
        <textarea
          value={deptDesc}
          onChange={(e) => setDeptDesc(e.target.value)}
          placeholder="Short description"
        ></textarea>

        <div
          className="filter-popup-buttons"
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <button className="add-btn" onClick={saveDepartment}>
            Save
          </button>
          <button className="cancel-btn" onClick={closePopup}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
