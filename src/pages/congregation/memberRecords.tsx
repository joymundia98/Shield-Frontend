import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/global.css";
import CongregationHeader from './CongregationHeader';

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
  disabled: boolean;
  widowed: boolean;
  orphan: boolean;
}

// Assuming authFetch and orgFetch are implemented elsewhere
const authFetch = async (url: string) => {
  // Placeholder for authFetch logic
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return response.data;
};

const orgFetch = async (url: string) => {
  // Placeholder for orgFetch logic
  const response = await axios.get(url);
  return response.data;
};

const ChurchMembersPage: React.FC = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) {
      body.classList.add("sidebar-open");
    } else {
      body.classList.remove("sidebar-open");
    }
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [_editMember, _setEditMember] = useState<Member | null>(null);
  const [_editIndex, _setEditIndex] = useState<number | null>(null);

  const [recordsToShow, setRecordsToShow] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  // Filter states
  const [filter, setFilter] = useState({
    gender: "",
    ageRange: { min: "", max: "" },
    joinDate: { from: "", to: "" },
    disabled: false,
    widowed: false,
    orphaned: false
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
    setFilter({
      gender: "",
      ageRange: { min: "", max: "" },
      joinDate: { from: "", to: "" },
      disabled: false,
      widowed: false,
      orphaned: false
    });
    setTempFilter({
      gender: "",
      ageRange: { min: "", max: "" },
      joinDate: { from: "", to: "" },
      disabled: false,
      widowed: false,
      orphaned: false
    });
    closeFilter();
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Attempt to fetch with authFetch
        const response = await authFetch(`${baseURL}/api/members`);
        const data = response.data;  // Access the 'data' key here
        
        // Ensure the data is an array before setting it to the state
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          console.error("Received data is not an array:", data);
          setMembers([]); // Fallback to an empty array if data isn't an array
        }
      } catch (error) {
        console.error("Error with authFetch, attempting orgFetch:", error);
        try {
          // Fallback to orgFetch
          const response = await orgFetch(`${baseURL}/api/members`);
          const data = response.data; // Access the 'data' key here

          // Ensure the data is an array before setting it to the state
          if (Array.isArray(data)) {
            setMembers(data);
          } else {
            console.error("Received data is not an array from orgFetch:", data);
            setMembers([]); // Fallback to an empty array if data isn't an array
          }
        } catch (fallbackError) {
          console.error("Error with orgFetch:", fallbackError);
          setMembers([]); // Fallback to an empty array if both fetches fail
        }
      }
    };

    fetchMembers();
  }, []); // Only fetch once on component mount

  const filteredMembers = useMemo(() => {
    // Ensure members is an array before applying .filter()
    if (!Array.isArray(members)) return [];

    return members
      .filter((m) => {
        const genderMatch = filter.gender ? m.gender === filter.gender : true;
        const ageMatch =
          (filter.ageRange.min ? m.age >= parseInt(filter.ageRange.min) : true) &&
          (filter.ageRange.max ? m.age <= parseInt(filter.ageRange.max) : true);
        const dateMatch =
          (filter.joinDate.from ? new Date(m.date_joined) >= new Date(filter.joinDate.from) : true) &&
          (filter.joinDate.to ? new Date(m.date_joined) <= new Date(filter.joinDate.to) : true);
        const disabledMatch = filter.disabled ? m.disabled : true;
        const orphanedMatch = filter.orphaned ? m.orphan : true;
        const widowedMatch = filter.widowed ? m.widowed : true;

        // Apply search query filter only on full_name
        const searchMatch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          genderMatch &&
          ageMatch &&
          dateMatch &&
          disabledMatch &&
          orphanedMatch &&
          widowedMatch &&
          searchMatch // Include search match for full_name only
        );
      });
  }, [members, filter, searchQuery]); // Add searchQuery as a dependency

  const getCategory = (age: number) => {
    if (age >= 0 && age <= 12) return "Child";
    if (age >= 13 && age <= 18) return "Youth";
    if (age >= 19 && age <= 64) return "Adult";
    return "Elderly"; // Age 65+
  };

  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce<Record<string, Member[]>>((groups, m) => {
      const category = getCategory(m.age); // Get the category based on age
      if (!groups[category]) groups[category] = [];
      groups[category].push(m);
      return groups;
    }, {} as Record<string, Member[]>);
  }, [filteredMembers]);

  const openEditPage = (member: Member) => {
    const url = `/congregation/editMember/${member.member_id}`;
    window.open(url, "_blank");
  };

  const openViewModal = (member: Member) => {
    window.open(`/congregation/viewMember/${member.member_id}`, "_blank");
  };

  const handleViewMore = () => {
    setShowAll(true);
    setRecordsToShow(filteredMembers.length);
  };

  const handleViewLess = () => {
    setShowAll(false);
    setRecordsToShow(5);
  };

  const downloadFile = async (type: "pdf" | "excel" | "csv") => {
  try {
    const response = await axios.get(
      `${baseURL}/api/reports/members/${type}`,
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

    link.download = `members_report.${extensionMap[type]}`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("File download failed:", error);
  }
};


  return (
    <div className="dashboard-wrapper members-wrapper">
      <button className="hamburger" onClick={toggleSidebar}> &#9776; </button>

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
        <CongregationHeader /><br />
        <header>
          <h1>Church Members Records</h1>
          <div className="header-buttons">
            <br />
            <button className="add-btn" onClick={() => navigate("/congregation/members")}> ← Members Overview </button>
          </div>
        </header>

        {/* Search and Filter buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", rowGap: "1rem" }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/congregation/addMember")}>+ Add New Member</button>&emsp;
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
          <div className="overlay" style={{ display: showFilterPopup ? "block" : "none" }} onClick={closeFilter}></div>
        )}
        <div className="filter-popup" style={{ display: showFilterPopup ? "block" : "none" }}>
          <div className="popup-content">
            <h3>Filter Members</h3>
            <label>Gender:
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

            <label>Join Date Range:&emsp;
              <input
                type="date"
                value={tempFilter.joinDate.from}
                onChange={(e) => setTempFilter({ ...tempFilter, joinDate: { ...tempFilter.joinDate, from: e.target.value } })}
              />&emsp;
              <input
                type="date"
                value={tempFilter.joinDate.to}
                onChange={(e) => setTempFilter({ ...tempFilter, joinDate: { ...tempFilter.joinDate, to: e.target.value } })}
              />
            </label>

            <div className="checkbox-group">
              <label>
                Disabled:&nbsp;
                <input
                  type="checkbox"
                  checked={tempFilter.disabled}
                  onChange={(e) => setTempFilter({ ...tempFilter, disabled: e.target.checked })}
                />
              </label>
              <label>
                Orphaned:&nbsp;
                <input
                  type="checkbox"
                  checked={tempFilter.orphaned}
                  onChange={(e) => setTempFilter({ ...tempFilter, orphaned: e.target.checked })}
                />
              </label>
              <label>
                Widowed:&nbsp;
                <input
                  type="checkbox"
                  checked={tempFilter.widowed}
                  onChange={(e) => setTempFilter({ ...tempFilter, widowed: e.target.checked })}
                />
              </label>
            </div>

            <div className="filter-popup-buttons">
              <button className="add-btn" onClick={handleApplyFilter}>Apply Filter</button>&emsp;
              <button className="delete-btn" onClick={handleClearFilter}>Clear All</button>
            </div>
          </div>
        </div>

        {/* Display Members Grouped by Category */}
        {["Child", "Youth", "Adult", "Elderly"].map((category) => {
          const memberList = groupedMembers[category];
          if (!memberList) return null;  // Skip if no members in this category
          
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
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.slice(0, recordsToShow).map((m) => (
                    <tr key={m.member_id}>
                      <td>{m.full_name}</td>
                      <td>{m.age}</td>
                      <td>{m.gender}</td>
                      <td>{m.date_joined}</td>
                      <td className="actions">
                        <button className="view-btn" onClick={() => openViewModal(m)}>
                          View
                        </button>
                        <button className="edit-btn" onClick={() => openEditPage(m)}>
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

export default ChurchMembersPage;
