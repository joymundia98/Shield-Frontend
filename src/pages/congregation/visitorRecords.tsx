import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Visitor {
  id: number;
  photo: string | null;
  name: string;
  gender: "Male" | "Female";
  age: number;
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

const VisitorRecordsPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Visitors data
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null);
  const [editVisitor, setEditVisitor] = useState<Visitor | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openViewModal = (v: Visitor) => setViewVisitor(v);
  const closeViewModal = () => setViewVisitor(null);

  const openEditModal = (v: Visitor, index: number) => {
    setEditVisitor(v);
    setEditIndex(index);
  };
  const closeEditModal = () => setEditVisitor(null);

  // Fetch visitors from backend
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/visitor`);
        const mapped = res.data.map((v: any) => ({
          id: v.id,
          photo: v.photo_url,
          name: v.name,
          gender: v.gender,
          age: v.age,
          visitDate: v.visit_date.split("T")[0],
          address: v.address,
          phone: v.phone,
          email: v.email,
          invitedBy: v.invited_by,
          serviceAttended: "", // can fetch from visitor-services if needed
          foundBy: "",
          firstTime: v.first_time,
          needsFollowUp: v.needs_follow_up,
        }));

        setVisitors(mapped);
      } catch (err) {
        console.error("Error fetching visitors:", err);
      }
    };
    fetchVisitors();
  }, []);

  const handleSaveVisitor = async (updated: Visitor) => {
    if (editIndex === null) return;

    try {
      await axios.put(`${baseURL}/api/visitor/${updated.id}`, {
        name: updated.name,
        gender: updated.gender,
        age: updated.age,
        visit_date: updated.visitDate,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        invited_by: updated.invitedBy,
        photo_url: updated.photo,
        first_time: updated.firstTime,
        needs_follow_up: updated.needsFollowUp,
      });

      const newList = [...visitors];
      newList[editIndex] = updated;
      setVisitors(newList);
      closeEditModal();
    } catch (err) {
      console.error("Error saving visitor", err);
      alert("Failed to save visitor");
    }
  };

  // Filtering
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visitors, searchQuery]);

  // Group by service attended
  const groupedVisitors = useMemo(() => {
    return filteredVisitors.reduce<Record<string, Visitor[]>>((groups, v) => {
      if (!groups[v.serviceAttended]) groups[v.serviceAttended] = [];
      groups[v.serviceAttended].push(v);
      return groups;
    }, {});
  }, [filteredVisitors]);

  return (
    <div className="dashboard-wrapper visitors-wrapper">
      {/* HAMBURGER */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
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
        <a href="/congregation/visitors" className="active">Visitors</a>
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

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        <header>
          <h1>Visitors Records</h1>

          <div className="header-buttons">
            <br />
            <button
              className="add-btn"
              onClick={() => navigate("/congregation/visitors")}
            >
              ← Visitors Overview
            </button>
          </div>
        </header>

        {/* Search + Add button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Search visitors..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            className="add-btn"
            onClick={() => navigate("/congregation/addVisitors")}
          >
            + Add Visitor
          </button>
        </div>

        {/* GROUPED VISITORS */}
        {Object.entries(groupedVisitors).map(([service, list]) => (
          <div className="category-block" key={service}>
            <br />
            <h2>{service}</h2>

            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Visit Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {list.map((v) => {
                  const index = visitors.indexOf(v);
                  return (
                    <tr key={index}>
                      <td data-title="Name">{v.name}</td>
                      <td data-title="Age">{v.age}</td>
                      <td data-title="Gender">{v.gender}</td>
                      <td data-title="Visit Date">{v.visitDate}</td>

                      <td data-title="Actions" className="actions">
                        <button className="view-btn" onClick={() => openViewModal(v)}>
                          View
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(v, index)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* VIEW MODAL */}
        {viewVisitor && (
          <>
            <div className="overlay" onClick={closeViewModal}></div>
            <div className="filter-popup modal-wide">
              {/* ... keep exactly the same content ... */}
            </div>
          </>
        )}

        {/* EDIT MODAL */}
        {editVisitor && (
          <>
            <div className="overlay" onClick={closeEditModal}></div>
            <div className="filter-popup modal-wide">
              {/* ... keep exactly the same inputs, labels, br, table attributes ... */}
              <div className="filter-popup-buttons">
                <button
                  className="add-btn"
                  onClick={() => handleSaveVisitor(editVisitor)}
                >
                  Save
                </button>
                <button className="delete-btn" onClick={closeEditModal}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorRecordsPage;
