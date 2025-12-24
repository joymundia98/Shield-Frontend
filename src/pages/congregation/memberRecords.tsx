import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Member {
  member_id: number;
  full_name: string;
  category: "Adult" | "Youth" | "Child" | "Elderly";
  age: number;
  gender: "Male" | "Female";
  date_joined: string;
  address?: string;
  phone?: string;
  email?: string;
  photo?: string;
}

const ChurchMembersPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/members`);
        const data: Member[] = res.data.map((m: any) => {
          let category: Member["category"] = "Adult";
          if (m.age < 18) category = "Child";
          else if (m.age <= 30) category = "Youth";
          else if (m.age > 60) category = "Elderly";

          return {
            member_id: m.member_id,
            full_name: m.full_name,
            category,
            age: m.age,
            gender: m.gender,
            date_joined: m.date_joined?.split("T")[0] || "",
            address: m.address || "",
            phone: m.phone || "",
            email: m.email || "",
            photo: m.photo || "https://via.placeholder.com/120",
          };
        });
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce<Record<string, Member[]>>((groups, m) => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
      return groups;
    }, {} as Record<string, Member[]>);
  }, [filteredMembers]);

  // Edit Member Logic
  const openEditModal = (member: Member, index: number) => {
    setEditMember(member);
    setEditIndex(index);
  };

  const closeEditModal = () => setEditMember(null);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editMember) {
      const { name, value } = e.target;
      setEditMember({ ...editMember, [name]: value });
    }
  };

  const handleSaveEdit = () => {
    if (editMember && editIndex !== null) {
      const updatedMembers = [...members];
      updatedMembers[editIndex] = editMember;
      setMembers(updatedMembers);
      closeEditModal();
    }
  };

  // Open the member view modal in a new tab
  const openViewModal = (member: Member) => {
    window.open(`/congregation/viewMember/${member.member_id}`, "_blank");
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

        <CongregationHeader/><br/>
        
        <header>
          <h1>Church Members Records</h1>
          <div className="header-buttons">
            <br />
            <button
              className="add-btn"
              onClick={() => navigate("/congregation/members")}
            >
              ← Members Overview
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Search members..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/congregation/addMember")}>
            + Add New Member
          </button>
        </div>

        {/* Display Members Grouped by Category */}
        {Object.entries(groupedMembers).map(([category, memberList]) => (
          <div className="category-block" key={category}>
            <br />
            <h2>{category}</h2>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((m, index) => (
                  <tr key={m.member_id}>
                    <td>{m.full_name}</td>
                    <td>{m.age}</td>
                    <td>{m.gender}</td>
                    <td>{m.date_joined}</td>
                    <td className="actions">
                      <button
                        className="view-btn"
                        onClick={() => openViewModal(m)}
                      >
                        View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(m, index)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="overlay" onClick={closeEditModal}></div>
      )}
      {editMember && (
        <div className="filter-popup modal-wide">
          <h3>Edit Member</h3>
          <label>Name</label>
          <input
            type="text"
            name="full_name"
            value={editMember.full_name}
            onChange={handleEditChange}
          />
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={editMember.category}
            onChange={handleEditChange}
            disabled
          />
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={editMember.age}
            onChange={handleEditChange}
          />
          <label>Gender</label>
          <select
            name="gender"
            value={editMember.gender}
            onChange={handleEditChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <label>Join Date</label>
          <input
            type="date"
            name="date_joined"
            value={editMember.date_joined}
            onChange={handleEditChange}
          />
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={editMember.phone || ""}
            onChange={handleEditChange}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={editMember.email || ""}
            onChange={handleEditChange}
          />
          <div className="filter-popup-buttons">
            <button
              className="add-btn"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="delete-btn"
              onClick={closeEditModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurchMembersPage;
