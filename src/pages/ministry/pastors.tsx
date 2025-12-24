import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

interface Staff {
  name: string;
  department: string;
  role: string;
  status: string;
  hierarchy: string;
  joinDate: string;
  transferDate?: string;
  gender: string;
  NRC: string;
  address: string;
  phone: string;
  email: string;
  photo: string;
}

const PastorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [staffData, setStaffData] = useState<Staff[]>([
    {
      name: "Rev. John Mensah",
      department: "Pastoral / Clergy",
      role: "Senior Pastor",
      status: "active",
      hierarchy: "senior",
      joinDate: "2015-01-10",
      transferDate: "",
      gender: "Male",
      NRC: "12345678/12/1",
      address: "12 Gospel St, Accra",
      phone: "+233201234567",
      email: "john@church.org",
      photo: "https://via.placeholder.com/120",
    },
    {
      name: "Rev. Mary Asante",
      department: "Youth Ministry",
      role: "Youth Pastor",
      status: "transferring-in",
      hierarchy: "associate",
      joinDate: "2023-09-01",
      transferDate: "2023-11-15",
      gender: "Female",
      NRC: "87654321/12/2",
      address: "45 Hope Ave, Accra",
      phone: "+233209876543",
      email: "mary@church.org",
      photo: "https://via.placeholder.com/120",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStaffIndex, setSelectedStaffIndex] = useState<number | null>(null);

  const [tempStaff, setTempStaff] = useState<Staff>({
    name: "",
    department: "",
    role: "",
    status: "active",
    hierarchy: "member",
    joinDate: "",
    transferDate: "",
    gender: "Male",
    NRC: "",
    address: "",
    phone: "",
    email: "",
    photo: "",
  });

  // ------------------- Sidebar -------------------
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ------------------- Filtered Staff -------------------
  const _filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffData;
    return staffData.filter((staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffData, searchQuery]);

  // ------------------- Handlers -------------------
  const handleAdd = () => {
    navigate("/pastors/add", { state: { addStaffCallback: setStaffData } });
  };

  const handleEdit = (index: number) => {
    setSelectedStaffIndex(index);
    setTempStaff(staffData[index]);
    setEditModalOpen(true);
  };

  const handleView = (index: number) => {
    setSelectedStaffIndex(index);
    setViewModalOpen(true);
  };

  const handleSaveStaff = () => {
    if (selectedStaffIndex !== null) {
      setStaffData((prev) => {
        const newData = [...prev];
        newData[selectedStaffIndex] = tempStaff;
        return newData;
      });
    } else {
      setStaffData((prev) => [...prev, tempStaff]);
    }
    setEditModalOpen(false);
  };

  // ------------------- Departments Grouping -------------------
  const departments = useMemo(() => {
    const groups: Record<string, Staff[]> = {};
    _filteredStaff.forEach((staff) => {
      if (!groups[staff.department]) groups[staff.department] = [];
      groups[staff.department].push(staff);
    });
    return groups;
  }, [_filteredStaff]);


  return (
    <div className="dashboard-wrapper">
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

        <h2>Ministry Manager</h2>
        <a href="/dashboard">Dashboard</a>
        <a href="/staff" className="active">
          Pastors & Clergy
        </a>
        <a href="/payroll">Payroll</a>
        <a href="/attendance">Attendance</a>
        <a href="/leave">Leave Management</a>
        <hr className="sidebar-separator" />
        <a href="/" className="logout-link">
          ➜] Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1>Pastors & Clergy Directory</h1>

        {/* Add + Search */}
        <div
          className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Search pastors or clergy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={handleAdd}>
            + Add New Pastor/Clergy
          </button>
        </div>

        {/* Departments */}
        {Object.keys(departments).map((dept) => (
          <div key={dept} className="department-block">
            <h2>{dept}</h2>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Hierarchy</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Transfer Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments[dept].map((staff, index) => (
                  <tr key={index}>
                    <td>{staff.name}</td>
                    <td>{staff.role}</td>
                    <td>{staff.hierarchy.replace("-", " ")}</td>
                    <td>{staff.status.replace("-", " ")}</td>
                    <td>{staff.joinDate}</td>
                    <td>{staff.transferDate || "-"}</td>
                    <td className="actions">
                      <button className="view-btn" onClick={() => handleView(index)}>View</button>
                      <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="filter-popup modal-wide">
            <h3>Pastor/Clergy Profile</h3>
            <label>Name</label>
            <input
              type="text"
              value={tempStaff.name}
              onChange={(e) => setTempStaff({ ...tempStaff, name: e.target.value })}
            />
            <label>Department</label>
            <select
              value={tempStaff.department}
              onChange={(e) => setTempStaff({ ...tempStaff, department: e.target.value })}
            >
              <option value="">-- Select Ministry --</option>
              <option value="Pastoral / Clergy">Pastoral / Clergy</option>
              <option value="Youth Ministry">Youth Ministry</option>
              <option value="Children's Ministry">Children's Ministry</option>
              <option value="Music / Choir / Worship">Music / Choir / Worship</option>
              <option value="Outreach / Evangelism">Outreach / Evangelism</option>
              <option value="Prayer / Intercession">Prayer / Intercession</option>
              <option value="Counseling / Care Ministry">Counseling / Care Ministry</option>
            </select>
            <label>Role</label>
            <input
              type="text"
              value={tempStaff.role}
              onChange={(e) => setTempStaff({ ...tempStaff, role: e.target.value })}
            />
            <label>Status</label>
            <select
              value={tempStaff.status}
              onChange={(e) => setTempStaff({ ...tempStaff, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="transferring-in">Transferring In</option>
              <option value="transferring-out">Transferring Out</option>
              <option value="retired">Retired</option>
            </select>
            <label>Hierarchy</label>
            <select
              value={tempStaff.hierarchy}
              onChange={(e) => setTempStaff({ ...tempStaff, hierarchy: e.target.value })}
            >
              <option value="senior">Senior Pastor / Leader</option>
              <option value="associate">Associate Pastor</option>
              <option value="assistant">Assistant / Ministry Leader</option>
              <option value="member">Clergy Member</option>
            </select>
            <label>Join Date</label>
            <input
              type="date"
              value={tempStaff.joinDate}
              onChange={(e) => setTempStaff({ ...tempStaff, joinDate: e.target.value })}
            />
            <label>Transfer Date</label>
            <input
              type="date"
              value={tempStaff.transferDate}
              onChange={(e) => setTempStaff({ ...tempStaff, transferDate: e.target.value })}
            />
            <label>Gender</label>
            <select
              value={tempStaff.gender}
              onChange={(e) => setTempStaff({ ...tempStaff, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label>ID / NRC</label>
            <input
              type="text"
              value={tempStaff.NRC}
              onChange={(e) => setTempStaff({ ...tempStaff, NRC: e.target.value })}
            />
            <label>Address</label>
            <input
              type="text"
              value={tempStaff.address}
              onChange={(e) => setTempStaff({ ...tempStaff, address: e.target.value })}
            />
            <label>Phone</label>
            <input
              type="text"
              value={tempStaff.phone}
              onChange={(e) => setTempStaff({ ...tempStaff, phone: e.target.value })}
            />
            <label>Email</label>
            <input
              type="email"
              value={tempStaff.email}
              onChange={(e) => setTempStaff({ ...tempStaff, email: e.target.value })}
            />
            <label>Photo URL</label>
            <input
              type="text"
              value={tempStaff.photo}
              onChange={(e) => setTempStaff({ ...tempStaff, photo: e.target.value })}
            />
            <div className="filter-popup-buttons">
              <button className="add-btn" onClick={handleSaveStaff}>Save</button>
              <button className="delete-btn" onClick={() => setEditModalOpen(false)}>Close</button>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModalOpen && selectedStaffIndex !== null && (
          <div className="filter-popup modal-wide">
            <h3>Pastor/Clergy Profile</h3>
            <table className="responsive-table view-table">
              <tbody>
                {Object.entries(staffData[selectedStaffIndex]).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {key === "photo" ? <img src={value as string} style={{ maxWidth: 120 }} /> : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="filter-popup-buttons">
              <button className="delete-btn" onClick={() => setViewModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastorsPage;
