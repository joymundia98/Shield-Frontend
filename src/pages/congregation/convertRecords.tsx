import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import CongregationHeader from "./CongregationHeader";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Helper: calculate age from DOB
const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const ConvertsPage: React.FC = () => {
  const navigate = useNavigate();

  const { hasPermission } = useAuth(); // Access the hasPermission function
  

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

  // Authenticated fetch function
  const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found.");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching data from ${url}: ${res.statusText}`);
  }

  if (res.status !== 204) { // 204 No Content has no JSON
    return res.json();
  }
  return null;
};

  // Fetch Converts Data
  const fetchConverts = async () => {
    try {
      const [convertsResponse, visitorsResponse, membersResponse] =
        await Promise.all([
          authFetch(`${baseURL}/api/converts`),
          authFetch(`${baseURL}/api/visitor`),
          authFetch(`${baseURL}/api/members`),
        ]);


      const visitors = visitorsResponse.reduce((acc: any, visitor: any) => {
        acc[visitor.id] = visitor;
        return acc;
      }, {});

      const members = membersResponse.data.reduce((acc: any, member: any) => {
        acc[member.member_id] = member;
        return acc;
      }, {});

      // Update converts with additional data
      const updatedConverts = convertsResponse.map((convert: any) => {
        let source: any = null;
        let name = "";

        if (convert.convert_type === "visitor") {
          source = visitors[convert.visitor_id];
          name = source?.name || "";
        } else if (convert.convert_type === "member") {
          source = members[convert.member_id];
          name = source?.full_name || "";
        }

        return {
          ...convert,
          name,
          gender: source?.gender || "",
          dob: source?.dob || null,
          age: source?.age || (source?.dob ? calculateAge(source.dob) : null),  // Calculate age if missing
        };
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
    // DELETE using authFetch
    await authFetch(`${baseURL}/api/converts/${deleteConvertId}`, {
      method: "DELETE",
    });

    // Update state after deletion
    setConverts(converts.filter((c) => c.id !== deleteConvertId));
    setShowDeleteConfirm(false);
    setDeleteConvertId(null);
  } catch (error) {
    console.error("Error deleting convert:", error);
  }
};


  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConvertId(null);
  };

  // Filter states
  const [filter, setFilter] = useState({
    gender: "",
    ageRange: { min: "", max: "" },
    convertDateRange: { from: "", to: "" },
    convertType: "",
    needsFollowUp: null as boolean | null,
  });

  const [tempFilter, setTempFilter] = useState(filter);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

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
    const cleared = {
      gender: "",
      ageRange: { min: "", max: "" },
      convertDateRange: { from: "", to: "" },
      convertType: "",
      needsFollowUp: null,
    };
    setFilter(cleared);
    setTempFilter(cleared);
    closeFilter();
  };

  // ✅ FULL FILTER LOGIC (FIXED)
  const filteredConverts = useMemo(() => {
    return converts.filter((c) => {
      // Search
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Gender
      const matchesGender =
        !filter.gender || c.gender === filter.gender;

      // Age
      let matchesAge = true;
      const convertAge = c.age || calculateAge(c.dob);  // Use c.age if available, else calculate from dob

      if (filter.ageRange.min || filter.ageRange.max) {
        const minAge = filter.ageRange.min ? Number(filter.ageRange.min) : null;
        const maxAge = filter.ageRange.max ? Number(filter.ageRange.max) : null;

        if (minAge !== null && convertAge < minAge) matchesAge = false;
        if (maxAge !== null && convertAge > maxAge) matchesAge = false;
      }

      // Convert type
      const matchesType =
        !filter.convertType ||
        c.convert_type
          .toLowerCase()
          .includes(filter.convertType.toLowerCase());

      // Convert date range
      const convertDate = new Date(c.convert_date);
      const from = filter.convertDateRange.from
        ? new Date(filter.convertDateRange.from)
        : null;
      const to = filter.convertDateRange.to
        ? new Date(filter.convertDateRange.to)
        : null;

      const matchesDate =
        (!from || convertDate >= from) &&
        (!to || convertDate <= to);

      // Follow-up
      const matchesFollowUp =
        filter.needsFollowUp === null ||
        (filter.needsFollowUp
          ? c.follow_up_status === "required"
          : c.follow_up_status !== "required");

      return (
        matchesSearch &&
        matchesGender &&
        matchesAge &&
        matchesType &&
        matchesDate &&
        matchesFollowUp
      );
    });
  }, [converts, searchQuery, filter]);

  // Grouped by type
  const groupedConverts = useMemo(() => {
    return filteredConverts.reduce<Record<string, any[]>>((groups, c) => {
      if (!groups[c.convert_type]) groups[c.convert_type] = [];
      groups[c.convert_type].push(c);
      return groups;
    }, {});
  }, [filteredConverts]);

  // View More / View Less logic
  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredConverts.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  // Download Reports
    const downloadFile = async (type: "pdf" | "excel" | "csv") => {
      try {
        const response = await axios.get(
          `${baseURL}/api/reports/converts/${type}`,
          {
            responseType: "blob", // VERY important
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            params: {
              organization_id: localStorage.getItem("organization_id"),
              gender: filter.gender || undefined,
              // status can be added later if needed
            }
          }
        );
    
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        link.href = url;
    
        const extensionMap = {
          pdf: "pdf",
          excel: "xlsx",
          csv: "csv"
        };
    
        link.download = `converts_report.${extensionMap[type]}`;
        document.body.appendChild(link);
        link.click();
    
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("File download failed:", error);
      }
    };

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
        {/* Conditional Sidebar Links Based on Permissions */}
        {hasPermission("View Congregation Dashboard") && <a href="/congregation/dashboard">Dashboard</a>}
        {hasPermission("View Members Summary") && <a href="/congregation/members">Members</a>}
        {hasPermission("Record Congregation Attendance") && <a href="/congregation/attendance">Attendance</a>}
        {hasPermission("View Congregation Follow-ups") && <a href="/congregation/followups">Follow-ups</a>}
        {hasPermission("View Visitor Dashboard") && <a href="/congregation/visitors">Visitors</a>}
        {hasPermission("View Converts Dashboard") && <a href="/congregation/converts" className="active">New Converts</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

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
        <CongregationHeader /><br />

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
            placeholder="Search converts..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/congregation/addConvert")}>
            + Add Convert
          </button>&emsp;
          <button className="filter-btn" onClick={openFilter}>
            📂 Filter
          </button>&emsp;
          <div style={{ display: "flex", gap: "10px"}}>
            <button className="add-btn" onClick={() => downloadFile("pdf")}>
              📄 Export PDF
            </button>

            <button className="add-btn" onClick={() => downloadFile("excel")}>
              📊 Export Excel
            </button>

            <button className="add-btn" onClick={() => downloadFile("csv")}>
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        {/* Filter Popup */}
        {showFilterPopup && (
          <div
            className="overlay"
            style={{ display: showFilterPopup ? "block" : "none" }}
            onClick={closeFilter}
          ></div>
        )}
        <div className="filter-popup" style={{ display: showFilterPopup ? "block" : "none" }}>
          <div className="popup-content">
            <h3>Filter Converts</h3>

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

            <label>
              Age Range:&emsp;
              <input
                type="number"
                placeholder="Min Age"
                value={tempFilter.ageRange.min}
                onChange={(e) => setTempFilter({ ...tempFilter, ageRange: { ...tempFilter.ageRange, min: e.target.value } })}
              />
              &emsp;
              <input
                type="number"
                placeholder="Max Age"
                value={tempFilter.ageRange.max}
                onChange={(e) => setTempFilter({ ...tempFilter, ageRange: { ...tempFilter.ageRange, max: e.target.value } })}
              />
            </label>

            <label>
              Convert Date Range:&emsp;
              <input
                type="date"
                value={tempFilter.convertDateRange.from}
                onChange={(e) => setTempFilter({ ...tempFilter, convertDateRange: { ...tempFilter.convertDateRange, from: e.target.value } })}
              />
              &emsp;
              <input
                type="date"
                value={tempFilter.convertDateRange.to}
                onChange={(e) => setTempFilter({ ...tempFilter, convertDateRange: { ...tempFilter.convertDateRange, to: e.target.value } })}
              />
            </label>

            {/* Convert Type Dropdown */}
            <label>
              Convert Type:&emsp;
              <select
                value={tempFilter.convertType}
                onChange={(e) => setTempFilter({ ...tempFilter, convertType: e.target.value })}
              >
                <option value="">All</option>
                <option value="visitor">Visitor</option>
                <option value="member">Member</option>
              </select>
            </label>

            <label>
              Needs Follow-Up:&nbsp;
              <select
                value={tempFilter.needsFollowUp === null ? "" : tempFilter.needsFollowUp ? "true" : "false"}
                onChange={(e) => setTempFilter({
                  ...tempFilter,
                  needsFollowUp: e.target.value === "true" ? true : e.target.value === "false" ? false : null
                })}
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
                {list.slice(0, recordsToShow).map((c, index) => (
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

        {/* View More / View Less */}
        <button onClick={showAll ? handleViewLess : handleViewMore} className="add-btn">
          {showAll ? "View Less" : "View More"}
        </button>

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
