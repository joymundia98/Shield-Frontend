import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const ConvertsPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Converts
  const [converts, setConverts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Converts Data
  const fetchConverts = async () => {
    try {
      const [convertsResponse, visitorsResponse, membersResponse] = await Promise.all([
        fetch(`${baseURL}/api/converts`).then(res => res.json()),
        fetch(`${baseURL}/api/visitor`).then(res => res.json()),
        fetch(`${baseURL}/api/members`).then(res => res.json()),
      ]);

      const visitors = visitorsResponse.reduce((acc: any, visitor: any) => {
        acc[visitor.id] = visitor;
        return acc;
      }, {});

      const members = membersResponse.reduce((acc: any, member: any) => {
        acc[member.member_id] = member;
        return acc;
      }, {});

      const updatedConverts = convertsResponse.map((convert: any) => {
        let name = '';
        if (convert.convert_type === "visitor" && visitors[convert.visitor_id]) {
          name = visitors[convert.visitor_id].name;
        } else if (convert.convert_type === "member" && members[convert.member_id]) {
          name = members[convert.member_id].full_name;
        }
        return { ...convert, name };
      });

      setConverts(updatedConverts);
    } catch (error) {
      console.error("Error fetching converts data:", error);
    }
  };

  useEffect(() => {
    fetchConverts();
  }, []);

  // Confirmation Modal for Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConvertId, setDeleteConvertId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteConvertId === null) return;

    try {
      // Make DELETE request to delete the convert
      await fetch(`${baseURL}/api/converts/${deleteConvertId}`, {
        method: "DELETE",
      });

      // Remove the deleted convert from the state
      setConverts(converts.filter((convert) => convert.id !== deleteConvertId));

      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setDeleteConvertId(null);
    } catch (error) {
      console.error("Error deleting convert:", error);
    }
  };

  // Cancel Deletion
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConvertId(null);
  };

  // Filtered & grouped by type
  const filteredConverts = useMemo(
    () =>
      converts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [converts, searchQuery]
  );

  const groupedConverts = useMemo(() => {
    return filteredConverts.reduce<Record<string, any[]>>((groups, c) => {
      if (!groups[c.convert_type]) groups[c.convert_type] = [];
      groups[c.convert_type].push(c);
      return groups;
    }, {} as Record<string, any[]>);
  }, [filteredConverts]);

  return (
    <div className="dashboard-wrapper converts-wrapper">
      {/* HAMBURGER */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
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
        <a href="/congregation/attendance">Attendance</a>
        <a href="/congregation/followups">Follow-ups</a>
        <a href="/congregation/visitors">Visitors</a>
        <a href="/congregation/converts" className="active">New Converts</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard">← Back to Main Dashboard</a>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <CongregationHeader/><br/>
        
        <header>
          <h1>Converts Records</h1>
          <div className="header-buttons">
            <br />
            <button
              className="add-btn"
              onClick={() => navigate("/congregation/converts")}
            >
              ← Converts Overview
            </button>&emsp;
            <button className="add-btn" onClick={() => navigate("/congregation/addConvert")}>
              + Add New Convert
            </button>
          </div>
        </header>

        {/* Search */}
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
            placeholder="Search converts..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Converts by Type */}
        {Object.entries(groupedConverts).map(([type, list]) => (
          <div className="category-block" key={type}>
            <br />
            <h2>{type}s</h2>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Convert Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c, index) => (
                  <tr key={index}>
                    <td data-title="Name">{c.name}</td>
                    <td data-title="Convert Date">
                      {new Date(c.convert_date).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button className="view-btn" onClick={() => navigate(`/congregation/viewConvert/${c.id}`)}>
                        View
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setDeleteConvertId(c.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-overlay" onClick={handleCancelDelete}>
            <div className="delete-confirmation-popup">
              <h3>Are you sure you want to delete this convert?</h3>
              <div className="delete-confirmation-buttons">
                <button className="delete-confirm-btn" onClick={handleDelete}>
                  Yes, Delete
                </button>&emsp;
                <button className="delete-cancel-btn" onClick={handleCancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConvertsPage;
