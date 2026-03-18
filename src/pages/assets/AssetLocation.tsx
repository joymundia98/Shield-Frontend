import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from "./AssetsHeader";
import { authFetch, orgFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Location {
  id: number;
  name: string;
  desc: string;
}

const AssetLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- AUTH FETCH ----------------
  const fetchDataWithAuthFallback = async (url: string, options?: RequestInit) => {
    try {
      return await authFetch(url, options);
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch", error);
      return await orgFetch(url, options);
    }
  };

  // ---------------- STATE ----------------
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");

  // ---------------- FETCH LOCATIONS ----------------
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);

        const data = await fetchDataWithAuthFallback(`${baseURL}/api/assets/location`);

        const mapped: Location[] = (data as any[]).map((item) => ({
          id: item.location_id,
          name: item.name,
          desc: item.description,
        }));

        setLocations(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load locations");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // ---------------- POPUP ----------------
  const openPopup = (id: number | null = null) => {
    setShowPopup(true);

    if (id !== null) {
      const data = locations.find((l) => l.id === id);
      if (!data) return;

      setLocationName(data.name);
      setLocationDesc(data.desc);
      setEditId(id);
    } else {
      setLocationName("");
      setLocationDesc("");
      setEditId(null);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditId(null);
    setLocationName("");
    setLocationDesc("");
  };

  // ---------------- SAVE LOCATION ----------------
  const saveLocation = async () => {
    if (!locationName.trim()) {
      alert("Location name is required");
      return;
    }

    try {
      const options: RequestInit = {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationName,
          description: locationDesc,
        }),
      };

      if (editId !== null) {
        // UPDATE
        options.method = "PATCH";

        await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/location/${editId}`,
          options
        );

        setLocations((prev) =>
          prev.map((l) =>
            l.id === editId ? { ...l, name: locationName, desc: locationDesc } : l
          )
        );
      } else {
        // CREATE
        options.method = "POST";

        const newLoc = await fetchDataWithAuthFallback(
          `${baseURL}/api/assets/location`,
          options
        );

        setLocations((prev) => [
          ...prev,
          {
            id: newLoc.location_id,
            name: newLoc.name,
            desc: newLoc.description,
          },
        ]);
      }

      closePopup();
    } catch (err: any) {
      console.error(err);
      alert("Error saving location: " + err.message);
    }
  };

  // ---------------- DELETE LOCATION ----------------
  const deleteLocation = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    try {
      await fetchDataWithAuthFallback(
        `${baseURL}/api/assets/location/${id}`,
        { method: "DELETE" }
      );

      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Error deleting location: " + err.message);
    }
  };

  if (loading) return <div>Loading locations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-wrapper">
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

        <h2>ASSET MANAGER</h2>
        {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
        {hasPermission("View All Assets") && <a href="/assets/assets">Asset Inventory</a>}
        {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}
        <a href="/assets/locations" className="active">Locations</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>

        <a href="/" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>
          ➜ Logout
        </a>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        <AssetsHeader />
        <br />
        <h1>Asset Locations</h1>

        <div className="table-section">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Locations</h2>
            <button className="add-btn" onClick={() => openPopup(null)}>
              + Add Location
            </button>
          </div>

          <table className="responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.id}</td>
                  <td>{loc.name}</td>
                  <td>{loc.desc}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openPopup(loc.id)}>
                      Edit
                    </button>
                    &emsp;
                    <button className="delete-btn" onClick={() => deleteLocation(loc.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && <div className="overlay" onClick={closePopup}></div>}
      <div className="filter-popup" style={{ display: showPopup ? "block" : "none" }}>
        <h3>{editId !== null ? "Edit Location" : "Add Location"}</h3>

        <label>Name</label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />

        <label>Description</label>
        <textarea
          value={locationDesc}
          onChange={(e) => setLocationDesc(e.target.value)}
        />

        <div className="filter-popup-buttons">
          <button className="add-btn" onClick={saveLocation}>Save</button>
          <button className="cancel-btn" onClick={closePopup}>Cancel</button>
          {editId !== null && (
            <button className="delete-btn" onClick={() => deleteLocation(editId!)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetLocationsPage;