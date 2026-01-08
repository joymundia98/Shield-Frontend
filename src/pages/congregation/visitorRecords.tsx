import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

const baseURL = import.meta.env.VITE_BASE_URL;

// Visitor interface for type-checking
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

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Visitor data state
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [filter, setFilter] = useState({
    gender: "",
    ageRange: { min: "", max: "" },
    visitDateRange: { from: "", to: "" },
    needsFollowUp: null as boolean | null,
  });

  const [tempFilter, setTempFilter] = useState(filter);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Open and close filter
  const openFilter = () => {
    setTempFilter(filter);
    setShowFilterPopup(true);
  };
  const closeFilter = () => setShowFilterPopup(false);

  const handleApplyFilter = () => {
    setFilter(tempFilter);
    closeFilter();
  };

  const handleClearFilter = () => {
    setFilter({
      gender: "",
      ageRange: { min: "", max: "" },
      visitDateRange: { from: "", to: "" },
      needsFollowUp: null,
    });
    setTempFilter({
      gender: "",
      ageRange: { min: "", max: "" },
      visitDateRange: { from: "", to: "" },
      needsFollowUp: null,
    });
    closeFilter();
  };

  // Authenticated fetch logic
  const authFetch = async (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found.");
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  // Unauthenticated fetch logic
  const orgFetch = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
  };

  // Fetch visitors data with the authenticated request
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await authFetch(`${baseURL}/api/visitor`);
        const data: Visitor[] = res.map((v: any) => ({
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
          serviceAttended: v.service_attended,
          foundBy: v.found_by,
          firstTime: v.first_time,
          needsFollowUp: v.needs_follow_up,
        }));

        setVisitors(data);
      } catch (err) {
        console.error("Error fetching visitors:", err);
      }
    };
    fetchVisitors();
  }, []); // Empty dependency array ensures this only runs once on component mount

  // Filtering logic for visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const searchMatch = v.name.toLowerCase().includes(searchQuery.toLowerCase());

      const genderMatch = filter.gender ? v.gender === filter.gender : true;
      
      const ageMatch =
        (filter.ageRange.min ? v.age >= parseInt(filter.ageRange.min) : true) &&
        (filter.ageRange.max ? v.age <= parseInt(filter.ageRange.max) : true);
      
      const dateMatch =
        (filter.visitDateRange.from ? new Date(v.visitDate) >= new Date(filter.visitDateRange.from) : true) &&
        (filter.visitDateRange.to ? new Date(v.visitDate) <= new Date(filter.visitDateRange.to) : true);

      const followUpMatch =
        filter.needsFollowUp !== null ? v.needsFollowUp === filter.needsFollowUp : true;

      return (
        searchMatch &&
        genderMatch &&
        ageMatch &&
        dateMatch &&
        followUpMatch
      );
    });
  }, [visitors, searchQuery, filter]); // Add filter as dependency

  const getCategory = (age: number) => {
    if (age >= 0 && age <= 12) return "Child";
    if (age >= 13 && age <= 18) return "Youth";
    if (age >= 19 && age <= 64) return "Adult";
    return "Elderly"; // Age 65+
  };

  // Group visitors by service attended
  const groupedVisitors = useMemo(() => {
    return filteredVisitors.reduce<Record<string, Visitor[]>>((groups, v) => {
      const category = getCategory(v.age); // Get the category based on age
      if (!groups[category]) groups[category] = [];
      groups[category].push(v);
      return groups;
    }, {} as Record<string, Visitor[]>);
  }, [filteredVisitors]);


  // "View More / View Less" logic
  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredVisitors.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  // Open the view visitor page in a new tab
  const openViewVisitor = (id: number) => {
    window.open(`/congregation/viewVisitor/${id}`, "_blank");
  };

  // Open the edit visitor page in a new tab
  const openEditVisitor = (id: number) => {
    window.open(`/congregation/editVisitor/${id}`, "_blank");
  };

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
        <CongregationHeader /><br />

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

        {/* Search and Filter buttons */}
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
          </button>&emsp;
          <button className="filter-btn" onClick={openFilter}>
            📂 Filter
          </button>
        </div>

        {/* Filter Popup */}
        {showFilterPopup && (
          <div className="overlay" style={{ display: showFilterPopup ? "block" : "none" }} onClick={closeFilter}></div>
        )}
        <div className="filter-popup" style={{ display: showFilterPopup ? "block" : "none" }}>
          <div className="popup-content">
            <h3>Filter Visitors</h3>

            <label>
              Gender:
              <select
                value={tempFilter.gender}
                onChange={(e) => setTempFilter({ ...tempFilter, gender: e.target.value })}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label>Age Range:&emsp;
              <input
                type="number"
                placeholder="Min Age"
                value={tempFilter.ageRange.min}
                onChange={(e) => setTempFilter({ ...tempFilter, ageRange: { ...tempFilter.ageRange, min: e.target.value } })}
              />&emsp;
              <input
                type="number"
                placeholder="Max Age"
                value={tempFilter.ageRange.max}
                onChange={(e) => setTempFilter({ ...tempFilter, ageRange: { ...tempFilter.ageRange, max: e.target.value } })}
              />
            </label>

            <label>Visit Date Range:&emsp;
              <input
                type="date"
                value={tempFilter.visitDateRange.from}
                onChange={(e) => setTempFilter({ ...tempFilter, visitDateRange: { ...tempFilter.visitDateRange, from: e.target.value } })}
              />&emsp;
              <input
                type="date"
                value={tempFilter.visitDateRange.to}
                onChange={(e) => setTempFilter({ ...tempFilter, visitDateRange: { ...tempFilter.visitDateRange, to: e.target.value } })}
              />
            </label>

            <label>
              Needs Follow-Up:&nbsp;
              <select
                value={tempFilter.needsFollowUp === null ? "" : tempFilter.needsFollowUp ? "true" : "false"}
                onChange={(e) => setTempFilter({ ...tempFilter, needsFollowUp: e.target.value === "true" ? true : e.target.value === "false" ? false : null })}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>

            <div className="filter-popup-buttons">
              <button className="add-btn" onClick={handleApplyFilter}>Apply Filter</button>&emsp;
              <button className="delete-btn" onClick={handleClearFilter}>Clear All</button>
            </div>
          </div>
        </div>

        {/* GROUPED VISITORS */}
        {["Child", "Youth", "Adult", "Elderly"].map((category) => {
          const visitorList = groupedVisitors[category];
          if (!visitorList) return null;  // Skip if no visitors in this category
          
          let ageRange = '';
          if (category === "Child") ageRange = "0-12";
          if (category === "Youth") ageRange = "13-18";
          if (category === "Adult") ageRange = "19-64";
          if (category === "Elderly") ageRange = "65+";

          return (
            <div className="category-block" key={category}>
              <br/><br/>
              <h2>{`${category} (${ageRange})`}</h2>
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
                  {visitorList.slice(0, recordsToShow).map((v) => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>{v.age}</td>
                      <td>{v.gender}</td>
                      <td>{v.visitDate}</td>
                      <td className="actions">
                        <button className="view-btn" onClick={() => openViewVisitor(v.id)}>
                          View
                        </button>
                        <button className="edit-btn" onClick={() => openEditVisitor(v.id)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={showAll ? handleViewLess : handleViewMore} className="add-btn">
                {showAll ? "View Less" : "View More"}
              </button>
              <br/><br/>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default VisitorRecordsPage;
